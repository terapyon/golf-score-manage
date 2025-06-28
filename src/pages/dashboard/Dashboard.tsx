import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  SportsGolf as GolfIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { RoundService, StatsService } from '../../services/firestoreService';

// スタッツカードコンポーネント
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
}) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: 56,
            height: 56,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // ユーザー統計取得
  const {
    data: userStats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['userStats', currentUser?.uid],
    queryFn: () => {
      if (!currentUser) return null;
      return StatsService.getUserStats(currentUser.uid);
    },
    enabled: !!currentUser,
  });

  // 最近のラウンド取得
  const {
    data: recentRounds,
    isLoading: roundsLoading,
  } = useQuery({
    queryKey: ['recentRounds', currentUser?.uid],
    queryFn: () => {
      if (!currentUser) return null;
      return RoundService.getRecentRounds(currentUser.uid, 3);
    },
    enabled: !!currentUser,
  });

  return (
    <Box>
      {/* ウェルカムメッセージ */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          おかえりなさい、{currentUser?.name}さん！
        </Typography>
        <Typography variant="body1" color="text.secondary">
          今日も素晴らしいゴルフを楽しみましょう
        </Typography>
      </Box>

      {/* 統計カード */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          {statsLoading ? (
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="text" width="50%" height={20} />
              </CardContent>
            </Card>
          ) : (
            <StatsCard
              title="総ラウンド数"
              value={userStats?.totalRounds || 0}
              subtitle="ラウンド"
              icon={<GolfIcon />}
              color="primary"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {statsLoading ? (
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="text" width="50%" height={20} />
              </CardContent>
            </Card>
          ) : (
            <StatsCard
              title="平均スコア"
              value={userStats?.averageScore ? Math.round(userStats.averageScore * 10) / 10 : '-'}
              subtitle={userStats?.totalRounds ? 'ストローク' : 'まだラウンドがありません'}
              icon={<TrendingUpIcon />}
              color="success"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {statsLoading ? (
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="text" width="50%" height={20} />
              </CardContent>
            </Card>
          ) : (
            <StatsCard
              title="ベストスコア"
              value={userStats?.bestScore || '-'}
              subtitle={userStats?.bestScore ? 'ストローク' : '記録なし'}
              icon={<TrophyIcon />}
              color="warning"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {statsLoading ? (
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="text" width="50%" height={20} />
              </CardContent>
            </Card>
          ) : (
            <StatsCard
              title="今年のラウンド"
              value={userStats?.thisYear?.rounds || 0}
              subtitle="ラウンド"
              icon={<TimelineIcon />}
              color="secondary"
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* クイックアクション */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                クイックアクション
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/rounds/new')}
                  fullWidth
                >
                  新しいラウンドを記録
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/rounds')}
                  fullWidth
                >
                  ラウンド履歴を見る
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/profile')}
                  fullWidth
                >
                  プロフィールを編集
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 最近のラウンド */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  最近のラウンド
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/rounds')}
                >
                  すべて見る
                </Button>
              </Box>
              
              {roundsLoading ? (
                <Box>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Box key={index} mb={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box flex={1}>
                          <Skeleton variant="text" width="70%" height={20} />
                          <Skeleton variant="text" width="50%" height={16} />
                        </Box>
                        <Skeleton variant="text" width={60} height={20} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : recentRounds && recentRounds.length > 0 ? (
                <List>
                  {recentRounds.map((round, index) => (
                    <ListItem
                      key={round.id}
                      divider={index < recentRounds.length - 1}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                      onClick={() => navigate(`/rounds/${round.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <CalendarIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={round.courseName}
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {round.playDate}
                            </Typography>
                            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                              {round.participants.length}名
                            </Typography>
                          </Box>
                        }
                      />
                      <Box textAlign="right">
                        <Typography variant="h6" color="primary">
                          {round.totalScore}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {round.totalScore - round.totalPar > 0 ? '+' : ''}{round.totalScore - round.totalPar}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  py={4}
                  color="text.secondary"
                >
                  <GolfIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" gutterBottom>
                    まだラウンドが記録されていません
                  </Typography>
                  <Typography variant="body2" textAlign="center">
                    最初のラウンドを記録して
                    <br />
                    スコア管理を始めましょう！
                  </Typography>
                  <Button
                    variant="text"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/rounds/new')}
                    sx={{ mt: 2 }}
                  >
                    ラウンドを記録する
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* プロフィール情報 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              プロフィール情報
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Avatar
                src={currentUser?.avatar}
                sx={{ width: 64, height: 64 }}
              >
                {currentUser?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {currentUser?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentUser?.email}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Chip
                    label={`ハンディキャップ: ${currentUser?.handicap}`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={`デフォルトティー: ${currentUser?.preferences?.defaultTee || 'レギュラー'}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;