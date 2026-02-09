import React, { useState } from 'react';
import { FileImage, ChevronLeft, ChevronRight, X, Loader2, Bot } from 'lucide-react';

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

export default function FRQReviewPanel({ submissions }) {
  const [viewerImage, setViewerImage] = useState(null);

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

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Bot className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-800 mb-1">AI Feedback & Score</h4>
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <p className="text-sm text-amber-700">Grading in progress... Results will appear here once processing is complete.</p>
            </div>
          </div>
        </div>
      </div>

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
