import { supabase } from './supabaseClient';
import { simulateAIGrading } from '../lib/mockGemini';

export const reviewApi = {
  async submitExamAttempt(participantId, examId, questions, answers) {
    const mcqQuestions = questions.filter(q => q.question_type === 'mcq');
    let rawScore = 0;

    const answerRows = questions.map(q => {
      const answer = answers[q.id];
      const isMCQ = q.question_type === 'mcq';
      const isCorrect = isMCQ && answer?.selected_option === q.correct_answer;
      if (isCorrect) rawScore++;

      return {
        question_id: q.id,
        selected_option: answer?.selected_option || null,
        correct_option: q.correct_answer || null,
        is_correct: isCorrect,
        confidence_level: answer?.confidence_level || 'medium',
        time_spent: answer?.time_spent || 0,
        question_type: q.question_type
      };
    });

    const { data: attempt, error: attemptError } = await supabase
      .from('exam_attempts')
      .insert({
        participant_id: participantId,
        exam_id: examId,
        status: 'completed',
        raw_score: rawScore,
        total_mcq: mcqQuestions.length,
        submitted_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (attemptError) throw attemptError;

    const rowsWithAttemptId = answerRows.map(row => ({
      ...row,
      attempt_id: attempt.id
    }));

    const { error: answersError } = await supabase
      .from('exam_answers')
      .insert(rowsWithAttemptId);

    if (answersError) throw answersError;

    return attempt;
  },

  async getAttempt(attemptId) {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('id', attemptId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAttemptAnswers(attemptId) {
    const { data, error } = await supabase
      .from('exam_answers')
      .select('*')
      .eq('attempt_id', attemptId);

    if (error) throw error;
    return data || [];
  },

  async getFRQSubmissions(participantId) {
    const { data, error } = await supabase
      .from('frq_submissions')
      .select('*')
      .eq('participant_id', participantId);

    if (error) throw error;
    return data || [];
  },

  async getFRQGradingResult(questionId) {
    return simulateAIGrading(questionId);
  }
};
