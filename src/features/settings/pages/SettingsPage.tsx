import { useEffect, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useTeacher } from '../hooks/useTeacher';
import { teacherService } from '../../../services/teacherService';
import { ValidationError } from '../../../services/errors';

export function SettingsPage() {
  const teacher = useTeacher();
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFullName(teacher.fullName);
      setBranch(teacher.branch);
      setSchoolName(teacher.schoolName ?? '');
    }
  }, [teacher]);

  async function handleSave() {
    setError(null);
    setSaved(false);
    try {
      await teacherService.createOrUpdate({ fullName, branch, schoolName });
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
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h5" gutterBottom>
        Öğretmen Profili
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          {!teacher && (
            <Alert severity="info">
              Başlamadan önce öğretmen profilinizi oluşturun. Bu bilgiler PDF raporlarının üst
              bilgisinde kullanılacaktır.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {saved && <Alert severity="success">Kaydedildi.</Alert>}
          <TextField
            label="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Branş"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Okul Adı"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleSave}>
            Kaydet
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
