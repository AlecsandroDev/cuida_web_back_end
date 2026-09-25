/**
 * Logger mínimo em JSON (uma linha por evento), fácil de filtrar com grep/jq
 * ou de enviar a um agregador depois. Nunca registre telefone completo nem o
 * texto da mensagem: o fato de alguém esperar um remédio é dado de saúde (LGPD).
 */
function log(nivel, evento, dados = {}) {
  const linha = JSON.stringify({ ts: new Date().toISOString(), nivel, evento, ...dados });
  if (nivel === 'error') console.error(linha);
  else if (nivel === 'warn') console.warn(linha);
  else console.log(linha);
}

module.exports = {
  info: (evento, dados) => log('info', evento, dados),
  warn: (evento, dados) => log('warn', evento, dados),
  error: (evento, dados) => log('error', evento, dados)
};
