import { StyleSheet, Text, View } from '@react-pdf/renderer';

// react-pdf harici canvas/SVG kabul etmediği için grafik önceden Chart.js ile
// PNG'e rasterize edilirdi. Çubuklar sabit yükseklikte dikdörtgenler
// olduğundan react-pdf'in kendi View/Text (flexbox) motoruyla doğrudan çizilebilir.
export const MAX_CHART_BARS = 15;

export interface BarColumnChartDatum {
  label: string;
  value: number;
  color: string;
}

interface BarColumnChartProps {
  data: BarColumnChartDatum[];
  // Verilmezse veri setindeki en büyük değer baz alınır (örn. yüzde grafiklerinde
  // çağıran taraf sabit 100 geçer, histogramda en büyük öğrenci sayısı otomatik bulunur).
  maxValue?: number;
  height?: number;
  valueFormatter?: (value: number) => string;
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row' },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 1 },
  valueLabel: { fontSize: 6, marginBottom: 2 },
  bar: { width: '60%', borderRadius: 2 },
  labels: { flexDirection: 'row', marginTop: 3 },
  axisLabel: { flex: 1, fontSize: 6, textAlign: 'center' },
});

export function BarColumnChart({
  data,
  maxValue,
  height = 70,
  valueFormatter = (value) => Math.round(value).toString(),
}: BarColumnChartProps) {
  if (data.length === 0) return null;
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <View>
      <View style={[styles.bars, { height }]}>
        {data.map((d, index) => {
          const clamped = Math.max(0, Math.min(max, d.value));
          const barHeight = Math.max(2, (clamped / max) * height);
          return (
            <View key={index} style={styles.barColumn}>
              <Text style={styles.valueLabel}>{valueFormatter(d.value)}</Text>
              <View style={[styles.bar, { height: barHeight, backgroundColor: d.color }]} />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {data.map((d, index) => (
          <Text key={index} style={styles.axisLabel}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
