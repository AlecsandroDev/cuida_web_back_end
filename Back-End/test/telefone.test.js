const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizarTelefoneBR, mascararTelefone } = require('../src/utils/telefone');

const casos = [
  // entrada,                  numero esperado
  ['(14) 99876-5432',          '5514998765432'],
  ['14998765432',              '5514998765432'],
  ['+55 14 99876-5432',        '5514998765432'],
  ['5514998765432',            '5514998765432'],
  ['014 99876 5432',           '5514998765432'], // zero de longa distância
  ['0 15 14 99876-5432',       '5514998765432'], // código de operadora
  ['14 9876-5432',             '5514998765432'], // sem 9º dígito -> adiciona
  ['551498765432',             '5514998765432'], // DDI + 8 dígitos
  ['55 55 99876-5432',         '5555998765432'], // DDD 55 (RS)
  ['55998765432',              '5555998765432'], // DDD 55 sem DDI
  [5514998765432,              '5514998765432'], // number
];

for (const [entrada, esperado] of casos) {
  test(`normaliza ${entrada}`, () => {
    const r = normalizarTelefoneBR(entrada);
    assert.equal(r.valido, true, JSON.stringify(r));
    assert.equal(r.numero, esperado);
    assert.equal(r.tipo, 'celular');
    assert.deepEqual(r.variantes, [esperado, esperado.slice(0, 4) + esperado.slice(5)]);
  });
}

test('fixo é aceito sem variantes', () => {
  const r = normalizarTelefoneBR('(14) 3232-1010');
  assert.equal(r.valido, true);
  assert.equal(r.tipo, 'fixo');
  assert.deepEqual(r.variantes, ['551432321010']);
});

for (const [entrada, motivo] of [
  [null, 'SEM_TELEFONE'], ['', 'SEM_TELEFONE'], ['   ', 'SEM_TELEFONE'],
  ['12345', 'NUMERO_INVALIDO'], ['(20) 99876-5432', 'DDD_INVALIDO'],
  ['(14) 89876-5432', 'NUMERO_INVALIDO'],  // 9 dígitos sem começar por 9
  ['(14) 99999-9999', 'NUMERO_INVALIDO'],  // número "fake"
  ['(14) 1234-5678', 'NUMERO_INVALIDO'],
]) {
  test(`rejeita ${entrada} -> ${motivo}`, () => {
    const r = normalizarTelefoneBR(entrada);
    assert.equal(r.valido, false);
    assert.equal(r.motivo, motivo);
  });
}

test('mascara telefone', () => {
  assert.equal(mascararTelefone('5514998765432'), '5514*****5432');
});
