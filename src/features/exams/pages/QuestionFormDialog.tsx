import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { questionService } from '../../../services/questionService';
import { ValidationError } from '../../../services/errors';
import { useOutcomesByTopic } from '../hooks/useOutcomesByTopic';
import type { Question, Topic } from '../../../types/entities';

interface QuestionFormDialogProps {
  open: boolean;
  examId: string;
  subjectName: string;
  topics: Topic[];
  editingQuestion: Question | null;
  suggestedQuestionNo: number;
  onClose: () => void;
}

export function QuestionFormDialog({
  open,
  examId,
  subjectName,
  topics,
  editingQuestion,
  suggestedQuestionNo,
  onClose,
}: QuestionFormDialogProps) {
  const [questionNo, setQuestionNo] = useState(1);
  const [score, setScore] = useState(10);
  const [topicId, setTopicId] = useState('');
  const [outcomeId, setOutcomeId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const outcomes = useOutcomesByTopic(topicId);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editingQuestion) {
      setQuestionNo(editingQuestion.questionNo);
      setScore(editingQuestion.score);
      setTopicId(editingQuestion.topicId);
      setOutcomeId(editingQuestion.outcomeId);
    } else {
      setQuestionNo(suggestedQuestionNo);
      setScore(10);
      setTopicId('');
      setOutcomeId('');
    }
  }, [open, editingQuestion, suggestedQuestionNo]);

  async function handleSave() {
    setError(null);
    try {
      const input = { examId, questionNo, score, topicId, outcomeId };
      if (editingQuestion) {
        await questionService.update(editingQuestion.id, input);
      } else {
        await questionService.create(input);
      }
      onClose();
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
        return;
      }
      throw err;
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editingQuestion ? 'Soruyu Düzenle' : 'Yeni Soru'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Ders" value={subjectName} disabled fullWidth />
          <TextField
            label="Soru No"
            type="number"
            value={questionNo}
            onChange={(e) => setQuestionNo(Number(e.target.value))}
            required
            fullWidth
          />
          <TextField
            label="Puan"
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            required
            fullWidth
          />
          <TextField
            select
            label="Konu"
            value={topicId}
            onChange={(e) => {
              setTopicId(e.target.value);
              setOutcomeId('');
            }}
            required
            fullWidth
          >
            {topics.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.unit ? `${t.unit} — ${t.name}` : t.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Kazanım"
            value={outcomeId}
            onChange={(e) => setOutcomeId(e.target.value)}
            required
            fullWidth
            disabled={!topicId}
          >
            {outcomes?.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.code}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Vazgeç</Button>
        <Button variant="contained" onClick={handleSave}>
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
