import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FileText, PenLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BluebookLayout from '../../components/exam/layouts/BluebookLayout';
import OptionRadio from '../../components/exam/atoms/OptionRadio';
import DataCollectionZone from '../../components/exam/molecules/DataCollectionZone';
import FRQUploadZone from '../../components/exam/molecules/FRQUploadZone';
import IntroBreakScreen from '../../components/exam/molecules/IntroBreakScreen';
import LatexText from '../../components/exam/atoms/LatexText';
import { useExamStore } from '../../store/examStore';
import Modal from '../../components/common/Modal';
import { ALL_QUESTIONS, EXAM_PHASES } from '../../data/mockExamData';
import { studentApi } from '../../api/studentApi';
import { reviewApi } from '../../api/reviewApi';

export default function ExamRoom() {
  const navigate = useNavigate();
  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    setSelectedOption,
    setConfidenceLevel,
    logCalculatorUse,
    initExam,
    clearExam,
    isExamActive
  } = useExamStore();

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseStartTime, setPhaseStartTime] = useState(Date.now());
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [eliminatedOptions, setEliminatedOptions] = useState({});
  const [frqUploadStatus, setFrqUploadStatus] = useState({});
  const [examEnded, setExamEnded] = useState(false);
  const participantId = studentApi.DEMO_PARTICIPANT_ID;

  const currentPhase = EXAM_PHASES[currentPhaseIndex];
  const isLastPhase = currentPhaseIndex === EXAM_PHASES.length - 1;

  useEffect(() => {
    initExam('demo-exam-1', 'demo-attempt-1', ALL_QUESTIONS);
    return () => {
      if (isExamActive) clearExam();
    };
  }, []);

  useEffect(() => {
    if (!examEnded) return;

    studentApi.getFRQSubmissions(participantId).then((submissions) => {
      const statusMap = {};
      submissions.forEach((s) => {
        if (!statusMap[s.question_id]) statusMap[s.question_id] = {};
        statusMap[s.question_id][s.page_key] = {
          submitted_by: s.submitted_by,
          file_url: s.file_url,
          file_name: s.file_name
        };
      });
      setFrqUploadStatus(statusMap);
    }).catch((err) => console.error('Failed to load FRQ submissions:', err));

    const unsubscribe = studentApi.subscribeToFRQSubmissions(participantId, (payload) => {
      const row = payload.new;
      if (!row) return;
      setFrqUploadStatus((prev) => ({
        ...prev,
        [row.question_id]: {
          ...prev[row.question_id],
          [row.page_key]: {
            submitted_by: row.submitted_by,
            file_url: row.file_url,
            file_name: row.file_name
          }
        }
      }));
    });

    return unsubscribe;
  }, [examEnded, participantId]);

  useEffect(() => {
    if (currentPhase.type === 'section') {
      const [start] = currentPhase.questionRange;
      setCurrentQuestionIndex(start);
    }
  }, [currentPhaseIndex]);

  const advancePhase = useCallback(() => {
    if (currentPhaseIndex < EXAM_PHASES.length - 1) {
      setCurrentPhaseIndex(prev => prev + 1);
      setPhaseStartTime(Date.now());
    }
  }, [currentPhaseIndex]);

  const endTime = useMemo(() => {
    if (currentPhase.type !== 'section') return null;
    return new Date(phaseStartTime + currentPhase.duration * 1000).toISOString();
  }, [phaseStartTime, currentPhaseIndex, currentPhase]);

  if (currentPhase.type === 'intro') {
    return <IntroBreakScreen type="intro" duration={currentPhase.duration} onContinue={advancePhase} />;
  }

  if (currentPhase.type === 'break') {
    return (
      <IntroBreakScreen
        type="break"
        duration={currentPhase.duration}
        label={currentPhase.label}
        onContinue={advancePhase}
      />
    );
  }

  const [sectionStart, sectionEnd] = currentPhase.questionRange;
  const sectionQuestions = ALL_QUESTIONS.slice(sectionStart, sectionEnd + 1);
  const sectionTotalQuestions = sectionQuestions.length;
  const localIndex = currentQuestionIndex - sectionStart;
  const currentQuestion = ALL_QUESTIONS[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id];

  if (!currentQuestion) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800">Loading exam...</h2>
      </div>
    );
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > sectionStart) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < sectionEnd) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!isLastPhase) {
      advancePhase();
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(currentQuestion.id, option);
  };

  const handleEliminate = (option) => {
    setEliminatedOptions(prev => {
      const qElims = prev[currentQuestion.id] || {};
      return {
        ...prev,
        [currentQuestion.id]: { ...qElims, [option]: !qElims[option] }
      };
    });
  };

  const handleCalculatorToggle = (used) => {
    logCalculatorUse(currentQuestion.id, used);
  };

  const handleConfidenceChange = (level) => {
    setConfidenceLevel(currentQuestion.id, level);
  };

  const handleFlagToggle = () => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  const handleTimeUp = () => {
    if (!isLastPhase) {
      advancePhase();
    } else {
      setExamEnded(true);
    }
  };

  const handleSubmit = () => {
    setExamEnded(true);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const attempt = await reviewApi.submitExamAttempt(
        participantId,
        'demo-exam-1',
        ALL_QUESTIONS,
        answers
      );
      clearExam();
      navigate(`/student/review?attemptId=${attempt.id}`);
    } catch (err) {
      console.error('Failed to submit exam:', err);
      setSubmitting(false);
    }
  };

  const handleQuestionSelect = (localIdx) => {
    setCurrentQuestionIndex(sectionStart + localIdx);
  };

  const handleFRQFileUpload = async (questionId, pageKey, file) => {
    const fileUrl = await studentApi.uploadFRQFile(file, participantId, questionId, pageKey);
    await studentApi.saveFRQSubmission(participantId, questionId, pageKey, fileUrl, file.name);
  };

  const questionStates = sectionQuestions.map(q => ({
    answered: q.question_type === 'frq'
      ? !!(frqUploadStatus[q.id]?.page1 || frqUploadStatus[q.id]?.page2)
      : !!answers[q.id]?.selected_option,
    flagged: flaggedQuestions.has(q.id)
  }));

  const calculatorUsed = currentAnswer?.interaction_log?.some(
    log => log.action === 'calculator_toggle' && log.used
  ) || false;

  const isFRQ = currentQuestion.question_type === 'frq';
  const hasPassage = !!currentQuestion.passage;
  const hasImage = !!currentQuestion.image_url;
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
        examEnded ? (
          <FRQUploadZone
            uploadStatus={frqUploadStatus[currentQuestion.id] || {}}
            onFileUpload={handleFRQFileUpload}
            questionId={currentQuestion.id}
            participantId={participantId}
          />
        ) : (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <PenLine className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Write your answers on paper</p>
              <p className="text-xs text-amber-600 mt-1">
                You will be able to upload photos of your written work after the exam ends.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col w-full">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Select your answer:</h3>
          {currentQuestion.options.map(option => (
            <OptionRadio
              key={option.key}
              option={option.key}
              label={option.text}
              selected={currentAnswer?.selected_option === option.key}
              eliminated={eliminatedOptions[currentQuestion.id]?.[option.key] || false}
              onSelect={handleOptionSelect}
              onEliminate={handleEliminate}
            />
          ))}
        </div>
      )}

      <DataCollectionZone
        confidenceLevel={currentAnswer?.confidence_level || 'medium'}
        onConfidenceChange={handleConfidenceChange}
        calculatorAllowed={currentPhase.calculatorAllowed}
        calculatorUsed={calculatorUsed}
        onCalculatorToggle={handleCalculatorToggle}
      />
    </div>
  );

  const canGoNext = currentQuestionIndex < sectionEnd || !isLastPhase;

  const submissionBanner = examEnded ? (
    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-800">Submission Phase</p>
        <p className="text-xs text-blue-600 mt-0.5">
          The exam has ended. Please upload your FRQ response pages below, then click "Final Submit."
        </p>
      </div>
    </div>
  ) : null;

  const augmentedRightPanel = (
    <div className="space-y-4">
      {submissionBanner}
      {rightPanel.props.children}
    </div>
  );

  return (
    <>
      <BluebookLayout
        sectionInfo={currentPhase.sectionInfo}
        endTime={examEnded ? null : endTime}
        onTimeUp={handleTimeUp}
        currentQuestionNumber={localIndex + 1}
        totalQuestions={sectionTotalQuestions}
        leftPanel={leftPanel}
        rightPanel={examEnded ? augmentedRightPanel : rightPanel}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={examEnded ? handleFinalSubmit : handleSubmit}
        canGoPrevious={currentQuestionIndex > sectionStart}
        canGoNext={canGoNext}
        showTimer={!examEnded}
        hasReference={currentPhase.hasReference}
        onReferenceClick={() => setShowReferenceModal(true)}
        flagged={flaggedQuestions.has(currentQuestion.id)}
        onFlagToggle={handleFlagToggle}
        questionStates={questionStates}
        onQuestionSelect={handleQuestionSelect}
        calculatorAllowed={currentPhase.calculatorAllowed}
        isFRQ={isFRQ}
      />

      <Modal
        isOpen={showReferenceModal}
        onClose={() => setShowReferenceModal(false)}
        title="Formula Sheet"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Derivatives</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><LatexText>{'Power Rule: $\\frac{d}{dx}[x^n] = nx^{n-1}$'}</LatexText></li>
              <li><LatexText>{'Product Rule: $(fg)\' = f\'g + fg\'$'}</LatexText></li>
              <li><LatexText>{'Chain Rule: $(f(g(x)))\' = f\'(g(x)) \\cdot g\'(x)$'}</LatexText></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Integrals</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><LatexText>{'$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$ (for $n \\neq -1$)'}</LatexText></li>
              <li><LatexText>{'$\\int e^x dx = e^x + C$'}</LatexText></li>
              <li><LatexText>{'$\\int \\frac{1}{x} dx = \\ln|x| + C$'}</LatexText></li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
}
