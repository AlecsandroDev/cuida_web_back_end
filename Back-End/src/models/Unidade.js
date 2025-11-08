const supabase = require('../db/database');

class Unidade {
  static async getUnidade() {
    const { data, error } = await supabase
      .from('unidade')
      .select(`
        id:      id_unidade,
        name:    nome_unidade,
        address: endereco,
        lat:     latitude,
        lon:     longitude,
        tel:     telefone,
        aberto:  hora_abertura,
        fechado: hora_fechamento 
      `);

    if (error) {
      return [];
    }

    return data;
  }
}

module.exports = Unidade;