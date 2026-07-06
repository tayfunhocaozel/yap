import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  getExamAnalysis,
  RISK_HEX_COLOR,
  type ExamAnalysis,
  type RiskLevel,
} from '../../../services/analysisService';
import { examService } from '../../../services/examService';
import { classService } from '../../../services/classService';
import { subjectRepository } from '../../../repositories/subjectRepository';
import type { Exam, SchoolClass } from '../../../types/entities';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RISK_COLOR: Record<RiskLevel, 'success' | 'info' | 'warning' | 'error'> = {
  'Çok İyi': 'success',
  İyi: 'info',
  Geliştirilmeli: 'warning',
  Kritik: 'error',
};

function successBarOptions(title: string) {
  return {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: title } },
    scales: { y: { min: 0, max: 100 } },
  };
}

export function AnalysisPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [subjectName, setSubjectName] = useState('-');
  const [analysis, setAnalysis] = useState<ExamAnalysis | null>(null);

  useEffect(() => {
    if (!examId) return;
    let cancelled = false;

    (async () => {
      const [examData, examAnalysis] = await Promise.all([
        examService.getById(examId),
        getExamAnalysis(examId),
      ]);
      if (cancelled || !examData) return;

      const [classData, subjects] = await Promise.all([
        classService.getById(examData.classId),
        subjectRepository.getAll(),
      ]);
      if (cancelled) return;

      setExam(examData);
      setSchoolClass(classData ?? null);
      setSubjectName(subjects.find((s) => s.id === examData.subjectId)?.name ?? '-');
      setAnalysis(examAnalysis);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [examId]);

  if (loading || !exam || !analysis) return null;

  // Hiç puanlanmamış öğrenci "henüz değerlendirilmedi" demektir, "riskli" değil;
  // en az bir soru puanlanmış ve toplamı düşük olan öğrenciler listelenir.
  const riskyStudents = analysis.studentAnalyses
    .filter((s) => s.gradedCount > 0 && s.totalScore < 70)
    .sort((a, b) => a.totalScore - b.totalScore);

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/yazililar/${exam.id}/puanlar`)}
        sx={{ mb: 1 }}
      >
        Puan Girişine Dön
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5">{exam.title} — Analiz</Typography>
          <Typography variant="body2" color="text.secondary">
            {schoolClass?.name} — {subjectName} — {exam.examDate}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate(`/yazililar/${exam.id}/telafi`)}>
          Telafi Planlamasına Geç
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Sınıf Özeti */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sınıf Özeti
            </Typography>
            <Typography>Öğrenci Sayısı: {analysis.classAnalysis.studentCount}</Typography>
            <Typography>Ortalama: {analysis.classAnalysis.average.toFixed(1)}</Typography>
            <Typography>En Yüksek: {analysis.classAnalysis.max}</Typography>
            <Typography>En Düşük: {analysis.classAnalysis.min}</Typography>
          </Paper>
        </Grid>

        {/* Riskli Öğrenciler */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Riskli Öğrenciler
            </Typography>
            {riskyStudents.length === 0 ? (
              <Typography color="text.secondary">Riskli öğrenci bulunmuyor.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Okul No</TableCell>
                      <TableCell>Ad Soyad</TableCell>
                      <TableCell align="right">Puan</TableCell>
                      <TableCell align="right">Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {riskyStudents.map((s) => {
                      const risk = s.totalScore < 50 ? 'Kritik' : 'Geliştirilmeli';
                      return (
                        <TableRow key={s.studentId}>
                          <TableCell>{s.schoolNumber}</TableCell>
                          <TableCell>
                            {s.fullName}
                            {!s.isFullyGraded && ' (eksik)'}
                          </TableCell>
                          <TableCell align="right">{s.totalScore}</TableCell>
                          <TableCell align="right">
                            <Chip size="small" label={risk} color={RISK_COLOR[risk]} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Soru Analizi */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Soru Analizi
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Soru No</TableCell>
                    <TableCell align="right">Maks. Puan</TableCell>
                    <TableCell align="right">Ort. Puan</TableCell>
                    <TableCell align="right">Başarı %</TableCell>
                    <TableCell align="right">Puanlanan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analysis.questionAnalyses.map((q) => (
                    <TableRow key={q.questionId}>
                      <TableCell>{q.questionNo}</TableCell>
                      <TableCell align="right">{q.maxScore}</TableCell>
                      <TableCell align="right">{q.averageScore.toFixed(1)}</TableCell>
                      <TableCell align="right">{q.successRate.toFixed(0)}%</TableCell>
                      <TableCell align="right">
                        {q.gradedCount} / {analysis.classAnalysis.studentCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Konu Analizi */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Konu Analizi
            </Typography>
            <Bar
              options={successBarOptions('Konu Bazlı Başarı %')}
              data={{
                labels: analysis.topicAnalyses.map((t) => t.topicName),
                datasets: [
                  {
                    label: 'Başarı %',
                    data: analysis.topicAnalyses.map((t) => Math.round(t.successRate)),
                    backgroundColor: '#1565C0',
                  },
                ],
              }}
            />
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Konu</TableCell>
                    <TableCell align="right">Başarı %</TableCell>
                    <TableCell align="right">Eksik Öğrenci</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analysis.topicAnalyses.map((t) => (
                    <TableRow key={t.topicId}>
                      <TableCell>{t.topicName}</TableCell>
                      <TableCell align="right">{t.successRate.toFixed(0)}%</TableCell>
                      <TableCell align="right">{t.missingStudentCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Kazanım Analizi */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Kazanım Analizi
            </Typography>
            <Bar
              options={successBarOptions('Kazanım Bazlı Başarı %')}
              data={{
                labels: analysis.outcomeAnalyses.map((o) => o.code),
                datasets: [
                  {
                    label: 'Başarı %',
                    data: analysis.outcomeAnalyses.map((o) => Math.round(o.successRate)),
                    backgroundColor: analysis.outcomeAnalyses.map((o) => RISK_HEX_COLOR[o.riskLevel]),
                  },
                ],
              }}
            />
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Kazanım</TableCell>
                    <TableCell align="right">Başarı %</TableCell>
                    <TableCell align="right">Başarısız Öğrenci</TableCell>
                    <TableCell align="right">Risk</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analysis.outcomeAnalyses.map((o) => (
                    <TableRow key={o.outcomeId}>
                      <TableCell>{o.code}</TableCell>
                      <TableCell align="right">{o.successRate.toFixed(0)}%</TableCell>
                      <TableCell align="right">{o.failingStudentCount}</TableCell>
                      <TableCell align="right">
                        <Chip size="small" label={o.riskLevel} color={RISK_COLOR[o.riskLevel]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
