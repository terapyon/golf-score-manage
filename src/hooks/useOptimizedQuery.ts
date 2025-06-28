import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCallback } from 'react';

// 最適化されたクエリフック
export function useOptimizedQuery<TData, TError = Error>(
  options: UseQueryOptions<TData, TError>
) {
  const queryClient = useQueryClient();

  // プリフェッチ機能
  const prefetch = useCallback(
    (prefetchOptions?: Partial<UseQueryOptions<TData, TError>>) => {
      if (options.queryKey) {
        queryClient.prefetchQuery({
          ...options,
          ...prefetchOptions,
        });
      }
    },
    [queryClient, options]
  );

  // キャッシュ無効化
  const invalidate = useCallback(() => {
    if (options.queryKey) {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    }
  }, [queryClient, options.queryKey]);

  // 手動リフェッチ
  const refetchOptimized = useCallback(() => {
    if (options.queryKey) {
      return queryClient.refetchQueries({ queryKey: options.queryKey });
    }
  }, [queryClient, options.queryKey]);

  const query = useQuery({
    ...options,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // デフォルト5分
    gcTime: options.gcTime ?? 10 * 60 * 1000, // デフォルト10分
    retry: options.retry ?? 2, // デフォルト2回リトライ
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    ...query,
    prefetch,
    invalidate,
    refetchOptimized,
  };
}

// Rounds用の最適化されたフック
export function useOptimizedRoundsQuery(userId: string, filters: any) {
  return useOptimizedQuery({
    queryKey: ['rounds', userId, filters],
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3分
    select: (data: any) => {
      // データ変換の最適化
      if (!data) return data;
      
      return {
        ...data,
        items: data.items?.map((round: any) => ({
          ...round,
          // 計算済みフィールドをキャッシュ
          scoreDiff: round.totalScore - round.totalPar,
          isUnderPar: round.totalScore < round.totalPar,
        })),
      };
    },
  });
}

// Stats用の最適化されたフック
export function useOptimizedStatsQuery(userId: string) {
  return useOptimizedQuery({
    queryKey: ['userStats', userId],
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10分（統計データは頻繁に変わらない）
    select: (data: any) => {
      if (!data) return data;
      
      return {
        ...data,
        // 統計計算の最適化
        averageScoreRounded: data.averageScore ? Math.round(data.averageScore * 10) / 10 : 0,
        improvementTrend: data.last5Rounds?.improvement || 0,
        isImproving: (data.last5Rounds?.improvement || 0) < 0,
      };
    },
  });
}