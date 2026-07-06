import { StyleSheet } from '@react-pdf/renderer';
import './registerFonts';

export const reportStyles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'NotoSans' },
  title: { fontSize: 16, marginBottom: 4, fontFamily: 'NotoSans', fontWeight: 'bold' },
  subtitle: { fontSize: 10, marginBottom: 16, color: '#555555' },
  sectionTitle: {
    fontSize: 12,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
  },
  table: { display: 'flex', width: 'auto' },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 4,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    paddingVertical: 4,
  },
  cell: { flex: 1 },
  cellRight: { flex: 1, textAlign: 'right' },
  // Not: summaryRow çocukları `justifyContent: space-between` yerine `flex`
  // ile hizalanır; react-pdf'in otomatik genişlikli metinleri "space-between"
  // içinde ölçerken metnin ilk karakterlerini kırptığı gözlemlendi (örn.
  // "Toplam Puan" -> "plam Puan"). Sabit flex genişlik bu hatayı ortadan kaldırır.
  summaryRow: { flexDirection: 'row', marginBottom: 4, width: 220 },
  summaryLabel: { flex: 1 },
  summaryValue: { flex: 1, textAlign: 'right' },
  chartImage: { width: '100%', maxHeight: 180, marginTop: 8, marginBottom: 8 },
  warning: { color: '#C62828', marginTop: 4, marginBottom: 4 },
});
