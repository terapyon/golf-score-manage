import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  CalendarToday as CalendarIcon,
  Schedule as TimeIcon,
  SportsGolf as GolfIcon,
  Person as PersonIcon,
  CloudQueue as WeatherIcon,
  Thermostat as TempIcon,
  Air as WindIcon,
  StickyNote2 as NoteIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { RoundService } from '../../services/firestoreService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const RoundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useUIStore();

  // ラウンド詳細取得
  const {
    data: round,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['round', id],
    queryFn: () => {
      if (!id) throw new Error('Round ID is required');
      return RoundService.getRound(id);
    },
    enabled: !!id,
  });

  // ラウンド削除
  const handleDelete = async () => {
    if (!id || !round) return;

    if (!window.confirm('このラウンドを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      await RoundService.deleteRound(id);
      showToast('ラウンドを削除しました', 'success');
      navigate('/rounds');
    } catch (error) {
      console.error('Delete round error:', error);
      showToast('ラウンドの削除に失敗しました', 'error');
    }
  };

  // スコアの表示色を取得
  const getScoreColor = (strokes: number, par: number) => {
    const diff = strokes - par;
    if (diff <= -2) return '#4caf50'; // Eagle以下 - 緑
    if (diff === -1) return '#2196f3'; // Birdie - 青
    if (diff === 0) return '#000000'; // Par - 黒
    if (diff === 1) return '#ff9800'; // Bogey - オレンジ
    return '#f44336'; // ダブルボギー以上 - 赤
  };

  // スコア差分のテキスト
  const getScoreDiffText = (strokes: number, par: number) => {
    const diff = strokes - par;
    if (diff <= -2) return 'E'; // Eagle
    if (diff === -1) return 'B'; // Birdie
    if (diff === 0) return 'P'; // Par
    if (diff === 1) return '+1'; // Bogey
    return `+${diff}`; // ダブルボギー以上
  };

  if (isLoading) {
    return <LoadingSpinner message="ラウンド詳細を読み込み中..." />;
  }

  if (error || !round) {
    return (
      <Box p={3}>
        <Alert severity="error">
          ラウンド詳細の取得に失敗しました。
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/rounds')}
          sx={{ mt: 2 }}
        >
          ラウンド一覧に戻る
        </Button>
      </Box>
    );
  }

  // 統計計算
  const totalScore = round.scores.reduce((sum, score) => sum + score.strokes, 0);
  const totalPutts = round.scores.reduce((sum, score) => sum + (score.putts || 0), 0);
  const fairwayHits = round.scores.filter(score => score.fairwayHit).length;
  const girCount = round.scores.filter(score => score.greenInRegulation).length;
  const totalPenalties = round.scores.reduce((sum, score) => sum + (score.penalties || 0), 0);

  return (
    <Box p={3}>
      {/* ヘッダー */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/rounds')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">
            ラウンド詳細
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/rounds/${id}/edit`)}
          >
            編集
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            削除
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 基本情報 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <GolfIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                基本情報
              </Typography>
              
              <Box mb={2}>
                <Typography variant="h5" gutterBottom>
                  {round.courseName}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body1">
                  {round.playDate}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="body1">
                  スタート時間: {round.startTime}
                </Typography>
              </Box>

              <Box display="flex" gap={1} mt={2}>
                <Chip
                  label={round.teeName}
                  variant="outlined"
                  color="primary"
                />
                {round.weather && (
                  <Chip
                    label={round.weather}
                    variant="outlined"
                    icon={<WeatherIcon />}
                  />
                )}
              </Box>

              {(round.temperature !== undefined || round.windSpeed !== undefined) && (
                <Box display="flex" gap={2} mt={2}>
                  {round.temperature !== undefined && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <TempIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {round.temperature}℃
                      </Typography>
                    </Box>
                  )}
                  {round.windSpeed !== undefined && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <WindIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {round.windSpeed}m/s
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* スコアサマリー */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                スコアサマリー
              </Typography>
              
              <Box textAlign="center" mb={3}>
                <Typography variant="h2" color="primary" gutterBottom>
                  {totalScore}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  パー {round.totalPar} / {totalScore - round.totalPar > 0 ? '+' : ''}{totalScore - round.totalPar}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="text.primary">
                      {totalPutts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      総パット数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="text.primary">
                      {fairwayHits}/14
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      フェアウェイキープ
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="text.primary">
                      {girCount}/18
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      パーオン
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="text.primary">
                      {totalPenalties}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ペナルティ
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* プレイヤー情報 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                プレイヤー ({round.participants.length}名)
              </Typography>
              
              <List>
                {round.participants.map((participant, index) => (
                  <ListItem key={index} divider={index < round.participants.length - 1}>
                    <ListItemAvatar>
                      <Avatar>
                        {participant.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={participant.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" component="span">
                            {participant.type === 'registered' ? '登録ユーザー' : 'ゲスト'}
                          </Typography>
                          {participant.handicap !== undefined && (
                            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                              HC: {participant.handicap}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* メモ */}
        {round.memo && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <NoteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  メモ
                </Typography>
                <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                  {round.memo}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 詳細スコア */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                詳細スコア
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ホール</TableCell>
                      <TableCell align="center">パー</TableCell>
                      <TableCell align="center">ストローク</TableCell>
                      <TableCell align="center">差</TableCell>
                      <TableCell align="center">パット</TableCell>
                      <TableCell align="center">FW</TableCell>
                      <TableCell align="center">GIR</TableCell>
                      <TableCell align="center">ペナルティ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {round.scores.map((score, index) => (
                      <TableRow key={score.holeNumber}>
                        <TableCell component="th" scope="row">
                          {score.holeNumber}
                        </TableCell>
                        <TableCell align="center">{score.par}</TableCell>
                        <TableCell 
                          align="center"
                          sx={{ 
                            color: getScoreColor(score.strokes, score.par),
                            fontWeight: 'bold'
                          }}
                        >
                          {score.strokes}
                        </TableCell>
                        <TableCell 
                          align="center"
                          sx={{ 
                            color: getScoreColor(score.strokes, score.par),
                            fontWeight: 'bold'
                          }}
                        >
                          {getScoreDiffText(score.strokes, score.par)}
                        </TableCell>
                        <TableCell align="center">
                          {score.putts || '-'}
                        </TableCell>
                        <TableCell align="center">
                          {score.fairwayHit !== undefined ? (score.fairwayHit ? '○' : '×') : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {score.greenInRegulation !== undefined ? (score.greenInRegulation ? '○' : '×') : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {score.penalties || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* 前半・後半・合計の行 */}
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        前半
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {round.scores.slice(0, 9).reduce((sum, score) => sum + score.par, 0)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {round.scores.slice(0, 9).reduce((sum, score) => sum + score.strokes, 0)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {round.scores.slice(0, 9).reduce((sum, score) => sum + score.strokes, 0) - 
                         round.scores.slice(0, 9).reduce((sum, score) => sum + score.par, 0) > 0 ? '+' : ''}
                        {round.scores.slice(0, 9).reduce((sum, score) => sum + score.strokes, 0) - 
                         round.scores.slice(0, 9).reduce((sum, score) => sum + score.par, 0)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {round.scores.slice(0, 9).reduce((sum, score) => sum + (score.putts || 0), 0)}
                      </TableCell>
                      <TableCell align="center">-</TableCell>
                      <TableCell align="center">-</TableCell>
                      <TableCell align="center">-</TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        後半
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {round.scores.slice(9).reduce((sum, score) => sum + score.par, 0)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {round.scores.slice(9).reduce((sum, score) => sum + score.strokes, 0)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {round.scores.slice(9).reduce((sum, score) => sum + score.strokes, 0) - 
                         round.scores.slice(9).reduce((sum, score) => sum + score.par, 0) > 0 ? '+' : ''}
                        {round.scores.slice(9).reduce((sum, score) => sum + score.strokes, 0) - 
                         round.scores.slice(9).reduce((sum, score) => sum + score.par, 0)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {round.scores.slice(9).reduce((sum, score) => sum + (score.putts || 0), 0)}
                      </TableCell>
                      <TableCell align="center">-</TableCell>
                      <TableCell align="center">-</TableCell>
                      <TableCell align="center">-</TableCell>
                    </TableRow>
                    
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        合計
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {round.totalPar}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                        {totalScore}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                        {totalScore - round.totalPar > 0 ? '+' : ''}{totalScore - round.totalPar}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {totalPutts}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {fairwayHits}/14
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {girCount}/18
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {totalPenalties}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoundDetail;