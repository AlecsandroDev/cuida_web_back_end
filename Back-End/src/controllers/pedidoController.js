const Pedido = require("../models/Pedido");

exports.criarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.criar(req.body);
    res.status(201).json(pedido);
  } catch (err) {
    console.error("Erro ao criar pedido:", err);
    res.status(500).json({ error: "Erro ao processar pedido. Verifique os dados." });
  }
};

exports.listarMeusPedidos = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const pedidos = await Pedido.listarPorCliente(id_cliente);
    res.status(200).json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pedidos." });
  }
};  