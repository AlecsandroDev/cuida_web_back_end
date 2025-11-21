const supabase = require("../db/database");

class Pedido {
  static async criar(dados) {
    // O banco exige id_funcionario. Vamos usar o que vier do front ou fixar 1 se falhar.
    // Certifique-se de que existe um funcionário com ID 1 no banco ou altere este valor.
    const idFuncionario = 16; 

    const { data, error } = await supabase
      .from("pedido")
      .insert({
        id_cliente: dados.id_cliente,
        id_medicamento: dados.id_medicamento,
        id_unidade: dados.id_unidade,
        id_funcionario: idFuncionario, 
        quantidade: dados.quantidade,
        data_entrega: dados.data_entrega,
        horario_entrega: dados.horario_entrega
      })
      .select()
      .single();

    if (error) {
      console.error("Erro Supabase Pedido:", error);
      throw new Error(error.message);
    }
    return data;
  }

  static async listarPorCliente(idCliente) {
    const { data, error } = await supabase
      .from("pedido")
      .select(`
        *,
        medicamento:id_medicamento(nome),
        unidade:id_unidade(nome_unidade)
      `)
      .eq("id_cliente", idCliente);

    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = Pedido;