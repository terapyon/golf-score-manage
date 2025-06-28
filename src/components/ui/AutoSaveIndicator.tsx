import React, { useEffect, useState } from 'react';
import { Box, Chip, Fade, Typography } from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  message?: string;
}

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  showTimestamp?: boolean;
  position?: 'fixed' | 'relative';
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  showTimestamp = true,
  position = 'fixed',
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status.status !== 'idle') {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getStatusConfig = () => {
    switch (status.status) {
      case 'saving':
        return {
          icon: <SyncIcon className="animate-spin" />,
          label: '保存中...',
          color: 'info' as const,
        };
      case 'saved':
        return {
          icon: <CheckIcon />,
          label: '保存済み',
          color: 'success' as const,
        };
      case 'error':
        return {
          icon: <ErrorIcon />,
          label: status.message || '保存エラー',
          color: 'error' as const,
        };
      default:
        return {
          icon: <SaveIcon />,
          label: '',
          color: 'default' as const,
        };
    }
  };

  const config = getStatusConfig();

  if (status.status === 'idle' && !visible) {
    return null;
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <Fade in={visible}>
      <Box
        sx={{
          position,
          ...(position === 'fixed' && {
            top: 16,
            right: 16,
            zIndex: 1000,
          }),
        }}
      >
        <Chip
          icon={config.icon}
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">{config.label}</Typography>
              {showTimestamp && status.lastSaved && status.status === 'saved' && (
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(status.lastSaved)}
                </Typography>
              )}
            </Box>
          }
          color={config.color}
          variant={status.status === 'saving' ? 'filled' : 'outlined'}
          size="small"
        />
      </Box>
    </Fade>
  );
};

// 自動保存フック
export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  options: {
    delay?: number;
    enabled?: boolean;
    onSave?: () => void;
    onError?: (error: any) => void;
  } = {}
) {
  const { delay = 2000, enabled = true, onSave, onError } = options;
  const [status, setStatus] = useState<AutoSaveStatus>({ status: 'idle' });
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 既存のタイマーをクリア
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // 新しいタイマーを設定
    const timer = setTimeout(async () => {
      try {
        setStatus({ status: 'saving' });
        await saveFn(data);
        setStatus({
          status: 'saved',
          lastSaved: new Date(),
        });
        onSave?.();
      } catch (error) {
        setStatus({
          status: 'error',
          message: error instanceof Error ? error.message : '保存に失敗しました',
        });
        onError?.(error);
      }
    }, delay);

    setSaveTimeout(timer);

    return () => {
      clearTimeout(timer);
    };
  }, [data, delay, enabled, saveFn, onSave, onError]);

  // 手動保存
  const saveNow = async () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }

    try {
      setStatus({ status: 'saving' });
      await saveFn(data);
      setStatus({
        status: 'saved',
        lastSaved: new Date(),
      });
      onSave?.();
    } catch (error) {
      setStatus({
        status: 'error',
        message: error instanceof Error ? error.message : '保存に失敗しました',
      });
      onError?.(error);
    }
  };

  return {
    status,
    saveNow,
  };
}

export default AutoSaveIndicator;