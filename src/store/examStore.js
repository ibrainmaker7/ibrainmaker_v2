import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useExamStore = create(
  persist(
    (set, get) => ({
      examId: null,
      attemptId: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      questionStartTimes: {},
      isExamActive: false,

      initExam: (examId, attemptId, questions) => {
        const initialAnswers = {};
        questions.forEach(q => {
          initialAnswers[q.id] = {
            question_id: q.id,
            selected_option: null,
            written_answer: null,
            confidence_level: 'medium',
            time_spent: 0,
            interaction_log: []
          };
        });

        set({
          examId,
          attemptId,
          questions,
          answers: initialAnswers,
          currentQuestionIndex: 0,
          questionStartTimes: {},
          isExamActive: true
        });

        get().startQuestionTimer(questions[0]?.id);
      },

      setCurrentQuestionIndex: (index) => {
        const { questions, questionStartTimes } = get();
        const currentQuestion = questions[get().currentQuestionIndex];
        const nextQuestion = questions[index];

        if (currentQuestion) {
          get().stopQuestionTimer(currentQuestion.id);
        }

        set({ currentQuestionIndex: index });

        if (nextQuestion && !questionStartTimes[nextQuestion.id]) {
          get().startQuestionTimer(nextQuestion.id);
        }
      },

      startQuestionTimer: (questionId) => {
        set((state) => ({
          questionStartTimes: {
            ...state.questionStartTimes,
            [questionId]: Date.now()
          }
        }));
      },

      stopQuestionTimer: (questionId) => {
        const { questionStartTimes, answers } = get();
        const startTime = questionStartTimes[questionId];

        if (startTime) {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

          set((state) => ({
            answers: {
              ...state.answers,
              [questionId]: {
                ...state.answers[questionId],
                time_spent: (state.answers[questionId]?.time_spent || 0) + elapsedTime
              }
            },
            questionStartTimes: {
              ...state.questionStartTimes,
              [questionId]: null
            }
          }));
        }
      },

      setAnswer: (questionId, answerData) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...state.answers[questionId],
              ...answerData
            }
          }
        }));
      },

      setSelectedOption: (questionId, option) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...state.answers[questionId],
              selected_option: option
            }
          }
        }));

        get().logInteraction(questionId, 'option_change', { option });
      },

      setWrittenAnswer: (questionId, text) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...state.answers[questionId],
              written_answer: text
            }
          }
        }));
      },

      setConfidenceLevel: (questionId, level) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...state.answers[questionId],
              confidence_level: level
            }
          }
        }));

        get().logInteraction(questionId, 'confidence_change', { level });
      },

      logInteraction: (questionId, action, data = {}) => {
        const timestamp = new Date().toISOString();

        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              ...state.answers[questionId],
              interaction_log: [
                ...(state.answers[questionId]?.interaction_log || []),
                {
                  action,
                  timestamp,
                  ...data
                }
              ]
            }
          }
        }));
      },

      logCalculatorUse: (questionId, used) => {
        get().logInteraction(questionId, 'calculator_toggle', { used });
      },

      logHintAccess: (questionId) => {
        get().logInteraction(questionId, 'hint_accessed', {});
      },

      logFormulaSheetAccess: (questionId) => {
        get().logInteraction(questionId, 'formula_sheet_accessed', {});
      },

      getTotalTimeSpent: () => {
        const { answers, questions, questionStartTimes } = get();
        let total = 0;

        questions.forEach(q => {
          const answer = answers[q.id];
          total += answer?.time_spent || 0;

          if (questionStartTimes[q.id]) {
            const currentTime = Math.floor((Date.now() - questionStartTimes[q.id]) / 1000);
            total += currentTime;
          }
        });

        return total;
      },

      getAnswersArray: () => {
        const { answers } = get();
        return Object.values(answers);
      },

      clearExam: () => {
        const { questions, questionStartTimes } = get();

        questions.forEach(q => {
          if (questionStartTimes[q.id]) {
            get().stopQuestionTimer(q.id);
          }
        });

        set({
          examId: null,
          attemptId: null,
          questions: [],
          currentQuestionIndex: 0,
          answers: {},
          questionStartTimes: {},
          isExamActive: false
        });
      },

      pauseExam: () => {
        const { questions, questionStartTimes, currentQuestionIndex } = get();
        const currentQuestion = questions[currentQuestionIndex];

        if (currentQuestion && questionStartTimes[currentQuestion.id]) {
          get().stopQuestionTimer(currentQuestion.id);
        }

        set({ isExamActive: false });
      },

      resumeExam: () => {
        const { questions, currentQuestionIndex } = get();
        const currentQuestion = questions[currentQuestionIndex];

        if (currentQuestion) {
          get().startQuestionTimer(currentQuestion.id);
        }

        set({ isExamActive: true });
      }
    }),
    {
      name: 'exam-storage',
      partialize: (state) => ({
        examId: state.examId,
        attemptId: state.attemptId,
        questions: state.questions,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        questionStartTimes: state.questionStartTimes,
        isExamActive: state.isExamActive
      })
    }
  )
);
