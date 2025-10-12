import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../ThemeProvider/ThemeContext';

/**
 * Theme toggle button
 * Switches between light and dark mode
 */
export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};

