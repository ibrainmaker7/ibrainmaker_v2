import React, { useState, useEffect } from 'react';
import { FileImage, X, Loader2, Bot, Check, CircleX } from 'lucide-react';
import LatexText from '../atoms/LatexText';
import { reviewApi } from '../../../api/reviewApi';

function ImageViewer({ url, label, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-sm font-medium">{label}</span>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <img
          src={url}
          alt={label}
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg bg-white"
        />
      </div>
    </div>
  );
}

function ScoreBadge({ score, maxScore }) {
  const pct = maxScore > 0 ? score / maxScore : 0;
  let ringColor = 'text-red-500';
  let bgColor = 'bg-red-50';
  let textColor = 'text-red-700';
  if (pct >= 0.8) {
    ringColor = 'text-green-500';
    bgColor = 'bg-green-50';
    textColor = 'text-green-700';
  } else if (pct >= 0.6) {
    ringColor = 'text-amber-500';
    bgColor = 'bg-amber-50';
    textColor = 'text-amber-700';
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            className={ringColor}
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${textColor}`}>{score}</span>
          <span className="text-xs text-gray-400">/ {maxScore}</span>
        </div>
      </div>
    </div>
  );
}

function RubricTable({ rubric }) {
  const earned = rubric.filter(r => r.met).length;
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Rubric Breakdown</span>
        <span className="text-xs text-gray-500">{earned}/{rubric.length} criteria met</span>
      </div>
      <div className="divide-y divide-gray-100">
        {rubric.map((item, i) => (
          <div key={i} className={`flex items-start gap-3 px-4 py-2.5 ${item.met ? 'bg-white' : 'bg-red-50/40'}`}>
            <div className="flex-shrink-0 mt-0.5">
              {item.met ? (
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <CircleX className="w-3 h-3 text-red-500" />
                </div>
              )}
            </div>
            <span className={`text-sm ${item.met ? 'text-gray-700' : 'text-red-700'}`}>
              <LatexText>{item.criterion}</LatexText>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GradingReportCard({ result }) {
  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center gap-2">
        <Bot className="w-4 h-4 text-white" />
        <span className="text-sm font-semibold text-white">AI Grading Report</span>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-start gap-5">
          <ScoreBadge score={result.score} maxScore={result.maxScore} />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Feedback</h4>
            <div className="text-sm text-gray-700 leading-relaxed">
              <LatexText>{result.feedback}</LatexText>
            </div>
          </div>
        </div>

        <RubricTable rubric={result.rubric} />
      </div>
    </div>
  );
}

function GradingPending() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-800 mb-1">AI Grading in Progress</h4>
          <p className="text-sm text-amber-700">Analyzing your handwritten response... This typically takes a few seconds.</p>
        </div>
      </div>
    </div>
  );
}

export default function FRQReviewPanel({ submissions, questionId }) {
  const [viewerImage, setViewerImage] = useState(null);
  const [gradingResult, setGradingResult] = useState(null);
  const [gradingLoading, setGradingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setGradingLoading(true);
    setGradingResult(null);

    reviewApi.getFRQGradingResult(questionId).then((result) => {
      if (!cancelled) {
        setGradingResult(result);
        setGradingLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setGradingLoading(false);
    });

    return () => { cancelled = true; };
  }, [questionId]);

  const pages = [
    { key: 'page1', label: 'Page 1 (Part A, B)' },
    { key: 'page2', label: 'Page 2 (Part C, D)' }
  ];

  const hasAnyUpload = pages.some(p => submissions[p.key]?.file_url);

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">Uploaded Responses</h4>

      {!hasAnyUpload ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
          <FileImage className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No response images were uploaded for this question.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {pages.map(page => {
            const sub = submissions[page.key];
            if (!sub?.file_url) return null;

            return (
              <div key={page.key} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">{page.label}</span>
                  <span className="text-xs text-gray-400">{sub.file_name || 'Uploaded image'}</span>
                </div>
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setViewerImage({ url: sub.file_url, label: page.label })}
                >
                  <img
                    src={sub.file_url}
                    alt={page.label}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg">
                      Click to enlarge
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {gradingLoading ? <GradingPending /> : gradingResult ? <GradingReportCard result={gradingResult} /> : null}

      {viewerImage && (
        <ImageViewer
          url={viewerImage.url}
          label={viewerImage.label}
          onClose={() => setViewerImage(null)}
        />
      )}
    </div>
  );
}
