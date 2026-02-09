import React, { useState } from 'react';
import Split from 'react-split';
import { ChevronLeft, ChevronRight, Flag, LayoutGrid } from 'lucide-react';
import Timer from '../atoms/Timer';
import Toolbar from '../molecules/Toolbar';
import QuestionMap from '../molecules/QuestionMap';
import Button from '../../common/Button';
import Modal from '../../common/Modal';

export default function BluebookLayout({
  sectionInfo,
  endTime,
  onTimeUp,
  currentQuestionNumber,
  totalQuestions,
  leftPanel,
  rightPanel,
  onPrevious,
  onNext,
  onSubmit,
  canGoPrevious = true,
  canGoNext = true,
  showTimer = true,
  hasReference = false,
  onReferenceClick,
  flagged = false,
  onFlagToggle,
  questionStates = [],
  onQuestionSelect,
  calculatorAllowed = false,
  isFRQ = false
}) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuestionMap, setShowQuestionMap] = useState(false);

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    onSubmit && onSubmit();
  };

  const showReference = hasReference && !isFRQ;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">{sectionInfo}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              calculatorAllowed
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}>
              {calculatorAllowed ? 'Calculator Allowed' : 'No Calculator Allowed'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            Question {currentQuestionNumber} of {totalQuestions}
            {flagged && <Flag className="w-3.5 h-3.5 text-red-500 fill-red-500 ml-1" />}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showTimer && (
            <Timer endTime={endTime} onTimeUp={onTimeUp} />
          )}
          <Button variant="danger" size="sm" onClick={() => setShowSubmitModal(true)}>
            Submit Exam
          </Button>
        </div>
      </header>

      <Toolbar
        onReferenceClick={onReferenceClick}
        hasReference={showReference}
      />

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
            <Button variant="outline" size="sm" onClick={onPrevious} disabled={!canGoPrevious}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={onNext} disabled={!canGoNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <button
            onClick={() => setShowQuestionMap(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium"
          >
            <LayoutGrid className="w-4 h-4" />
            Question Map
          </button>

          <button
            onClick={onFlagToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
              flagged
                ? 'bg-red-50 border-red-400 text-red-600'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Flag className={`w-4 h-4 ${flagged ? 'text-red-500 fill-red-500' : ''}`} />
            <span className="text-sm font-medium">
              {flagged ? 'Flagged' : 'Flag for Review'}
            </span>
          </button>
        </div>
      </footer>

      <QuestionMap
        isOpen={showQuestionMap}
        onClose={() => setShowQuestionMap(false)}
        totalQuestions={totalQuestions}
        currentQuestionNumber={currentQuestionNumber}
        questionStates={questionStates}
        onQuestionSelect={onQuestionSelect}
      />

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Exam"
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmSubmit}>
              Submit
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to submit your exam? Once submitted, you cannot make any changes.
        </p>
        <p className="text-gray-600 text-sm mt-2">
          Please review your answers before submitting.
        </p>
      </Modal>
    </div>
  );
}
