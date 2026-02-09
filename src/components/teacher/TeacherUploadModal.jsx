import React, { useState, useRef } from 'react';
import { Upload, FileImage, X, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { teacherApi } from '../../api/teacherApi';

const STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
};

export default function TeacherUploadModal({
  isOpen,
  onClose,
  participant,
  questionId,
  questionLabel,
  pageKey,
  pageLabel,
  onUploadComplete
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const reset = () => {
    setSelectedFile(null);
    setPreview(null);
    setStatus(STATUS.IDLE);
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File must be smaller than 10MB');
      return;
    }

    setSelectedFile(file);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !participant) return;

    setStatus(STATUS.UPLOADING);
    setErrorMsg('');

    try {
      const fileUrl = await teacherApi.uploadFRQFile(
        selectedFile,
        participant.id,
        questionId,
        pageKey
      );

      await teacherApi.saveFRQSubmission(
        participant.id,
        questionId,
        pageKey,
        fileUrl,
        selectedFile.name
      );

      setStatus(STATUS.SUCCESS);
      onUploadComplete && onUploadComplete();
    } catch (err) {
      console.error('Upload failed:', err);
      setStatus(STATUS.ERROR);
      setErrorMsg(err.message || 'Upload failed. Please try again.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileSelect(fakeEvent);
    }
  };

  const title = `Manual Upload - ${participant?.student_name || 'Student'}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
    >
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{questionLabel}</span> - {pageLabel}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Upload an image received from the student via messenger. This will be marked as a teacher-assisted submission for tracking purposes.
          </p>
        </div>

        {status === STATUS.SUCCESS ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">Upload Complete</h4>
            <p className="text-sm text-gray-500 mb-6">
              The submission has been recorded as "Admin Upload" for {participant?.student_name}.
            </p>
            <Button variant="primary" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
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
                    className="max-h-48 mx-auto rounded-lg border border-gray-200 shadow-sm"
                  />
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <FileImage className="w-4 h-4" />
                    <span className="font-medium">{selectedFile?.name}</span>
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
                <div className="py-4">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">
                    Drop image here or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG up to 10MB
                  </p>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!selectedFile || status === STATUS.UPLOADING}
              >
                {status === STATUS.UPLOADING ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1.5" />
                    Upload for Student
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
