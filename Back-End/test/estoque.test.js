/**
 * Entrada de estoque + aviso automático — sem Supabase (models simulados).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { darEntrada, validarEntrada } = require('../src/services/estoqueService');

const HOJE = '2026-09-29';
const valido = (extra = {}) => ({
  id_medicamento: 2, id_unidade: 4, quantidade: 50, lote: 'ABC123', data_vencimento: '2027-06-30', ...extra
});

/** Banco em memória com a mesma interface do model Estoque */
function bancoFalso({ estoqueInicial = 0, loteExistente = null, falhaEstoque = null, falhaLote = null } = {}) {
  const chamadas = { criarLote: 0, removerLote: 0, somar: [] };
  let idLote = 100;
  return {
    chamadas,
    hojeBrasilia: () => HOJE,
    quantidadeDisponivel: async () => estoqueInicial,
    buscarLote: async () => loteExistente,
    criarLote: async (d) => {
      chamadas.criarLote++;
      if (falhaLote) throw Object.assign(new Error('fk'), { codigoSupabase: falhaLote });
      return { id_lote: ++idLote, id_medicamento: d.id_medicamento, lote: d.lote, data_vencimento: d.data_vencimento };
    },
    removerLote: async () => { chamadas.removerLote++; },
    somarEstoque: async (u, l, q) => {
      chamadas.somar.push([u, l, q]);
      if (falhaEstoque) throw Object.assign(new Error('fk'), { codigoSupabase: falhaEstoque });
      return { id_estoque: 7, id_unidade: u, id_lote: l, quantidade: q, criado: true };
    }
  };
}

function filaFalsa() {
  const enfileirados = [];
  return {
    enfileirados,
    enfileirarDisponibilidade: (inscritos, params) => { enfileirados.push({ inscritos, params }); return { id: 'lote-xyz' }; }
  };
}

const favoritos = (n) => ({ buscarInteressados: async () => Array.from({ length: n }, (_, i) => ({ id_favorito: i + 1 })) });

test('estava zerado + tem interessados -> avisa automaticamente', async () => {
  const Estoque = bancoFalso({ estoqueInicial: 0 });
  const fila = filaFalsa();
  const r = await darEntrada(valido(), { Estoque, Favorito: favoritos(3), fila, hoje: HOJE });

  assert.equal(r.estoque_antes, 0);
  assert.equal(r.estoque_depois, 50);
  assert.equal(r.entrada.lote_novo, true);
  assert.deepEqual(r.notificacao, {
    disparada: true, id_lote_notificacao: 'lote-xyz', total_inscritos: 3,
    acompanhar_em: '/api/whatsapp/notificacoes/lote-xyz'
  });
  assert.equal(fila.enfileirados.length, 1);
  assert.equal(fila.enfileirados[0].params.origem, 'entrada_estoque');
});

test('já havia estoque -> só registra, não avisa', async () => {
  const fila = filaFalsa();
  const r = await darEntrada(valido(), { Estoque: bancoFalso({ estoqueInicial: 10 }), Favorito: favoritos(3), fila, hoje: HOJE });
  assert.equal(r.estoque_depois, 60);
  assert.equal(r.notificacao.motivo, 'JA_HAVIA_ESTOQUE');
  assert.equal(fila.enfileirados.length, 0);
});

test('estava zerado mas ninguém favoritou -> não avisa', async () => {
  const fila = filaFalsa();
  const r = await darEntrada(valido(), { Estoque: bancoFalso(), Favorito: favoritos(0), fila, hoje: HOJE });
  assert.equal(r.notificacao.motivo, 'SEM_INTERESSADOS');
  assert.equal(fila.enfileirados.length, 0);
});

test('notificar:false -> registra sem avisar (ex.: carga inicial)', async () => {
  const fila = filaFalsa();
  const r = await darEntrada(valido({ notificar: false }), { Estoque: bancoFalso(), Favorito: favoritos(3), fila, hoje: HOJE });
  assert.equal(r.notificacao.motivo, 'NOTIFICACAO_DESLIGADA');
  assert.equal(fila.enfileirados.length, 0);
});

test('lote já cadastrado é reaproveitado', async () => {
  const Estoque = bancoFalso({ loteExistente: { id_lote: 55, lote: 'ABC123', data_vencimento: '2027-06-30' } });
  const r = await darEntrada(valido(), { Estoque, Favorito: favoritos(1), fila: filaFalsa(), hoje: HOJE });
  assert.equal(Estoque.chamadas.criarLote, 0);
  assert.equal(r.entrada.id_lote, 55);
  assert.equal(r.entrada.lote_novo, false);
  assert.deepEqual(Estoque.chamadas.somar[0], [4, 55, 50]);
});

test('lote já cadastrado com outro vencimento -> 409', async () => {
  const Estoque = bancoFalso({ loteExistente: { id_lote: 55, lote: 'ABC123', data_vencimento: '2027-01-01' } });
  await assert.rejects(darEntrada(valido(), { Estoque, Favorito: favoritos(1), fila: filaFalsa(), hoje: HOJE }),
    (e) => e.status === 409 && e.codigo === 'LOTE_VENCIMENTO_DIVERGENTE');
});

test('medicamento inexistente -> 404', async () => {
  const Estoque = bancoFalso({ falhaLote: '23503' });
  await assert.rejects(darEntrada(valido(), { Estoque, Favorito: favoritos(1), fila: filaFalsa(), hoje: HOJE }),
    (e) => e.status === 404 && e.codigo === 'MEDICAMENTO_INEXISTENTE');
});

test('unidade inexistente -> 404 e desfaz o lote recém-criado', async () => {
  const Estoque = bancoFalso({ falhaEstoque: '23503' });
  await assert.rejects(darEntrada(valido(), { Estoque, Favorito: favoritos(1), fila: filaFalsa(), hoje: HOJE }),
    (e) => e.status === 404 && e.codigo === 'UNIDADE_INEXISTENTE');
  assert.equal(Estoque.chamadas.removerLote, 1);
});

test('falha ao avisar NÃO desfaz a entrada de estoque', async () => {
  const Favorito = { buscarInteressados: async () => { throw new Error('supabase fora'); } };
  const r = await darEntrada(valido(), { Estoque: bancoFalso(), Favorito, fila: filaFalsa(), hoje: HOJE });
  assert.equal(r.estoque_depois, 50);
  assert.equal(r.notificacao.disparada, false);
  assert.equal(r.notificacao.motivo, 'ERRO_AO_NOTIFICAR');
});

test('validação: lista todos os problemas de uma vez', () => {
  assert.throws(() => validarEntrada({ id_medicamento: 'x', quantidade: 0, data_vencimento: '30/06/2027' }, HOJE), (e) => {
    assert.equal(e.status, 400);
    assert.equal(e.erros.length, 5);
    return true;
  });
});

test('validação: lote vencido e data impossível são recusados', () => {
  assert.throws(() => validarEntrada(valido({ data_vencimento: '2026-09-28' }), HOJE), (e) => /vencido/.test(e.erros[0]));
  assert.throws(() => validarEntrada(valido({ data_vencimento: '2027-02-30' }), HOJE), (e) => /AAAA-MM-DD/.test(e.erros[0]));
  assert.equal(validarEntrada(valido({ data_vencimento: HOJE }), HOJE).data_vencimento, HOJE); // vence hoje: aceita
});

test('rota HTTP: body inválido -> 400 com a lista de erros', async () => {
  process.env.SUPABASE_URL ||= 'http://127.0.0.1:1';
  process.env.SUPABASE_KEY ||= 'teste';
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use('/api/estoques', require('../src/routes/estoqueRoutes'));
  const srv = app.listen(0);
  const url = `http://127.0.0.1:${srv.address().port}/api/estoques/entrada`;
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  const json = await r.json();
  srv.close();
  assert.equal(r.status, 400);
  assert.equal(json.codigo, 'DADOS_INVALIDOS');
  assert.ok(json.erros.length >= 4);
});
