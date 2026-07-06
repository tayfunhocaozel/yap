import { db } from '../database/db';
import type { Report } from '../types/entities';

export const reportRepository = {
  add(report: Report): Promise<string> {
    return db.reports.add(report);
  },
};
