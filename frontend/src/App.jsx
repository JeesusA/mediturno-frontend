import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthProvider';
import Login from './pages/Login';
import Register from './pages/Register';
import PacienteDashboard from './pages/PacienteDashboard';
import MedicoDashboard from './pages/MedicoDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/paciente"
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <PacienteDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medico"
            element={
              <ProtectedRoute allowedRoles={['medico']}>
                <MedicoDashboard />
              </ProtectedRoute>
            }
          />

          {/* Ruta para no encontradas */}
          <Route path="*" element={<div>Página no encontrada</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
