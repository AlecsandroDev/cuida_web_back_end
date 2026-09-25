/**
 * Teste direto contra a Evolution API (sem Express, sem Supabase).
 *
 *   node scripts/testar-whatsapp.js "(14) 99999-9999"            -> só diagnostica
 *   node scripts/testar-whatsapp.js "(14) 99999-9999" --enviar   -> envia de verdade
 *   node scripts/testar-whatsapp.js "(14) 99999-9999" --enviar --modelo
 *        (usa o texto de aviso de disponibilidade, com as variações)
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const wa = require('../src/services/whatsappService');
const { normalizarTelefoneBR } = require('../src/utils/telefone');
const { montarMensagemDisponibilidade } = require('../src/utils/mensagens');

(async () => {
  const [numero, ...flags] = process.argv.slice(2);
  if (!numero) {
    console.log('Uso: node scripts/testar-whatsapp.js "<telefone>" [--enviar] [--modelo]');
    process.exit(1);
  }
  const c = wa.cfg();
  console.log(`\n1) Configuração: ${c.url}  instância=${c.instancia}  payload=${c.versao}  apikey=${c.apiKey ? 'definida' : 'VAZIA'}`);

  const s = await wa.estadoConexao();
  console.log(`2) Estado da instância: ${s.estado}${s.conectado ? ' ✔' : ' ✘'}`);
  if (!s.conectado) {
    console.log('   -> Leia o QR code: GET /instance/connect/' + c.instancia + ' (ou pelo Manager da Evolution).');
    process.exit(2);
  }

  const tel = normalizarTelefoneBR(numero);
  console.log('3) Higienização:', tel);
  if (!tel.valido) process.exit(3);

  const v = await wa.verificarNumero(tel.variantes);
  console.log('4) Verificação no WhatsApp:', v);
  if (v.existe === false) process.exit(4);
  const destino = v.numero || tel.numero;

  if (!flags.includes('--enviar')) {
    console.log(`\nTudo certo. Enviaria para ${destino}. Rode de novo com --enviar para mandar.\n`);
    return;
  }

  const texto = flags.includes('--modelo')
    ? montarMensagemDisponibilidade({ nome: 'Teste', medicamento: 'Losartana 50mg', unidade: 'UBS Centro' })
    : `Teste CUIDA ✔ ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

  try {
    const r = await wa.enviarTexto(destino, texto, { delayDigitacao: 1500 });
    console.log('5) Enviado! id_mensagem =', r.idMensagem);
  } catch (err) {
    const info = err.classificacao || wa.classificarErro(err);
    console.error('5) FALHOU:', info.codigo, info.status || '', JSON.stringify(info.detalhe));
    process.exit(5);
  }
})();
