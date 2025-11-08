const express = require("express");
const router = express.Router();
const controller = require("../controllers/unidadeController");

router.get("/get-unidades", controller.unidade);

module.exports = router;
