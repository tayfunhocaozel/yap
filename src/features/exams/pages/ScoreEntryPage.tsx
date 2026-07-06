import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Snackbar,
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
import { examService } from '../../../services/examService';
import { classService } from '../../../services/classService';
import { studentService } from '../../../services/studentService';
import { questionService } from '../../../services/questionService';
import { scoreService } from '../../../services/scoreService';
import { subjectRepository } from '../../../repositories/subjectRepository';
import { ValidationError } from '../../../services/errors';
import type { Exam, Question, SchoolClass, Student } from '../../../types/entities';

function cellKey(studentId: string, questionId: string): string {
  return `${studentId}:${questionId}`;
}

export function ScoreEntryPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [subjectName, setSubjectName] = useState('-');
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!examId) return;
    let cancelled = false;

    (async () => {
      const examData = await examService.getById(examId);
      if (!examData || cancelled) return;

      const [classData, subjects, questionsData] = await Promise.all([
        classService.getById(examData.classId),
        subjectRepository.getAll(),
        questionService.getByExam(examId),
      ]);
      if (cancelled) return;

      const studentsData = classData ? await studentService.getActiveByClass(classData.id) : [];
      const scores = await scoreService.getByExam(examId);
      if (cancelled) return;

      setExam(examData);
      setSchoolClass(classData ?? null);
      setSubjectName(subjects.find((s) => s.id === examData.subjectId)?.name ?? '-');
      setQuestions(questionsData);
      setStudents(studentsData);
      setValues(
        Object.fromEntries(scores.map((s) => [cellKey(s.studentId, s.questionId), String(s.earnedScore)])),
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [examId]);

  function focusCell(rowIndex: number, colIndex: number) {
    const student = students[rowIndex];
    const question = questions[colIndex];
    if (!student || !question) return;
    inputRefs.current[cellKey(student.id, question.id)]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      focusCell(rowIndex + 1, colIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusCell(rowIndex - 1, colIndex);
    }
  }

  function handleChange(studentId: string, questionId: string, raw: string) {
    setValues((prev) => ({ ...prev, [cellKey(studentId, questionId)]: raw }));
  }

  async function handleBlur(studentId: string, questionId: string, maxScore: number) {
    const key = cellKey(studentId, questionId);
    const raw = (values[key] ?? '').trim();
    if (raw === '') return;

    try {
      await scoreService.setScore({ studentId, questionId, maxScore, earnedScore: Number(raw) });
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
        return;
      }
      throw err;
    }
  }

  function rowTotal(studentId: string): { total: number; isComplete: boolean } {
    let total = 0;
    let isComplete = true;
    for (const q of questions) {
      const raw = values[cellKey(studentId, q.id)];
      const num = raw !== undefined && raw.trim() !== '' ? Number(raw) : NaN;
      if (Number.isFinite(num)) {
        total += num;
      } else {
        isComplete = false;
      }
    }
    return { total, isComplete };
  }

  if (loading) return null;

  if (!exam) {
    return <Typography>Yazılı bulunamadı.</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/yazililar/${exam.id}/sorular`)}
        sx={{ mb: 1 }}
      >
        Sorulara Dön
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5">{exam.title} — Puan Girişi</Typography>
          <Typography variant="body2" color="text.secondary">
            {schoolClass?.name} — {subjectName} — {exam.examDate}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate(`/yazililar/${exam.id}/analiz`)}>
          Analizi Görüntüle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Öğrenci</TableCell>
              {questions.map((q) => (
                <TableCell key={q.id} align="center">
                  S{q.questionNo} ({q.score}p)
                </TableCell>
              ))}
              <TableCell align="center">Toplam</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student, rowIndex) => {
              const { total, isComplete } = rowTotal(student.id);
              return (
                <TableRow key={student.id} hover>
                  <TableCell>
                    {student.schoolNumber} — {student.fullName}
                  </TableCell>
                  {questions.map((q, colIndex) => (
                    <TableCell key={q.id} align="center" sx={{ p: 0.5 }}>
                      <input
                        ref={(el) => {
                          inputRefs.current[cellKey(student.id, q.id)] = el;
                        }}
                        type="number"
                        min={0}
                        max={q.score}
                        value={values[cellKey(student.id, q.id)] ?? ''}
                        onChange={(e) => handleChange(student.id, q.id, e.target.value)}
                        onBlur={() => handleBlur(student.id, q.id, q.score)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        style={{ width: 56, textAlign: 'center', padding: 4 }}
                      />
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={isComplete ? total : `${total} (eksik)`}
                      color={isComplete ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={questions.length + 2} align="center">
                  Bu sınıfta öğrenci bulunmuyor.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={error !== null} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
