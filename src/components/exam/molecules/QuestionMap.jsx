import React from 'react';
import { X, Flag } from 'lucide-react';

export default function QuestionMap({
  isOpen,
  onClose,
  totalQuestions,
  currentQuestionNumber,
  questionStates,
  onQuestionSelect,
  reviewMode = false
}) {
  if (!isOpen) return null;

  const getReviewClasses = (state, isCurrent) => {
    if (isCurrent) return ' bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300';
    if (state.status === 'correct') return ' bg-green-500 text-white border-green-500';
    if (state.status === 'incorrect') return ' bg-red-500 text-white border-red-500';
    if (state.status === 'pending') return ' bg-amber-400 text-white border-amber-400';
    return ' bg-gray-50 text-gray-500 border-gray-200';
  };

  const getExamClasses = (state, isCurrent) => {
    if (isCurrent) return ' bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300';
    if (state.answered) return ' bg-green-100 text-green-800 border-green-300';
    return ' bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400 hover:bg-gray-100';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-20">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">
            {reviewMode ? 'Review Map' : 'Question Map'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-8 gap-2 mb-4">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const num = i + 1;
            const state = questionStates?.[i] || {};
            const isCurrent = num === currentQuestionNumber;

            let classes = 'relative w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer transition-all duration-150 border-2';
            classes += reviewMode
              ? getReviewClasses(state, isCurrent)
              : getExamClasses(state, isCurrent);

            return (
              <button
                key={num}
                onClick={() => { onQuestionSelect(i); onClose(); }}
                className={classes}
              >
                {num}
                {!reviewMode && state.flagged && (
                  <Flag className="absolute -top-1 -right-1 w-3 h-3 text-red-500 fill-red-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Current
          </span>
          {reviewMode ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-green-500 inline-block" /> Correct
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500 inline-block" /> Incorrect
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Pending
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <Flag className="w-3 h-3 text-red-500 fill-red-500" /> Flagged
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gray-50 border border-gray-200 inline-block" /> Unanswered
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
