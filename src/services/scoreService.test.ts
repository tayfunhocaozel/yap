import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../database/db';
import { scoreService } from './scoreService';
import { ValidationError } from './errors';

const EXAM_ID = 'exam-1';
const QUESTION_ID = 'question-1';
const STUDENT_ID = 'student-1';

describe('scoreService', () => {
  beforeEach(async () => {
    await db.studentScores.clear();
    await db.questions.clear();
    await db.questions.add({
      id: QUESTION_ID,
      examId: EXAM_ID,
      questionNo: 1,
      score: 10,
      topicId: 't1',
      outcomeId: 'o1',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('puan soru puanını aşamaz', async () => {
    await expect(
      scoreService.setScore({ studentId: STUDENT_ID, questionId: QUESTION_ID, maxScore: 10, earnedScore: 15 }),
    ).rejects.toThrow(ValidationError);
  });

  it('puan negatif olamaz', async () => {
    await expect(
      scoreService.setScore({ studentId: STUDENT_ID, questionId: QUESTION_ID, maxScore: 10, earnedScore: -1 }),
    ).rejects.toThrow(ValidationError);
  });

  it('geçerli puanı kaydeder ve günceller (aynı öğrenci-soru için tek kayıt)', async () => {
    await scoreService.setScore({ studentId: STUDENT_ID, questionId: QUESTION_ID, maxScore: 10, earnedScore: 7 });
    await scoreService.setScore({ studentId: STUDENT_ID, questionId: QUESTION_ID, maxScore: 10, earnedScore: 9 });

    const scores = await scoreService.getByExam(EXAM_ID);
    expect(scores).toHaveLength(1);
    expect(scores[0].earnedScore).toBe(9);
  });

  it('sınava ait olmayan sorunun puanını getirmez', async () => {
    await db.questions.add({
      id: 'question-other-exam',
      examId: 'other-exam',
      questionNo: 1,
      score: 10,
      topicId: 't1',
      outcomeId: 'o1',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    await scoreService.setScore({
      studentId: STUDENT_ID,
      questionId: 'question-other-exam',
      maxScore: 10,
      earnedScore: 5,
    });

    const scores = await scoreService.getByExam(EXAM_ID);
    expect(scores).toHaveLength(0);
  });
});
