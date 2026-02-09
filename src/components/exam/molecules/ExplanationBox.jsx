import React from 'react';
import { Lightbulb } from 'lucide-react';
import LatexText from '../atoms/LatexText';

export default function ExplanationBox({ explanation }) {
  if (!explanation) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-blue-800 mb-1.5">Rationale / Explanation</h4>
          <div className="text-sm text-blue-900 leading-relaxed">
            <LatexText>{explanation}</LatexText>
          </div>
        </div>
      </div>
    </div>
  );
}
