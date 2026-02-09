import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutGrid, Trophy, ArrowLeft, Loader2 } from 'lucide-react';
import Split from 'react-split';
import OptionRadio from '../../components/exam/atoms/OptionRadio';
import LatexText from '../../components/exam/atoms/LatexText';
import QuestionMap from '../../components/exam/molecules/QuestionMap';
import ExplanationBox from '../../components/exam/molecules/ExplanationBox';
import FRQReviewPanel from '../../components/exam/molecules/FRQReviewPanel';
import Button from '../../components/common/Button';
import { reviewApi } from '../../api/reviewApi';
import { ALL_QUESTIONS } from '../../data/mockExamData';

export default function ReviewMode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState(null);
  const [answersMap, setAnswersMap] = useState({});
  const [frqSubmissions, setFrqSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showQuestionMap, setShowQuestionMap] = useState(false);

  useEffect(() => {
    if (!attemptId) {
      setError('No attempt ID provided.');
      setLoading(false);
      return;
    }
    loadReviewData();
  }, [attemptId]);

  const loadReviewData = async () => {
    try {
      const [attemptData, answers, frqData] = await Promise.all([
        reviewApi.getAttempt(attemptId),
        reviewApi.getAttemptAnswers(attemptId),
        null
      ]);

      if (!attemptData) {
        setError('Attempt not found.');
        setLoading(false);
        return;
      }

      setAttempt(attemptData);

      const aMap = {};
      answers.forEach(a => { aMap[a.question_id] = a; });
      setAnswersMap(aMap);

      const frqSubs = await reviewApi.getFRQSubmissions(attemptData.participant_id);
      const frqMap = {};
      frqSubs.forEach(s => {
        if (!frqMap[s.question_id]) frqMap[s.question_id] = {};
        frqMap[s.question_id][s.page_key] = {
          file_url: s.file_url,
          file_name: s.file_name,
          submitted_by: s.submitted_by
        };
      });
      setFrqSubmissions(frqMap);
    } catch (err) {
      console.error('Failed to load review data:', err);
      setError('Failed to load review data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const questions = ALL_QUESTIONS;
  const currentQuestion = questions[currentIndex];

  const questionStates = useMemo(() =>
    questions.map(q => {
      const answer = answersMap[q.id];
      if (q.question_type === 'frq') {
        return { status: 'pending' };
      }
      if (!answer || !answer.selected_option) {
        return { status: 'incorrect' };
      }
      return { status: answer.is_correct ? 'correct' : 'incorrect' };
    }),
    [answersMap, questions]
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-sm">
          <p className="text-base font-semibold text-gray-900 mb-2">Cannot Load Review</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const answer = answersMap[currentQuestion?.id];
  const isFRQ = currentQuestion?.question_type === 'frq';
  const hasPassage = !!currentQuestion?.passage;
  const hasImage = !!currentQuestion?.image_url;
  const isSplitMode = !isFRQ && (hasPassage || hasImage);

  const leftPanel = isSplitMode ? (
    <div className="space-y-4">
      {currentQuestion.passage && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Passage</h3>
          <div className="text-gray-800 leading-relaxed">
            <LatexText>{currentQuestion.passage}</LatexText>
          </div>
        </div>
      )}
      {currentQuestion.image_url && (
        <img
          src={currentQuestion.image_url}
          alt={`Question ${currentQuestion.question_number} diagram`}
          className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
        />
      )}
    </div>
  ) : null;

  const rightPanel = (
    <div className="space-y-4">
      <div className="flex items-start gap-3 mb-2">
        <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
          {currentQuestion.question_number}
        </span>
        <div className="flex-1 text-gray-900 text-base leading-relaxed pt-1">
          <LatexText>{currentQuestion.question_text}</LatexText>
        </div>
      </div>

      {isFRQ ? (
        <FRQReviewPanel submissions={frqSubmissions[currentQuestion.id] || {}} questionId={currentQuestion.id} />
      ) : (
        <>
          <div className="flex flex-col w-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</h3>
            {currentQuestion.options.map(option => (
              <OptionRadio
                key={option.key}
                option={option.key}
                label={option.text}
                selected={answer?.selected_option === option.key}
                eliminated={false}
                onSelect={() => {}}
                disabled={true}
                showCorrect={true}
                isCorrect={option.key === currentQuestion.correct_answer}
              />
            ))}
          </div>

          {answer?.selected_option && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              answer.is_correct
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {answer.is_correct ? 'Correct' : `Incorrect -- Correct answer: ${currentQuestion.correct_answer}`}
            </div>
          )}
          {!answer?.selected_option && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              No answer selected -- Correct answer: {currentQuestion.correct_answer}
            </div>
          )}

          <ExplanationBox explanation={currentQuestion.explanation} />
        </>
      )}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Exam Review</h1>
          <span className="text-sm text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <Trophy className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">
              Score: {attempt?.raw_score || 0}/{attempt?.total_mcq || 0}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {leftPanel ? (
          <Split
            className="flex h-full w-full"
            sizes={[50, 50]}
            minSize={300}
            gutterSize={10}
            snapOffset={0}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
            style={{ display: 'flex', height: '100%' }}
          >
            <div className="bg-white overflow-y-auto h-full" style={{ height: '100%', overflow: 'auto' }}>
              <div className="p-6">{leftPanel}</div>
            </div>
            <div className="bg-white overflow-y-auto h-full" style={{ height: '100%', overflow: 'auto' }}>
              <div className="p-6">{rightPanel}</div>
            </div>
          </Split>
        ) : (
          <div className="bg-white overflow-y-auto h-full">
            <div className="max-w-4xl mx-auto p-6">{rightPanel}</div>
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex(i => i - 1)}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex(i => i + 1)}
              disabled={currentIndex === questions.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <button
            onClick={() => setShowQuestionMap(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium"
          >
            <LayoutGrid className="w-4 h-4" />
            Review Map
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            {questionStates.filter(s => s.status === 'correct').length} correct,{' '}
            {questionStates.filter(s => s.status === 'incorrect').length} incorrect,{' '}
            {questionStates.filter(s => s.status === 'pending').length} pending
          </div>
        </div>
      </footer>

      <QuestionMap
        isOpen={showQuestionMap}
        onClose={() => setShowQuestionMap(false)}
        totalQuestions={questions.length}
        currentQuestionNumber={currentIndex + 1}
        questionStates={questionStates}
        onQuestionSelect={(i) => setCurrentIndex(i)}
        reviewMode={true}
      />
    </div>
  );
}
