import { createTheme } from '@mui/material/styles';

const colors = {
  primary: '#8B5CF6',      // Violet
  secondary: '#EC4899',    // Pink
  success: '#10B981',       // Emerald
  warning: '#F59E0B',       // Amber
  error: '#EF4444',         // Red
  info: '#06B6D4',        // Cyan
  darkBg: '#0F0F0F',
  darkPaper: '#1A1A1A',
  darkCard: '#242424',
};

export const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: { main: colors.primary },
    secondary: { main: colors.secondary },
    success: { main: colors.success },
    warning: { main: colors.warning },
    error: { main: colors.error },
    background: {
      default: mode === 'dark' ? colors.darkBg : '#FAFAFA',
      paper: mode === 'dark' ? colors.darkPaper : '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, background: mode === 'dark' ? colors.darkCard : '#FFFFFF' },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
      },
    },
  },
});