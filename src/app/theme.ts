import { createTheme } from '@mui/material/styles';

// 03_UI_UX_GUIDELINES.md Bölüm 4 - Renk Sistemi:
// Mavi = işlemler, Yeşil = başarı, Turuncu = uyarı, Kırmızı = risk, Gri = bilgi
export const theme = createTheme({
  palette: {
    primary: { main: '#1565C0' },
    success: { main: '#2E7D32' },
    warning: { main: '#EF6C00' },
    error: { main: '#C62828' },
    info: { main: '#607D8B' },
  },
  typography: {
    fontSize: 14,
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
});
