import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FormControlLabel,
  Checkbox,
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
import { registerSchema, type RegisterFormData } from '../../utils/validationSchemas';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, loginWithGoogle } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      handicap: 0,
    },
  });

  // メール・パスワード新規登録
  const onSubmit = async (data: RegisterFormData) => {
    if (!agreeTos) {
      setError('利用規約に同意してください。');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      await registerUser(data.email, data.password, data.name);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Firebaseエラーメッセージを日本語に変換
      let errorMessage = '新規登録に失敗しました。';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています。';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません。';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'パスワードが弱すぎます。より強固なパスワードを設定してください。';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'メール/パスワード認証が無効になっています。';
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
      navigate('/dashboard', { replace: true });
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (isLoading) {
    return <LoadingSpinner message="新規登録中..." fullScreen />;
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
            新規登録
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

        {/* 新規登録フォーム */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* 名前 */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="名前"
                autoComplete="name"
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

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
                autoComplete="new-password"
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
                sx={{ mb: 2 }}
              />
            )}
          />

          {/* パスワード（確認） */}
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="パスワード（確認）"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="パスワードを表示"
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            )}
          />

          {/* ハンディキャップ（任意） */}
          <Controller
            name="handicap"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                fullWidth
                label="ハンディキャップ（任意）"
                type="number"
                value={value || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange(val === '' ? undefined : Number(val));
                }}
                error={!!errors.handicap}
                helperText={errors.handicap?.message || '後から設定することも可能です'}
                inputProps={{ min: -10, max: 54 }}
                sx={{ mb: 2 }}
              />
            )}
          />

          {/* 利用規約同意 */}
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTos}
                onChange={(e) => setAgreeTos(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                利用規約に同意します
              </Typography>
            }
            sx={{ mb: 2 }}
          />

          {/* 登録ボタン */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting || !agreeTos}
            sx={{ mb: 2 }}
          >
            {isSubmitting ? '登録中...' : '新規登録'}
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
          Googleで登録
        </Button>

        {/* ログインリンク */}
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            既にアカウントをお持ちですか？
          </Typography>
          <Link
            to="/login"
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Button color="primary" sx={{ mt: 1 }}>
              ログイン
            </Button>
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;