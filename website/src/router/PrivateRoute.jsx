import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useSession } from '../hooks/useSession';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spin size="large" />
        <p className="mt-4">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  if (requireAdmin && !user.is_admin && user.role !== 'admin') {
    return <Navigate to="/Logged" replace />;
  }

  return children;
};

export default PrivateRoute;