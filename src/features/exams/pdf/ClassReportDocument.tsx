import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { reportStyles as styles } from './reportStyles';
import type { ExamAnalysis } from '../../../services/analysisService';
import type { Exam, Intervention, SchoolClass } from '../../../types/entities';

interface ClassReportDocumentProps {
  exam: Exam;
  schoolClass: SchoolClass | null;
  subjectName: string;
  analysis: ExamAnalysis;
  interventions: Intervention[];
  topicChartImage?: string;
  outcomeChartImage?: string;
}

export function ClassReportDocument({
  exam,
  schoolClass,
  subjectName,
  analysis,
  interventions,
  topicChartImage,
  outcomeChartImage,
}: ClassReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{exam.title} — Sınıf Analiz Raporu</Text>
        <Text style={styles.subtitle}>
          {schoolClass?.name} — {subjectName} — {exam.examDate}
        </Text>

        <Text style={styles.sectionTitle}>Sınıf Özeti</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Öğrenci Sayısı</Text>
          <Text style={styles.summaryValue}>{analysis.classAnalysis.studentCount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ortalama</Text>
          <Text style={styles.summaryValue}>{analysis.classAnalysis.average.toFixed(1)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>En Yüksek</Text>
          <Text style={styles.summaryValue}>{analysis.classAnalysis.max}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>En Düşük</Text>
          <Text style={styles.summaryValue}>{analysis.classAnalysis.min}</Text>
        </View>

        <Text style={styles.sectionTitle}>Soru Analizi</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.cell}>Soru No</Text>
            <Text style={styles.cellRight}>Maks. Puan</Text>
            <Text style={styles.cellRight}>Ort. Puan</Text>
            <Text style={styles.cellRight}>Başarı %</Text>
          </View>
          {analysis.questionAnalyses.map((q) => (
            <View style={styles.row} key={q.questionId}>
              <Text style={styles.cell}>{q.questionNo}</Text>
              <Text style={styles.cellRight}>{q.maxScore}</Text>
              <Text style={styles.cellRight}>{q.averageScore.toFixed(1)}</Text>
              <Text style={styles.cellRight}>{q.successRate.toFixed(0)}%</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Konu Analizi</Text>
        {topicChartImage && <Image src={topicChartImage} style={styles.chartImage} />}
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.cell}>Konu</Text>
            <Text style={styles.cellRight}>Başarı %</Text>
            <Text style={styles.cellRight}>Eksik Öğrenci</Text>
          </View>
          {analysis.topicAnalyses.map((t) => (
            <View style={styles.row} key={t.topicId}>
              <Text style={styles.cell}>{t.topicName}</Text>
              <Text style={styles.cellRight}>{t.successRate.toFixed(0)}%</Text>
              <Text style={styles.cellRight}>{t.missingStudentCount}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Kazanım Analizi</Text>
        {outcomeChartImage && <Image src={outcomeChartImage} style={styles.chartImage} />}
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.cell}>Kazanım</Text>
            <Text style={styles.cellRight}>Başarı %</Text>
            <Text style={styles.cellRight}>Başarısız Öğrenci</Text>
            <Text style={styles.cellRight}>Risk</Text>
          </View>
          {analysis.outcomeAnalyses.map((o) => (
            <View style={styles.row} key={o.outcomeId}>
              <Text style={styles.cell}>{o.code}</Text>
              <Text style={styles.cellRight}>{o.successRate.toFixed(0)}%</Text>
              <Text style={styles.cellRight}>{o.failingStudentCount}</Text>
              <Text style={styles.cellRight}>{o.riskLevel}</Text>
            </View>
          ))}
        </View>

        {interventions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Telafi Planı</Text>
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={styles.cell}>Kazanım</Text>
                <Text style={styles.cell}>Yöntem</Text>
                <Text style={styles.cell}>Tarih</Text>
                <Text style={styles.cell}>Not</Text>
              </View>
              {interventions.map((i) => {
                const outcome = analysis.outcomeAnalyses.find((o) => o.outcomeId === i.outcomeId);
                return (
                  <View style={styles.row} key={i.id}>
                    <Text style={styles.cell}>{outcome?.code ?? '-'}</Text>
                    <Text style={styles.cell}>{i.type}</Text>
                    <Text style={styles.cell}>{i.interventionDate}</Text>
                    <Text style={styles.cell}>{i.notes ?? '-'}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </Page>
    </Document>
  );
}
