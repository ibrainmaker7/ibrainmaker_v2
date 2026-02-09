import React from 'react';
import LatexText from '../atoms/LatexText';

export default function QuestionStem({
  questionNumber,
  questionText,
  imageUrl,
  passage,
  className = ''
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {passage && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
            Passage
          </h3>
          <div className="text-gray-800 leading-relaxed">
            <LatexText>{passage}</LatexText>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-start gap-3 mb-3">
          <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
            {questionNumber}
          </span>
          <div className="flex-1 text-gray-900 leading-relaxed pt-1">
            <LatexText>{questionText}</LatexText>
          </div>
        </div>

        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt={`Question ${questionNumber} diagram`}
              className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
