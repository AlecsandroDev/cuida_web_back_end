const express = require("express");
const router = express.Router();
const controller = require("../controllers/favoritoController");

router.post("/", controller.adicionar);
router.get("/cliente/:id_cliente", controller.listar);
router.delete("/:id", controller.remover);

module.exports = router;