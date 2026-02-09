import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, Loader2, X, Image } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { studentApi } from '../../api/studentApi';

const STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
};

const PAGE_LABELS = {
  page1: 'Page 1 (Part A, B)',
  page2: 'Page 2 (Part C, D)'
};

export default function MobileUpload() {
  const [searchParams] = useSearchParams();
  const participantId = searchParams.get('participantId');
  const questionId = searchParams.get('questionId');
  const page = searchParams.get('page');

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const pageLabel = PAGE_LABELS[page] || page;
  const isValid = participantId && questionId && page;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be smaller than 10MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !isValid) return;

    setStatus(STATUS.UPLOADING);
    setError('');

    try {
      const fileUrl = await studentApi.uploadFRQFile(selectedFile, participantId, questionId, page);
      await studentApi.saveFRQSubmission(participantId, questionId, page, fileUrl, selectedFile.name);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      console.error('Upload failed:', err);
      setStatus(STATUS.ERROR);
      setError(err.message || 'Upload failed. Please try again.');
    }
  };

  const handleRetake = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    setStatus(STATUS.IDLE);
  };

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-sm text-gray-500">
            This upload link is missing required parameters. Please scan the QR code again from the exam screen.
          </p>
        </div>
      </div>
    );
  }

  if (status === STATUS.SUCCESS) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-5">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Complete</h1>
          <p className="text-base text-gray-600 mb-2">
            {pageLabel} has been submitted successfully.
          </p>
          <p className="text-sm text-gray-400">
            You can check your computer screen -- it will update automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">Upload {pageLabel}</h1>
        <p className="text-xs text-gray-500 mt-0.5">Take a photo of your handwritten response</p>
      </header>

      <main className="p-5 space-y-5 max-w-lg mx-auto">
        {!preview ? (
          <div className="space-y-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl bg-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-transform"
            >
              <Camera className="w-6 h-6" />
              Take Photo
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-medium text-sm bg-white active:bg-gray-50 transition-colors"
            >
              <Image className="w-5 h-5" />
              Select from Gallery
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100">
              <img
                src={preview}
                alt="Preview of your response"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
              <button
                onClick={handleRetake}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white active:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-xs text-gray-500">
              Make sure your handwriting is clearly visible and the entire page is captured.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 px-4 py-3.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 bg-white active:bg-gray-50 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === STATUS.UPLOADING}
                className="flex-1 px-4 py-3.5 rounded-xl bg-green-600 text-white text-sm font-semibold shadow-lg shadow-green-600/20 active:scale-[0.98] transition-transform disabled:opacity-60 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {status === STATUS.UPLOADING ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Submit Photo
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
