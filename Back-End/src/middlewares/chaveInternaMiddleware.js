/**
 * Protege rotas administrativas (disparo em massa) com uma chave no header
 * `x-api-key`. Só é exigida se NOTIFICACAO_API_KEY estiver definida no .env,
 * para não quebrar o ambiente de desenvolvimento.
 */
const crypto = require('crypto');

module.exports = function exigirChaveInterna(req, res, next) {
  const esperada = process.env.NOTIFICACAO_API_KEY;
  if (!esperada) return next();

  const recebida = String(req.headers['x-api-key'] || '');
  const a = Buffer.from(recebida);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ success: false, error: 'Chave interna inválida ou ausente (x-api-key).' });
  }
  next();
};
