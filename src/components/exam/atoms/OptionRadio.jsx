import React from 'react';
import { X } from 'lucide-react';
import LatexText from './LatexText';

export default function OptionRadio({
  option,
  label,
  selected = false,
  eliminated = false,
  onSelect,
  onEliminate,
  disabled = false,
  showCorrect = false,
  isCorrect = false,
  className = ''
}) {
  const getContainerClasses = () => {
    if (showCorrect) {
      if (isCorrect) return 'border-green-500 bg-green-50 ring-2 ring-green-500';
      if (selected && !isCorrect) return 'border-red-500 bg-red-50 ring-2 ring-red-500';
    }
    if (selected) {
      return 'border-green-700 bg-green-50 ring-1 ring-green-700 shadow-md';
    }
    return 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm';
  };

  const getCircleClasses = () => {
    if (showCorrect && isCorrect) return 'bg-green-600 text-white border-green-600';
    if (selected) return 'bg-green-700 text-white border-green-700';
    return 'bg-gray-100 text-gray-600 border-gray-300 group-hover:border-gray-400 group-hover:text-gray-700';
  };

  const handleEliminate = (e) => {
    e.stopPropagation();
    onEliminate && onEliminate(option);
  };

  return (
    <div
      role="button"
      onClick={() => !disabled && onSelect(option)}
      className={`option-row-forced group relative w-full flex flex-row items-center gap-3 p-3 mb-2 border-2 rounded-xl cursor-pointer transition-all duration-200 ease-in-out ${getContainerClasses()} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-colors duration-200 ${getCircleClasses()}`}>
          {option}
        </div>
        {eliminated && (
          <div className="absolute inset-0 flex items-center justify-center">
            <X className="w-8 h-8 text-red-600 stroke-[3]" />
          </div>
        )}
      </div>

      <div className={`flex-1 text-gray-900 text-sm leading-relaxed transition-all ${eliminated ? 'line-through opacity-50' : ''}`}>
        <LatexText block={false}>{label}</LatexText>
        {showCorrect && isCorrect && (
          <span className="inline-block ml-3 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
            Correct Answer
          </span>
        )}
      </div>

      {onEliminate && !disabled && !showCorrect && (
        <button
          onClick={handleEliminate}
          className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md border transition-all ${
            eliminated
              ? 'bg-red-100 border-red-300 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          }`}
          title={eliminated ? 'Restore choice' : 'Eliminate choice'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
