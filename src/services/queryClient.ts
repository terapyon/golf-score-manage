import { QueryClient } from '@tanstack/react-query';

// React Query の設定
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ステイルタイム（データが古いと判定されるまでの時間）
      staleTime: 5 * 60 * 1000, // 5分
      
      // キャッシュタイム（メモリからデータが削除されるまでの時間）
      gcTime: 10 * 60 * 1000, // 10分（旧cacheTime）
      
      // リトライ設定
      retry: (failureCount, error: any) => {
        // 400番台のエラーはリトライしない
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // 3回まで再試行
        return failureCount < 3;
      },
      
      // リトライ間隔
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // リフェッチ設定
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動リフェッチを無効
      refetchOnMount: 'always', // マウント時は常にリフェッチ
      refetchOnReconnect: 'always', // 再接続時は常にリフェッチ
    },
    mutations: {
      // ミューテーションのリトライ設定
      retry: 1,
      
      // ミューテーションのタイムアウト
      networkMode: 'online',
    },
  },
});

// エラーハンドリング
queryClient.setMutationDefaults(['rounds', 'create'], {
  onError: (error) => {
    console.error('Mutation error:', error);
  },
});

queryClient.setQueryDefaults(['rounds'], {
  onError: (error) => {
    console.error('Query error:', error);
  },
});

export default queryClient;