const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../controllers/clienteController");
const autenticarToken = require("../middlewares/authMiddleware");

const upload = multer();

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get("/perfil/:id", controller.perfil);

router.post("/upload-foto/:id", upload.single("foto"), controller.uploadFoto);

router.get("/perfils", autenticarToken, (req, res) => {
  res.json({ message: `Bem-vindo, usuário ${req.user.id}` });
});

module.exports = router;
