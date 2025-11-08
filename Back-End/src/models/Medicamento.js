const supabase = require('../db/database');

class Medicamento {
  static async getMedicamentos(id) {
    const { data, error } = await supabase
      .from('medicamento')
      .select('*')
      .eq('id_medicamento', id);

    if (error) {
      return [];
    }

    return data;
  }
}

module.exports = Medicamento;