const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const autenticarToken = require('../middlewares/authMiddleware');
const exigirChaveInterna = require('../middlewares/chaveInternaMiddleware');

// Envio avulso: exige usuário logado (o front já manda o Bearer token).
// Sem isso, qualquer pessoa usaria o número do CUIDA para mandar qualquer texto.
router.post('/enviar', autenticarToken, whatsappController.enviarMensagem);

// Disparo em massa e diagnóstico: chave interna (x-api-key), se configurada
router.post('/notificar-disponibilidade', exigirChaveInterna, whatsappController.notificarDisponibilidade);
router.get('/notificacoes', exigirChaveInterna, whatsappController.listarLotes);
router.get('/notificacoes/:id', exigirChaveInterna, whatsappController.statusLote);
router.get('/status', exigirChaveInterna, whatsappController.statusInstancia);
router.post('/validar-numero', exigirChaveInterna, whatsappController.validarNumero);

module.exports = router;
