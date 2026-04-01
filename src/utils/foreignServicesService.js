import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const foreignServicesService = {
  async getContent(language = 'en') {
    try {
      const { data, error } = await supabase
        .from('foreign_services')
        .select('*')
        .eq('language', language)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching foreign services content:', error);
      throw error;
    }
  },

  async getContentForAdmin(language = 'en') {
    try {
      const { data, error } = await supabase
        .from('foreign_services')
        .select('*')
        .eq('language', language)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching foreign services content for admin:', error);
      throw error;
    }
  },

  async updateContent(language, contentData, userEmail) {
    try {
      const updateData = {
        ...contentData,
        updated_at: new Date().toISOString(),
        last_updated_by: userEmail,
      };

      const { data, error } = await supabase
        .from('foreign_services')
        .update(updateData)
        .eq('language', language)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating foreign services content:', error);
      throw error;
    }
  },

  async publishContent(language, userEmail) {
    try {
      const { data, error } = await supabase
        .from('foreign_services')
        .update({
          is_published: true,
          updated_at: new Date().toISOString(),
          last_updated_by: userEmail,
        })
        .eq('language', language)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error publishing foreign services content:', error);
      throw error;
    }
  },
};
