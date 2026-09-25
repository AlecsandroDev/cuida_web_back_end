// server.js
const path = require('path');
// .env fica na pasta Back-End (um nível acima de src/)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require("./app");

const PORT = process.env.PORT_SERVER;
app.listen(PORT, () => console.log(`Server Run -> Port:${PORT}`));
