import { useState, type ChangeEvent } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import {
  parseStudentFile,
  importStudents,
  type StudentImportParseResult,
  type StudentImportCommitResult,
} from '../../../services/studentImportService';
import { ValidationError } from '../../../services/errors';

interface StudentImportDialogProps {
  open: boolean;
  classId: string;
  onClose: () => void;
}

export function StudentImportDialog({ open, classId, onClose }: StudentImportDialogProps) {
  const [parseResult, setParseResult] = useState<StudentImportParseResult | null>(null);
  const [commitResult, setCommitResult] = useState<StudentImportCommitResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  function reset() {
    setParseResult(null);
    setCommitResult(null);
    setParseError(null);
    setImporting(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setParseError(null);
    setCommitResult(null);
    try {
      setParseResult(await parseStudentFile(file));
    } catch (error) {
      if (error instanceof ValidationError) {
        setParseError(error.message);
        return;
      }
      throw error;
    }
  }

  async function handleConfirm() {
    if (!parseResult) return;
    setImporting(true);
    try {
      setCommitResult(await importStudents(classId, parseResult.validRows));
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Excel / CSV ile Öğrenci İçe Aktar</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {parseError && <Alert severity="error">{parseError}</Alert>}

          {!parseResult && !commitResult && (
            <>
              <Typography variant="body2" color="text.secondary">
                .xls, .xlsx veya .csv dosyası seçin. Dosyada "Öğrenci No", "Adı" ve "Soyadı"
                sütunları bulunmalıdır.
              </Typography>
              <Button variant="outlined" component="label">
                Dosya Seç
                <input type="file" hidden accept=".xls,.xlsx,.csv" onChange={handleFileChange} />
              </Button>
            </>
          )}

          {parseResult && !commitResult && (
            <>
              <Alert severity="info">
                {parseResult.validRows.length} öğrenci içe aktarılmaya hazır.
                {parseResult.errors.length > 0 &&
                  ` ${parseResult.errors.length} satır atlanacak.`}
              </Alert>
              {parseResult.errors.length > 0 && (
                <List dense>
                  {parseResult.errors.map((e) => (
                    <ListItem key={e.rowNumber} disableGutters>
                      <ListItemText primary={`Satır ${e.rowNumber}: ${e.reason}`} />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}

          {commitResult && (
            <>
              <Alert severity="success">{commitResult.successCount} öğrenci eklendi.</Alert>
              {commitResult.errors.length > 0 && (
                <>
                  <Alert severity="warning">{commitResult.errors.length} satır eklenemedi.</Alert>
                  <List dense>
                    {commitResult.errors.map((e) => (
                      <ListItem key={e.rowNumber} disableGutters>
                        <ListItemText primary={`Satır ${e.rowNumber}: ${e.reason}`} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {!commitResult && <Button onClick={handleClose}>Vazgeç</Button>}
        {parseResult && !commitResult && (
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={importing || parseResult.validRows.length === 0}
          >
            {importing ? 'İçe Aktarılıyor...' : `${parseResult.validRows.length} Öğrenciyi İçe Aktar`}
          </Button>
        )}
        {commitResult && (
          <Button variant="contained" onClick={handleClose}>
            Kapat
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
