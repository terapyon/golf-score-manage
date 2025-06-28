import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // 認証状態のロード中
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // 未認証の場合、ログインページにリダイレクト
  // 現在のパスを state として保存し、ログイン後に元のページに戻れるようにする
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 認証済みの場合、子コンポーネントを表示
  return <>{children}</>;
};

export default ProtectedRoute;