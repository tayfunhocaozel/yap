import { useState, type ReactNode } from 'react';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { supabase } from '../lib/supabaseClient';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/siniflar', label: 'Sınıflar', icon: <ClassIcon /> },
  { to: '/yazililar', label: 'Yazılılar', icon: <AssignmentIcon /> },
  { to: '/ayarlar', label: 'Ayarlar', icon: <SettingsIcon /> },
];

function pageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  const match = NAV_ITEMS.find((item) => item.to !== '/' && pathname.startsWith(item.to));
  return match?.label ?? 'YAP';
}

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { session } = useAuth();

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', px: 2, py: 1.5 }}>
        © tayfunhoca
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen((open) => !open)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            YAP — {pageTitle(location.pathname)}
          </Typography>
          {session && (
            <>
              <Typography variant="body2" noWrap sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                {session.user.email}
              </Typography>
              <Button
                color="inherit"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={() => supabase.auth.signOut()}
              >
                Çıkış Yap
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
