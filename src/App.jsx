import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ExamRoom from './pages/student/ExamRoom';
import ExamSessionManager from './pages/teacher/ExamSessionManager';
import MobileUpload from './pages/mobile/MobileUpload';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/student/exam/demo" replace />} />
        <Route path="/student/exam/demo" element={<ExamRoom />} />
        <Route path="/teacher/session" element={<ExamSessionManager />} />
        <Route path="/mobile/upload" element={<MobileUpload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
