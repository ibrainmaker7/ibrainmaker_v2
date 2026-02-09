import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Presentation } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 학생 모드 버튼 */}
        <button
          onClick={() => navigate('/student/exam/demo')}
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-blue-100 flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
            <GraduationCap className="w-10 h-10 text-blue-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Student Mode</h2>
          <p className="text-gray-500 mt-2">Take the AP Calculus BC Exam</p>
        </button>

        {/* 선생님 모드 버튼 */}
        <button
          onClick={() => navigate('/teacher/session')}
          className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-indigo-100 flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
            <Presentation className="w-10 h-10 text-indigo-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Hub</h2>
          <p className="text-gray-500 mt-2">Grading & Live Monitoring</p>
        </button>

      </div>
    </div>
  );
}