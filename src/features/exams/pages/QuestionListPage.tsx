import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { examService } from '../../../services/examService';
import { classService } from '../../../services/classService';
import { subjectRepository } from '../../../repositories/subjectRepository';
import { questionService, REQUIRED_TOTAL_SCORE } from '../../../services/questionService';
import { useQuestions } from '../hooks/useQuestions';
import { useTopics } from '../hooks/useTopics';
import { useOutcomesByIds } from '../hooks/useOutcomesByIds';
import { QuestionFormDialog } from './QuestionFormDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import type { Question } from '../../../types/entities';

export function QuestionListPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const exam = useLiveQuery(() => examService.getById(examId!), [examId]);
  const schoolClass = useLiveQuery(
    () => (exam ? classService.getById(exam.classId) : undefined),
    [exam],
  );
  const subjects = useLiveQuery(() => subjectRepository.getAll(), []);
  const topics = useTopics(exam?.subjectId ?? '', schoolClass?.grade) ?? [];
  const questions = useQuestions(examId!);
  const outcomes = useOutcomesByIds(questions?.map((q) => q.outcomeId) ?? []);

  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState<Question | null>(null);

  const topicNameById = new Map(topics.map((t) => [t.id, t.unit ? `${t.unit} — ${t.name}` : t.name]));
  const outcomeCodeById = new Map(outcomes?.map((o) => [o.id, o.code]));
  const subjectName = subjects?.find((s) => s.id === exam?.subjectId)?.name ?? '-';

  const totalScore = (questions ?? []).reduce((sum, q) => sum + q.score, 0);
  const isComplete = totalScore === REQUIRED_TOTAL_SCORE;
  const nextQuestionNo = (questions ?? []).reduce((max, q) => Math.max(max, q.questionNo), 0) + 1;

  function openCreate() {
    setEditingQuestion(null);
    setFormOpen(true);
  }

  function openEdit(question: Question) {
    setEditingQuestion(question);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (deleting) {
      await questionService.remove(deleting.id);
    }
    setDeleting(null);
  }

  if (!examId) return null;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/yazililar')} sx={{ mb: 1 }}>
        Yazılılara Dön
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5">{exam ? exam.title : 'Yazılı'}</Typography>
          {exam && schoolClass && (
            <Typography variant="body2" color="text.secondary">
              {schoolClass.name} — {subjectName} — {exam.examDate}
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} disabled={!exam || topics.length === 0}>
          Yeni Soru
        </Button>
      </Box>

      {exam && topics.length === 0 && (
        <Typography color="warning.main" sx={{ mb: 2 }}>
          Bu ders/sınıf seviyesi için müfredat verisi henüz yüklenmemiş; soru eklenemez.
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Soru No</TableCell>
              <TableCell>Puan</TableCell>
              <TableCell>Konu</TableCell>
              <TableCell>Kazanım</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions?.map((q) => (
              <TableRow key={q.id} hover>
                <TableCell>{q.questionNo}</TableCell>
                <TableCell>{q.score}</TableCell>
                <TableCell>{topicNameById.get(q.topicId) ?? '-'}</TableCell>
                <TableCell>{outcomeCodeById.get(q.outcomeId) ?? '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(q)} aria-label="düzenle">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setDeleting(q)} aria-label="sil">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {questions && questions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Henüz soru eklenmedi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>
                <strong>Toplam Puan</strong>
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={`${totalScore} / ${REQUIRED_TOTAL_SCORE}`}
                  color={isComplete ? 'success' : 'warning'}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {exam && (
        <QuestionFormDialog
          open={formOpen}
          examId={exam.id}
          topics={topics}
          editingQuestion={editingQuestion}
          suggestedQuestionNo={nextQuestionNo}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Soruyu Sil"
        description={`"${deleting?.questionNo}" numaralı soruyu silmek istediğinize emin misiniz?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </Box>
  );
}
