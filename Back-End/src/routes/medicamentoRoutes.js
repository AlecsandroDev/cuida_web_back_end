const express = require("express");
const router = express.Router();
const controller = require("../controllers/medicamentoController");

// Route: Requisição do medicamento com base no id do medicamento;
router.get("/get-medicamentos/:id", controller.medicamento);

module.exports = router;