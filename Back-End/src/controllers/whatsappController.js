const Favorito = require('../models/Favorito');
const wa = require('../services/whatsappService');
const fila = require('../services/filaNotificacao');
const { normalizarTelefoneBR, mascararTelefone } = require('../utils/telefone');
const log = require('../utils/logger');

const IS_WHATSAPP_MOCK = process.env.WHATSAPP_MOCK === 'true';

/**
 * Envia uma mensagem de texto avulsa (uso interno / teste).
 * POST /api/whatsapp/enviar
 * Body: { "numero": "(14) 99999-9999", "mensagem": "Olá..." }
 */
exports.enviarMensagem = async (req, res) => {
  const { numero, mensagem } = req.body || {};

  if (!numero || !mensagem) {
    return res.status(400).json({ success: false, codigo: 'PARAMETROS', error: 'Número e mensagem são obrigatórios.' });
  }

  const tel = normalizarTelefoneBR(numero);
  if (!tel.valido) {
    return res.status(400).json({ success: false, codigo: tel.motivo, error: 'Telefone inválido.' });
  }

  // Interceptação rápida se estiver rodando em Mock
  if (IS_WHATSAPP_MOCK) {
    console.log('\n================ [MOCK WHATSAPP - AVULSO] ================');
    console.log(`📱 Destinatário: ${mascararTelefone(tel.numero)}`);
    console.log(`💬 Mensagem: ${mensagem}`);
    console.log('⏱️ Status: Simulado com sucesso (200 OK)');
    console.log('==========================================================\n');
    return res.status(200).json({
      success: true,
      id_mensagem: `mock_${Date.now()}`,
      numero_usado: mascararTelefone(tel.numero),
      modo_simulacao: true
    });
  }

  try {
    let destino = tel.numero;
    const v = await wa.verificarNumero(tel.variantes);
    if (v.existe === false) {
      return res.status(422).json({ success: false, codigo: 'SEM_WHATSAPP', numero: mascararTelefone(tel.numero) });
    }
    if (v.existe) destino = v.numero;

    const { idMensagem } = await wa.enviarTexto(destino, mensagem);
    return res.status(200).json({
      success: true,
      id_mensagem: idMensagem,
      numero_usado: mascararTelefone(destino),
      ajuste_9_digito: destino !== tel.numero
    });
  } catch (err) {
    const info = err.classificacao || wa.classificarErro(err);
    log.error('whatsapp.envio_avulso_falhou', { codigo: info.codigo, status: info.status });
    const http = info.codigo === 'SEM_WHATSAPP' ? 422 : info.fatalParaLote ? 503 : 502;
    return res.status(http).json({ success: false, codigo: info.codigo, detalhes: info.detalhe });
  }
};

/**
 * Enfileira o aviso para todos que favoritaram o medicamento na unidade.
 * POST /api/whatsapp/notificar-disponibilidade
 * Body: { "id_medicamento": 12, "id_unidade": 3, "aguardar": false }
 */
exports.notificarDisponibilidade = async (req, res) => {
  const { id_medicamento, id_unidade, aguardar } = req.body || {};

  if (!id_medicamento || !id_unidade) {
    return res.status(400).json({ success: false, error: 'id_medicamento e id_unidade são obrigatórios.' });
  }

  try {
    const inscritos = await Favorito.buscarInteressados(id_medicamento, id_unidade);

    if (!inscritos || !inscritos.length) {
      return res.status(200).json({
        success: true,
        total_inscritos: 0,
        message: 'Nenhum cidadão cadastrado para este medicamento nesta unidade.'
      });
    }

    const lote = fila.enfileirarDisponibilidade(inscritos, { id_medicamento, id_unidade });

    if (aguardar === true) {
      const final = await fila.aguardarLote(lote.id);
      return res.status(200).json({ 
        success: true, 
        modo_simulacao: IS_WHATSAPP_MOCK,
        lote: final 
      });
    }

    return res.status(202).json({
      success: true,
      id_lote: lote.id,
      total_inscritos: inscritos.length,
      status: lote.status,
      modo_simulacao: IS_WHATSAPP_MOCK,
      acompanhar_em: `/api/whatsapp/notificacoes/${lote.id}`
    });
  } catch (error) {
    log.error('notificacao.falha_ao_enfileirar', { erro: error.message });
    return res.status(500).json({ success: false, error: 'Falha ao processar notificações.', detalhes: error.message });
  }
};

/** GET /api/whatsapp/notificacoes/:id — status detalhado de um lote */
exports.statusLote = (req, res) => {
  const lote = fila.obterLote(req.params.id);
  if (!lote) return res.status(404).json({ success: false, error: 'Lote não encontrado (ou expirado após restart).' });
  return res.json({ success: true, lote });
};

/** GET /api/whatsapp/notificacoes — últimos lotes (resumo) */
exports.listarLotes = (req, res) => res.json({ success: true, lotes: fila.listarLotes() });

/** GET /api/whatsapp/status — a instância da Evolution está conectada? */
exports.statusInstancia = async (req, res) => {
  if (IS_WHATSAPP_MOCK) {
    return res.status(200).json({
      success: true,
      instancia: 'cuida-mock',
      versao_api: 'v1-mock',
      url: 'http://localhost:simulado',
      estado: 'open',
      modo_simulacao: true
    });
  }

  const s = await wa.estadoConexao();
  const { instancia, versao, url } = wa.cfg();
  return res.status(s.conectado ? 200 : 503).json({
    success: s.conectado,
    instancia,
    versao_api: versao,
    url,
    estado: s.estado,
    erro: s.erro?.codigo
  });
};

/** POST /api/whatsapp/validar-numero — testa a higienização sem enviar nada */
exports.validarNumero = async (req, res) => {
  const { numero, verificar } = req.body || {};
  const tel = normalizarTelefoneBR(numero);
  
  if (!tel.valido || verificar === false || IS_WHATSAPP_MOCK) {
    return res.json({ 
      entrada: numero, 
      ...tel, 
      ...(IS_WHATSAPP_MOCK ? { whatsapp: { existe: true, numero: tel.numero, simulado: true } } : {}) 
    });
  }

  try {
    const v = await wa.verificarNumero(tel.variantes);
    return res.json({ entrada: numero, ...tel, whatsapp: v });
  } catch (err) {
    const info = err.classificacao || wa.classificarErro(err);
    return res.status(503).json({ entrada: numero, ...tel, whatsapp: { erro: info.codigo } });
  }
};