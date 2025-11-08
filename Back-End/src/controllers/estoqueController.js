const Estoque = require('../models/Estoque');

exports.estoque = async (req, res) => {
  try {
    const data = await Estoque.getEstoque();
    res.status(200).json(data);
  } catch (err) {
    console.error("Erro ao buscar lote:", err);
    res.status(500).json({ error: "Erro ao buscar lote" });
  }
}