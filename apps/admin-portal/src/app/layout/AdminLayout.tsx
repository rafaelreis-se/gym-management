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
  Chip,
  useTheme,
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
  Menu as MenuIcon,
} from '@mui/icons-material';
import { ThemeToggle, LanguageSwitcher } from '@gym-management/ui-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

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
  const { user, logout, isAdmin, isInstructor } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getRoleColor = (
    role: string
  ): 'error' | 'warning' | 'info' | 'success' | 'default' => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'INSTRUCTOR':
        return 'warning';
      case 'STUDENT':
        return 'info';
      case 'GUARDIAN':
        return 'success';
      default:
        return 'default';
    }
  };

  // Drawer content component
  const drawerContent = (
    <>
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
                onClick={() => setMobileOpen(false)} // Close drawer on mobile after navigation
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    minWidth: 40,
                  }}
                >
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
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-color',
            bgcolor: 'background.paper',
            color: 'text.primary',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}
      >
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {menuItems.find((item) => item.path === location.pathname)
                ?.text || 'Admin Panel'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* User Info */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role}
                  size="small"
                  color={getRoleColor(user?.role || '')}
                  variant="outlined"
                />
              </Box>

              <LanguageSwitcher />
              <ThemeToggle />

              <IconButton onClick={handleMenu}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: { minWidth: 200 },
              }}
            >
              {/* User info in mobile */}
              <Box
                sx={{
                  display: { md: 'none' },
                  p: 2,
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role}
                  size="small"
                  color={getRoleColor(user?.role || '')}
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Box>

              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Perfil
              </MenuItem>

              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                Sair
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
