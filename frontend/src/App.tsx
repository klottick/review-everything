import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import { ThemeProvider as CustomThemeProvider, useThemeMode } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CategoryDetail } from './pages/CategoryDetail';
import { ItemDetail } from './pages/ItemDetail';

function AppContent() {
  const { mode } = useThemeMode();
  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <UserProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/category/:id" element={<CategoryDetail />} />
              <Route path="/item/:id" element={<ItemDetail />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}