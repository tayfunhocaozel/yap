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
  warning: { color: '#C62828', marginTop: 4, marginBottom: 4 },
  twoColumnRow: { flexDirection: 'row' },
  column: { flex: 1 },
  columnDivider: { marginLeft: 12, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: '#dddddd' },
  durumCell: { flex: 1, alignItems: 'flex-end' },
  durumBadge: {
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: 9,
  },
  summaryCards: { flexDirection: 'row', marginTop: 8, marginBottom: 4 },
  summaryCard: {
    flex: 1,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  summaryCardLabel: { fontSize: 8, color: '#555555', marginBottom: 2, textAlign: 'center' },
  summaryCardValue: { fontSize: 14, fontFamily: 'NotoSans', fontWeight: 'bold', textAlign: 'center' },
  footnote: { marginTop: 6, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#dddddd' },
  footnoteItem: { fontSize: 8, color: '#555555', marginBottom: 2 },
});
