import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Envuelve rutas protegidas.
 * allowedRoles es un array con los roles permitidos (ej. ['paciente'] o ['medico'])
 * Si el usuario no está autenticado o no tiene el rol, lo redirige al login.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    // No autenticado, redirige al login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // No tiene el rol necesario
    return <Navigate to="/login" replace />;
  }

  // Está autenticado y tiene el rol correcto
  return children;
}
