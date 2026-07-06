import { Navigate, Route, Routes } from 'react-router-dom';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { ClassListPage } from '../features/classes/pages/ClassListPage';
import { StudentListPage } from '../features/students/pages/StudentListPage';
import { ExamListPage } from '../features/exams/pages/ExamListPage';
import { QuestionListPage } from '../features/exams/pages/QuestionListPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/siniflar" replace />} />
      <Route path="/ayarlar" element={<SettingsPage />} />
      <Route path="/siniflar" element={<ClassListPage />} />
      <Route path="/siniflar/:classId/ogrenciler" element={<StudentListPage />} />
      <Route path="/yazililar" element={<ExamListPage />} />
      <Route path="/yazililar/:examId/sorular" element={<QuestionListPage />} />
      <Route path="*" element={<Navigate to="/siniflar" replace />} />
    </Routes>
  );
}
