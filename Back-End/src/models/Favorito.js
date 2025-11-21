const supabase = require("../db/database");

class Favorito {
  static async adicionar(dados) {
    const { data, error } = await supabase
      .from("favorito")
      .insert({
        id_cliente: dados.id_cliente,
        id_unidade: dados.id_unidade,
        id_medicamento: dados.id_medicamento
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async listarPorCliente(idCliente) {
    // CORREÇÃO: Adicionei id_unidade e id_medicamento na seleção
    const { data, error } = await supabase
      .from("favorito")
      .select(`
        id_favorito,
        id_unidade,      
        id_medicamento,  
        medicamento:id_medicamento (nome, principio_ativo),
        unidade:id_unidade (nome_unidade, endereco)
      `)
      .eq("id_cliente", idCliente);

    if (error) throw new Error(error.message);
    return data;
  }

  static async remover(idFavorito) {
    const { error } = await supabase
      .from("favorito")
      .delete()
      .eq("id_favorito", idFavorito);

    if (error) throw new Error(error.message);
    return true;
  }
}

module.exports = Favorito;