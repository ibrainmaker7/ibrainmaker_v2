import { supabase } from './supabaseClient';

const DEMO_PARTICIPANT_ID = 'b0000000-0000-0000-0000-000000000003';

export const studentApi = {
  DEMO_PARTICIPANT_ID,

  async getFRQSubmissions(participantId = DEMO_PARTICIPANT_ID) {
    const { data, error } = await supabase
      .from('frq_submissions')
      .select('*')
      .eq('participant_id', participantId);

    if (error) throw error;
    return data || [];
  },

  async uploadFRQFile(file, participantId, questionId, pageKey) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${participantId}/${questionId}/${pageKey}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('frq-uploads')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('frq-uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async saveFRQSubmission(participantId, questionId, pageKey, fileUrl, fileName) {
    const { data, error } = await supabase
      .from('frq_submissions')
      .upsert({
        participant_id: participantId,
        question_id: questionId,
        page_key: pageKey,
        file_url: fileUrl,
        file_name: fileName,
        submitted_by: 'student',
        uploaded_at: new Date().toISOString()
      }, {
        onConflict: 'participant_id,question_id,page_key'
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  subscribeToFRQSubmissions(participantId = DEMO_PARTICIPANT_ID, callback) {
    const channel = supabase
      .channel(`student-frq-${participantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'frq_submissions',
          filter: `participant_id=eq.${participantId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
