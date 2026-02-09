import { supabase } from './supabaseClient';

export const examApi = {
  async fetchExamQuestions(examId) {
    const { data, error } = await supabase
      .from('exam_questions')
      .select(`
        *,
        question:questions(*)
      `)
      .eq('exam_id', examId)
      .order('order_index');

    if (error) throw error;
    return data;
  },

  async getExamDetails(examId) {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (error) throw error;
    return data;
  },

  async createExamAttempt(examId, studentId) {
    const { data, error } = await supabase
      .from('exam_attempts')
      .insert({
        exam_id: examId,
        student_id: studentId,
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async submitExamAttempt(attemptId, answers, totalTimeSpent) {
    const { data: attempt, error: attemptError } = await supabase
      .from('exam_attempts')
      .update({
        status: 'completed',
        submitted_at: new Date().toISOString(),
        total_time_spent: totalTimeSpent
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (attemptError) throw attemptError;

    const answersToInsert = answers.map(answer => ({
      attempt_id: attemptId,
      question_id: answer.question_id,
      selected_option: answer.selected_option || null,
      written_answer: answer.written_answer || null,
      confidence_level: answer.confidence_level || 'medium',
      time_spent: answer.time_spent || 0,
      interaction_log: answer.interaction_log || []
    }));

    const { data: savedAnswers, error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert)
      .select();

    if (answersError) throw answersError;

    return { attempt, answers: savedAnswers };
  },

  async saveTempAnswer(attemptId, questionId, answerData) {
    const { data, error } = await supabase
      .from('temp_answers')
      .upsert({
        attempt_id: attemptId,
        question_id: questionId,
        selected_option: answerData.selected_option || null,
        written_answer: answerData.written_answer || null,
        confidence_level: answerData.confidence_level || 'medium',
        time_spent: answerData.time_spent || 0,
        interaction_log: answerData.interaction_log || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'attempt_id,question_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTempAnswers(attemptId) {
    const { data, error } = await supabase
      .from('temp_answers')
      .select('*')
      .eq('attempt_id', attemptId);

    if (error) throw error;
    return data;
  },

  async getExamAttempt(attemptId) {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select(`
        *,
        exam:exams(*),
        answers(*)
      `)
      .eq('id', attemptId)
      .single();

    if (error) throw error;
    return data;
  },

  async pauseExamAttempt(attemptId) {
    const { data, error } = await supabase
      .from('exam_attempts')
      .update({
        status: 'paused',
        paused_at: new Date().toISOString()
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async resumeExamAttempt(attemptId) {
    const { data, error } = await supabase
      .from('exam_attempts')
      .update({
        status: 'in_progress',
        resumed_at: new Date().toISOString()
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
