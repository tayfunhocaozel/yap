import { Document, Page, Text, View } from '@react-pdf/renderer';
import { reportStyles as styles } from './reportStyles';
import type { StudentDetail } from '../../../services/analysisService';
import type { Exam, SchoolClass } from '../../../types/entities';

interface StudentReportDocumentProps {
  exam: Exam;
  schoolClass: SchoolClass | null;
  subjectName: string;
  studentDetails: StudentDetail[];
}

export function StudentReportDocument({
  exam,
  schoolClass,
  subjectName,
  studentDetails,
}: StudentReportDocumentProps) {
  return (
    <Document>
      {studentDetails.map((student) => (
        <Page size="A4" style={styles.page} key={student.studentId}>
          <Text style={styles.title}>{exam.title} — Öğrenci Analiz Raporu</Text>
          <Text style={styles.subtitle}>
            {schoolClass?.name} — {subjectName} — {exam.examDate}
          </Text>

          <Text style={styles.sectionTitle}>
            {student.schoolNumber} — {student.fullName}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel} wrap={false}>
              Toplam Puan
            </Text>
            <Text style={styles.summaryValue}>{student.totalScore} / 100</Text>
          </View>
          {!student.isFullyGraded && (
            <Text style={styles.warning}>Not: Bu yazılı için puan girişi henüz tamamlanmadı.</Text>
          )}

          <Text style={styles.sectionTitle}>Konu Bazlı Başarı</Text>
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={styles.cell}>Konu</Text>
              <Text style={styles.cellRight}>Başarı %</Text>
            </View>
            {student.topicBreakdown.map((t) => (
              <View style={styles.row} key={t.topicId}>
                <Text style={styles.cell}>{t.topicName}</Text>
                <Text style={styles.cellRight}>
                  {t.successRate === null ? '-' : `${t.successRate.toFixed(0)}%`}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Kazanım Bazlı Başarı</Text>
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={styles.cell}>Kazanım</Text>
              <Text style={styles.cellRight}>Başarı %</Text>
            </View>
            {student.outcomeBreakdown.map((o) => (
              <View style={styles.row} key={o.outcomeId}>
                <Text style={styles.cell}>{o.code}</Text>
                <Text style={styles.cellRight}>
                  {o.successRate === null ? '-' : `${o.successRate.toFixed(0)}%`}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Güçlü Yönler</Text>
          <Text>{student.strongTopics.length > 0 ? student.strongTopics.join(', ') : 'Henüz belirlenmedi.'}</Text>

          <Text style={styles.sectionTitle}>Geliştirilmesi Gereken Yönler</Text>
          <Text>{student.weakTopics.length > 0 ? student.weakTopics.join(', ') : 'Belirlenmedi.'}</Text>
        </Page>
      ))}
    </Document>
  );
}
