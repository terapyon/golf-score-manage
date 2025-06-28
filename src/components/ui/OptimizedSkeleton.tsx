import React from 'react';
import { Skeleton, Box, Card, CardContent, Grid } from '@mui/material';

// 汎用スケルトンコンポーネント
interface SkeletonProps {
  lines?: number;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | false;
}

export const OptimizedSkeleton: React.FC<SkeletonProps> = ({
  lines = 1,
  width = '100%',
  height,
  variant = 'text',
  animation = 'pulse',
}) => {
  if (lines === 1) {
    return (
      <Skeleton
        variant={variant}
        width={width}
        height={height}
        animation={animation}
      />
    );
  }

  return (
    <Box>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          width={index === lines - 1 ? '60%' : width}
          height={height}
          animation={animation}
          sx={{ mb: 0.5 }}
        />
      ))}
    </Box>
  );
};

// ダッシュボード統計カード用スケルトン
export const StatsCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box flex={1}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={40} sx={{ my: 1 }} />
          <Skeleton variant="text" width="50%" height={20} />
        </Box>
        <Skeleton variant="circular" width={56} height={56} />
      </Box>
    </CardContent>
  </Card>
);

// ラウンドカード用スケルトン
export const RoundCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Skeleton variant="text" width="70%" height={28} />
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
      </Box>
      
      <Box mb={1}>
        <Skeleton variant="text" width="50%" height={20} />
      </Box>
      <Box mb={1}>
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
      <Box mb={2}>
        <Skeleton variant="text" width="60%" height={20} />
      </Box>
      
      <Box display="flex" gap={1} mb={2}>
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
      </Box>
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" width="40%" height={16} />
        <Box display="flex" gap={1}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ラウンド一覧用スケルトン
export const RoundsListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <Grid container spacing={2}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <RoundCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

// 最近のラウンド用スケルトン
export const RecentRoundsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box flex={1}>
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="50%" height={16} />
          </Box>
          <Box textAlign="right">
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="text" width={40} height={16} />
          </Box>
        </Box>
      </Box>
    ))}
  </Box>
);

// ラウンド詳細用スケルトン
export const RoundDetailSkeleton: React.FC = () => (
  <Grid container spacing={3}>
    {/* 基本情報 */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
          <Box display="flex" gap={1}>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
          </Box>
        </CardContent>
      </Card>
    </Grid>

    {/* スコアサマリー */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
          <Box textAlign="center" mb={3}>
            <Skeleton variant="text" width="30%" height={80} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mx: 'auto' }} />
          </Box>
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={6} key={index}>
                <Box textAlign="center">
                  <Skeleton variant="text" width="60%" height={24} sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width="80%" height={16} sx={{ mx: 'auto' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Grid>

    {/* スコアテーブル */}
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
          <Box>
            {Array.from({ length: 20 }).map((_, index) => (
              <Box key={index} display="flex" gap={2} mb={1}>
                <Skeleton variant="text" width={40} height={24} />
                <Skeleton variant="text" width={40} height={24} />
                <Skeleton variant="text" width={60} height={24} />
                <Skeleton variant="text" width={40} height={24} />
                <Skeleton variant="text" width={40} height={24} />
                <Skeleton variant="text" width={40} height={24} />
                <Skeleton variant="text" width={40} height={24} />
                <Skeleton variant="text" width={60} height={24} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// フォーム用スケルトン
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <Box>
    {Array.from({ length: fields }).map((_, index) => (
      <Box key={index} mb={3}>
        <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
      </Box>
    ))}
    <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
    </Box>
  </Box>
);

export default OptimizedSkeleton;