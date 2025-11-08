const express = require("express");
const router = express.Router();
const controller = require("../controllers/estoqueController");

router.get("/get-estoque", controller.estoque);

module.exports = router;