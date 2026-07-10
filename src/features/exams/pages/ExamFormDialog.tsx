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
import { useClasses } from '../../classes/hooks/useClasses';
import { useSubjects } from '../hooks/useSubjects';
import { examService } from '../../../services/examService';
import { ValidationError } from '../../../services/errors';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { today } from '../../../utils/today';

interface ExamFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (examId: string) => void;
}

export function ExamFormDialog({ open, onClose, onCreated }: ExamFormDialogProps) {
  const classes = useClasses();
  const subjects = useSubjects();

  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [examDate, setExamDate] = useState(today());
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);

  useEffect(() => {
    if (!open) return;
    setClassId('');
    setSubjectId('');
    setTitle('');
    setExamDate(today());
    setDescription('');
    setError(null);
    setConfirmDuplicate(false);
  }, [open]);

  async function doCreate() {
    try {
      const exam = await examService.create({ classId, subjectId, title, examDate, description });
      onCreated(exam.id);
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
        return;
      }
      throw err;
    }
  }

  async function handleSave() {
    setError(null);
    try {
      const duplicate = await examService.findDuplicateTitle(classId, title);
      if (duplicate) {
        setConfirmDuplicate(true);
        return;
      }
      await doCreate();
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
        return;
      }
      throw err;
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Yeni Yazılı</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              select
              label="Sınıf"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
              fullWidth
            >
              {classes?.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Ders"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              fullWidth
            >
              {subjects?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Yazılı Adı"
              placeholder="Örn. 1. Yazılı"
              helperText="Sınıf ve öğrenci raporlarında başlık olarak görünecek."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Tarih"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Açıklama"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Vazgeç</Button>
          <Button variant="contained" onClick={handleSave}>
            Kaydet ve Sorulara Geç
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDuplicate}
        title="Aynı İsimde Yazılı Var"
        description={`"${title}" adında bu sınıfta zaten bir yazılı var. Yine de oluşturmak istiyor musunuz?`}
        onConfirm={() => {
          setConfirmDuplicate(false);
          void doCreate();
        }}
        onCancel={() => setConfirmDuplicate(false)}
      />
    </>
  );
}
