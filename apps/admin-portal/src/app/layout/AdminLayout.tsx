import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Dashboard,
  People,
  EmojiEvents,
  Payment,
  Inventory,
  Assessment,
  Settings,
  Logout,
  AccountCircle,
  FamilyRestroom,
} from '@mui/icons-material';
import { ThemeToggle, LanguageSwitcher } from '@gym-management/ui-components';
import { useTranslation } from 'react-i18next';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Students', icon: <People />, path: '/students' },
  { text: 'Guardians', icon: <FamilyRestroom />, path: '/guardians' },
  { text: 'Graduations', icon: <EmojiEvents />, path: '/graduations' },
  { text: 'Financial', icon: <Payment />, path: '/financial' },
  { text: 'Products', icon: <Inventory />, path: '/products' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#1e293b',
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            🥋 {t('gracie-barra-araxa')}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {t('admin-portal')}
          </Typography>
        </Box>

        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: '#f8f9fa', minHeight: '100vh' }}
      >
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'white',
            color: 'text.primary',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {menuItems.find((item) => item.path === location.pathname)
                ?.text || 'Admin Panel'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LanguageSwitcher />
              <ThemeToggle />
              <IconButton onClick={handleMenu}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  A
                </Avatar>
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
