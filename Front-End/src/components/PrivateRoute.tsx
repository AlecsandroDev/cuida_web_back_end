import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // ou sessionStorage

  if (!token) {
    // se não tiver token, redireciona para login
    return <Navigate to="/" replace />;
  }

  // se tiver token, permite acesso à rota
  return children;
};

export default PrivateRoute;
