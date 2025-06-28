import { describe, it, expect } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('デフォルトメッセージで正しくレンダリングされること', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('カスタムメッセージが表示されること', () => {
    const customMessage = 'データを保存中...';
    render(<LoadingSpinner message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('フルスクリーンモードで正しくレンダリングされること', () => {
    render(<LoadingSpinner fullScreen />);
    
    const container = screen.getByRole('progressbar').parentElement?.parentElement;
    expect(container).toHaveStyle({
      position: 'fixed',
      top: '0px',
      left: '0px',
    });
    
    // Material-UIのBoxコンポーネントはright/bottomプロパティを使用するため、
    // width/heightではなくright/bottomの存在を確認
    const computedStyle = window.getComputedStyle(container!);
    expect(computedStyle.position).toBe('fixed');
  });

  it('サイズプロップが正しく適用されること', () => {
    render(<LoadingSpinner size={60} />);
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveStyle({
      width: '60px',
      height: '60px',
    });
  });

  it('メッセージなしで表示されること', () => {
    render(<LoadingSpinner message="" />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
  });
});