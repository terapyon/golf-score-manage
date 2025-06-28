import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  FormControlLabel,
  Switch,
  MenuItem,
  Alert,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { profileUpdateSchema, type ProfileUpdateFormData } from '../../utils/validationSchemas';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Profile: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useUIStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: currentUser?.name || '',
      handicap: currentUser?.handicap || 0,
      preferences: {
        defaultTee: currentUser?.preferences?.defaultTee || 'レギュラー',
        scoreDisplayMode: currentUser?.preferences?.scoreDisplayMode || 'stroke',
        notifications: {
          email: currentUser?.preferences?.notifications?.email ?? true,
          push: currentUser?.preferences?.notifications?.push ?? true,
        },
      },
    },
  });

  // プロフィール更新
  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      setError(null);
      await updateUserProfile(data);
      setIsEditing(false);
      showToast('プロフィールが更新されました', 'success');
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError('プロフィールの更新に失敗しました。');
    }
  };

  // 編集モードをキャンセル
  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setError(null);
  };

  // ティーの選択肢
  const teeOptions = [
    { value: 'レディース', label: 'レディース' },
    { value: 'レギュラー', label: 'レギュラー' },
    { value: 'バック', label: 'バック' },
    { value: 'チャンピオン', label: 'チャンピオン' },
  ];

  if (!currentUser) {
    return <LoadingSpinner message="プロフィール情報を読み込み中..." />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        プロフィール
      </Typography>

      <Grid container spacing={3}>
        {/* プロフィール情報カード */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  src={currentUser.avatar}
                  sx={{ width: 80, height: 80, mr: 2 }}
                >
                  {currentUser.name?.charAt(0) || <PersonIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h6">{currentUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ハンディキャップ: {currentUser.handicap}
                  </Typography>
                </Box>
              </Box>

              {!isEditing && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  fullWidth
                >
                  プロフィールを編集
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 統計情報カード（プレースホルダー） */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                統計情報
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  総ラウンド数
                </Typography>
                <Typography variant="body2">0</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  平均スコア
                </Typography>
                <Typography variant="body2">-</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  ベストスコア
                </Typography>
                <Typography variant="body2">-</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 編集フォーム */}
        {isEditing && (
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                プロフィール編集
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                  {/* 名前 */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="名前"
                          error={!!errors.name}
                          helperText={errors.name?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* ハンディキャップ */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="handicap"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="ハンディキャップ"
                          type="number"
                          value={value}
                          onChange={(e) => onChange(Number(e.target.value))}
                          error={!!errors.handicap}
                          helperText={errors.handicap?.message}
                          inputProps={{ min: -10, max: 54 }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      設定
                    </Typography>
                  </Grid>

                  {/* デフォルトティー */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="preferences.defaultTee"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          select
                          label="デフォルトティー"
                          error={!!errors.preferences?.defaultTee}
                          helperText={errors.preferences?.defaultTee?.message}
                        >
                          {teeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  {/* スコア表示モード */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="preferences.scoreDisplayMode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          select
                          label="スコア表示モード"
                        >
                          <MenuItem value="stroke">ストローク</MenuItem>
                          <MenuItem value="net">ネット</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      通知設定
                    </Typography>
                  </Grid>

                  {/* メール通知 */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="preferences.notifications.email"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={value}
                              onChange={(e) => onChange(e.target.checked)}
                            />
                          }
                          label="メール通知"
                        />
                      )}
                    />
                  </Grid>

                  {/* プッシュ通知 */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="preferences.notifications.push"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={value}
                              onChange={(e) => onChange(e.target.checked)}
                            />
                          }
                          label="プッシュ通知"
                        />
                      )}
                    />
                  </Grid>

                  {/* ボタン */}
                  <Grid item xs={12}>
                    <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        キャンセル
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={isSubmitting || !isDirty}
                      >
                        {isSubmitting ? '保存中...' : '保存'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Profile;