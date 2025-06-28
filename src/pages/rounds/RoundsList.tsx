import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Pagination,
  Skeleton,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  SportsGolf as GolfIcon,
  CalendarToday as CalendarIcon,
  Schedule as TimeIcon,
  TrendingUp as ScoreIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { RoundService } from '../../services/firestoreService';
import { Round, RoundFilters } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// フィルタの初期値
const initialFilters: RoundFilters = {
  page: 1,
  limit: 10,
  from: '',
  to: '',
  courseId: '',
};

// 期間選択の選択肢
const periodOptions = [
  { value: '', label: '全期間' },
  { value: 'this-month', label: '今月' },
  { value: 'last-month', label: '先月' },
  { value: 'this-year', label: '今年' },
  { value: 'last-year', label: '昨年' },
];

const RoundsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useUIStore();

  const [filters, setFilters] = useState<RoundFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  // ラウンド一覧取得
  const {
    data: roundsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['rounds', currentUser?.uid, filters],
    queryFn: () => {
      if (!currentUser) return null;
      return RoundService.getRounds(currentUser.uid, filters);
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });

  // 期間フィルタの変更処理
  useEffect(() => {
    if (!selectedPeriod) {
      setFilters(prev => ({ ...prev, from: '', to: '', page: 1 }));
      return;
    }

    const now = new Date();
    let from = '';
    let to = '';

    switch (selectedPeriod) {
      case 'this-month':
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'last-month':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'this-year':
        from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        to = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      case 'last-year':
        from = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
        to = new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
        break;
    }

    setFilters(prev => ({ ...prev, from, to, page: 1 }));
  }, [selectedPeriod]);

  // ページ変更
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters(prev => ({ ...prev, page: value }));
  };

  // ラウンド削除
  const handleDeleteRound = async (roundId: string) => {
    if (!window.confirm('このラウンドを削除しますか？')) {
      return;
    }

    try {
      await RoundService.deleteRound(roundId);
      showToast('ラウンドを削除しました', 'success');
      refetch();
    } catch (error) {
      console.error('Delete round error:', error);
      showToast('ラウンドの削除に失敗しました', 'error');
    }
  };

  // スコアの表示色を取得
  const getScoreColor = (score: number, par: number = 72) => {
    const diff = score - par;
    if (diff <= -2) return 'success';
    if (diff === -1) return 'info';
    if (diff === 0) return 'default';
    if (diff === 1) return 'warning';
    return 'error';
  };

  // スコア差分のテキスト
  const getScoreDiffText = (score: number, par: number = 72) => {
    const diff = score - par;
    if (diff === 0) return 'E';
    if (diff > 0) return `+${diff}`;
    return `${diff}`;
  };

  if (!currentUser) {
    return <LoadingSpinner message="認証情報を確認中..." />;
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          ラウンド一覧の取得に失敗しました。
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* ヘッダー */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          ラウンド履歴
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/rounds/new')}
        >
          新しいラウンド
        </Button>
      </Box>

      {/* フィルタ */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            フィルタ・検索
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="ゴルフ場名で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="期間"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periodOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="開始日"
                type="date"
                value={filters.from}
                onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value, page: 1 }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="終了日"
                type="date"
                value={filters.to}
                onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value, page: 1 }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ローディング状態 */}
      {isLoading && (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="text" width="80%" height={24} />
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Skeleton variant="rectangular" width={60} height={32} />
                    <Skeleton variant="rectangular" width={80} height={32} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ラウンド一覧 */}
      {!isLoading && roundsData && (
        <>
          {roundsData.items.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={8}
              color="text.secondary"
            >
              <GolfIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                ラウンドが見つかりません
              </Typography>
              <Typography variant="body2" textAlign="center" mb={3}>
                まだラウンドが記録されていないか、<br />
                検索条件に一致するラウンドがありません
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/rounds/new')}
              >
                最初のラウンドを記録
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {roundsData.items.map((round) => (
                  <Grid item xs={12} sm={6} md={4} key={round.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => navigate(`/rounds/${round.id}`)}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" component="div" noWrap>
                            {round.courseName}
                          </Typography>
                          <Chip
                            label={getScoreDiffText(round.totalScore, round.totalPar)}
                            color={getScoreColor(round.totalScore, round.totalPar)}
                            size="small"
                          />
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {round.playDate}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {round.startTime}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <ScoreIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {round.totalScore} ({round.totalPar})
                          </Typography>
                        </Box>

                        <Box display="flex" gap={1} mb={2}>
                          <Chip
                            label={round.teeName}
                            variant="outlined"
                            size="small"
                          />
                          {round.weather && (
                            <Chip
                              label={round.weather}
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Box>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {round.participants.length}名でプレー
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/rounds/${round.id}/edit`);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRound(round.id);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* ページネーション */}
              {roundsData.pagination.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={roundsData.pagination.totalPages}
                    page={roundsData.pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* フローティングアクションボタン */}
      <Fab
        color="primary"
        aria-label="add round"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => navigate('/rounds/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default RoundsList;