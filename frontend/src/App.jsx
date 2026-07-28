import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
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
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/role" />} />
              <Route path="/role" element={user ? <RoleSelection /> : <Navigate to="/login" />} />
              <Route path="/laborer" element={user?.role === 'laborer' ? <LaborerDashboard /> : <Navigate to="/role" />} />
              <Route path="/owner" element={user?.role === 'farmowner' ? <FarmOwnerDashboard /> : <Navigate to="/role" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
