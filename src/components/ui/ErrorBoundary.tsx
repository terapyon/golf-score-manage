import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          p={3}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 400,
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom>
              エラーが発生しました
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              申し訳ございません。予期しないエラーが発生しました。
              ページを再読み込みするか、しばらく時間をおいてから再度お試しください。
            </Typography>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                component="pre"
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                {this.state.error.stack}
              </Box>
            )}

            <Box display="flex" gap={2} justifyContent="center" mt={3}>
              <Button
                variant="outlined"
                onClick={this.handleReset}
              >
                再試行
              </Button>
              <Button
                variant="contained"
                onClick={this.handleReload}
              >
                ページを再読み込み
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;