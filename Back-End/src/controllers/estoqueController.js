const Estoque = require('../models/Estoque');
const { darEntrada, ErroEntrada } = require('../services/estoqueService');
const log = require('../utils/logger');

exports.estoque = async (req, res) => {
  try {
    const data = await Estoque.getEstoque();
    res.status(200).json(data);
  } catch (err) {
    console.error("Erro ao buscar lote:", err);
    res.status(500).json({ error: "Erro ao buscar lote" });
  }
}

/**
 * Entrada de estoque (uso da gestão/UBS).
 * POST /api/estoques/entrada
 * Body: { id_medicamento, id_unidade, quantidade, lote, data_vencimento: "AAAA-MM-DD", notificar?: true }
 *
 * Se o medicamento estava zerado na UBS, os cidadãos que o favoritaram
 * são avisados automaticamente (WhatsApp + e-mail), pela mesma fila anti-ban.
 */
exports.entrada = async (req, res) => {
  try {
    const resultado = await darEntrada(req.body);
    return res.status(201).json({ success: true, ...resultado });
  } catch (err) {
    if (err instanceof ErroEntrada) {
      return res.status(err.status).json({ success: false, codigo: err.codigo, error: err.message, erros: err.erros });
    }
    log.error('estoque.entrada_falhou', { erro: err.message });
    return res.status(500).json({ success: false, codigo: 'ERRO_INTERNO', error: 'Falha ao registrar entrada de estoque.' });
  }
};
