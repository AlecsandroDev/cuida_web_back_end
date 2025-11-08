const express = require("express");
const router = express.Router();
const controller = require("../controllers/clienteController");
const autenticarToken = require("../middlewares/authMiddleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/perfil", autenticarToken, (req, res) => {
  res.json({ message: `Bem-vindo, usuário ${req.user.id}` });
});

module.exports = router;
