/**
 * Monta textos de aviso com variação (saudação, corpo e fechamento sorteados),
 * para que um lote não saia com mensagens idênticas byte a byte.
 * Todas as variações dizem a mesma coisa e soam naturais — nada de caracteres
 * invisíveis ou "spintax" sem sentido, que o WhatsApp também detecta.
 */

const SAUDACOES = [
  'Olá, {nome}!',
  'Oi, {nome}, tudo bem?',
  'Bom dia, {nome}!',          // trocado por boa tarde/noite conforme o horário
  '{nome}, temos uma boa notícia!',
  'Olá {nome}, aqui é o CUIDA.'
];

const CORPOS = [
  'O medicamento *{medicamento}* que você acompanha chegou na *{unidade}* e já está disponível para retirada.',
  'Chegou na *{unidade}* o medicamento *{medicamento}*, que você marcou como favorito.',
  'O *{medicamento}* já pode ser retirado na *{unidade}*.',
  'A *{unidade}* recebeu *{medicamento}*. Ele já está disponível para retirada.'
];

const ORIENTACOES = [
  'Leve um documento com foto e a receita médica.',
  'Não esqueça de levar documento e receita.',
  'Para retirar, apresente documento com foto e receita médica.'
];

const RODAPES = [
  'Para não receber mais este aviso, remova o favorito no app CUIDA.',
  'Você recebeu este aviso porque favoritou este medicamento no CUIDA. Para parar, é só remover o favorito no app.'
];

function sortear(lista, rnd = Math.random) {
  return lista[Math.floor(rnd() * lista.length)];
}

function saudacaoPorHorario(texto, data = new Date()) {
  // Horário de Brasília
  const hora = Number(
    new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }).format(data)
  );
  const cumprimento = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  return texto.replace('Bom dia', cumprimento);
}

function primeiroNome(nomeCompleto) {
  const p = String(nomeCompleto || '').trim().split(/\s+/)[0];
  if (!p) return '';
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
}

function preencher(t, vars) {
  return t.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

/**
 * @param {{ nome?: string, medicamento: string, unidade: string }} dados
 * @param {() => number} [rnd] gerador aleatório (injetável nos testes)
 */
function montarMensagemDisponibilidade(dados, rnd = Math.random) {
  const nome = primeiroNome(dados.nome) || 'cidadão(ã)';
  const vars = { nome, medicamento: dados.medicamento, unidade: dados.unidade };

  const saudacao = saudacaoPorHorario(preencher(sortear(SAUDACOES, rnd), vars));
  const corpo = preencher(sortear(CORPOS, rnd), vars);
  const orientacao = sortear(ORIENTACOES, rnd);
  const rodape = sortear(RODAPES, rnd);

  return `${saudacao}\n\n${corpo}\n${orientacao}\n\n_${rodape}_`;
}

module.exports = { montarMensagemDisponibilidade, primeiroNome };
