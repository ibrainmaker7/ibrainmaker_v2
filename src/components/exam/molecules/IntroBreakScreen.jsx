import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ArrowRight } from 'lucide-react';

export default function IntroBreakScreen({
  type = 'intro',
  duration = 60,
  label = '',
  onContinue
}) {
  const [timeLeft, setTimeLeft] = useState(duration);

  const handleContinue = useCallback(() => {
    onContinue && onContinue();
  }, [onContinue]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, type, label]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleContinue();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleContinue]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="h-screen flex items-center justify-center bg-cyan-50">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg border border-cyan-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-6">
            <Clock className="w-8 h-8 text-cyan-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {type === 'intro' ? 'Exam Instructions' : label || 'Break Time'}
          </h1>

          {type === 'intro' ? (
            <div className="text-left bg-cyan-50 rounded-lg p-4 mb-6 border border-cyan-100">
              <p className="text-gray-700 leading-relaxed text-sm">
                Instructions: Please rate your confidence using the buttons below each question.
                This data helps track your learning progress and is required for each question.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold mt-0.5">1.</span>
                  Read each question carefully before selecting your answer.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold mt-0.5">2.</span>
                  Use the eliminate tool to cross out unlikely choices.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold mt-0.5">3.</span>
                  Flag questions you want to review later.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 font-bold mt-0.5">4.</span>
                  Rate your confidence for each answer (Required).
                </li>
              </ul>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">
              Take a moment to rest. The next section will begin automatically when the timer ends.
            </p>
          )}

          <div className="text-4xl font-mono font-bold text-cyan-700 mb-6">
            {timeStr}
          </div>

          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
          >
            {type === 'intro' ? 'Begin Exam' : 'Skip Break'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
