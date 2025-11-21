const Favorito = require("../models/Favorito");

exports.adicionar = async (req, res) => {
  try {
    const novoFavorito = await Favorito.adicionar(req.body);
    res.status(201).json(novoFavorito);
  } catch (err) {
    console.error("Erro ao favoritar:", err);
    res.status(500).json({ error: "Erro ao adicionar favorito." });
  }
};

exports.listar = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const favoritos = await Favorito.listarPorCliente(id_cliente);
    res.status(200).json(favoritos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar favoritos." });
  }
};

exports.remover = async (req, res) => {
  try {
    const { id } = req.params;
    await Favorito.remover(id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover favorito." });
  }
};