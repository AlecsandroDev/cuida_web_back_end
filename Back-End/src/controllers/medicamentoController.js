const Medicamento = require("../models/Medicamento");

exports.medicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Medicamento.getMedicamentos(id);
    res.status(200).json(data);
  } catch (err) {
    console.error("Erro ao buscar medicamento:", err);
    res.status(500).json({ error: "Erro ao buscar medicamento" });
  }
};

exports.uploadFotoMedicamento = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  try {
    const updatedMedicamento = await Medicamento.uploadFoto(id, file);
    
    res.status(200).json(updatedMedicamento);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload da foto', details: error.message });
  }
};