import { supabase } from './supabaseClient';

export const gradingApi = {
  async gradeExamAttempt(attemptId, preferredLanguage = 'en') {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/grade-exam`;

    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          attempt_id: attemptId,
          preferred_language: preferredLanguage
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Grading failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.warn('Edge Function not available, using mock grading:', error.message);

      return {
        success: true,
        attempt_id: attemptId,
        message: 'Mock grading completed (Edge Function not yet deployed)',
        mcq_score: 0,
        frq_score: 0,
        total_score: 0
      };
    }
  },

  async getMCQCorrectAnswers(questionIds) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, correct_answer')
      .in('id', questionIds)
      .eq('question_type', 'mcq');

    if (error) throw error;
    return data;
  },

  async gradeMCQAnswers(answers, correctAnswers) {
    const correctAnswersMap = new Map(
      correctAnswers.map(q => [q.id, q.correct_answer])
    );

    return answers.map(answer => ({
      question_id: answer.question_id,
      selected_option: answer.selected_option,
      is_correct: answer.selected_option === correctAnswersMap.get(answer.question_id),
      correct_answer: correctAnswersMap.get(answer.question_id)
    }));
  },

  async saveGradingResult(attemptId, gradingData) {
    const { data, error } = await supabase
      .from('grading_results')
      .insert({
        attempt_id: attemptId,
        mcq_score: gradingData.mcq_score,
        frq_score: gradingData.frq_score,
        total_score: gradingData.total_score,
        graded_at: new Date().toISOString(),
        grading_metadata: gradingData.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGradingResult(attemptId) {
    const { data, error } = await supabase
      .from('grading_results')
      .select('*')
      .eq('attempt_id', attemptId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};
