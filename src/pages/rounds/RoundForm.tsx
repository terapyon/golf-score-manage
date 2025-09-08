import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Alert,
  IconButton,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  CloudQueue as WeatherIcon,
  Thermostat as TempIcon,
  Air as WindIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { RoundService } from '../../services/firestoreService';
import {
  roundFormSchema,
  type RoundFormData,
} from '../../utils/validationSchemas';
import { RoundParticipant, RoundScore } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// ステップ定義
const steps = ['基本情報', 'プレイヤー情報', 'スコア入力', '確認'];

// 天気の選択肢
const weatherOptions = [
  { value: '晴れ', label: '☀️ 晴れ' },
  { value: '曇り', label: '☁️ 曇り' },
  { value: '雨', label: '🌧️ 雨' },
  { value: '雪', label: '❄️ 雪' },
  { value: '強風', label: '💨 強風' },
];

// ティーの選択肢
const teeOptions = [
  { value: 'レディース', label: 'レディース', color: 'red' },
  { value: 'レギュラー', label: 'レギュラー', color: 'white' },
  { value: 'バック', label: 'バック', color: 'blue' },
  { value: 'チャンピオン', label: 'チャンピオン', color: 'black' },
];

const RoundForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { showToast } = useUIStore();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = Boolean(id);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RoundFormData>({
    resolver: zodResolver(roundFormSchema),
    defaultValues: {
      courseId: '',
      playDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      teeName: 'レギュラー',
      participants: [
        {
          name: currentUser?.name || '',
          type: 'registered' as const,
          handicap: currentUser?.handicap,
        },
      ],
      scores: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        strokes: 4,
        putts: undefined,
        fairwayHit: undefined,
        greenInRegulation: undefined,
        penalties: undefined,
      })),
      weather: undefined,
      temperature: undefined,
      windSpeed: undefined,
      memo: '',
    },
  });

  const {
    fields: participantFields,
    append: appendParticipant,
    remove: removeParticipant,
  } = useFieldArray({
    control,
    name: 'participants',
  });

  const { fields: scoreFields, update: updateScore } = useFieldArray({
    control,
    name: 'scores',
  });

  // フォーム送信
  const onSubmit = async (data: RoundFormData) => {
    if (!currentUser) return;

    try {
      setError(null);
      setIsLoading(true);

      if (isEditMode) {
        // TODO: ラウンド更新処理
        showToast('ラウンドを更新しました', 'success');
      } else {
        await RoundService.createRound(currentUser.uid, data);
        showToast('ラウンドを保存しました', 'success');
      }

      navigate('/rounds');
    } catch (err: any) {
      console.error('Round save error:', err);
      setError(err.message || 'ラウンドの保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // ステップ進行
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // プレイヤー追加
  const addParticipant = () => {
    if (participantFields.length < 4) {
      appendParticipant({
        name: '',
        type: 'guest',
        handicap: undefined,
      });
    }
  };

  // スコア一括設定
  const setAllScores = (strokes: number) => {
    scoreFields.forEach((_, index) => {
      updateScore(index, {
        holeNumber: index + 1,
        strokes,
        putts: undefined,
        fairwayHit: undefined,
        greenInRegulation: undefined,
        penalties: undefined,
      });
    });
  };

  if (isLoading) {
    return <LoadingSpinner message='ラウンドを保存中...' fullScreen />;
  }

  // ステップ1: 基本情報
  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom>
          ラウンド基本情報
        </Typography>
      </Grid>

      {/* ゴルフ場選択 */}
      <Grid item xs={12}>
        <Controller
          name='courseId'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='ゴルフ場'
              placeholder='ゴルフ場を選択してください'
              error={!!errors.courseId}
              helperText={
                errors.courseId?.message || '現在はテスト用のダミーコースです'
              }
              select
            >
              <MenuItem value='dummy-course-1'>
                🏌️ テストゴルフクラブ（18ホール・パー72）
              </MenuItem>
              <MenuItem value='dummy-course-2'>
                ⛳ サンプルカントリークラブ（18ホール・パー71）
              </MenuItem>
            </TextField>
          )}
        />
      </Grid>

      {/* プレー日 */}
      <Grid item xs={12} sm={6}>
        <Controller
          name='playDate'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='プレー日'
              type='date'
              error={!!errors.playDate}
              helperText={errors.playDate?.message}
              InputLabelProps={{ shrink: true }}
            />
          )}
        />
      </Grid>

      {/* スタート時間 */}
      <Grid item xs={12} sm={6}>
        <Controller
          name='startTime'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='スタート時間'
              type='time'
              error={!!errors.startTime}
              helperText={errors.startTime?.message}
              InputLabelProps={{ shrink: true }}
            />
          )}
        />
      </Grid>

      {/* ティー選択 */}
      <Grid item xs={12} sm={6}>
        <Controller
          name='teeName'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              select
              label='ティー'
              error={!!errors.teeName}
              helperText={errors.teeName?.message}
            >
              {teeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Box
                      width={12}
                      height={12}
                      borderRadius='50%'
                      bgcolor={option.color}
                      border={
                        option.color === 'white' ? '1px solid #ccc' : 'none'
                      }
                    />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>

      {/* 天気情報 */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant='subtitle1' gutterBottom>
          <WeatherIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          天気情報（オプション）
        </Typography>
      </Grid>

      <Grid item xs={12} sm={4}>
        <Controller
          name='weather'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              select
              label='天気'
              error={!!errors.weather}
              helperText={errors.weather?.message}
            >
              {weatherOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Controller
          name='temperature'
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <TextField
              {...field}
              fullWidth
              label='気温（℃）'
              type='number'
              value={value || ''}
              onChange={(e) =>
                onChange(e.target.value ? Number(e.target.value) : undefined)
              }
              error={!!errors.temperature}
              helperText={errors.temperature?.message}
              InputProps={{
                startAdornment: (
                  <TempIcon sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Controller
          name='windSpeed'
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <TextField
              {...field}
              fullWidth
              label='風速（m/s）'
              type='number'
              value={value || ''}
              onChange={(e) =>
                onChange(e.target.value ? Number(e.target.value) : undefined)
              }
              error={!!errors.windSpeed}
              helperText={errors.windSpeed?.message}
              InputProps={{
                startAdornment: (
                  <WindIcon sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
          )}
        />
      </Grid>
    </Grid>
  );

  // ステップ2: プレイヤー情報
  const renderParticipants = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>
            プレイヤー情報 ({participantFields.length}/4)
          </Typography>
          <Button
            variant='outlined'
            startIcon={<AddIcon />}
            onClick={addParticipant}
            disabled={participantFields.length >= 4}
          >
            プレイヤー追加
          </Button>
        </Box>
      </Grid>

      {participantFields.map((field, index) => (
        <Grid item xs={12} key={field.id}>
          <Card variant='outlined'>
            <CardContent>
              <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                mb={2}
              >
                <Typography variant='subtitle1'>
                  プレイヤー {index + 1}
                  {index === 0 && (
                    <Chip label='自分' size='small' sx={{ ml: 1 }} />
                  )}
                </Typography>
                {index > 0 && (
                  <IconButton
                    color='error'
                    onClick={() => removeParticipant(index)}
                    size='small'
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`participants.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='名前'
                        error={!!errors.participants?.[index]?.name}
                        helperText={errors.participants?.[index]?.name?.message}
                        disabled={index === 0}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Controller
                    name={`participants.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label='タイプ'
                        disabled={index === 0}
                      >
                        <MenuItem value='registered'>登録ユーザー</MenuItem>
                        <MenuItem value='guest'>ゲスト</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Controller
                    name={`participants.${index}.handicap`}
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='HC'
                        type='number'
                        value={value || ''}
                        onChange={(e) =>
                          onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        error={!!errors.participants?.[index]?.handicap}
                        helperText={
                          errors.participants?.[index]?.handicap?.message
                        }
                        inputProps={{ min: -10, max: 54 }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // ステップ3: スコア入力
  const renderScoreInput = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>スコア入力</Typography>
          <Box display='flex' gap={1}>
            <Button size='small' onClick={() => setAllScores(3)}>
              全パー
            </Button>
            <Button size='small' onClick={() => setAllScores(4)}>
              全ボギー
            </Button>
            <Button size='small' onClick={() => setAllScores(5)}>
              全ダブルボギー
            </Button>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <TableContainer component={Paper} variant='outlined'>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>ホール</TableCell>
                <TableCell align='center'>パー</TableCell>
                <TableCell align='center'>ストローク</TableCell>
                <TableCell align='center'>パット</TableCell>
                <TableCell align='center'>FW</TableCell>
                <TableCell align='center'>GIR</TableCell>
                <TableCell align='center'>ペナルティ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scoreFields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell align='center'>4</TableCell>
                  <TableCell align='center'>
                    <Controller
                      name={`scores.${index}.strokes`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type='number'
                          size='small'
                          sx={{ width: 60 }}
                          inputProps={{ min: 1, max: 20 }}
                          error={!!errors.scores?.[index]?.strokes}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Controller
                      name={`scores.${index}.putts`}
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <TextField
                          {...field}
                          type='number'
                          size='small'
                          sx={{ width: 60 }}
                          value={value || ''}
                          onChange={(e) =>
                            onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          inputProps={{ min: 0, max: 10 }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Controller
                      name={`scores.${index}.fairwayHit`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Checkbox
                          checked={value || false}
                          onChange={(e) => onChange(e.target.checked)}
                          size='small'
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Controller
                      name={`scores.${index}.greenInRegulation`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Checkbox
                          checked={value || false}
                          onChange={(e) => onChange(e.target.checked)}
                          size='small'
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Controller
                      name={`scores.${index}.penalties`}
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <TextField
                          {...field}
                          type='number'
                          size='small'
                          sx={{ width: 60 }}
                          value={value || ''}
                          onChange={(e) =>
                            onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          inputProps={{ min: 0, max: 10 }}
                        />
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* メモ */}
      <Grid item xs={12}>
        <Controller
          name='memo'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={3}
              label='メモ（オプション）'
              placeholder='ラウンドの感想や気づいたことを記録しましょう'
              error={!!errors.memo}
              helperText={errors.memo?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );

  // ステップ4: 確認
  const renderConfirmation = () => {
    const formData = watch();
    const totalScore = formData.scores.reduce(
      (sum, score) => sum + score.strokes,
      0
    );

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='h6' gutterBottom>
            ラウンド内容確認
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle1' gutterBottom>
                基本情報
              </Typography>
              <Box mb={1}>
                <Typography variant='body2' color='text.secondary'>
                  ゴルフ場:{' '}
                  {formData.courseId === 'dummy-course-1'
                    ? 'テストゴルフクラブ'
                    : 'サンプルカントリークラブ'}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography variant='body2' color='text.secondary'>
                  プレー日: {formData.playDate}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography variant='body2' color='text.secondary'>
                  スタート時間: {formData.startTime}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography variant='body2' color='text.secondary'>
                  ティー: {formData.teeName}
                </Typography>
              </Box>
              {formData.weather && (
                <Box mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    天気: {formData.weather}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant='subtitle1' gutterBottom>
                スコア
              </Typography>
              <Box mb={2}>
                <Typography variant='h4' color='primary'>
                  {totalScore}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  トータルスコア
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography variant='body2' color='text.secondary'>
                  プレイヤー: {formData.participants.length}名
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderParticipants();
      case 2:
        return renderScoreInput();
      case 3:
        return renderConfirmation();
      default:
        return null;
    }
  };

  return (
    <Box p={3}>
      <Typography variant='h4' gutterBottom>
        {isEditMode ? 'ラウンド編集' : '新しいラウンド'}
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        {/* ステッパー */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* フォーム内容 */}
        <Box component='form' onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent(activeStep)}

          {/* ナビゲーションボタン */}
          <Box display='flex' justifyContent='space-between' mt={4}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<BackIcon />}
            >
              戻る
            </Button>

            <Box display='flex' gap={2}>
              <Button
                variant='outlined'
                onClick={() => navigate('/rounds')}
                startIcon={<CancelIcon />}
              >
                キャンセル
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type='submit'
                  variant='contained'
                  disabled={isSubmitting}
                  startIcon={<SaveIcon />}
                >
                  {isSubmitting ? '保存中...' : '保存'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant='contained'
                  endIcon={<NextIcon />}
                >
                  次へ
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RoundForm;
