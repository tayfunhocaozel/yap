import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditIcon from '@mui/icons-material/Edit';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { useInactiveStudents, useStudents } from '../hooks/useStudents';
import { StudentFormDialog } from './StudentFormDialog';
import { StudentImportDialog } from './StudentImportDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { studentService } from '../../../services/studentService';
import { classService } from '../../../services/classService';
import { recordClassVisit } from '../../../utils/recentClasses';
import { ValidationError } from '../../../services/errors';
import type { Student } from '../../../types/entities';

export function StudentListPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const schoolClass = useLiveQuery(() => classService.getById(classId!), [classId]);
  const students = useStudents(classId!);
  const inactiveStudents = useInactiveStudents(classId!);

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deactivating, setDeactivating] = useState<Student | null>(null);
  const [activating, setActivating] = useState<Student | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    if (classId) recordClassVisit(classId);
  }, [classId]);

  function openCreate() {
    setEditingStudent(null);
    setFormOpen(true);
  }

  function openEdit(student: Student) {
    setEditingStudent(student);
    setFormOpen(true);
  }

  async function confirmDeactivate() {
    if (deactivating) {
      await studentService.deactivate(deactivating.id);
    }
    setDeactivating(null);
  }

  function openActivate(student: Student) {
    setActivateError(null);
    setActivating(student);
  }

  async function confirmActivate() {
    if (!activating || !classId) return;
    try {
      await studentService.activate(activating.id, classId, activating.schoolNumber);
      setActivating(null);
    } catch (err) {
      if (err instanceof ValidationError) {
        setActivateError(err.message);
      } else {
        throw err;
      }
    }
  }

  if (!classId) return null;

  const visibleStudents = showInactive ? [...(students ?? []), ...(inactiveStudents ?? [])] : students;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/siniflar')} sx={{ mb: 1 }}>
        Sınıflara Dön
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          {schoolClass ? `${schoolClass.name} — Öğrenciler` : 'Öğrenciler'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
            }
            label="Pasif öğrencileri göster"
          />
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setImportOpen(true)}>
            Excel / CSV İçe Aktar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Yeni Öğrenci
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Okul No</TableCell>
              <TableCell>Ad Soyad</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleStudents?.map((s) => (
              <TableRow key={s.id} hover sx={!s.active ? { opacity: 0.6 } : undefined}>
                <TableCell>{s.schoolNumber}</TableCell>
                <TableCell>
                  {s.fullName}
                  {!s.active && <Chip size="small" label="Pasif" sx={{ ml: 1 }} />}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(s)} aria-label="düzenle">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {s.active ? (
                    <IconButton size="small" onClick={() => setDeactivating(s)} aria-label="pasifleştir">
                      <PersonOffIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton size="small" onClick={() => openActivate(s)} aria-label="aktifleştir">
                      <PersonIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {visibleStudents && visibleStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Henüz öğrenci eklenmedi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <StudentFormDialog
        open={formOpen}
        classId={classId}
        editingStudent={editingStudent}
        onClose={() => setFormOpen(false)}
      />

      <StudentImportDialog open={importOpen} classId={classId} onClose={() => setImportOpen(false)} />

      <ConfirmDialog
        open={deactivating !== null}
        title="Öğrenciyi Pasifleştir"
        description={`"${deactivating?.fullName}" öğrencisini pasif duruma almak istediğinize emin misiniz?`}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivating(null)}
      />

      <ConfirmDialog
        open={activating !== null}
        title="Öğrenciyi Aktifleştir"
        description={
          activateError ??
          `"${activating?.fullName}" öğrencisini tekrar aktif duruma almak istediğinize emin misiniz?`
        }
        onConfirm={confirmActivate}
        onCancel={() => setActivating(null)}
      />
    </Box>
  );
}
