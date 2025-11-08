const supabase = require('../db/database');

class Lote {
  static async getLote() {
    const { data, error } = await supabase
      .from('lote')
      .select('*');

    if (error) {
      return [];
    }

    return data;
  }
}

module.exports = Lote;