import { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { theme } from './app/theme';
import { AppShell } from './app/AppShell';
import { AppRoutes } from './app/routes';
import { AuthProvider } from './app/AuthProvider';
import { RequireAuth } from './app/RequireAuth';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
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
        <AuthProvider>
          <Routes>
            <Route path="/giris" element={<LoginPage />} />
            <Route path="/kayit" element={<SignupPage />} />
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <AppShell>
                    <AppRoutes />
                  </AppShell>
                </RequireAuth>
              }
            />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
