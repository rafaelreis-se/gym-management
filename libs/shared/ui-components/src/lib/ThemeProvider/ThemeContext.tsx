import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  PaletteMode,
} from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

interface AppThemeProviderProps {
  children: React.ReactNode;
  adminMode?: boolean; // If true, use blue/gray theme instead of red
}

/**
 * Theme Provider with Dark/Light mode support
 * Persists preference in localStorage
 */
export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({
  children,
  adminMode = false,
}) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  // Load theme preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as PaletteMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(adminMode
            ? // ADMIN MODE: Professional Blue/Gray Theme
              mode === 'light'
              ? {
                  // Admin Light mode
                  primary: {
                    main: '#1976d2', // Professional Blue
                    light: '#42a5f5',
                    dark: '#1565c0',
                  },
                  secondary: {
                    main: '#424242', // Gray
                  },
                  background: {
                    default: '#f5f5f5',
                    paper: '#ffffff',
                  },
                  success: {
                    main: '#10b981',
                  },
                }
              : {
                  // Admin Dark mode
                  primary: {
                    main: '#60a5fa', // Light Blue
                    light: '#93c5fd',
                    dark: '#3b82f6',
                  },
                  secondary: {
                    main: '#94a3b8', // Light Gray
                  },
                  background: {
                    default: '#0f172a',
                    paper: '#1e293b',
                  },
                  success: {
                    main: '#34d399',
                  },
                }
            : // STUDENT MODE: Gracie Barra Red Theme
            mode === 'light'
            ? {
                // Student Light mode - Gracie Barra Colors
                primary: {
                  main: '#DC1F26', // Gracie Barra Red
                  light: '#E84A4F',
                  dark: '#B81519',
                },
                secondary: {
                  main: '#1a1a1a', // Dark gray/black
                },
                background: {
                  default: '#f5f5f5',
                  paper: '#ffffff',
                },
                success: {
                  main: '#10b981',
                },
              }
            : {
                // Student Dark mode - Gracie Barra Colors
                primary: {
                  main: '#E84A4F', // Lighter red for dark mode
                  light: '#FF6B6B',
                  dark: '#DC1F26',
                },
                secondary: {
                  main: '#f0f0f0', // Light gray for dark mode
                },
                background: {
                  default: '#0f172a',
                  paper: '#1e293b',
                },
                success: {
                  main: '#34d399',
                },
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
            fontFamily: '"Bebas Neue", "Oswald", "Impact", sans-serif',
            letterSpacing: '0.05em',
          },
          h2: {
            fontWeight: 700,
            fontFamily: '"Bebas Neue", "Oswald", "Impact", sans-serif',
            letterSpacing: '0.03em',
          },
          h3: { fontWeight: 600 },
          h4: { fontWeight: 600 },
          h5: {
            fontWeight: 700,
            fontFamily: '"Bebas Neue", "Oswald", "Impact", sans-serif',
          },
          h6: { fontWeight: 600 },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow:
                  mode === 'dark'
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    : '0 2px 8px rgba(0,0,0,0.08)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode, adminMode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
