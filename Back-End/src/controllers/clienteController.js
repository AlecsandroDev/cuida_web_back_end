const Cliente = require("../models/Cliente");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const user = await Cliente.createCliente(req.body);
    res.status(201).json(user);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: "Dados únicos já estão cadastrados." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await Cliente.loginCliente(req.body);

    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
    
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });
    res.json({ token, nome: user.nome_completo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao logar" });
  }
};