import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Login from './pages/Login';

import LaborerDashboard from './pages/LaborerDashboard';
import FarmOwnerDashboard from './pages/FarmOwnerDashboard';

import AdminLayout from './pages/admin/AdminLayout';

export const AuthContext = createContext(null);

function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

  // Helper for role redirection
  const getRedirectForRole = (role) => {
    if (role === 'owner') return '/admin';
    if (role === 'farmowner') return '/owner';
    return '/laborer';
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes (Full Width) */}
          <Route path="/admin/*" element={user && user.role === 'owner' ? <AdminLayout /> : <Navigate to="/login" replace />} />

          {/* Regular App Routes (Mobile Width) */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
              <header className="bg-green-600 text-white p-4 shadow-md">
                <h1 className="text-xl font-bold text-center">{t('app.title')}</h1>
              </header>
              <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
                <Routes>
                  <Route path="/login" element={!user ? <Login /> : <Navigate to={getRedirectForRole(user.role)} replace />} />
                  <Route path="/laborer" element={user ? (user.role === 'laborer' ? <LaborerDashboard /> : <Navigate to={getRedirectForRole(user.role)} replace />) : <Navigate to="/login" replace />} />
                  <Route path="/owner" element={user ? (user.role === 'farmowner' ? <FarmOwnerDashboard /> : <Navigate to={getRedirectForRole(user.role)} replace />) : <Navigate to="/login" replace />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
