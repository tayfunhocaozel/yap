import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
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
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useExams } from '../hooks/useExams';
import { useSubjects } from '../hooks/useSubjects';
import { useClasses } from '../../classes/hooks/useClasses';
import { ExamFormDialog } from './ExamFormDialog';
import { questionService, REQUIRED_TOTAL_SCORE } from '../../../services/questionService';
import type { Exam } from '../../../types/entities';

function ExamRow({
  exam,
  className,
  subjectName,
}: {
  exam: Exam;
  className: string;
  subjectName: string;
}) {
  const navigate = useNavigate();
  const totalScore = useLiveQuery(() => questionService.getTotalScore(exam.id), [exam.id]);
  const isComplete = totalScore === REQUIRED_TOTAL_SCORE;

  return (
    <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/yazililar/${exam.id}/sorular`)}>
      <TableCell>{exam.title}</TableCell>
      <TableCell>{className}</TableCell>
      <TableCell>{subjectName}</TableCell>
      <TableCell>{exam.examDate}</TableCell>
      <TableCell align="right">
        <Chip
          size="small"
          label={`${totalScore ?? 0} / ${REQUIRED_TOTAL_SCORE}`}
          color={isComplete ? 'success' : 'warning'}
        />
      </TableCell>
    </TableRow>
  );
}

export function ExamListPage() {
  const exams = useExams();
  const classes = useClasses();
  const subjects = useSubjects();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(searchParams.get('yeni') === '1');

  function closeForm() {
    setFormOpen(false);
    if (searchParams.get('yeni')) setSearchParams({}, { replace: true });
  }

  const classNameById = new Map(classes?.map((c) => [c.id, c.name]));
  const subjectNameById = new Map(subjects?.map((s) => [s.id, s.name]));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Yazılılar</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          Yeni Yazılı
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Yazılı Adı</TableCell>
              <TableCell>Sınıf</TableCell>
              <TableCell>Ders</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell align="right">Toplam Puan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams?.map((exam) => (
              <ExamRow
                key={exam.id}
                exam={exam}
                className={classNameById.get(exam.classId) ?? '-'}
                subjectName={subjectNameById.get(exam.subjectId) ?? '-'}
              />
            ))}
            {exams && exams.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Henüz yazılı oluşturulmadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ExamFormDialog
        open={formOpen}
        onClose={closeForm}
        onCreated={(examId) => {
          setFormOpen(false);
          navigate(`/yazililar/${examId}/sorular`);
        }}
      />
    </Box>
  );
}
