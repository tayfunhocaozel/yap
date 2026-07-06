import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { getExamAnalysis, type OutcomeAnalysis } from '../../../services/analysisService';
import { examService } from '../../../services/examService';
import { classService } from '../../../services/classService';
import { subjectRepository } from '../../../repositories/subjectRepository';
import {
  interventionService,
  suggestIntervention,
  SUGGESTION_LABELS,
  type SuggestionLabel,
} from '../../../services/interventionService';
import { ValidationError } from '../../../services/errors';
import { today } from '../../../utils/today';
import type { Exam, Intervention, SchoolClass } from '../../../types/entities';

interface InterventionRowProps {
  examId: string;
  outcomeId: string;
  outcomeCode: string;
  failingStudentCount: number;
  existing: Intervention | undefined;
}

function InterventionRow({ examId, outcomeId, outcomeCode, failingStudentCount, existing }: InterventionRowProps) {
  const suggestion = suggestIntervention(failingStudentCount);
  const [type, setType] = useState<SuggestionLabel>(
    (existing?.type as SuggestionLabel | undefined) ?? suggestion ?? SUGGESTION_LABELS[0],
  );
  const [date, setDate] = useState(existing?.interventionDate ?? today());
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saved, setSaved] = useState(Boolean(existing));
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    try {
      await interventionService.save({ examId, outcomeId, type, interventionDate: date, notes });
      setSaved(true);
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
        return;
      }
      throw err;
    }
  }

  return (
    <TableRow>
      <TableCell>{outcomeCode}</TableCell>
      <TableCell align="right">{failingStudentCount}</TableCell>
      <TableCell>
        <TextField
          select
          size="small"
          fullWidth
          value={type}
          onChange={(e) => {
            setType(e.target.value as SuggestionLabel);
            setSaved(false);
          }}
        >
          {SUGGESTION_LABELS.map((label) => (
            <MenuItem key={label} value={label}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell>
        <TextField
          type="date"
          size="small"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSaved(false);
          }}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          fullWidth
          placeholder="Not (opsiyonel)"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
        />
      </TableCell>
      <TableCell align="right">
        <Button size="small" variant={saved ? 'outlined' : 'contained'} onClick={handleSave}>
          {saved ? 'Kaydedildi' : 'Kaydet'}
        </Button>
        {error && (
          <Typography color="error" variant="caption" sx={{ display: 'block' }}>
            {error}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
}

export function InterventionPlanPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
  const [subjectName, setSubjectName] = useState('-');
  const [outcomeAnalyses, setOutcomeAnalyses] = useState<OutcomeAnalysis[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  useEffect(() => {
    if (!examId) return;
    let cancelled = false;

    (async () => {
      const [examData, analysis, interventionsData] = await Promise.all([
        examService.getById(examId),
        getExamAnalysis(examId),
        interventionService.getByExam(examId),
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
      setOutcomeAnalyses(analysis?.outcomeAnalyses ?? []);
      setInterventions(interventionsData);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [examId]);

  if (loading || !exam) return null;

  const needsIntervention = outcomeAnalyses.filter((o) => o.failingStudentCount > 0);

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/yazililar/${exam.id}/analiz`)}
        sx={{ mb: 1 }}
      >
        Analize Dön
      </Button>

      <Typography variant="h5">{exam.title} — Telafi Planlama</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {schoolClass?.name} — {subjectName} — {exam.examDate}
      </Typography>

      {needsIntervention.length === 0 ? (
        <Alert severity="success">Telafi gerektiren bir kazanım bulunmuyor.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Kazanım</TableCell>
                <TableCell align="right">Başarısız Öğrenci</TableCell>
                <TableCell>Telafi Yöntemi</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Not</TableCell>
                <TableCell align="right">Kayıt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {needsIntervention.map((o) => (
                <InterventionRow
                  key={o.outcomeId}
                  examId={exam.id}
                  outcomeId={o.outcomeId}
                  outcomeCode={o.code}
                  failingStudentCount={o.failingStudentCount}
                  existing={interventions.find((i) => i.outcomeId === o.outcomeId)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
