import { useEffect, useState } from 'react';
import { Box, Button, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { getExamAnalysis, type ExamAnalysis } from '../../../services/analysisService';
import { examService } from '../../../services/examService';
import { classService } from '../../../services/classService';
import { subjectRepository } from '../../../repositories/subjectRepository';
import { interventionService } from '../../../services/interventionService';
import { reportService, type ReportType } from '../../../services/reportService';
import { ClassReportDocument } from '../pdf/ClassReportDocument';
import { StudentReportDocument } from '../pdf/StudentReportDocument';
import { ensureFontsLoaded } from '../pdf/registerFonts';
import type { Exam, Intervention, SchoolClass } from '../../../types/entities';

export function ReportsPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [subjectName, setSubjectName] = useState('-');
  const [analysis, setAnalysis] = useState<ExamAnalysis | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [reportType, setReportType] = useState<ReportType>('sinif');

  useEffect(() => {
    if (!examId) return;
    let cancelled = false;

    (async () => {
      const [examData, examAnalysis, interventionsData] = await Promise.all([
        examService.getById(examId),
        getExamAnalysis(examId),
        interventionService.getByExam(examId),
      ]);
      if (cancelled || !examData || !examAnalysis) return;

      const [classData, subjects] = await Promise.all([
        classService.getById(examData.classId),
        subjectRepository.getAll(),
      ]);
      if (cancelled) return;

      setExam(examData);
      setSchoolClass(classData ?? null);
      setSubjectName(subjects.find((s) => s.id === examData.subjectId)?.name ?? '-');
      setAnalysis(examAnalysis);
      setInterventions(interventionsData);

      // Font tam yüklenmeden PDF render edilirse react-pdf glyph
      // altkümelemesini eksik veriyle yapar (bkz. registerFonts.ts).
      await ensureFontsLoaded();
      if (cancelled) return;

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [examId]);

  if (loading || !exam || !analysis) return null;

  const document =
    reportType === 'sinif' ? (
      <ClassReportDocument
        exam={exam}
        schoolClass={schoolClass}
        subjectName={subjectName}
        analysis={analysis}
        interventions={interventions}
      />
    ) : (
      <StudentReportDocument
        exam={exam}
        schoolClass={schoolClass}
        subjectName={subjectName}
        studentDetails={analysis.studentDetails}
      />
    );

  const fileName = `${exam.title}-${reportType === 'sinif' ? 'sinif-raporu' : 'ogrenci-raporu'}.pdf`;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/yazililar/${exam.id}/telafi`)}
        sx={{ mb: 1 }}
      >
        Telafi Planlamasına Dön
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5">{exam.title} — Raporlar</Typography>
          <Typography variant="body2" color="text.secondary">
            {schoolClass?.name} — {subjectName} — {exam.examDate}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={reportType}
            exclusive
            size="small"
            onChange={(_, value: ReportType | null) => value && setReportType(value)}
          >
            <ToggleButton value="sinif">Sınıf Raporu</ToggleButton>
            <ToggleButton value="ogrenci">Öğrenci Raporu</ToggleButton>
          </ToggleButtonGroup>

          <PDFDownloadLink document={document} fileName={fileName}>
            {({ loading: pdfLoading }) => (
              <Button
                variant="contained"
                disabled={pdfLoading}
                onClick={() => {
                  void reportService.logGenerated(exam.id, reportType);
                }}
              >
                {pdfLoading ? 'Hazırlanıyor...' : 'PDF İndir'}
              </Button>
            )}
          </PDFDownloadLink>
        </Box>
      </Box>

      <PDFViewer style={{ width: '100%', height: '80vh', border: 'none' }} showToolbar>
        {document}
      </PDFViewer>
    </Box>
  );
}
