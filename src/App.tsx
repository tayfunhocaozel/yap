import { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { HashRouter } from 'react-router-dom';
import { theme } from './app/theme';
import { AppShell } from './app/AppShell';
import { AppRoutes } from './app/routes';
import { seedCurriculum } from './services/curriculumSeedService';

function App() {
  useEffect(() => {
    seedCurriculum().catch((error: unknown) => {
      console.error('Müfredat verisi yüklenemedi:', error);
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* GitHub Pages statik hosting üzerinde server-side rewrite
          olmadığı için (BrowserRouter'da doğrudan bir path'e gidilince
          404 alınır), HashRouter kullanılıyor. */}
      <HashRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
