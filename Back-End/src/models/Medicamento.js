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

  
  static async uploadFoto(id, file) {
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
      .from('medicamentos')
      .update({ foto_url: publicUrl })
      .eq('id', id)
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