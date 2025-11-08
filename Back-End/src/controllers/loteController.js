const Lote = require('../models/Lote');

exports.lote = async (req, res) => {
  try {
    const data = await Lote.getLote();
    res.status(200).json(data);
  } catch (err) {
    console.error("Erro ao buscar lote:", err);
    res.status(500).json({ error: "Erro ao buscar lote" });
  }
}