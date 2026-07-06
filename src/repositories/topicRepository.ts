import { db } from '../database/db';
import type { Topic, Grade } from '../types/entities';

export const topicRepository = {
  async getBySubjectAndGrade(subjectId: string, grade: Grade): Promise<Topic[]> {
    const topics = await db.topics.filter((t) => t.subjectId === subjectId && t.grade === grade).toArray();
    return topics.sort((a, b) => a.order - b.order);
  },

  findBySubjectGradeName(subjectId: string, grade: Grade, name: string): Promise<Topic | undefined> {
    return db.topics
      .filter((t) => t.subjectId === subjectId && t.grade === grade && t.name === name)
      .first();
  },

  add(topic: Topic): Promise<string> {
    return db.topics.add(topic);
  },

  update(id: string, changes: Partial<Topic>): Promise<number> {
    return db.topics.update(id, changes);
  },

  getByIds(ids: string[]): Promise<Topic[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return db.topics.where('id').anyOf(ids).toArray();
  },
};
