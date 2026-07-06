import { studentScoreRepository } from '../repositories/studentScoreRepository';
import { questionRepository } from '../repositories/questionRepository';
import type { StudentScore } from '../types/entities';
import { ValidationError } from './errors';

export interface SetScoreInput {
  studentId: string;
  questionId: string;
  maxScore: number;
  earnedScore: number;
}

function validate(input: SetScoreInput): void {
  if (!Number.isFinite(input.earnedScore) || input.earnedScore < 0) {
    throw new ValidationError('Puan negatif olamaz.');
  }
  if (input.earnedScore > input.maxScore) {
    throw new ValidationError(`Puan ${input.maxScore} puanını aşamaz.`);
  }
}

export const scoreService = {
  async getByExam(examId: string): Promise<StudentScore[]> {
    const questions = await questionRepository.getByExam(examId);
    return studentScoreRepository.getByQuestionIds(questions.map((q) => q.id));
  },

  async setScore(input: SetScoreInput): Promise<void> {
    validate(input);
    const existing = await studentScoreRepository.findByStudentAndQuestion(
      input.studentId,
      input.questionId,
    );
    if (existing) {
      await studentScoreRepository.update(existing.id, { earnedScore: input.earnedScore });
    } else {
      await studentScoreRepository.add({
        id: crypto.randomUUID(),
        studentId: input.studentId,
        questionId: input.questionId,
        earnedScore: input.earnedScore,
      });
    }
  },
};
