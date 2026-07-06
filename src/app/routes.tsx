import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { ClassListPage } from '../features/classes/pages/ClassListPage';
import { StudentListPage } from '../features/students/pages/StudentListPage';
import { ExamListPage } from '../features/exams/pages/ExamListPage';
import { QuestionListPage } from '../features/exams/pages/QuestionListPage';
import { ScoreEntryPage } from '../features/exams/pages/ScoreEntryPage';
import { AnalysisPage } from '../features/exams/pages/AnalysisPage';
import { InterventionPlanPage } from '../features/exams/pages/InterventionPlanPage';
import { ReportsPage } from '../features/exams/pages/ReportsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/ayarlar" element={<SettingsPage />} />
      <Route path="/siniflar" element={<ClassListPage />} />
      <Route path="/siniflar/:classId/ogrenciler" element={<StudentListPage />} />
      <Route path="/yazililar" element={<ExamListPage />} />
      <Route path="/yazililar/:examId/sorular" element={<QuestionListPage />} />
      <Route path="/yazililar/:examId/puanlar" element={<ScoreEntryPage />} />
      <Route path="/yazililar/:examId/analiz" element={<AnalysisPage />} />
      <Route path="/yazililar/:examId/telafi" element={<InterventionPlanPage />} />
      <Route path="/yazililar/:examId/raporlar" element={<ReportsPage />} />
      <Route path="*" element={<Navigate to="/siniflar" replace />} />
    </Routes>
  );
}
