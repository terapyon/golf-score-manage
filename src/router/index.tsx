import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// ローディングコンポーネント
const PageLoader: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <CircularProgress />
  </Box>
);

// 遅延読み込み用のページコンポーネント
const LazyDashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const LazyRoundsList = React.lazy(() => import('../pages/rounds/RoundsList'));
const LazyRoundDetail = React.lazy(() => import('../pages/rounds/RoundDetail'));
const LazyRoundForm = React.lazy(() => import('../pages/rounds/RoundForm'));
const LazyProfile = React.lazy(() => import('../pages/profile/Profile'));
const LazyLogin = React.lazy(() => import('../pages/auth/Login'));
const LazyRegister = React.lazy(() => import('../pages/auth/Register'));

// 一時的なプレースホルダーコンポーネント（実際のページが実装されるまで）
const Dashboard: React.FC = () => (
  <Box p={3}>
    <h1>ダッシュボード</h1>
    <p>環境セットアップ完了！</p>
  </Box>
);

const RoundsList: React.FC = () => (
  <Box p={3}>
    <h1>ラウンド一覧</h1>
    <p>ラウンド一覧ページ（実装予定）</p>
  </Box>
);

const RoundDetail: React.FC = () => (
  <Box p={3}>
    <h1>ラウンド詳細</h1>
    <p>ラウンド詳細ページ（実装予定）</p>
  </Box>
);

const RoundForm: React.FC = () => (
  <Box p={3}>
    <h1>ラウンド入力</h1>
    <p>ラウンド入力ページ（実装予定）</p>
  </Box>
);

const Profile: React.FC = () => (
  <Box p={3}>
    <h1>プロフィール</h1>
    <p>プロフィールページ（実装予定）</p>
  </Box>
);

const Login: React.FC = () => (
  <Box p={3}>
    <h1>ログイン</h1>
    <p>ログインページ（実装予定）</p>
  </Box>
);

const Register: React.FC = () => (
  <Box p={3}>
    <h1>新規登録</h1>
    <p>新規登録ページ（実装予定）</p>
  </Box>
);

// エラーページコンポーネント
const NotFound: React.FC = () => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <h1>404 - ページが見つかりません</h1>
    <p>お探しのページは存在しません。</p>
  </Box>
);

const ErrorPage: React.FC = () => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <h1>エラーが発生しました</h1>
    <p>申し訳ございません。エラーが発生しました。</p>
  </Box>
);

// ルーター設定
export const router = createBrowserRouter([
  // 認証が不要なルート
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Register />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  
  // 認証が必要なルート（AppLayoutでラップ）
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'rounds',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <RoundsList />
              </Suspense>
            ),
          },
          {
            path: 'new',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RoundForm />
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RoundDetail />
              </Suspense>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RoundForm />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        ),
      },
    ],
  },
  
  // 404ページ
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;