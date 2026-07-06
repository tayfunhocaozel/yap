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
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import SearchIcon from '@mui/icons-material/Search';
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
  const [search, setSearch] = useState('');

  const filteredClasses = classes?.filter((c) =>
    c.name.toLocaleLowerCase('tr-TR').includes(search.trim().toLocaleLowerCase('tr-TR')),
  );

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

      <TextField
        size="small"
        placeholder="Sınıf ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{ input: { startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> } }}
        sx={{ mb: 2, width: 280 }}
      />

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
            {filteredClasses?.map((c) => (
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
            {classes && classes.length > 0 && filteredClasses?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aramanızla eşleşen sınıf bulunamadı.
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
