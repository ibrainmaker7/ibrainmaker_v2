import React from 'react';
import {
  Clock, CheckCircle, Bot, Send, Eye, Loader2, Shield
} from 'lucide-react';

const GRADE_STATUS_CONFIG = {
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200'
  },
  pending: {
    label: 'Pending AI',
    icon: Loader2,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    animate: true
  },
  ai_graded: {
    label: 'AI Graded',
    icon: Bot,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  released: {
    label: 'Released',
    icon: Shield,
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  }
};

function StatusBadge({ status }) {
  const conf = GRADE_STATUS_CONFIG[status] || GRADE_STATUS_CONFIG.in_progress;
  const Icon = conf.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${conf.bg} ${conf.text} border ${conf.border}`}>
      <Icon className={`w-3 h-3 ${conf.animate ? 'animate-spin' : ''}`} />
      {conf.label}
    </span>
  );
}

function ScoreCell({ score, total }) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-gray-400">--</span>;
  }

  const pct = total > 0 ? score / total : 0;
  let color = 'text-red-600';
  if (pct >= 0.8) color = 'text-green-600';
  else if (pct >= 0.6) color = 'text-amber-600';

  return (
    <span className={`text-sm font-semibold ${color}`}>
      {score}/{total}
    </span>
  );
}

function GradingStudentRow({ student, onReview }) {
  const frqKeys = Object.keys(student.frq_grades || {});
  const frqScore = frqKeys.reduce((sum, k) => sum + (student.frq_grades[k]?.score || 0), 0);
  const frqMax = frqKeys.reduce((sum, k) => sum + (student.frq_grades[k]?.maxScore || 0), 0);
  const hasFRQScores = frqKeys.some(k => student.frq_grades[k]?.score !== null);

  const mcqScore = student.mcq_score;
  const mcqTotal = student.mcq_total;

  const totalScore = student.total_score !== null
    ? student.total_score
    : (mcqScore !== null && hasFRQScores ? mcqScore + frqScore : null);
  const totalMax = mcqTotal + frqMax;

  const canReview = student.grade_status !== 'in_progress';

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{student.student_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{student.student_email}</p>
        </div>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={student.grade_status} />
      </td>

      <td className="px-5 py-4 text-center">
        <ScoreCell score={mcqScore} total={mcqTotal} />
      </td>

      <td className="px-5 py-4 text-center">
        {hasFRQScores ? (
          <ScoreCell score={frqScore} total={frqMax} />
        ) : (
          <span className="text-xs text-gray-400">
            {student.grade_status === 'pending' ? 'Grading...' : '--'}
          </span>
        )}
      </td>

      <td className="px-5 py-4 text-center">
        {totalScore !== null ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-sm font-bold text-gray-800">
            {totalScore}/{totalMax}
          </span>
        ) : (
          <span className="text-xs text-gray-400">--</span>
        )}
      </td>

      <td className="px-5 py-4 text-center">
        {canReview ? (
          <button
            onClick={() => onReview(student)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Review
          </button>
        ) : (
          <span className="text-xs text-gray-400">Exam in progress</span>
        )}
      </td>
    </tr>
  );
}

export default function GradingQueue({ students, onReview }) {
  const aiGraded = students.filter(s => s.grade_status === 'ai_graded').length;
  const released = students.filter(s => s.grade_status === 'released').length;
  const pending = students.filter(s => s.grade_status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border px-4 py-3 bg-blue-50 border-blue-200 text-blue-700">
          <p className="text-xs font-medium opacity-70">Ready for Review</p>
          <p className="text-xl font-bold mt-0.5">{aiGraded}</p>
        </div>
        <div className="rounded-xl border px-4 py-3 bg-green-50 border-green-200 text-green-700">
          <p className="text-xs font-medium opacity-70">Grades Released</p>
          <p className="text-xl font-bold mt-0.5">{released}</p>
        </div>
        <div className="rounded-xl border px-4 py-3 bg-amber-50 border-amber-200 text-amber-700">
          <p className="text-xs font-medium opacity-70">Pending AI Grading</p>
          <p className="text-xl font-bold mt-0.5">{pending}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Grading Queue</h2>
          <p className="text-xs text-gray-400 mt-0.5">Review AI-graded FRQ responses and release final scores</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">MCQ</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">FRQ (AI)</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-gray-400">
                    No students to grade yet.
                  </td>
                </tr>
              ) : (
                students.map(s => (
                  <GradingStudentRow key={s.id} student={s} onReview={onReview} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
