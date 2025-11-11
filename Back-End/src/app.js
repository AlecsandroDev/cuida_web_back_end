// app.js
const express = require("express");
const cors = require("cors");

const unidadeRoutes     = require("./routes/unidadeRoutes");
const clienteRoutes     = require("./routes/clienteRoutes");
const medicamentoRoutes = require("./routes/medicamentoRoutes");
const loteRoutes        = require("./routes/loteRoutes");
const estoqueRoutes     = require("./routes/estoqueRoutes");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors());
  
app.use("/api/clientes", clienteRoutes);
app.use("/api/unidades", unidadeRoutes);
app.use("/api/medicamentos", medicamentoRoutes);
app.use("/api/lotes", loteRoutes);
app.use("/api/estoques", estoqueRoutes);

module.exports = app;
