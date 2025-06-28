import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  SportsGolf as GolfIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, type LoginFormData } from '../../utils/validationSchemas';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ログイン後のリダイレクト先を取得
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // メール・パスワードログイン
  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Firebaseエラーメッセージを日本語に変換
      let errorMessage = 'ログインに失敗しました。';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'ユーザーが見つかりません。';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'パスワードが間違っています。';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません。';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'このアカウントは無効化されています。';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'ログイン試行回数が上限に達しました。しばらく時間をおいてから再度お試しください。';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Googleログイン
  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google login error:', err);
      
      let errorMessage = 'Googleログインに失敗しました。';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'ログインがキャンセルされました。';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'ポップアップがブロックされました。ブラウザの設定を確認してください。';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return <LoadingSpinner message="ログイン中..." fullScreen />;
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="grey.100"
      p={2}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        {/* ヘッダー */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          mb={3}
        >
          <GolfIcon
            sx={{
              fontSize: 48,
              color: 'primary.main',
              mb: 1,
            }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            ログイン
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ゴルフスコア管理システム
          </Typography>
        </Box>

        {/* エラーメッセージ */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ログインフォーム */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* メールアドレス */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="メールアドレス"
                type="email"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          {/* パスワード */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="パスワードを表示"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
            )}
          />

          {/* ログインボタン */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </Button>
        </Box>

        {/* 区切り線 */}
        <Divider sx={{ my: 2 }}>または</Divider>

        {/* Googleログインボタン */}
        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={isLoading}
          sx={{ mb: 3 }}
        >
          Googleでログイン
        </Button>

        {/* 新規登録リンク */}
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            アカウントをお持ちでないですか？
          </Typography>
          <Link
            to="/register"
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Button color="primary" sx={{ mt: 1 }}>
              新規登録
            </Button>
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;