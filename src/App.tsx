import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <h1>ゴルフスコア管理システム</h1>
        <p>環境セットアップが完了しました。</p>
      </div>
    </ThemeProvider>
  );
}

export default App;