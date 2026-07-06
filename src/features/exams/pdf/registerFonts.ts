import { Font } from '@react-pdf/renderer';
import notoSansRegular from '@expo-google-fonts/noto-sans/400Regular/NotoSans_400Regular.ttf';
import notoSansBold from '@expo-google-fonts/noto-sans/700Bold/NotoSans_700Bold.ttf';

// Helvetica (react-pdf'in varsayılan fontu) Türkçe karakterleri (ğ, ş, ı,
// İ, ö, ü, ç) doğru render edemiyor. Noto Sans'ın latin-ext alt kümesi bu
// karakterleri destekler.
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: notoSansRegular, fontWeight: 'normal' },
    { src: notoSansBold, fontWeight: 'bold' },
  ],
});

// Tarayıcıda font dosyası ağ üzerinden asenkron indirilir. PDF render'ı
// tetiklenmeden önce her iki ağırlığın da tam yüklendiğinden emin olmak
// için kullanılır (bkz. ReportsPage).
export async function ensureFontsLoaded(): Promise<void> {
  await Font.load({ fontFamily: 'NotoSans', fontWeight: 'normal' });
  await Font.load({ fontFamily: 'NotoSans', fontWeight: 'bold' });
}
