import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Link as MuiLink, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError('E-posta veya şifre hatalı.');
      return;
    }
    navigate('/');
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
          YAP — Giriş
        </Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
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
          />
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Hesabınız yok mu?{' '}
            <MuiLink component={Link} to="/kayit">
              Kayıt olun
            </MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
