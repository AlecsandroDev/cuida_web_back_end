/**
 * Normalização de telefones brasileiros para a Evolution API.
 *
 * Formato canônico de saída: 55 + DDD (2) + número (9 dígitos para celular)
 *   ex.: "(14) 99876-5432"  -> "5514998765432"
 *        "14 9876-5432"     -> "5514998765432"  (9º dígito adicionado)
 *        "+55 014 99876..." -> "5514998765432"
 *
 * Também devolve "variantes" (com e sem o 9º dígito), porque contas antigas de
 * WhatsApp em alguns DDDs continuam registradas sem o 9 no JID. A verificação
 * via /chat/whatsappNumbers resolve qual das duas existe de fato.
 */

// DDDs válidos no Brasil (Anatel)
const DDDS_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99
]);

/**
 * @param {string|number|null|undefined} entrada
 * @returns {{
 *   valido: boolean,
 *   numero?: string,        // canônico, 55+DDD+número
 *   variantes?: string[],   // [canônico, alternativa sem/ com 9º dígito]
 *   ddd?: number,
 *   tipo?: 'celular'|'fixo',
 *   motivo?: string
 * }}
 */
function normalizarTelefoneBR(entrada) {
  if (entrada === null || entrada === undefined || String(entrada).trim() === '') {
    return { valido: false, motivo: 'SEM_TELEFONE' };
  }

  let d = String(entrada).replace(/\D/g, '');

  // Remove zeros à esquerda (ex.: "014...", "0055...")
  d = d.replace(/^0+/, '');

  // Com DDI 55 explícito: 55 + 10 ou 11 dígitos
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) {
    d = d.slice(2);
  }

  // Código de operadora (0 + XX + DDD + número) já teve o 0 removido:
  // sobram 2 dígitos da operadora na frente -> 12 ou 13 dígitos sem "55"
  if ((d.length === 12 || d.length === 13) && !d.startsWith('55')) {
    d = d.slice(2);
  }

  if (d.length !== 10 && d.length !== 11) {
    return { valido: false, motivo: 'NUMERO_INVALIDO' };
  }

  const ddd = Number(d.slice(0, 2));
  if (!DDDS_VALIDOS.has(ddd)) {
    return { valido: false, motivo: 'DDD_INVALIDO' };
  }

  let local = d.slice(2);

  if (local.length === 9) {
    // Celular com 9º dígito: obrigatoriamente começa com 9
    if (local[0] !== '9') return { valido: false, motivo: 'NUMERO_INVALIDO' };
  } else {
    // 8 dígitos: celular antigo (6-9) ou fixo (2-5)
    const primeiro = local[0];
    if ('6789'.includes(primeiro)) {
      local = '9' + local; // adiciona o 9º dígito
    } else if ('2345'.includes(primeiro)) {
      const numero = `55${ddd}${local}`;
      // Fixo pode ter WhatsApp Business; deixa a verificação decidir
      return { valido: true, numero, variantes: [numero], ddd, tipo: 'fixo' };
    } else {
      return { valido: false, motivo: 'NUMERO_INVALIDO' };
    }
  }

  // Números "fake" comuns em cadastro: todos os dígitos iguais
  if (/^(\d)\1+$/.test(local.slice(1))) {
    return { valido: false, motivo: 'NUMERO_INVALIDO' };
  }

  const numero = `55${ddd}${local}`;           // com 9
  const sem9 = `55${ddd}${local.slice(1)}`;    // sem 9 (JID legado)
  return { valido: true, numero, variantes: [numero, sem9], ddd, tipo: 'celular' };
}

/** Mascara o telefone para logs (LGPD): 5514*****5432 */
function mascararTelefone(numero) {
  const d = String(numero || '').replace(/\D/g, '');
  if (d.length < 8) return '***';
  return d.slice(0, 4) + '*'.repeat(d.length - 8) + d.slice(-4);
}

module.exports = { normalizarTelefoneBR, mascararTelefone, DDDS_VALIDOS };
