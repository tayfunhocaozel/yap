import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../database/db';
import { questionService } from './questionService';
import { ValidationError } from './errors';

const EXAM_ID = 'exam-1';

describe('questionService', () => {
  beforeEach(async () => {
    await db.questions.clear();
  });

  it('aynı sınavda aynı soru numarası tekrar edemez', async () => {
    await questionService.create({
      examId: EXAM_ID,
      questionNo: 1,
      score: 10,
      topicId: 'topic-1',
      outcomeId: 'outcome-1',
    });

    await expect(
      questionService.create({
        examId: EXAM_ID,
        questionNo: 1,
        score: 20,
        topicId: 'topic-2',
        outcomeId: 'outcome-2',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('puan sıfır veya negatif olamaz', async () => {
    await expect(
      questionService.create({ examId: EXAM_ID, questionNo: 1, score: 0, topicId: 't', outcomeId: 'o' }),
    ).rejects.toThrow(ValidationError);
    await expect(
      questionService.create({ examId: EXAM_ID, questionNo: 1, score: -5, topicId: 't', outcomeId: 'o' }),
    ).rejects.toThrow(ValidationError);
  });

  it('toplam puanı doğru hesaplar', async () => {
    await questionService.create({ examId: EXAM_ID, questionNo: 1, score: 40, topicId: 't1', outcomeId: 'o1' });
    await questionService.create({ examId: EXAM_ID, questionNo: 2, score: 60, topicId: 't2', outcomeId: 'o2' });

    expect(await questionService.getTotalScore(EXAM_ID)).toBe(100);
  });

  it('soru silindiğinde toplam puana dahil edilmez', async () => {
    await questionService.create({ examId: EXAM_ID, questionNo: 1, score: 40, topicId: 't1', outcomeId: 'o1' });
    const [question] = await questionService.getByExam(EXAM_ID);
    await questionService.remove(question.id);

    expect(await questionService.getTotalScore(EXAM_ID)).toBe(0);
  });
});
