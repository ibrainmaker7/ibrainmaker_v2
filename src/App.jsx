import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home'; // 1. 방금 만든 Home 불러오기
import ExamRoom from './pages/student/ExamRoom';
import ExamSessionManager from './pages/teacher/ExamSessionManager';
import MobileUpload from './pages/mobile/MobileUpload';
import ReviewMode from './pages/student/ReviewMode';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 앱을 켜면 가장 먼저 Home(대문)을 보여줌 */}
        <Route path="/" element={<Home />} />

        {/* 2. 학생 시험 경로 (데모용 + 실전용) */}
        <Route path="/student/exam/demo" element={<ExamRoom />} />
        <Route path="/student/exam/:attemptId" element={<ExamRoom />} />

        {/* 3. 결과 리뷰 경로 (ID가 있을 때와 없을 때 모두 대응) */}
        <Route path="/student/review" element={<ReviewMode />} />
        <Route path="/student/review/:attemptId" element={<ReviewMode />} />

        {/* 4. 선생님 대시보드 */}
        <Route path="/teacher/session" element={<ExamSessionManager />} />

        {/* 5. 모바일 업로드 (QR 코드용) */}
        <Route path="/mobile/upload" element={<MobileUpload />} />
        <Route path="/mobile/upload/:token" element={<MobileUpload />} />

        {/* 6. 이상한 주소로 들어오면 홈으로 보냄 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;