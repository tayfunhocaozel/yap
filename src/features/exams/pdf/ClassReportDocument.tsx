import { Document, Page, Text, View } from '@react-pdf/renderer';
import { reportStyles as styles } from './reportStyles';
import { BarColumnChart, MAX_CHART_BARS } from './components/BarColumnChart';
import { DURUM_STYLES, isAtRiskStudent, type ExamAnalysis } from '../../../services/analysisService';
import type { Exam, Intervention, SchoolClass } from '../../../types/entities';

interface ClassReportDocumentProps {
  exam: Exam;
  schoolClass: SchoolClass | null;
  subjectName: string;
  analysis: ExamAnalysis;
  interventions: Intervention[];
  teacherName?: string;
}

export function ClassReportDocument({
  exam,
  schoolClass,
  subjectName,
  analysis,
  interventions,
  teacherName,
}: ClassReportDocumentProps) {
  const riskCount = analysis.studentAnalyses.filter(isAtRiskStudent).length;
  const questionCount = analysis.questionNumbers.length;
  const questionFontSize = questionCount > 15 ? 6 : questionCount > 8 ? 7 : 9;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{exam.title} — Sınıf Analiz Raporu</Text>
        <Text style={styles.subtitle}>
          {schoolClass?.name} — {subjectName} — {exam.examDate} · {analysis.classAnalysis.studentCount} öğrenci
          {teacherName ? ` · Öğretmen: ${teacherName}` : ''}
        </Text>

        <Text style={styles.sectionTitle}>Sınıf Özeti</Text>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>En Yüksek</Text>
            <Text style={styles.summaryCardValue}>{analysis.classAnalysis.max}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>En Düşük</Text>
            <Text style={styles.summaryCardValue}>{analysis.classAnalysis.min}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Sınıf Ortalaması</Text>
            <Text style={styles.summaryCardValue}>{analysis.classAnalysis.average.toFixed(1)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>Std. Sapma</Text>
            <Text style={styles.summaryCardValue}>{analysis.classAnalysis.stdDeviation.toFixed(1)}</Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: DURUM_STYLES.Zayif.color, borderColor: DURUM_STYLES.Zayif.color },
            ]}
          >
            <Text style={[styles.summaryCardLabel, { color: DURUM_STYLES.Zayif.textColor }]}>Risk Altında</Text>
            <Text style={[styles.summaryCardValue, { color: DURUM_STYLES.Zayif.textColor }]}>{riskCount}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Puan Dağılımı</Text>
        <BarColumnChart
          data={analysis.scoreDistribution.map((b) => ({
            label: b.label,
            value: b.count,
            color: DURUM_STYLES[b.durum].color,
          }))}
          valueFormatter={(v) => String(v)}
        />

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

        <View style={styles.twoColumnRow}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Konu Analizi</Text>
            {analysis.topicAnalyses.length <= MAX_CHART_BARS && (
              <BarColumnChart
                data={analysis.topicAnalyses.map((t) => ({
                  label: t.shortName,
                  value: t.successRate,
                  color: DURUM_STYLES[t.durum].color,
                }))}
                maxValue={100}
                valueFormatter={(v) => `${Math.round(v)}%`}
              />
            )}
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={styles.cell}>Konu</Text>
                <Text style={styles.cellRight}>Başarı %</Text>
                <Text style={styles.cellRight}>Eksik</Text>
                <Text style={styles.cellRight}>Durum</Text>
              </View>
              {analysis.topicAnalyses.map((t) => (
                <View style={styles.row} key={t.topicId}>
                  <Text style={styles.cell}>{t.shortName}</Text>
                  <Text style={styles.cellRight}>{t.successRate.toFixed(0)}%</Text>
                  <Text style={styles.cellRight}>{t.missingStudentCount}</Text>
                  <View style={styles.durumCell}>
                    <Text
                      style={[
                        styles.durumBadge,
                        { backgroundColor: DURUM_STYLES[t.durum].color, color: DURUM_STYLES[t.durum].textColor },
                      ]}
                    >
                      {DURUM_STYLES[t.durum].label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.column, styles.columnDivider]}>
            <Text style={styles.sectionTitle}>Kazanım Analizi</Text>
            {analysis.outcomeAnalyses.length <= MAX_CHART_BARS && (
              <BarColumnChart
                data={analysis.outcomeAnalyses.map((o) => ({
                  label: o.code,
                  value: o.successRate,
                  color: DURUM_STYLES[o.durum].color,
                }))}
                maxValue={100}
                valueFormatter={(v) => `${Math.round(v)}%`}
              />
            )}
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={styles.cell}>Kazanım</Text>
                <Text style={styles.cellRight}>Başarı %</Text>
                <Text style={styles.cellRight}>Başarısız</Text>
                <Text style={styles.cellRight}>Durum</Text>
              </View>
              {analysis.outcomeAnalyses.map((o) => (
                <View style={styles.row} key={o.outcomeId}>
                  <Text style={styles.cell}>{o.code}</Text>
                  <Text style={styles.cellRight}>{o.successRate.toFixed(0)}%</Text>
                  <Text style={styles.cellRight}>{o.failingStudentCount}</Text>
                  <View style={styles.durumCell}>
                    <Text
                      style={[
                        styles.durumBadge,
                        { backgroundColor: DURUM_STYLES[o.durum].color, color: DURUM_STYLES[o.durum].textColor },
                      ]}
                    >
                      {DURUM_STYLES[o.durum].label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {analysis.topicAnalyses.some((t) => t.shortName !== t.topicName) && (
          <View style={styles.footnote}>
            {analysis.topicAnalyses
              .filter((t) => t.shortName !== t.topicName)
              .map((t) => (
                <Text key={t.topicId} style={styles.footnoteItem}>
                  {t.shortName} — {t.topicName}
                </Text>
              ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Öğrenci Analizi</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={{ width: 24 }}>No</Text>
            <Text style={{ flex: 3 }}>Ad Soyad</Text>
            {analysis.questionNumbers.map((no) => (
              <Text key={no} style={{ flex: 1, textAlign: 'center', fontSize: questionFontSize }}>
                {no}
              </Text>
            ))}
            <Text style={{ flex: 1, textAlign: 'right' }}>Puan</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>Durum</Text>
          </View>
          {analysis.studentQuestionBreakdown.map((row) => (
            <View style={styles.row} key={row.studentId}>
              <Text style={{ width: 24 }}>{row.schoolNumber}</Text>
              <Text style={{ flex: 3 }}>{row.fullName}</Text>
              {row.questionScores.map((score, i) => (
                <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: questionFontSize }}>
                  {score === null ? '-' : score}
                </Text>
              ))}
              <Text style={{ flex: 1, textAlign: 'right' }}>{row.totalScore}</Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'right',
                  color: DURUM_STYLES[row.durum].textColor,
                  fontFamily: 'NotoSans',
                  fontWeight: 'bold',
                }}
              >
                {DURUM_STYLES[row.durum].label}
              </Text>
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
