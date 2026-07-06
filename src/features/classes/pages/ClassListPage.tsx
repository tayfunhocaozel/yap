import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import { useNavigate } from 'react-router-dom';
import { useClasses } from '../hooks/useClasses';
import { useTeacher } from '../../settings/hooks/useTeacher';
import { ClassFormDialog } from './ClassFormDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { classService } from '../../../services/classService';
import type { SchoolClass } from '../../../types/entities';

export function ClassListPage() {
  const classes = useClasses();
  const teacher = useTeacher();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [archiving, setArchiving] = useState<SchoolClass | null>(null);

  function openCreate() {
    setEditingClass(null);
    setFormOpen(true);
  }

  function openEdit(schoolClass: SchoolClass) {
    setEditingClass(schoolClass);
    setFormOpen(true);
  }

  async function confirmArchive() {
    if (archiving) {
      await classService.archive(archiving.id);
    }
    setArchiving(null);
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Sınıflar</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} disabled={!teacher}>
          Yeni Sınıf
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sınıf</TableCell>
              <TableCell>Seviye</TableCell>
              <TableCell>Öğretim Yılı</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes?.map((c) => (
              <TableRow
                key={c.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/siniflar/${c.id}/ogrenciler`)}
              >
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.grade}. Sınıf</TableCell>
                <TableCell>{c.academicYear}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton size="small" onClick={() => openEdit(c)} aria-label="düzenle">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setArchiving(c)} aria-label="arşivle">
                    <ArchiveIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {classes && classes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Henüz sınıf oluşturulmadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {teacher && (
        <ClassFormDialog
          open={formOpen}
          teacherId={teacher.id}
          editingClass={editingClass}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmDialog
        open={archiving !== null}
        title="Sınıfı Arşivle"
        description={`"${archiving?.name}" sınıfını arşivlemek istediğinize emin misiniz? Arşivlenen sınıflar listede görünmez.`}
        onConfirm={confirmArchive}
        onCancel={() => setArchiving(null)}
      />
    </Box>
  );
}
