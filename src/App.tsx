import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { HomePage } from './pages/HomePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { PublicWifiPage } from './pages/wifi/PublicWifiPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

export default function App() {
  // 1. Direct query parameter check for GitHub Pages NFC URLs:
  // Example: https://usuario.github.io/linknfc/?wifi=PWyRj6rpV
  const [wifiQueryId, setWifiQueryId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('wifi');
  });

  useEffect(() => {
    const checkQuery = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('wifi');
      setWifiQueryId(id);

      // Support ?admin=true by redirecting to hash route #/admin
      if (params.get('admin') === 'true' && !window.location.hash) {
        window.location.hash = '#/admin';
      }
    };

    window.addEventListener('popstate', checkQuery);
    return () => window.removeEventListener('popstate', checkQuery);
  }, []);

  // When visiting with ?wifi=PUBLIC_ID, render the public Wi-Fi page directly
  // NO Firebase Authentication check, NO ProtectedRoute, NO admin bars
  if (wifiQueryId) {
    return (
      <ToastProvider>
        <PublicWifiPage publicId={wifiQueryId} />
      </ToastProvider>
    );
  }

  // 2. HashRouter for GitHub Pages SPA compatibility (never triggers server 404s)
  // Admin URLs: https://usuario.github.io/linknfc/#/admin
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<HomePage />} />

            {/* Public fallback route /wifi/:publicId */}
            <Route path="/wifi/:publicId" element={<PublicWifiPage />} />

            {/* Admin login */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected admin dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clients/*"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}
