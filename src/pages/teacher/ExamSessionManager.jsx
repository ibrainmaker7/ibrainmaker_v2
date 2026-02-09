import React, { useState, useEffect, useCallback } from 'react';
import { Users, RefreshCw, CloudUpload, CheckCircle, Clock, Send, AlertTriangle, Monitor, ClipboardCheck } from 'lucide-react';
import { teacherApi } from '../../api/teacherApi';
import TeacherUploadModal from '../../components/teacher/TeacherUploadModal';
import GradingQueue from '../../components/teacher/GradingQueue';
import GradingDetailModal from '../../components/teacher/GradingDetailModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MOCK_STUDENTS } from '../../data/mockGradingData';

const STATUS_CONFIG = {
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  submitted: { label: 'Submitted', icon: Send, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
};

function SubmissionCell({ submission }) {
  if (!submission) return null;
  const isAdmin = submission.submitted_by === 'teacher_manual_support';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      isAdmin
        ? 'bg-green-100 text-green-700 border border-green-300'
        : 'bg-gray-100 text-gray-600 border border-gray-200'
    }`}>
      <CheckCircle className="w-3 h-3" />
      {isAdmin ? 'Submitted (Admin)' : 'Submitted'}
    </span>
  );
}

function MissingCell({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
    >
      <CloudUpload className="w-3.5 h-3.5" />
      Upload for Student
    </button>
  );
}

function StudentRow({ participant, frqQuestions, onUploadClick }) {
  const statusConf = STATUS_CONFIG[participant.exam_status] || STATUS_CONFIG.in_progress;
  const StatusIcon = statusConf.icon;

  const getSubmission = (questionId, pageKey) => {
    return participant.frq_submissions?.find(
      s => s.question_id === questionId && s.page_key === pageKey
    );
  };

  const totalPages = frqQuestions.reduce((sum, q) => sum + q.pages.length, 0);
  const submittedPages = frqQuestions.reduce((sum, q) => {
    return sum + q.pages.filter(p => getSubmission(q.id, p)).length;
  }, 0);
  const allSubmitted = submittedPages === totalPages;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{participant.student_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{participant.student_email}</p>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.color} border ${statusConf.border}`}>
          <StatusIcon className="w-3 h-3" />
          {statusConf.label}
        </span>
      </td>
      {frqQuestions.map(q =>
        q.pages.map(pageKey => {
          const sub = getSubmission(q.id, pageKey);
          return (
            <td key={`${q.id}-${pageKey}`} className="px-4 py-4 text-center">
              {sub ? (
                <SubmissionCell submission={sub} />
              ) : (
                <MissingCell onClick={() => onUploadClick(participant, q.id, q.label, pageKey)} />
              )}
            </td>
          );
        })
      )}
      <td className="px-5 py-4 text-center">
        {allSubmitted ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
            <CheckCircle className="w-3.5 h-3.5" />
            Complete
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
            <AlertTriangle className="w-3.5 h-3.5" />
            {submittedPages}/{totalPages}
          </span>
        )}
      </td>
    </tr>
  );
}

function LiveMonitorTab({ participants, frqQuestions, onUploadClick, error }) {
  const completedCount = participants.filter(p => p.exam_status === 'submitted' || p.exam_status === 'completed').length;
  const inProgressCount = participants.filter(p => p.exam_status === 'in_progress').length;
  const totalExpectedPages = participants.length * frqQuestions.reduce((sum, q) => sum + q.pages.length, 0);
  const totalSubmittedPages = participants.reduce((sum, p) => sum + (p.frq_submissions?.length || 0), 0);
  const missingPages = totalExpectedPages - totalSubmittedPages;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Students" value={participants.length} sub={`${inProgressCount} still taking exam`} color="blue" />
        <StatCard label="Completed / Submitted" value={completedCount} sub={`of ${participants.length} students`} color="green" />
        <StatCard label="Missing FRQ Pages" value={missingPages} sub={missingPages > 0 ? 'Needs teacher attention' : 'All pages submitted'} color={missingPages > 0 ? 'amber' : 'green'} />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Student Progress</h2>
          <p className="text-xs text-gray-400 mt-0.5">FRQ submission status for each student</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                {frqQuestions.map(q =>
                  q.pages.map(pageKey => (
                    <th key={`${q.id}-${pageKey}`} className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {q.label} / {pageKey === 'page1' ? 'P1' : 'P2'}
                    </th>
                  ))
                )}
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">FRQ Total</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={3 + frqQuestions.reduce((s, q) => s + q.pages.length, 0)} className="text-center py-12 text-sm text-gray-400">
                    No students have joined this session yet.
                  </td>
                </tr>
              ) : (
                participants.map(p => (
                  <StudentRow key={p.id} participant={p} frqQuestions={frqQuestions} onUploadClick={onUploadClick} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ExamSessionManager() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [uploadModal, setUploadModal] = useState({
    open: false, participant: null, questionId: null, questionLabel: '', pageKey: null
  });

  const [gradingStudents, setGradingStudents] = useState(MOCK_STUDENTS);
  const [gradingDetail, setGradingDetail] = useState({ open: false, student: null });

  const frqQuestions = teacherApi.FRQ_QUESTIONS;

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const [sessionData, participantsData] = await Promise.all([
        teacherApi.getSessionInfo(),
        teacherApi.getSessionParticipants()
      ]);

      setSession(sessionData);
      setParticipants(participantsData || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const unsubscribe = teacherApi.subscribeToSubmissions(undefined, () => { loadData(true); });
    return unsubscribe;
  }, [loadData]);

  const handleUploadClick = (participant, questionId, questionLabel, pageKey) => {
    setUploadModal({
      open: true, participant, questionId, questionLabel, pageKey,
      pageLabel: pageKey === 'page1' ? 'Page 1 (Part A, B)' : 'Page 2 (Part C, D)'
    });
  };

  const handleReviewStudent = (student) => {
    setGradingDetail({ open: true, student });
  };

  const handleStudentUpdate = (updatedStudent) => {
    setGradingStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setGradingDetail(prev => ({
      ...prev,
      student: prev.student?.id === updatedStudent.id ? updatedStudent : prev.student
    }));
  };

  const tabs = [
    { id: 'monitor', label: 'Live Monitor', icon: Monitor },
    { id: 'grading', label: 'Grading Queue', icon: ClipboardCheck }
  ];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading session data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{session?.exam_name || 'Exam Session'}</h1>
              <p className="text-xs text-gray-500 mt-0.5">Teacher Session Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'monitor' && (
          <LiveMonitorTab
            participants={participants}
            frqQuestions={frqQuestions}
            onUploadClick={handleUploadClick}
            error={error}
          />
        )}

        {activeTab === 'grading' && (
          <GradingQueue students={gradingStudents} onReview={handleReviewStudent} />
        )}
      </main>

      <TeacherUploadModal
        isOpen={uploadModal.open}
        onClose={() => setUploadModal(prev => ({ ...prev, open: false }))}
        participant={uploadModal.participant}
        questionId={uploadModal.questionId}
        questionLabel={uploadModal.questionLabel}
        pageKey={uploadModal.pageKey}
        pageLabel={uploadModal.pageLabel}
        onUploadComplete={() => loadData(true)}
      />

      <GradingDetailModal
        isOpen={gradingDetail.open}
        onClose={() => setGradingDetail({ open: false, student: null })}
        student={gradingDetail.student}
        onStudentUpdate={handleStudentUpdate}
      />
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700'
  };

  return (
    <div className={`rounded-xl border px-5 py-4 ${colorMap[color] || colorMap.blue}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  );
}
