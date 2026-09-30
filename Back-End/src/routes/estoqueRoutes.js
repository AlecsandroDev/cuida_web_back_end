const express = require("express");
const router = express.Router();
const controller = require("../controllers/estoqueController");
const exigirChaveInterna = require("../middlewares/chaveInternaMiddleware");

router.get("/get-estoque", controller.estoque);

// Gestão (app das UBS): exige x-api-key quando NOTIFICACAO_API_KEY estiver definida.
// O web dos cidadãos não deve chamar esta rota.
router.post("/entrada", exigirChaveInterna, controller.entrada);

module.exports = router;
