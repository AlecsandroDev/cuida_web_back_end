const express = require("express");
const router = express.Router();
const controller = require("../controllers/loteController");

router.get("/get-lote", controller.lote);

module.exports = router;