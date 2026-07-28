import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

import LaborerDashboard from './pages/LaborerDashboard';
import FarmOwnerDashboard from './pages/FarmOwnerDashboard';

export const AuthContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
          {/* Header */}
          <header className="bg-green-600 text-white p-4 shadow-md">
            <h1 className="text-xl font-bold text-center">Farm Connect</h1>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'laborer' ? "/laborer" : "/owner"} replace />} />
              <Route path="/laborer" element={user ? (user.role === 'laborer' ? <LaborerDashboard /> : <Navigate to="/owner" replace />) : <Navigate to="/login" replace />} />
              <Route path="/owner" element={user ? (user.role === 'farmowner' ? <FarmOwnerDashboard /> : <Navigate to="/laborer" replace />) : <Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
