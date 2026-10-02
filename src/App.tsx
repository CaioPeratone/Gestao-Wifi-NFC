import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { HomePage } from './pages/HomePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { PublicWifiPage } from './pages/wifi/PublicWifiPage';
import { PublicPixPage } from './pages/pix/PublicPixPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

export default function App() {
  // 1. Direct query parameter check for GitHub Pages NFC URLs:
  // Examples:
  // Wi-Fi: https://usuario.github.io/linknfc/?wifi=PWyRj6rpV
  // PIX:   https://usuario.github.io/linknfc/?pix=K92mxP7Q
  const [wifiQueryId, setWifiQueryId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('wifi');
  });

  const [pixQueryId, setPixQueryId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('pix');
  });

  useEffect(() => {
    const checkQuery = () => {
      const params = new URLSearchParams(window.location.search);
      const wId = params.get('wifi');
      const pId = params.get('pix');
      setWifiQueryId(wId);
      setPixQueryId(pId);

      // Support ?admin=true by redirecting to hash route #/admin
      if (params.get('admin') === 'true' && !window.location.hash) {
        window.location.hash = '#/admin';
      }
    };

    window.addEventListener('popstate', checkQuery);
    return () => window.removeEventListener('popstate', checkQuery);
  }, []);

  // When visiting with ?wifi=PUBLIC_ID, render the public Wi-Fi page directly
  if (wifiQueryId) {
    return (
      <ToastProvider>
        <PublicWifiPage publicId={wifiQueryId} />
      </ToastProvider>
    );
  }

  // When visiting with ?pix=PIX_PUBLIC_ID, render the public PIX page directly
  if (pixQueryId) {
    return (
      <ToastProvider>
        <PublicPixPage pixPublicId={pixQueryId} />
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

            {/* Public fallback route /pix/:pixPublicId */}
            <Route path="/pix/:pixPublicId" element={<PublicPixPage />} />

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
