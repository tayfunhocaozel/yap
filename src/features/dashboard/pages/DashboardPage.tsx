import { useMemo } from 'react';
import { Box, Button, List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useClasses } from '../../classes/hooks/useClasses';
import { useExams } from '../../exams/hooks/useExams';
import { getRecentClassIds } from '../../../utils/recentClasses';

const RECENT_LIMIT = 5;

export function DashboardPage() {
  const navigate = useNavigate();
  const classes = useClasses();
  const exams = useExams();

  const recentClassIds = useMemo(() => getRecentClassIds(RECENT_LIMIT), []);
  const recentClasses = recentClassIds
    .map((id) => classes?.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const recentExams = exams
    ? [...exams].sort((a, b) => b.examDate.localeCompare(a.examDate)).slice(0, RECENT_LIMIT)
    : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/yazililar?yeni=1')}
        >
          Yeni Yazılı
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 280 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Son Kullanılan Sınıflar
          </Typography>
          {recentClasses.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Henüz ziyaret edilen bir sınıf yok.
            </Typography>
          ) : (
            <List dense disablePadding>
              {recentClasses.map((c) => (
                <ListItemButton key={c.id} onClick={() => navigate(`/siniflar/${c.id}/ogrenciler`)}>
                  <ListItemText primary={c.name} secondary={`${c.grade}. Sınıf — ${c.academicYear}`} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>

        <Paper sx={{ p: 2, flex: 1, minWidth: 280 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Son Analizler
          </Typography>
          {recentExams.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Henüz yazılı oluşturulmadı.
            </Typography>
          ) : (
            <List dense disablePadding>
              {recentExams.map((exam) => (
                <ListItemButton key={exam.id} onClick={() => navigate(`/yazililar/${exam.id}/analiz`)}>
                  <ListItemText primary={exam.title} secondary={exam.examDate} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
