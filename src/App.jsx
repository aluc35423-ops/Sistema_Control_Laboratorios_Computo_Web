import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import TopHeader from './components/TopHeader';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LabsGridPage from './pages/LabsGridPage';
import AssignPage from './pages/AssignPage';
import ActiveSessionPage from './pages/ActiveSessionPage';
import ProfilePage from './pages/ProfilePage';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/labs" replace /> : children;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.rol !== 'ADMIN') return <Navigate to="/labs" replace />;
  return children;
};

const AdminPlaceholderPage = () => (
  <div className="page-shell">
    <TopHeader />
    <main className="container main-content">
      <div className="empty-box">
        <h2>Panel de Administración TI (C4)</h2>
        <p>Vista reservada para el rol ADMIN (siguiente hito).</p>
      </div>
    </main>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route
            path="/labs"
            element={
              <PrivateRoute>
                <LabsGridPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/assign/:id"
            element={
              <PrivateRoute>
                <AssignPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/session"
            element={
              <PrivateRoute>
                <ActiveSessionPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPlaceholderPage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/labs" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;