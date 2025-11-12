const Cliente = require("../models/Cliente");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const user = await Cliente.createCliente(req.body);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await Cliente.loginCliente(req.body);

    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign({ id: user.id_cliente }, SECRET, { expiresIn: "1h" });

    res.json({ token, id: user.id_cliente, nome: user.nome_completo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao logar" });
  }
};

exports.perfil = async (req, res) => {
  try {
    const data = await Cliente.perfilCliente(req.params.id);
    if (!data) return res.status(404).json({ error: "Cliente não encontrado" });
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dados de Cliente" });
  }
};

exports.updateCliente = async (req, res) => {
  const { id } = req.params; 
  const data = req.body;

  try {
    // 1. Validação simples (pode melhorar)
    if (!id || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'ID do cliente e dados para atualizar são obrigatórios.' });
    }

    // 2. Chama o método de atualização do Model
    const updatedCliente = await Cliente.atualizarPerfilCliente(id, data);
    
    // 3. Retorna o cliente atualizado (o React Query usará isso)
    res.status(200).json(updatedCliente);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente', details: error.message });
  }
};


exports.uploadFoto = async (req, res) => {
  try {
    const clienteID = req.params.id;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "Nenhum arquivo enviado." });
    
    const url = await Cliente.atualizarFoto(clienteID, file);

    if (!url) return res.status(500).json({ error: "Erro ao enviar foto" });

    res.status(200).json({ foto_url: url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno no upload da imagem" });
  }
};
