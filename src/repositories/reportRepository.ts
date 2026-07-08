import { db } from '../database/db';
import { createSyncedTable } from '../sync/createSyncedTable';
import type { Report } from '../types/entities';

const synced = createSyncedTable(db.reports, 'reports');

export const reportRepository = {
  add(report: Omit<Report, 'updatedAt'>): Promise<string> {
    return synced.add(report);
  },
};
