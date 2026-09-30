/**
 * Cliente da Evolution API (REST via Axios).
 *
 * Suporta os dois formatos de payload do /message/sendText:
 *   v1 (1.x): { number, options: { delay, presence }, textMessage: { text } }
 *   v2 (2.x): { number, text, delay }
 * Escolha com EVOLUTION_API_VERSION=v1|v2 (padrão v1, que é o que o projeto usava).
 *
 * Inclui suporte a WHATSAPP_MOCK=true para testes locais sem Docker/instância ativa.
 */
const axios = require('axios');
const log = require('../utils/logger');
const { mascararTelefone } = require('../utils/telefone');

const isMock = () => process.env.WHATSAPP_MOCK === 'true';

// Lido sob demanda para não depender da ordem em que o dotenv é carregado
function cfg() {
  return {
    url: (process.env.WHATSAPP_API_URL || 'http://localhost:8080').replace(/\/+$/, ''),
    apiKey: process.env.WHATSAPP_API_KEY || '',
    instancia: process.env.WHATSAPP_INSTANCE || 'cuida',
    versao: (process.env.EVOLUTION_API_VERSION || 'v1').toLowerCase()
  };
}

function cliente(timeoutMs = 20000) {
  const c = cfg();
  return axios.create({
    baseURL: c.url,
    timeout: timeoutMs,
    headers: { apikey: c.apiKey, 'Content-Type': 'application/json' }
  });
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Classificação de erros
// ---------------------------------------------------------------------------

/**
 * Códigos possíveis:
 *  SEM_WHATSAPP            número não tem conta de WhatsApp
 *  INSTANCIA_DESCONECTADA  sessão caiu / celular deslogado (precisa ler QR de novo)
 *  INSTANCIA_INEXISTENTE   nome da instância errado
 *  NAO_AUTORIZADO          apikey errada
 *  LIMITE_TAXA             429 da API
 *  TIMEOUT                 a API não respondeu a tempo (envio pode ou não ter ocorrido)
 *  ERRO_REDE               API fora do ar / DNS / conexão recusada
 *  ERRO_API                qualquer outro erro HTTP
 */
function classificarErro(err) {
  if (!err.response) {
    const code = err.code || '';
    if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || /timeout/i.test(err.message)) {
      return { codigo: 'TIMEOUT', retentavel: false, fatalParaLote: false, detalhe: err.message };
    }
    return { codigo: 'ERRO_REDE', retentavel: true, fatalParaLote: true, detalhe: `${code} ${err.message}`.trim() };
  }

  const status = err.response.status;
  const corpo = err.response.data;
  const texto = typeof corpo === 'string' ? corpo : JSON.stringify(corpo || {});
  const base = { status, detalhe: corpo };

  if (/"exists"\s*:\s*false/.test(texto)) {
    return { ...base, codigo: 'SEM_WHATSAPP', retentavel: false, fatalParaLote: false };
  }
  if (/connection closed|not connected|disconnected/i.test(texto) && status !== 404) {
    return { ...base, codigo: 'INSTANCIA_DESCONECTADA', retentavel: false, fatalParaLote: true };
  }
  if (status === 404 && /instance/i.test(texto)) {
    return { ...base, codigo: 'INSTANCIA_INEXISTENTE', retentavel: false, fatalParaLote: true };
  }
  if (status === 401 || status === 403) {
    return { ...base, codigo: 'NAO_AUTORIZADO', retentavel: false, fatalParaLote: true };
  }
  if (status === 429) {
    return { ...base, codigo: 'LIMITE_TAXA', retentavel: true, fatalParaLote: false };
  }
  // 502/503/504: gateway/proxy — a requisição não chegou a ser processada
  if ([502, 503, 504].includes(status)) {
    return { ...base, codigo: 'ERRO_API', retentavel: true, fatalParaLote: false };
  }
  return { ...base, codigo: 'ERRO_API', retentavel: false, fatalParaLote: false };
}

/**
 * Executa fn com retentativa + backoff exponencial com jitter, apenas para
 * erros "seguros" de repetir (a mensagem certamente não foi entregue).
 * TIMEOUT não é repetido no envio para não mandar a mesma mensagem duas vezes.
 */
async function comRetry(fn, { tentativas = 3, baseMs = 2000, rotulo = 'chamada' } = {}) {
  let ultimo;
  for (let i = 1; i <= tentativas; i++) {
    try {
      return await fn();
    } catch (err) {
      const info = classificarErro(err);
      ultimo = Object.assign(err, { classificacao: info });
      if (!info.retentavel || i === tentativas) break;
      const atraso = baseMs * 2 ** (i - 1) + Math.floor(Math.random() * 1000);
      log.warn('whatsapp.retry', { rotulo, tentativa: i, codigo: info.codigo, aguardando_ms: atraso });
      await espera(atraso);
    }
  }
  throw ultimo;
}

// ---------------------------------------------------------------------------
// Endpoints da Evolution API
// ---------------------------------------------------------------------------

/** Estado da instância: 'open' | 'connecting' | 'close' | ... */
async function estadoConexao() {
  if (isMock()) {
    return { conectado: true, estado: 'open', simulado: true };
  }

  const { instancia } = cfg();
  try {
    const { data } = await cliente(10000).get(`/instance/connectionState/${instancia}`);
    const estado = data?.instance?.state || data?.state || 'desconhecido';
    return { conectado: estado === 'open', estado, bruto: data };
  } catch (err) {
    const info = classificarErro(err);
    return { conectado: false, estado: info.codigo, erro: info };
  }
}

/**
 * Pergunta à Evolution quais variantes do número têm WhatsApp.
 * Resolve a questão do 9º dígito: devolve o número exatamente como está no JID.
 * @returns {Promise<{ existe: boolean|null, numero?: string, jid?: string }>}
 */
async function verificarNumero(variantes) {
  if (isMock()) {
    const escolhido = variantes[0] || '5500000000000';
    return { existe: true, numero: escolhido, jid: `${escolhido}@s.whatsapp.net` };
  }

  const { instancia } = cfg();
  try {
    const { data } = await comRetry(
      () => cliente(15000).post(`/chat/whatsappNumbers/${instancia}`, { numbers: variantes }),
      { rotulo: 'whatsappNumbers' }
    );
    const lista = Array.isArray(data) ? data : data?.numbers || data?.response || [];
    const achado = lista.find((x) => x && x.exists);
    if (!achado) return { existe: false };
    const numero = String(achado.jid || achado.number || '').split('@')[0].replace(/\D/g, '');
    return { existe: true, numero: numero || variantes[0], jid: achado.jid };
  } catch (err) {
    const info = err.classificacao || classificarErro(err);
    if (info.fatalParaLote) throw err; // instância caiu, apikey errada etc.
    log.warn('whatsapp.verificacao_indisponivel', { codigo: info.codigo, status: info.status });
    return { existe: null };
  }
}

/**
 * Envia texto. `delayDigitacao` = tempo (ms) que a Evolution mostra
 * "digitando..." antes de enviar — deixa o comportamento mais humano.
 */
async function enviarTexto(numero, texto, { delayDigitacao = 1200 } = {}) {
  if (isMock()) {
    await espera(300); // breve delay para emular resposta assíncrona
    const idSimulado = `MOCK_WA_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    console.log('\n---------------- [MOCK DISPARO WHATSAPP] ----------------');
    console.log(`📱 Destino: ${mascararTelefone(numero)}`);
    console.log(`⏱️ Delay de digitação emulado: ${delayDigitacao}ms`);
    console.log(`💬 Texto:\n${texto}`);
    console.log(`🆔 ID Mensagem: ${idSimulado}`);
    console.log('---------------------------------------------------------\n');

    log.info('whatsapp.enviado_simulado', { para: mascararTelefone(numero), id_mensagem: idSimulado });
    return { idMensagem: idSimulado, bruto: { status: 'PENDING', key: { id: idSimulado } } };
  }

  const { instancia, versao } = cfg();
  const payload =
    versao === 'v2'
      ? { number: numero, text: texto, delay: delayDigitacao }
      : { number: numero, options: { delay: delayDigitacao, presence: 'composing' }, textMessage: { text: texto } };

  const inicio = Date.now();
  const { data } = await comRetry(
    () => cliente(20000 + delayDigitacao).post(`/message/sendText/${instancia}`, payload),
    { rotulo: 'sendText' }
  );

  const idMensagem = data?.key?.id || data?.message?.key?.id || null;
  log.info('whatsapp.enviado', { para: mascararTelefone(numero), id_mensagem: idMensagem, ms: Date.now() - inicio });
  return { idMensagem, bruto: data };
}

module.exports = { estadoConexao, verificarNumero, enviarTexto, classificarErro, comRetry, espera, cfg };