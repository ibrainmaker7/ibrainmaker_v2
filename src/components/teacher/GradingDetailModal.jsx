import React, { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, Bot, Check, CircleX,
  Loader2, Save, ShieldCheck, Pencil, FileImage, RotateCcw
} from 'lucide-react';
import LatexText from '../exam/atoms/LatexText';
import { simulateAIGrading } from '../../lib/mockGemini';

const FRQ_QUESTIONS = [
  { id: 'q5', label: 'FRQ 1', number: 1 },
  { id: 'q6', label: 'FRQ 2', number: 2 }
];

function ImagePanel({ submissions, questionId }) {
  const [expanded, setExpanded] = useState(null);
  const pages = [
    { key: 'page1', label: 'Page 1 (Part A, B)' },
    { key: 'page2', label: 'Page 2 (Part C, D)' }
  ];

  const subs = submissions[questionId] || {};
  const hasAny = pages.some(p => subs[p.key]?.file_url);

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileImage className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No uploaded images for this question.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 h-full overflow-y-auto">
      {pages.map(page => {
        const sub = subs[page.key];
        if (!sub?.file_url) return null;

        return (
          <div key={page.key}>
            <p className="text-xs font-semibold text-gray-600 mb-1.5">{page.label}</p>
            <div
              className="relative border border-gray-200 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setExpanded(expanded === page.key ? null : page.key)}
            >
              <img
                src={sub.file_url}
                alt={page.label}
                className={`w-full object-contain transition-all ${
                  expanded === page.key ? 'max-h-[60vh]' : 'max-h-48'
                }`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScoreRing({ score, maxScore, size = 'lg' }) {
  const pct = maxScore > 0 ? score / maxScore : 0;
  let ringColor = 'text-red-500';
  let textColor = 'text-red-700';
  if (pct >= 0.8) { ringColor = 'text-green-500'; textColor = 'text-green-700'; }
  else if (pct >= 0.6) { ringColor = 'text-amber-500'; textColor = 'text-amber-700'; }

  const dimension = size === 'lg' ? 96 : 64;
  const radius = size === 'lg' ? 40 : 26;
  const strokeWidth = size === 'lg' ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg className="-rotate-90" style={{ width: dimension, height: dimension }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            className={ringColor}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${size === 'lg' ? 'text-2xl' : 'text-lg'} font-bold ${textColor}`}>{score}</span>
          <span className="text-xs text-gray-400">/ {maxScore}</span>
        </div>
      </div>
    </div>
  );
}

function EditableRubricTable({ rubric, onToggle }) {
  const earned = rubric.filter(r => r.met).length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Rubric Breakdown</span>
        <span className="text-xs text-gray-500">{earned}/{rubric.length} criteria met</span>
      </div>
      <div className="divide-y divide-gray-100">
        {rubric.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${
              item.met ? 'bg-white' : 'bg-red-50/40'
            }`}
            onClick={() => onToggle(i)}
          >
            <button className="flex-shrink-0">
              {item.met ? (
                <div className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center transition-colors">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center transition-colors">
                  <CircleX className="w-3 h-3 text-red-500" />
                </div>
              )}
            </button>
            <span className={`text-sm flex-1 ${item.met ? 'text-gray-700' : 'text-red-700'}`}>
              <LatexText>{item.criterion}</LatexText>
            </span>
            <Pencil className="w-3 h-3 text-gray-300 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function GradingPanel({ student, questionId, onScoreUpdate, onRelease }) {
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rubric, setRubric] = useState([]);
  const [editedScore, setEditedScore] = useState(null);
  const [editedFeedback, setEditedFeedback] = useState('');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const existingGrade = student.frq_grades?.[questionId];
    if (existingGrade?.status === 'confirmed') {
      simulateAIGrading(questionId).then((result) => {
        if (!cancelled) {
          setAiResult(result);
          setRubric(result.rubric);
          setEditedScore(existingGrade.score);
          setEditedFeedback(result.feedback);
          setLoading(false);
        }
      });
      return () => { cancelled = true; };
    }

    simulateAIGrading(questionId).then((result) => {
      if (!cancelled) {
        setAiResult(result);
        setRubric([...result.rubric]);
        setEditedScore(result.score);
        setEditedFeedback(result.feedback);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [questionId, student.id]);

  const handleRubricToggle = (index) => {
    setRubric(prev => {
      const next = [...prev];
      next[index] = { ...next[index], met: !next[index].met };
      const newScore = next.filter(r => r.met).length;
      setEditedScore(newScore);
      return next;
    });
    setIsModified(true);
  };

  const handleScoreChange = (val) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= (aiResult?.maxScore || 9)) {
      setEditedScore(num);
      setIsModified(true);
    }
  };

  const handleReset = () => {
    if (!aiResult) return;
    setRubric([...aiResult.rubric]);
    setEditedScore(aiResult.score);
    setEditedFeedback(aiResult.feedback);
    setIsModified(false);
    setIsEditingFeedback(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500">Running AI grading...</p>
      </div>
    );
  }

  const maxScore = aiResult?.maxScore || 9;
  const isConfirmed = student.frq_grades?.[questionId]?.status === 'confirmed';

  return (
    <div className="p-4 h-full overflow-y-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">AI Grading Report</span>
        </div>
        {isModified && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset to AI
          </button>
        )}
      </div>

      <div className="flex items-start gap-4">
        <ScoreRing score={editedScore} maxScore={maxScore} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Override Score</label>
            {isModified && (
              <span className="text-xs text-amber-600 font-medium">(Modified)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={maxScore}
              value={editedScore}
              onChange={(e) => handleScoreChange(e.target.value)}
              className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="text-sm text-gray-500">/ {maxScore}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Feedback</h4>
          <button
            onClick={() => setIsEditingFeedback(!isEditingFeedback)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            {isEditingFeedback ? 'Preview' : 'Edit'}
          </button>
        </div>
        {isEditingFeedback ? (
          <textarea
            value={editedFeedback}
            onChange={(e) => { setEditedFeedback(e.target.value); setIsModified(true); }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          />
        ) : (
          <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-gray-700 leading-relaxed">
            <LatexText>{editedFeedback}</LatexText>
          </div>
        )}
      </div>

      <EditableRubricTable rubric={rubric} onToggle={handleRubricToggle} />

      <div className="pt-2 flex items-center gap-3">
        <button
          onClick={() => onScoreUpdate(questionId, editedScore, editedFeedback, rubric)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          Save Changes
        </button>
        {!isConfirmed && (
          <button
            onClick={() => {
              onScoreUpdate(questionId, editedScore, editedFeedback, rubric);
              onRelease(questionId, editedScore);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Confirm & Release
          </button>
        )}
        {isConfirmed && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Grade Released
          </span>
        )}
      </div>
    </div>
  );
}

export default function GradingDetailModal({
  isOpen,
  onClose,
  student,
  onStudentUpdate
}) {
  const [currentFRQIndex, setCurrentFRQIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentFRQIndex(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !student) return null;

  const currentFRQ = FRQ_QUESTIONS[currentFRQIndex];

  const handleScoreUpdate = (questionId, score, feedback, rubric) => {
    const updated = { ...student };
    if (!updated.frq_grades) updated.frq_grades = {};
    updated.frq_grades[questionId] = {
      ...updated.frq_grades[questionId],
      score,
      maxScore: rubric.length,
      status: updated.frq_grades[questionId]?.status === 'confirmed' ? 'confirmed' : 'graded'
    };
    onStudentUpdate(updated);
  };

  const handleRelease = (questionId, score) => {
    const updated = { ...student };
    if (!updated.frq_grades) updated.frq_grades = {};
    updated.frq_grades[questionId] = {
      ...updated.frq_grades[questionId],
      score,
      status: 'confirmed'
    };

    const allConfirmed = FRQ_QUESTIONS.every(
      q => updated.frq_grades[q.id]?.status === 'confirmed'
    );

    if (allConfirmed) {
      const frqTotal = FRQ_QUESTIONS.reduce(
        (sum, q) => sum + (updated.frq_grades[q.id]?.score || 0), 0
      );
      updated.total_score = (updated.mcq_score || 0) + frqTotal;
      updated.grade_status = 'released';
    }

    onStudentUpdate(updated);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="fixed inset-4 bg-white rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">{student.student_name}</h2>
              <p className="text-xs text-gray-500">{student.student_email}</p>
            </div>
            <span className="text-xs text-gray-400">|</span>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              MCQ: <span className="font-semibold">{student.mcq_score ?? '--'}/{student.mcq_total}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {FRQ_QUESTIONS.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentFRQIndex(i)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    i === currentFRQIndex
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 border-r border-gray-200 bg-gray-50 overflow-hidden">
            <div className="px-4 py-2.5 bg-white border-b border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Student Response -- {currentFRQ.label}
              </h3>
            </div>
            <ImagePanel submissions={student.frq_submissions || {}} questionId={currentFRQ.id} />
          </div>

          <div className="w-1/2 overflow-hidden">
            <div className="px-4 py-2.5 bg-white border-b border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                AI Report & Teacher Override
              </h3>
            </div>
            <GradingPanel
              key={`${student.id}-${currentFRQ.id}`}
              student={student}
              questionId={currentFRQ.id}
              onScoreUpdate={handleScoreUpdate}
              onRelease={handleRelease}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setCurrentFRQIndex(i => Math.max(0, i - 1))}
            disabled={currentFRQIndex === 0}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous FRQ
          </button>

          <span className="text-xs text-gray-500">
            {currentFRQIndex + 1} of {FRQ_QUESTIONS.length}
          </span>

          <button
            onClick={() => setCurrentFRQIndex(i => Math.min(FRQ_QUESTIONS.length - 1, i + 1))}
            disabled={currentFRQIndex === FRQ_QUESTIONS.length - 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next FRQ
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
