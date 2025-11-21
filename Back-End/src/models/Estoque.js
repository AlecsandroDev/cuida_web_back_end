const supabase = require('../db/database');

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
}

module.exports = Estoque;