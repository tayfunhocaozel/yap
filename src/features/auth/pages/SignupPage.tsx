import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Link as MuiLink, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      navigate('/');
      return;
    }
    setInfo('Kayıt başarılı. E-postanıza gelen bağlantıyla hesabınızı onaylayıp giriş yapabilirsiniz.');
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper sx={{ p: 4, width: 360 }} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          YAP — Kayıt Ol
        </Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {info && <Alert severity="success">{info}</Alert>}
          <TextField
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText="En az 6 karakter"
          />
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Zaten hesabınız var mı?{' '}
            <MuiLink component={Link} to="/giris">
              Giriş yapın
            </MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
