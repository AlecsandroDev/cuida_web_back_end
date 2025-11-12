const supabase = require("../db/database");
const bcrypt = require("bcryptjs");

class Cliente {
  static async createCliente(data) {
    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(data.password, salt);

    const { data: novoCliente, error } = await supabase
      .from("cliente")
      .insert({
        nome_completo: data.nome,
        idade: data.idade,
        cpf: data.cpf,
        rg: data.rg,
        email: data.email,
        telefone: data.telefone,
        endereco_completo: data.endereco,
        carteirinha_sus: data.carteirinha,
        tipo_sanguineo: data.tipoSanguineo,
        medicamentos_restritos: data.medicamentosRestritos,
        problemas_saude: data.diagnosticos,
        senha_hash: senha_hash,
        foto_url: null
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar cliente:", error.message);
      return null;
    }

    return novoCliente;
  }

  static async loginCliente(data) {
    const { data: cliente, error } = await supabase
      .from("cliente")
      .select("*")
      .eq("cpf", data.cpf)
      .single();

    if (error || !cliente) return null;

    const senhaCorreta = await bcrypt.compare(data.password, cliente.senha_hash);
    if (!senhaCorreta) return null;

    delete cliente.senha_hash;
    return cliente;
  }

  static async perfilCliente(clienteID) {
    const { data, error } = await supabase
      .from("cliente")
      .select("*")
      .eq("id_cliente", clienteID)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error.message);
      return null;
    }

    return data;
  }

  static async atualizarPerfilCliente(clienteID, dados) {
    delete dados.clienteID;
    delete dados.created_at;
    delete dados.foto_url; 

    const { data, error } = await supabase
      .from('cliente')
      .update(dados)
      .eq('id_cliente', clienteID)           
      .select()              
      .single();             

    if (error) {
      console.error("Supabase error (update):", error);
      throw new Error(error.message);
    }

    return data;
  }


  static async atualizarFoto(clienteID, file) {
    try {
      const buffer = Buffer.from(file.buffer);

      const { data: uploaded, error: uploadError } = await supabase.storage
        .from("perfil")
        .upload(`fotos/${clienteID}.jpg`, buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("perfil")
        .getPublicUrl(`fotos/${clienteID}.jpg`);

      const { error: updateError } = await supabase
        .from("cliente")
        .update({ foto_url: publicUrl.publicUrl })
        .eq("id_cliente", clienteID);

      if (updateError) throw updateError;

      return publicUrl.publicUrl;
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
      return null;
    }
  }
}

module.exports = Cliente;
