import React from 'react';
import { Calculator } from 'lucide-react';

export default function DataCollectionZone({
  confidenceLevel = 'medium',
  onConfidenceChange,
  calculatorAllowed = false,
  calculatorUsed = false,
  onCalculatorToggle
}) {
  const confidenceLevels = [
    { value: 'low', label: 'Low', activeClass: 'bg-red-100 text-red-700 border-red-300' },
    { value: 'medium', label: 'Medium', activeClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 'high', label: 'High', activeClass: 'bg-green-100 text-green-700 border-green-300' }
  ];

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Data for Personal Analytics (Required)
      </p>

      <div className="flex items-center justify-between gap-4 min-h-[36px]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 leading-none">Confidence:</span>
          <div className="flex items-center gap-1">
            {confidenceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => onConfidenceChange && onConfidenceChange(level.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all leading-none ${
                  confidenceLevel === level.value
                    ? level.activeClass
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {calculatorAllowed && (
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 hover:bg-white cursor-pointer transition-colors text-sm leading-none">
            <input
              type="checkbox"
              checked={calculatorUsed}
              onChange={(e) => onCalculatorToggle && onCalculatorToggle(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <Calculator className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-medium text-gray-600 leading-none">Used Calculator</span>
          </label>
        )}
      </div>
    </div>
  );
}
