const Unidade = require("../models/Unidade");

exports.unidade = async (req, res) => {
  try {
    const data = await Unidade.getUnidade();
    res.status(200).json(data);
  } catch (err) {
    console.error("Erro ao buscar unidades:", err);
    res.status(500).json({ error: "Erro ao buscar unidades" });
  }
};
