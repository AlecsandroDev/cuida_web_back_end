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

    return data;
  }
}

module.exports = Estoque;