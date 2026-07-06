import { db } from '../database/db';
import type { Topic, Grade } from '../types/entities';

export const topicRepository = {
  getBySubjectAndGrade(subjectId: string, grade: Grade): Promise<Topic[]> {
    return db.topics.filter((t) => t.subjectId === subjectId && t.grade === grade).toArray();
  },

  findBySubjectGradeName(subjectId: string, grade: Grade, name: string): Promise<Topic | undefined> {
    return db.topics
      .filter((t) => t.subjectId === subjectId && t.grade === grade && t.name === name)
      .first();
  },

  add(topic: Topic): Promise<string> {
    return db.topics.add(topic);
  },

  getByIds(ids: string[]): Promise<Topic[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return db.topics.where('id').anyOf(ids).toArray();
  },
};
