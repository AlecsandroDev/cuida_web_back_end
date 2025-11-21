const supabase = require('../db/database');
const { v4: uuidv4 } = require('uuid'); // Certifique-se de ter o uuid importado se for usar no upload

class Medicamento {
  static async getMedicamentos(id) {
    const { data, error } = await supabase
      .from('medicamento')
      .select('*')
      .eq('id_medicamento', id);

    if (error) {
      return [];
    }

    // 👇 LÓGICA NOVA: Formata os dados antes de retornar
    const dadosFormatados = data.map(med => {
      const classif = med.classificacao || '';
      const text = classif.toLowerCase();
      
      const precisaReceita = text.includes('tarja') || 
                             text.includes('receita') || 
                             text.includes('controlado') || 
                             text.includes('antibiótico') ||
                             text.includes('antimicrobiano');

      // Retorna o objeto com o novo campo
      return {
        ...med,
        requer_prescricao: precisaReceita
      };
    });

    return dadosFormatados;
  }

  
  static async uploadFoto(id, file) {
    // (Mantendo o código de upload original intacto)
    const bucketName = 'fotos_medicamentos';
    const fileExt = file.originalname.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error("Supabase Storage error:", uploadError);
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);

    if (!urlData) {
      throw new Error("Não foi possível obter a URL pública do arquivo.");
    }
    
    const publicUrl = urlData.publicUrl;

    const { data, error: updateError } = await supabase
      .from('medicamento') // Atenção: nome da tabela geralmente é singular no seu padrão
      .update({ foto_url: publicUrl })
      .eq('id_medicamento', id)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase DB error (update):", updateError);
      throw new Error(updateError.message);
    }

    return data;
  }
}

module.exports = Medicamento;