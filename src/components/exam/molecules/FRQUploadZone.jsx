import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, Smartphone, X, Monitor, AlertCircle, UserCheck, FileImage, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PAGES = [
  { key: 'page1', label: 'Upload Page 1 (Part A, B)', shortLabel: 'Page 1' },
  { key: 'page2', label: 'Upload Page 2 (Part C, D)', shortLabel: 'Page 2' }
];

function QRModal({ pageConfig, participantId, questionId, uploadStatus, onFileUpload, onClose }) {
  const [showPCUpload, setShowPCUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const submission = uploadStatus[pageConfig.key];
  const isUploaded = !!submission;

  useEffect(() => {
    if (isUploaded) {
      const timer = setTimeout(onClose, 1200);
      return () => clearTimeout(timer);
    }
  }, [isUploaded, onClose]);

  const qrUrl = `${window.location.origin}/mobile/upload?participantId=${participantId}&questionId=${questionId}&page=${pageConfig.key}`;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be smaller than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePCUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      await onFileUpload(questionId, pageConfig.key, selectedFile);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  if (isUploaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40" />
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-[scale-in_0.3s_ease-out]">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Received</h3>
          <p className="text-sm text-gray-500">
            {pageConfig.shortLabel} has been uploaded successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {!showPCUpload ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-3">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {pageConfig.label}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Scan with your phone to take a photo of your answer sheet.
            </p>

            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                <QRCodeSVG
                  value={qrUrl}
                  size={192}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center mb-5">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-xs text-gray-500">
                Waiting for mobile upload...
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => setShowPCUpload(true)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Monitor className="w-3.5 h-3.5" />
                Camera not working? Upload from PC
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                setShowPCUpload(false);
                setSelectedFile(null);
                setPreview(null);
                setError('');
              }}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors"
            >
              <span>&larr;</span> Back to QR Code
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">
                <Monitor className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Upload from Computer
              </h3>
              <p className="text-xs text-gray-500 mt-1">{pageConfig.label}</p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {preview ? (
                <div className="space-y-3">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-lg border border-gray-200 shadow-sm"
                  />
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <FileImage className="w-4 h-4" />
                    <span className="font-medium truncate max-w-[180px]">{selectedFile?.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreview(null);
                      }}
                      className="ml-1 p-0.5 rounded hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-3">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click to select image</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePCUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FRQUploadZone({ uploadStatus = {}, onFileUpload, questionId, participantId }) {
  const [activeModal, setActiveModal] = useState(null);

  const activePage = PAGES.find(p => p.key === activeModal);

  return (
    <>
      <div className="space-y-2">
        {PAGES.map((page) => {
          const submission = uploadStatus[page.key];
          const isUploaded = !!submission;
          const isTeacherUpload = submission?.submitted_by === 'teacher_manual_support';

          return (
            <button
              key={page.key}
              onClick={() => !isUploaded && setActiveModal(page.key)}
              disabled={isUploaded}
              className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                isUploaded
                  ? 'bg-green-50 border-green-300 text-green-700 cursor-default'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
              }`}
            >
              {isUploaded ? (
                isTeacherUpload ? (
                  <UserCheck className="w-4 h-4 text-green-600" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="flex-1 text-left">
                {isUploaded
                  ? `${page.shortLabel} Uploaded${isTeacherUpload ? ' (by Teacher)' : ''}`
                  : page.label
                }
              </span>
              {isUploaded && submission?.file_name && (
                <span className="text-xs text-green-500 truncate max-w-[120px]">
                  {submission.file_name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activePage && (
        <QRModal
          pageConfig={activePage}
          participantId={participantId}
          questionId={questionId}
          uploadStatus={uploadStatus}
          onFileUpload={onFileUpload}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
