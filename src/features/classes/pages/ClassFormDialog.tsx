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
import type { Grade, SchoolClass } from '../../../types/entities';
import { classService } from '../../../services/classService';
import { ValidationError } from '../../../services/errors';
import { currentAcademicYear } from '../../../utils/academicYear';

const GRADES: Grade[] = [5, 6, 7, 8];

interface ClassFormDialogProps {
  open: boolean;
  teacherId: string;
  editingClass: SchoolClass | null;
  onClose: () => void;
}

export function ClassFormDialog({ open, teacherId, editingClass, onClose }: ClassFormDialogProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<Grade>(5);
  const [academicYear, setAcademicYear] = useState(currentAcademicYear());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editingClass) {
      setName(editingClass.name);
      setGrade(editingClass.grade);
      setAcademicYear(editingClass.academicYear);
    } else {
      setName('');
      setGrade(5);
      setAcademicYear(currentAcademicYear());
    }
  }, [open, editingClass]);

  async function handleSave() {
    setError(null);
    try {
      if (editingClass) {
        await classService.update(editingClass.id, { teacherId, name, grade, academicYear });
      } else {
        await classService.create({ teacherId, name, grade, academicYear });
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
      <DialogTitle>{editingClass ? 'Sınıfı Düzenle' : 'Yeni Sınıf'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Sınıf Adı"
            placeholder="Örn. 7/A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            select
            label="Sınıf Seviyesi"
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value) as Grade)}
            fullWidth
          >
            {GRADES.map((g) => (
              <MenuItem key={g} value={g}>
                {g}. Sınıf
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Öğretim Yılı"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
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
