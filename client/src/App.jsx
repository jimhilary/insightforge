import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import useAuthStore from './store/authStore';
import { authService } from './services';
import RequireAuth from './components/RequireAuth';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ProfilePage from './pages/ProfilePage';
import ErrorPage from './pages/ErrorPage';
import OfflineBanner from './components/OfflineBanner';
import { useDarkMode } from './hooks/useDarkMode';
import { useOnlineStatus } from './hooks/useOnlineStatus';

function App() {
  const { init, token, logout } = useAuthStore();
  const [isDark] = useDarkMode();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Initialize auth from localStorage
    init();
  }, [init]);

  useEffect(() => {
    // Health check on app startup (only if online)
    const checkHealth = async () => {
      if (!isOnline) {
        console.warn('⚠️ App is offline, skipping health check');
        return;
      }
      
      try {
        await authService.healthCheck();
        console.log('✅ Server is healthy');
      } catch (error) {
        console.error('❌ Server health check failed:', error);
      }
    };

    // Verify token if user is logged in
    const verifyToken = async () => {
      if (!isOnline) return;
      
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        try {
          const response = await authService.verifyToken(currentToken);
          console.log('✅ Token verified:', response.user.email);
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          // Token is invalid, logout user
          logout();
        }
      }
    };

    checkHealth();
    if (token) {
      verifyToken();
    }
  }, [token, logout, isOnline]);

  return (
    <BrowserRouter>
      <AuthProvider>
        {!isOnline && <OfflineBanner />}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <RequireAuth>
                <ProjectDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;