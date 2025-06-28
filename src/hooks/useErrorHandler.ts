import { useCallback } from 'react';
import { useUIStore } from '../store/uiStore';

// エラーの種類
export interface AppError {
  code?: string;
  message: string;
  details?: any;
  retryable?: boolean;
}

// Firebase エラーコードのマッピング
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'auth/user-not-found': 'ユーザーが見つかりません',
  'auth/wrong-password': 'パスワードが正しくありません',
  'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
  'auth/weak-password': 'パスワードが弱すぎます',
  'auth/invalid-email': 'メールアドレスの形式が正しくありません',
  'auth/user-disabled': 'このアカウントは無効化されています',
  'auth/too-many-requests': 'リクエストが多すぎます。しばらく待ってから再試行してください',
  'auth/network-request-failed': 'ネットワークエラーが発生しました',
  'auth/popup-closed-by-user': 'ログインがキャンセルされました',
  'auth/popup-blocked': 'ポップアップがブロックされました',

  // Firestore errors
  'permission-denied': 'アクセス権限がありません',
  'not-found': 'データが見つかりません',
  'already-exists': 'データが既に存在しています',
  'resource-exhausted': 'リクエスト制限に達しました',
  'failed-precondition': '操作の前提条件が満たされていません',
  'aborted': '操作が中断されました',
  'out-of-range': '値が範囲外です',
  'unimplemented': 'この機能は実装されていません',
  'internal': 'サーバー内部エラーが発生しました',
  'unavailable': 'サービスが一時的に利用できません',
  'data-loss': 'データの損失が発生しました',
  'unauthenticated': '認証が必要です',

  // Network errors
  'network-error': 'ネットワークエラーが発生しました',
  'timeout': 'リクエストがタイムアウトしました',
  'connection-failed': '接続に失敗しました',
};

// リトライ可能なエラー
const RETRYABLE_ERRORS = [
  'unavailable',
  'internal',
  'network-error',
  'timeout',
  'connection-failed',
  'resource-exhausted',
];

export function useErrorHandler() {
  const { showToast } = useUIStore();

  // エラーメッセージの取得
  const getErrorMessage = useCallback((error: any): string => {
    if (!error) return '不明なエラーが発生しました';

    // Firebase エラーの場合
    if (error.code && FIREBASE_ERROR_MESSAGES[error.code]) {
      return FIREBASE_ERROR_MESSAGES[error.code];
    }

    // カスタムエラーメッセージ
    if (error.message) {
      return error.message;
    }

    // HTTP ステータスコード
    if (error.status) {
      switch (error.status) {
        case 400:
          return 'リクエストが正しくありません';
        case 401:
          return '認証が必要です';
        case 403:
          return 'アクセス権限がありません';
        case 404:
          return 'データが見つかりません';
        case 429:
          return 'リクエスト制限に達しました。しばらく待ってから再試行してください';
        case 500:
          return 'サーバーエラーが発生しました';
        case 503:
          return 'サービスが一時的に利用できません';
        default:
          return `エラーが発生しました (${error.status})`;
      }
    }

    return '不明なエラーが発生しました';
  }, []);

  // エラーのリトライ可能性を判定
  const isRetryable = useCallback((error: any): boolean => {
    if (!error) return false;

    // Firebase エラーの場合
    if (error.code) {
      return RETRYABLE_ERRORS.includes(error.code);
    }

    // HTTP ステータスコード
    if (error.status) {
      return error.status >= 500 || error.status === 429;
    }

    return false;
  }, []);

  // エラーハンドリング
  const handleError = useCallback((
    error: any,
    options: {
      silent?: boolean;
      customMessage?: string;
      showRetry?: boolean;
      onRetry?: () => void;
    } = {}
  ) => {
    const { silent = false, customMessage, showRetry = false, onRetry } = options;

    console.error('Application Error:', error);

    if (silent) return;

    const message = customMessage || getErrorMessage(error);
    const retryable = isRetryable(error);

    // エラー詳細をコンソールに出力（開発環境）
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Details');
      console.error('Error object:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Is retryable:', retryable);
      console.groupEnd();
    }

    // トーストでエラー表示
    showToast(
      message,
      'error',
      {
        autoHideDuration: retryable ? 6000 : 4000,
        action: showRetry && retryable && onRetry ? {
          label: '再試行',
          onClick: onRetry,
        } : undefined,
      }
    );

    // エラーレポーティング（本番環境）
    if (process.env.NODE_ENV === 'production') {
      // TODO: エラーレポーティングサービス（Sentry等）への送信
      // reportError(error);
    }
  }, [getErrorMessage, isRetryable, showToast]);

  // 非同期エラーハンドリング
  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    options: {
      silent?: boolean;
      customMessage?: string;
      showRetry?: boolean;
      maxRetries?: number;
    } = {}
  ) => {
    const { maxRetries = 0, ...restOptions } = options;
    let lastError: any;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        return await asyncFn();
      } catch (error) {
        lastError = error;
        
        if (retryCount < maxRetries && isRetryable(error)) {
          retryCount++;
          // 指数バックオフ
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        break;
      }
    }

    handleError(lastError, restOptions);
    throw lastError;
  }, [handleError, isRetryable]);

  // 成功メッセージ表示
  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  // 警告メッセージ表示
  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  // 情報メッセージ表示
  const showInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  return {
    handleError,
    handleAsyncError,
    getErrorMessage,
    isRetryable,
    showSuccess,
    showWarning,
    showInfo,
  };
}