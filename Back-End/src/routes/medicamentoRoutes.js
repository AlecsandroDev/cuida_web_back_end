const express = require("express");
const router = express.Router();
const controller = require("../controllers/medicamentoController");

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/get-medicamentos/:id", controller.medicamento);

router.post('/medicamentos/upload-foto/:id', 
  upload.single('foto'),
  controller.uploadFotoMedicamento);

module.exports = router;