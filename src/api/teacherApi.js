import { supabase } from './supabaseClient';

const DEMO_SESSION_ID = 'a0000000-0000-0000-0000-000000000001';

const FRQ_QUESTIONS = [
  { id: 'q5', label: 'FRQ 1', pages: ['page1', 'page2'] },
  { id: 'q6', label: 'FRQ 2', pages: ['page1', 'page2'] }
];

export const teacherApi = {
  FRQ_QUESTIONS,

  async getSessionParticipants(sessionId = DEMO_SESSION_ID) {
    const { data, error } = await supabase
      .from('exam_participants')
      .select(`
        *,
        frq_submissions (*)
      `)
      .eq('session_id', sessionId)
      .order('student_name');

    if (error) throw error;
    return data;
  },

  async getSessionInfo(sessionId = DEMO_SESSION_ID) {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) throw error;
    return data;
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
        submitted_by: 'teacher_manual_support',
        uploaded_at: new Date().toISOString()
      }, {
        onConflict: 'participant_id,question_id,page_key'
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  subscribeToSubmissions(sessionId = DEMO_SESSION_ID, callback) {
    const channel = supabase
      .channel('frq-submissions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'frq_submissions'
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
