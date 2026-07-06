import { reportRepository } from '../repositories/reportRepository';

export type ReportType = 'sinif' | 'ogrenci';

export const reportService = {
  async logGenerated(examId: string, reportType: ReportType): Promise<void> {
    await reportRepository.add({
      id: crypto.randomUUID(),
      examId,
      reportType,
      createdAt: new Date().toISOString(),
    });
  },
};
