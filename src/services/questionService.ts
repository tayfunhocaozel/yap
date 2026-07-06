import { questionRepository } from '../repositories/questionRepository';
import type { Question } from '../types/entities';
import { ValidationError } from './errors';

export const REQUIRED_TOTAL_SCORE = 100;

export interface QuestionInput {
  examId: string;
  questionNo: number;
  score: number;
  topicId: string;
  outcomeId: string;
}

function validate(input: QuestionInput): void {
  if (!Number.isInteger(input.questionNo) || input.questionNo <= 0) {
    throw new ValidationError('Soru numarası pozitif bir tam sayı olmalıdır.');
  }
  if (!(input.score > 0)) {
    throw new ValidationError('Puan sıfırdan büyük olmalıdır.');
  }
  if (!input.topicId) throw new ValidationError('Konu seçimi zorunludur.');
  if (!input.outcomeId) throw new ValidationError('Kazanım seçimi zorunludur.');
}

export const questionService = {
  getByExam(examId: string): Promise<Question[]> {
    return questionRepository.getByExam(examId);
  },

  async getTotalScore(examId: string): Promise<number> {
    const questions = await questionRepository.getByExam(examId);
    return questions.reduce((sum, q) => sum + q.score, 0);
  },

  async create(input: QuestionInput): Promise<void> {
    validate(input);
    const duplicate = await questionRepository.findByExamAndNumber(input.examId, input.questionNo);
    if (duplicate) {
      throw new ValidationError(`"${input.questionNo}" numaralı soru bu yazılıda zaten var.`);
    }
    await questionRepository.add({ id: crypto.randomUUID(), ...input });
  },

  async update(id: string, input: QuestionInput): Promise<void> {
    validate(input);
    const duplicate = await questionRepository.findByExamAndNumber(input.examId, input.questionNo);
    if (duplicate && duplicate.id !== id) {
      throw new ValidationError(`"${input.questionNo}" numaralı soru bu yazılıda zaten var.`);
    }
    await questionRepository.update(id, input);
  },

  async remove(id: string): Promise<void> {
    await questionRepository.delete(id);
  },
};
