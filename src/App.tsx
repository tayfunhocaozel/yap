import { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
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
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
