import React from 'react';
import { X, Flag } from 'lucide-react';

export default function QuestionMap({
  isOpen,
  onClose,
  totalQuestions,
  currentQuestionNumber,
  questionStates,
  onQuestionSelect
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-20">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Question Map</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-8 gap-2 mb-4">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const num = i + 1;
            const state = questionStates?.[i] || {};
            const isCurrent = num === currentQuestionNumber;
            const isAnswered = state.answered;
            const isFlagged = state.flagged;

            let classes = 'relative w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer transition-all duration-150 border-2';

            if (isCurrent) {
              classes += ' bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300';
            } else if (isAnswered) {
              classes += ' bg-green-100 text-green-800 border-green-300';
            } else {
              classes += ' bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400 hover:bg-gray-100';
            }

            return (
              <button
                key={num}
                onClick={() => { onQuestionSelect(i); onClose(); }}
                className={classes}
              >
                {num}
                {isFlagged && (
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
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" /> Answered
          </span>
          <span className="flex items-center gap-1.5">
            <Flag className="w-3 h-3 text-red-500 fill-red-500" /> Flagged
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-50 border border-gray-200 inline-block" /> Unanswered
          </span>
        </div>
      </div>
    </div>
  );
}
