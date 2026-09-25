/**
 * Fila de notificações (em memória, 1 envio por vez para o processo inteiro).
 *
 * - Todos os lotes entram numa única fila: dois POSTs simultâneos NÃO disparam
 *   em paralelo pelo mesmo número de WhatsApp.
 * - Intervalo aleatório entre mensagens + pausa longa a cada N envios.
 * - Janela de horário (padrão 8h–20h, horário de Brasília).
 * - Se a instância cair no meio do lote, o WhatsApp é interrompido (sem
 *   martelar a API) e os e-mails continuam.
 *
 * Limitação: por ser em memória, um restart do servidor perde os lotes em
 * andamento. Para produção com volume, troque por BullMQ + Redis mantendo a
 * mesmas processarLote() e enviarWhatsappItem().
 */
const crypto = require('crypto');
const log = require('../utils/logger');
const wa = require('./whatsappService');
const { enviarEmail } = require('./emailService');
const { normalizarTelefoneBR, mascararTelefone } = require('../utils/telefone');
const { montarMensagemDisponibilidade } = require('../utils/mensagens');

// ---------------------------------------------------------------------------
// Configuração (variáveis de ambiente)
// ---------------------------------------------------------------------------
function num(nome, padrao) {
  const v = Number(process.env[nome]);
  return Number.isFinite(v) && process.env[nome] !== '' ? v : padrao;
}

function config() {
  return {
    intervaloMin: num('WHATSAPP_INTERVALO_MIN_MS', 8000),
    intervaloMax: num('WHATSAPP_INTERVALO_MAX_MS', 20000),
    pausaACada: num('WHATSAPP_PAUSA_A_CADA', 15),
    pausaMin: num('WHATSAPP_PAUSA_MIN_MS', 60000),
    pausaMax: num('WHATSAPP_PAUSA_MAX_MS', 180000),
    digitandoMin: num('WHATSAPP_DIGITANDO_MIN_MS', 1500),
    digitandoMax: num('WHATSAPP_DIGITANDO_MAX_MS', 4000),
    horaInicio: num('WHATSAPP_HORA_INICIO', 8),
    horaFim: num('WHATSAPP_HORA_FIM', 20),
    verificarNumero: (process.env.WHATSAPP_VERIFICAR_NUMERO || 'true') !== 'false'
  };
}

const aleatorio = (min, max) => Math.floor(min + Math.random() * (Math.max(max, min) - min + 1));

function horaBrasilia(d = new Date()) {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo'
  }).formatToParts(d);
  const h = Number(partes.find((p) => p.type === 'hour').value);
  const m = Number(partes.find((p) => p.type === 'minute').value);
  return h + m / 60;
}

/** ms até a janela abrir (0 se já estiver dentro) */
function msAteJanela(c) {
  if (c.horaInicio <= 0 && c.horaFim >= 24) return 0;
  const agora = horaBrasilia();
  if (agora >= c.horaInicio && agora < c.horaFim) return 0;
  const horas = agora < c.horaInicio ? c.horaInicio - agora : 24 - agora + c.horaInicio;
  return Math.ceil(horas * 3600 * 1000);
}

const escaparHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

// ---------------------------------------------------------------------------
// Estado da fila
// ---------------------------------------------------------------------------
const lotes = new Map(); // id -> lote
const fila = [];         // ids aguardando
let trabalhando = false;
const MAX_LOTES_GUARDADOS = 200;

function limparAntigos() {
  if (lotes.size <= MAX_LOTES_GUARDADOS) return;
  const finalizados = [...lotes.values()]
    .filter((l) => l.finalizado_em)
    .sort((a, b) => a.finalizado_em.localeCompare(b.finalizado_em));
  for (const l of finalizados.slice(0, lotes.size - MAX_LOTES_GUARDADOS)) lotes.delete(l.id);
}

function resumo(lote) {
  const r = { enviado: 0, falhou: 0, ignorado: 0, nao_enviado: 0, pendente: 0 };
  for (const i of lote.itens) r[i.whatsapp.status] = (r[i.whatsapp.status] || 0) + 1;
  const falhasPorCodigo = {};
  for (const i of lote.itens) {
    if (i.whatsapp.codigo) falhasPorCodigo[i.whatsapp.codigo] = (falhasPorCodigo[i.whatsapp.codigo] || 0) + 1;
  }
  const emails = lote.itens.filter((i) => i.email.status === 'enviado').length;
  return { whatsapp: r, falhas_por_codigo: falhasPorCodigo, emails_enviados: emails };
}

/** Versão serializável do lote (sem a promise interna) */
function publico(lote) {
  if (!lote) return null;
  const { _promise, _resolver, _dados, ...resto } = lote;
  return { ...resto, resumo: resumo(lote) };
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Enfileira um lote de avisos de disponibilidade.
 * @param {Array} inscritos  retorno de Favorito.buscarInteressados()
 * @param {object} parametros { id_medicamento, id_unidade }
 */
function enfileirarDisponibilidade(inscritos, parametros) {
  const id = crypto.randomUUID();
  let _resolver;
  const _promise = new Promise((r) => (_resolver = r));

  const lote = {
    id,
    tipo: 'disponibilidade_medicamento',
    status: 'na_fila',
    parametros,
    criado_em: new Date().toISOString(),
    iniciado_em: null,
    finalizado_em: null,
    motivo_interrupcao: null,
    total: inscritos.length,
    itens: inscritos.map((item) => {
      const cli = item.cliente || {};
      return {
        id_favorito: item.id_favorito,
        id_cliente: item.id_cliente,
        nome: cli.nome_completo || cli.nome || null,
        telefone: mascararTelefone(cli.telefone || cli.celular || cli.whatsapp),
        whatsapp: { status: 'pendente' },
        email: { status: cli.email ? 'pendente' : 'sem_email' }
      };
    }),
    _dados: inscritos,
    _promise,
    _resolver
  };

  lotes.set(id, lote);
  fila.push(id);
  log.info('notificacao.lote_enfileirado', { lote: id, total: lote.total, posicao_fila: fila.length, ...parametros });
  setImmediate(trabalhar);
  return lote;
}

function obterLote(id) {
  return publico(lotes.get(id));
}

function listarLotes() {
  return [...lotes.values()]
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
    .map((l) => ({ id: l.id, status: l.status, total: l.total, criado_em: l.criado_em, finalizado_em: l.finalizado_em, resumo: resumo(l) }));
}

async function aguardarLote(id) {
  const l = lotes.get(id);
  if (!l) return null;
  await l._promise;
  return publico(l);
}

// ---------------------------------------------------------------------------
// Worker
// ---------------------------------------------------------------------------
async function trabalhar() {
  if (trabalhando) return;
  trabalhando = true;
  try {
    while (fila.length) {
      const lote = lotes.get(fila.shift());
      if (!lote) continue;
      try {
        await processarLote(lote);
      } catch (err) {
        lote.status = 'erro';
        lote.motivo_interrupcao = err.message;
        log.error('notificacao.lote_erro', { lote: lote.id, erro: err.message });
      } finally {
        lote.finalizado_em = new Date().toISOString();
        lote._resolver();
        limparAntigos();
      }
    }
  } finally {
    trabalhando = false;
  }
}

async function processarLote(lote) {
  const c = config();
  lote.status = 'processando';
  lote.iniciado_em = new Date().toISOString();

  // 1) A instância está conectada? Se não, nem tenta WhatsApp (e-mails seguem).
  let bloqueioWhatsapp = null;
  const conexao = await wa.estadoConexao();
  if (!conexao.conectado) {
    bloqueioWhatsapp = conexao.erro?.codigo || 'INSTANCIA_DESCONECTADA';
    lote.motivo_interrupcao = `WhatsApp indisponível no início do lote (estado: ${conexao.estado})`;
    log.error('notificacao.instancia_indisponivel', { lote: lote.id, estado: conexao.estado });
  }

  const vistos = new Set();
  let enviadosNoLote = 0;

  for (let idx = 0; idx < lote.itens.length; idx++) {
    const item = lote.itens[idx];
    const dados = lote._dados[idx];
    const cli = dados.cliente || {};
    const medicamento = dados.medicamento?.nome || 'seu medicamento';
    const unidade = dados.unidade?.nome_unidade || 'sua unidade de saúde';
    const nome = cli.nome_completo || cli.nome;

    // ---- WhatsApp ----
    if (bloqueioWhatsapp) {
      item.whatsapp = { status: 'nao_enviado', codigo: bloqueioWhatsapp };
    } else {
      const tel = normalizarTelefoneBR(cli.telefone || cli.celular || cli.whatsapp);

      if (!tel.valido) {
        item.whatsapp = { status: 'ignorado', codigo: tel.motivo };
      } else if (vistos.has(tel.numero)) {
        item.whatsapp = { status: 'ignorado', codigo: 'DUPLICADO' };
      } else {
        vistos.add(tel.numero);

        // Pausas anti-banimento ANTES de cada envio (exceto o primeiro)
        if (enviadosNoLote > 0) {
          const pausaLonga = c.pausaACada > 0 && enviadosNoLote % c.pausaACada === 0;
          const ms = pausaLonga ? aleatorio(c.pausaMin, c.pausaMax) : aleatorio(c.intervaloMin, c.intervaloMax);
          if (pausaLonga) log.info('notificacao.pausa_longa', { lote: lote.id, ms });
          await wa.espera(ms);
        }
        const aguardarJanela = msAteJanela(c);
        if (aguardarJanela > 0) {
          lote.status = 'aguardando_janela';
          log.info('notificacao.fora_da_janela', { lote: lote.id, retoma_em_min: Math.round(aguardarJanela / 60000) });
          await wa.espera(aguardarJanela);
          lote.status = 'processando';
        }

        const r = await enviarWhatsappItem(tel, { nome, medicamento, unidade }, c);
        item.whatsapp = r;
        if (r.status === 'enviado') enviadosNoLote++;

        if (r.fatal) {
          bloqueioWhatsapp = r.codigo;
          lote.motivo_interrupcao = `WhatsApp interrompido no item ${idx + 1}: ${r.codigo}`;
          log.error('notificacao.whatsapp_interrompido', { lote: lote.id, item: idx + 1, codigo: r.codigo });
        }
        delete item.whatsapp.fatal;
      }
    }

    // ---- E-mail (independente do WhatsApp) ----
    if (cli.email) {
      try {
        const r = await enviarEmail({
          para: cli.email,
          assunto: `[CUIDA] Medicamento disponível: ${medicamento}`,
          html:
            `<p>Olá <strong>${escaparHtml(nome || 'cidadão(ã)')}</strong>,</p>` +
            `<p>O medicamento <strong>${escaparHtml(medicamento)}</strong> já está disponível na unidade <strong>${escaparHtml(unidade)}</strong>.</p>` +
            `<p>Compareça com documento com foto e receita médica.</p>` +
            `<p>Equipe CUIDA</p>`
        });
        // enviarEmail devolve undefined quando EMAIL_USER/EMAIL_PASS não estão configurados
        item.email = r ? { status: 'enviado' } : { status: 'ignorado', codigo: 'EMAIL_NAO_CONFIGURADO' };
      } catch (err) {
        item.email = { status: 'falhou', erro: err.message };
        log.error('notificacao.email_falhou', { lote: lote.id, id_cliente: item.id_cliente, erro: err.message });
      }
    }

    log.info('notificacao.item', {
      lote: lote.id, item: idx + 1, de: lote.itens.length, id_cliente: item.id_cliente,
      whatsapp: item.whatsapp.status, codigo: item.whatsapp.codigo, email: item.email.status
    });
  }

  lote.status = bloqueioWhatsapp ? 'concluido_com_interrupcao' : 'concluido';
  log.info('notificacao.lote_concluido', { lote: lote.id, status: lote.status, ...resumo(lote) });
}

async function enviarWhatsappItem(tel, dados, c) {
  const tentado_em = new Date().toISOString();
  try {
    let numeroEnvio = tel.numero;

    if (c.verificarNumero) {
      const v = await wa.verificarNumero(tel.variantes);
      if (v.existe === false) {
        return { status: 'falhou', codigo: 'SEM_WHATSAPP', tentado_em };
      }
      if (v.existe) numeroEnvio = v.numero; // pode ser a variante sem o 9
    }

    const texto = montarMensagemDisponibilidade(dados);
    const { idMensagem } = await wa.enviarTexto(numeroEnvio, texto, {
      delayDigitacao: aleatorio(c.digitandoMin, c.digitandoMax)
    });

    return {
      status: 'enviado',
      id_mensagem: idMensagem,
      numero_usado: mascararTelefone(numeroEnvio),
      ajuste_9_digito: numeroEnvio !== tel.numero,
      tentado_em
    };
  } catch (err) {
    const info = err.classificacao || wa.classificarErro(err);
    return {
      status: 'falhou',
      codigo: info.codigo,
      http_status: info.status,
      detalhe: resumirDetalhe(info.detalhe),
      tentado_em,
      fatal: info.fatalParaLote
    };
  }
}

function resumirDetalhe(d) {
  if (!d) return undefined;
  // mascara qualquer telefone que a API devolva no corpo do erro
  const s = (typeof d === 'string' ? d : JSON.stringify(d)).replace(/\d{10,13}/g, (n) => mascararTelefone(n));
  return s.length > 300 ? s.slice(0, 300) + '…' : s;
}

module.exports = { enfileirarDisponibilidade, obterLote, listarLotes, aguardarLote, _interno: { msAteJanela, horaBrasilia, config } };
