// app.js
const express = require("express");
const cors = require("cors");

const unidadeRoutes     = require("./routes/unidadeRoutes");
const clienteRoutes     = require("./routes/clienteRoutes");
const medicamentoRoutes = require("./routes/medicamentoRoutes");
const loteRoutes        = require("./routes/loteRoutes");
const estoqueRoutes     = require("./routes/estoqueRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/clientes", clienteRoutes);
app.use("/api/unidades", unidadeRoutes);
app.use("/api/medicamentos", medicamentoRoutes);
app.use("/api/lotes", loteRoutes);
app.use("/api/estoques", estoqueRoutes);

module.exports = app;
