/**
 * Testa a fila contra uma Evolution API FALSA (servidor HTTP local),
 * sem Supabase e sem WhatsApp de verdade.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

function subirEvolutionFalsa({ conectado = true, derrubarNo = null } = {}) {
  const enviados = [];
  const server = http.createServer((req, res) => {
    let corpo = '';
    req.on('data', (c) => (corpo += c));
    req.on('end', () => {
      const json = corpo ? JSON.parse(corpo) : {};
      const responder = (status, obj) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
      if (req.headers.apikey !== 'chave-teste') return responder(401, { message: 'Unauthorized' });

      if (req.url.startsWith('/instance/connectionState/')) {
        return responder(200, { instance: { instanceName: 'cuida', state: conectado ? 'open' : 'close' } });
      }
      if (req.url.startsWith('/chat/whatsappNumbers/')) {
        // ...0000 não tem WhatsApp; DDD 31 está registrado SEM o 9 (JID legado)
        return responder(200, json.numbers.map((n) => {
          if (n.endsWith('0000')) return { exists: false, jid: `${n}@s.whatsapp.net`, number: n };
          if (n.startsWith('5531')) return { exists: n.length === 12, jid: `${n}@s.whatsapp.net`, number: n };
          return { exists: n.length === 13, jid: `${n}@s.whatsapp.net`, number: n };
        }));
      }
      if (req.url.startsWith('/message/sendText/')) {
        if (derrubarNo !== null && enviados.length === derrubarNo) {
          return responder(500, { status: 500, error: 'Internal Server Error', response: { message: ['Connection Closed'] } });
        }
        enviados.push(json);
        return responder(201, { key: { id: `MSG${enviados.length}` }, status: 'PENDING' });
      }
      responder(404, { message: 'rota' });
    });
  });
  return new Promise((ok) => server.listen(0, () => ok({ server, enviados, url: `http://127.0.0.1:${server.address().port}` })));
}

function inscrito(id, nome, telefone) {
  return {
    id_favorito: id, id_cliente: id,
    cliente: { nome_completo: nome, telefone, email: null },
    medicamento: { nome: 'Losartana 50mg' },
    unidade: { nome_unidade: 'UBS Centro' }
  };
}

function configurarEnv(url) {
  Object.assign(process.env, {
    WHATSAPP_API_URL: url, WHATSAPP_API_KEY: 'chave-teste', WHATSAPP_INSTANCE: 'cuida',
    EVOLUTION_API_VERSION: 'v1',
    WHATSAPP_INTERVALO_MIN_MS: '5', WHATSAPP_INTERVALO_MAX_MS: '10',
    WHATSAPP_PAUSA_A_CADA: '2', WHATSAPP_PAUSA_MIN_MS: '20', WHATSAPP_PAUSA_MAX_MS: '30',
    WHATSAPP_DIGITANDO_MIN_MS: '0', WHATSAPP_DIGITANDO_MAX_MS: '0',
    WHATSAPP_HORA_INICIO: '0', WHATSAPP_HORA_FIM: '24'
  });
}

test('lote completo: sucesso, 9º dígito, sem WhatsApp, inválido e duplicado', async () => {
  const evo = await subirEvolutionFalsa();
  configurarEnv(evo.url);
  const fila = require('../src/services/filaNotificacao');

  const lote = fila.enfileirarDisponibilidade([
    inscrito(1, 'MARIA DA SILVA', '(14) 99876-5432'),
    inscrito(2, 'João Souza', '(31) 98765-4321'),     // JID legado sem 9
    inscrito(3, 'Ana', '(14) 99123-0000'),            // sem WhatsApp
    inscrito(4, 'Pedro', '123'),                      // inválido
    inscrito(5, 'Maria (dup)', '14998765432'),        // duplicado do 1
    inscrito(6, 'Sem Fone', null)
  ], { id_medicamento: 1, id_unidade: 1 });

  const r = await fila.aguardarLote(lote.id);
  evo.server.close();

  const st = r.itens.map((i) => [i.whatsapp.status, i.whatsapp.codigo || '']);
  assert.deepEqual(st, [
    ['enviado', ''], ['enviado', ''], ['falhou', 'SEM_WHATSAPP'],
    ['ignorado', 'NUMERO_INVALIDO'], ['ignorado', 'DUPLICADO'], ['ignorado', 'SEM_TELEFONE']
  ]);
  assert.equal(r.status, 'concluido');
  assert.equal(r.itens[1].whatsapp.ajuste_9_digito, true);
  assert.equal(evo.enviados[1].number, '553187654321');           // mandou sem o 9
  assert.equal(evo.enviados[0].number, '5514998765432');
  assert.ok(evo.enviados[0].textMessage.text.includes('Maria'));   // primeiro nome capitalizado
  assert.ok(!JSON.stringify(r).includes('99876-5432'));            // nada de telefone aberto
  assert.deepEqual(r.resumo.whatsapp, { enviado: 2, falhou: 1, ignorado: 3, nao_enviado: 0, pendente: 0 });
});

test('instância cai no meio do lote: interrompe e não martela a API', async () => {
  const evo = await subirEvolutionFalsa({ derrubarNo: 1 });
  configurarEnv(evo.url);
  const fila = require('../src/services/filaNotificacao');

  const lote = fila.enfileirarDisponibilidade([
    inscrito(1, 'A', '(14) 99876-5401'),
    inscrito(2, 'B', '(14) 99876-5402'),
    inscrito(3, 'C', '(14) 99876-5403')
  ], { id_medicamento: 1, id_unidade: 1 });
  const r = await fila.aguardarLote(lote.id);
  evo.server.close();

  assert.deepEqual(r.itens.map((i) => i.whatsapp.status), ['enviado', 'falhou', 'nao_enviado']);
  assert.equal(r.itens[1].whatsapp.codigo, 'INSTANCIA_DESCONECTADA');
  assert.equal(r.status, 'concluido_com_interrupcao');
  assert.equal(evo.enviados.length, 1);
});

test('instância desconectada antes de começar: nenhum envio', async () => {
  const evo = await subirEvolutionFalsa({ conectado: false });
  configurarEnv(evo.url);
  const fila = require('../src/services/filaNotificacao');
  const lote = fila.enfileirarDisponibilidade([inscrito(1, 'A', '(14) 99876-5401')], {});
  const r = await fila.aguardarLote(lote.id);
  evo.server.close();
  assert.equal(r.itens[0].whatsapp.status, 'nao_enviado');
  assert.equal(evo.enviados.length, 0);
});

test('apikey errada vira NAO_AUTORIZADO', async () => {
  const evo = await subirEvolutionFalsa();
  configurarEnv(evo.url);
  process.env.WHATSAPP_API_KEY = 'errada';
  const wa = require('../src/services/whatsappService');
  await assert.rejects(wa.enviarTexto('5514998765432', 'oi'), (e) => e.classificacao.codigo === 'NAO_AUTORIZADO');
  evo.server.close();
});

test('API fora do ar vira ERRO_REDE (após retentativas)', async () => {
  configurarEnv('http://127.0.0.1:1');
  const wa = require('../src/services/whatsappService');
  const e = await wa.comRetry(() => { throw Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }); },
    { tentativas: 2, baseMs: 1 }).catch((x) => x);
  assert.equal(e.classificacao.codigo, 'ERRO_REDE');
});

test('mensagens variam dentro de um lote', () => {
  const { montarMensagemDisponibilidade } = require('../src/utils/mensagens');
  const textos = new Set(Array.from({ length: 30 }, () =>
    montarMensagemDisponibilidade({ nome: 'maria', medicamento: 'X', unidade: 'Y' })));
  assert.ok(textos.size > 10, `só ${textos.size} variações`);
});
