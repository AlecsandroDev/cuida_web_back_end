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