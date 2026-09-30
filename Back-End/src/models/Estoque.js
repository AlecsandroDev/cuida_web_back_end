const supabase = require('../db/database');

/** Data de hoje (YYYY-MM-DD) no fuso de Brasília — usada para ignorar lotes vencidos */
function hojeBrasilia() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

function erroSupabase(error, contexto) {
  const e = new Error(`${contexto}: ${error.message}`);
  e.codigoSupabase = error.code; // ex.: 23503 = chave estrangeira inexistente
  return e;
}

class Estoque {
  static async getEstoque() {
    const { data, error } = await supabase
      .from('estoque')
      .select(`
            id_unidade,
            quantidade,
            lote (
                data_vencimento,
                medicamento (
                    *
                )
            )
        `);

    if (error) {
      return [];
    }

    // 👇 LÓGICA NOVA: Verifica a classificação e adiciona a flag requer_prescricao
    const estoqueFormatado = data.map(item => {
      if (item.lote && item.lote.medicamento) {
        const classif = item.lote.medicamento.classificacao || '';
        const text = classif.toLowerCase();

        // Lista de termos que indicam necessidade de receita
        const precisaReceita = text.includes('tarja') ||
                               text.includes('receita') ||
                               text.includes('controlado') ||
                               text.includes('antibiótico') ||
                               text.includes('antimicrobiano');

        // Adiciona o campo booleano que o Front espera
        item.lote.medicamento.requer_prescricao = precisaReceita;
      }
      return item;
    });

    return estoqueFormatado;
  }

  /**
   * Quantidade disponível de um medicamento numa UBS:
   * soma do estoque de todos os lotes NÃO vencidos daquele medicamento.
   */
  static async quantidadeDisponivel(idMedicamento, idUnidade) {
    const { data, error } = await supabase
      .from('estoque')
      .select('quantidade, lote!inner(id_medicamento, data_vencimento)')
      .eq('id_unidade', idUnidade)
      .eq('lote.id_medicamento', idMedicamento)
      .gte('lote.data_vencimento', hojeBrasilia());

    if (error) throw erroSupabase(error, 'Erro ao consultar estoque');
    return (data || []).reduce((soma, linha) => soma + (Number(linha.quantidade) || 0), 0);
  }

  /** Procura o lote do fabricante (mesmo medicamento + mesmo código) */
  static async buscarLote(idMedicamento, codigoLote) {
    const { data, error } = await supabase
      .from('lote')
      .select('id_lote, id_medicamento, lote, data_vencimento')
      .eq('id_medicamento', idMedicamento)
      .eq('lote', codigoLote)
      .limit(1);

    if (error) throw erroSupabase(error, 'Erro ao buscar lote');
    return data && data[0] ? data[0] : null;
  }

  static async criarLote({ id_medicamento, lote, data_vencimento }) {
    const { data, error } = await supabase
      .from('lote')
      .insert({ id_medicamento, lote, data_vencimento })
      .select('id_lote, id_medicamento, lote, data_vencimento')
      .single();

    if (error) throw erroSupabase(error, 'Erro ao criar lote');
    return data;
  }

  static async removerLote(idLote) {
    await supabase.from('lote').delete().eq('id_lote', idLote);
  }

  /**
   * Soma a quantidade ao estoque do lote na UBS (cria a linha se não existir).
   * Obs.: leitura + escrita não é atômica. Para uso concorrente intenso,
   * trocar por uma função SQL (RPC) com "update ... set quantidade = quantidade + x".
   */
  static async somarEstoque(idUnidade, idLote, quantidade) {
    const { data: existentes, error: erroBusca } = await supabase
      .from('estoque')
      .select('id_estoque, quantidade')
      .eq('id_unidade', idUnidade)
      .eq('id_lote', idLote)
      .limit(1);

    if (erroBusca) throw erroSupabase(erroBusca, 'Erro ao consultar estoque do lote');

    if (existentes && existentes[0]) {
      const atual = existentes[0];
      const { data, error } = await supabase
        .from('estoque')
        .update({ quantidade: Number(atual.quantidade) + quantidade })
        .eq('id_estoque', atual.id_estoque)
        .select('id_estoque, id_unidade, id_lote, quantidade')
        .single();
      if (error) throw erroSupabase(error, 'Erro ao atualizar estoque');
      return { ...data, criado: false };
    }

    const { data, error } = await supabase
      .from('estoque')
      .insert({ id_unidade: idUnidade, id_lote: idLote, quantidade })
      .select('id_estoque, id_unidade, id_lote, quantidade')
      .single();
    if (error) throw erroSupabase(error, 'Erro ao registrar estoque');
    return { ...data, criado: true };
  }
}

Estoque.hojeBrasilia = hojeBrasilia;
module.exports = Estoque;
