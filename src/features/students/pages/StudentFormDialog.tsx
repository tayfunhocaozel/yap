import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import type { Student } from '../../../types/entities';
import { studentService } from '../../../services/studentService';
import { ValidationError } from '../../../services/errors';

interface StudentFormDialogProps {
  open: boolean;
  classId: string;
  editingStudent: Student | null;
  onClose: () => void;
}

export function StudentFormDialog({ open, classId, editingStudent, onClose }: StudentFormDialogProps) {
  const [schoolNumber, setSchoolNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editingStudent) {
      setSchoolNumber(editingStudent.schoolNumber);
      setFullName(editingStudent.fullName);
    } else {
      setSchoolNumber('');
      setFullName('');
    }
  }, [open, editingStudent]);

  async function handleSave() {
    setError(null);
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.id, { classId, schoolNumber, fullName });
      } else {
        await studentService.create({ classId, schoolNumber, fullName });
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
      <DialogTitle>{editingStudent ? 'Öğrenciyi Düzenle' : 'Yeni Öğrenci'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Okul No"
            value={schoolNumber}
            onChange={(e) => setSchoolNumber(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            fullWidth
          />
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
