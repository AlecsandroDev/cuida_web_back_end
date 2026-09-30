/**
 * Entrada de estoque + aviso automático aos interessados.
 *
 * Regra: o aviso sai quando o medicamento estava ZERADO na UBS (somando os
 * lotes não vencidos) e passa a ter estoque. Se já havia estoque, a entrada
 * é só registrada — quem favoritou já foi avisado antes (ou já pode ver no app).
 */
const log = require('../utils/logger');

class ErroEntrada extends Error {
  constructor(status, codigo, mensagem) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }
}

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

function inteiroPositivo(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function dataValida(s) {
  if (typeof s !== 'string' || !DATA_ISO.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Valida e normaliza o body. Lança ErroEntrada(400) com todos os problemas. */
function validarEntrada(body, hoje) {
  const b = body || {};
  const erros = [];

  const id_medicamento = inteiroPositivo(b.id_medicamento);
  const id_unidade = inteiroPositivo(b.id_unidade);
  const quantidade = inteiroPositivo(b.quantidade);
  const lote = typeof b.lote === 'string' ? b.lote.trim() : String(b.lote ?? '').trim();
  const data_vencimento = b.data_vencimento;

  if (!id_medicamento) erros.push('id_medicamento deve ser um inteiro positivo');
  if (!id_unidade) erros.push('id_unidade deve ser um inteiro positivo');
  if (!quantidade) erros.push('quantidade deve ser um inteiro maior que zero');
  else if (quantidade > 1000000) erros.push('quantidade acima do limite (1.000.000)');
  if (!lote) erros.push('lote (código do lote do fabricante) é obrigatório');
  else if (lote.length > 50) erros.push('lote deve ter no máximo 50 caracteres');
  if (!dataValida(data_vencimento)) erros.push('data_vencimento deve estar no formato AAAA-MM-DD');
  else if (data_vencimento < hoje) erros.push('lote já vencido não pode dar entrada');

  if (erros.length) throw Object.assign(new ErroEntrada(400, 'DADOS_INVALIDOS', 'Dados inválidos.'), { erros });

  return {
    id_medicamento, id_unidade, quantidade, lote, data_vencimento,
    notificar: b.notificar !== false // padrão: avisa
  };
}

/**
 * @param {object} body  { id_medicamento, id_unidade, quantidade, lote, data_vencimento, notificar? }
 * @param {object} deps  injeção para testes: { Estoque, Favorito, fila, hoje }
 */
async function darEntrada(body, deps = {}) {
  const Estoque = deps.Estoque || require('../models/Estoque');
  const Favorito = deps.Favorito || require('../models/Favorito');
  const fila = deps.fila || require('./filaNotificacao');
  const hoje = deps.hoje || Estoque.hojeBrasilia();

  const d = validarEntrada(body, hoje);

  // 1) Quanto havia ANTES (lotes não vencidos)
  const antes = await Estoque.quantidadeDisponivel(d.id_medicamento, d.id_unidade);

  // 2) Lote do fabricante: reaproveita se já existe (mesmo medicamento + código)
  let loteRegistro = await Estoque.buscarLote(d.id_medicamento, d.lote);
  let loteCriado = false;
  if (loteRegistro) {
    if (String(loteRegistro.data_vencimento).slice(0, 10) !== d.data_vencimento) {
      throw new ErroEntrada(409, 'LOTE_VENCIMENTO_DIVERGENTE',
        `O lote ${d.lote} já está cadastrado com vencimento ${String(loteRegistro.data_vencimento).slice(0, 10)}.`);
    }
  } else {
    try {
      loteRegistro = await Estoque.criarLote(d);
      loteCriado = true;
    } catch (err) {
      if (err.codigoSupabase === '23503') {
        throw new ErroEntrada(404, 'MEDICAMENTO_INEXISTENTE', `Medicamento ${d.id_medicamento} não encontrado.`);
      }
      throw err;
    }
  }

  // 3) Soma no estoque da UBS
  let estoque;
  try {
    estoque = await Estoque.somarEstoque(d.id_unidade, loteRegistro.id_lote, d.quantidade);
  } catch (err) {
    if (loteCriado) await Estoque.removerLote(loteRegistro.id_lote).catch(() => {}); // desfaz lote órfão
    if (err.codigoSupabase === '23503') {
      throw new ErroEntrada(404, 'UNIDADE_INEXISTENTE', `Unidade ${d.id_unidade} não encontrada.`);
    }
    throw err;
  }

  const depois = antes + d.quantidade;
  log.info('estoque.entrada', {
    id_medicamento: d.id_medicamento, id_unidade: d.id_unidade, id_lote: loteRegistro.id_lote,
    quantidade: d.quantidade, antes, depois
  });

  // 4) Aviso aos interessados (a entrada já foi gravada: falha aqui NÃO desfaz o estoque)
  const notificacao = await avisarSeReabasteceu(d, antes, depois, { Favorito, fila });

  return {
    entrada: {
      id_lote: loteRegistro.id_lote,
      lote: loteRegistro.lote,
      data_vencimento: String(loteRegistro.data_vencimento).slice(0, 10),
      lote_novo: loteCriado,
      id_estoque: estoque.id_estoque,
      quantidade_adicionada: d.quantidade
    },
    estoque_antes: antes,
    estoque_depois: depois,
    notificacao
  };
}

async function avisarSeReabasteceu(d, antes, depois, { Favorito, fila }) {
  if (!d.notificar) return { disparada: false, motivo: 'NOTIFICACAO_DESLIGADA' };
  if (antes > 0) return { disparada: false, motivo: 'JA_HAVIA_ESTOQUE' };
  if (depois <= 0) return { disparada: false, motivo: 'SEM_ESTOQUE' };

  try {
    const inscritos = await Favorito.buscarInteressados(d.id_medicamento, d.id_unidade);
    if (!inscritos || !inscritos.length) return { disparada: false, motivo: 'SEM_INTERESSADOS' };

    const lote = fila.enfileirarDisponibilidade(inscritos, {
      id_medicamento: d.id_medicamento, id_unidade: d.id_unidade, origem: 'entrada_estoque'
    });
    return {
      disparada: true,
      id_lote_notificacao: lote.id,
      total_inscritos: inscritos.length,
      acompanhar_em: `/api/whatsapp/notificacoes/${lote.id}`
    };
  } catch (err) {
    log.error('estoque.aviso_falhou', { id_medicamento: d.id_medicamento, id_unidade: d.id_unidade, erro: err.message });
    return { disparada: false, motivo: 'ERRO_AO_NOTIFICAR', detalhe: err.message };
  }
}

module.exports = { darEntrada, validarEntrada, ErroEntrada };
