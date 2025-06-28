import { useCallback, useEffect, useRef } from 'react';

// キーボードナビゲーション用のフック
export function useKeyboardNavigation() {
  const elementRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, target } = event;
    const element = target as HTMLElement;

    // Tabキーでのフォーカス管理
    if (key === 'Tab') {
      // フォーカス可能な要素を取得
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Shift+Tabで最初の要素にフォーカスがある場合、最後の要素に移動
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tabで最後の要素にフォーカスがある場合、最初の要素に移動
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    // Escapeキーでモーダルやダイアログを閉じる
    if (key === 'Escape') {
      const closeButton = element.querySelector('[aria-label="閉じる"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }

    // Enterキーとスペースキーでボタンを実行
    if ((key === 'Enter' || key === ' ') && element.getAttribute('role') === 'button') {
      event.preventDefault();
      element.click();
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return elementRef;
}

// フォーカス管理用のフック
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // フォーカスをトラップする
  const trapFocus = useCallback((container: HTMLElement) => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, []);

  // フォーカスを復元する
  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return { trapFocus, restoreFocus };
}

// スクリーンリーダー用のアナウンス
export function useScreenReaderAnnouncement() {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // スクリーンリーダー用のライブリージョンを作成
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcementRef.current = announcement;

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      // 内容をクリアして再度読み上げられるようにする
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return announce;
}

// 色のコントラスト比を計算
export function calculateContrastRatio(color1: string, color2: string): number {
  // RGB値を取得する簡易的な関数（実際にはより複雑な計算が必要）
  const getLuminance = (color: string): number => {
    // この実装は簡略化されています
    // 実際のプロダクションでは、適切な色変換ライブラリを使用してください
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(Number);
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (lightest + 0.05) / (darkest + 0.05);
}

// アクセシビリティガイドライン準拠チェック
export function useAccessibilityCheck() {
  const checkColorContrast = useCallback((foreground: string, background: string): boolean => {
    const ratio = calculateContrastRatio(foreground, background);
    return ratio >= 4.5; // WCAG AA 準拠の最小比率
  }, []);

  const checkTextSize = useCallback((fontSize: number): boolean => {
    return fontSize >= 14; // 最小推奨フォントサイズ
  }, []);

  const checkTouchTargetSize = useCallback((width: number, height: number): boolean => {
    return width >= 44 && height >= 44; // 最小推奨タッチターゲットサイズ（px）
  }, []);

  return {
    checkColorContrast,
    checkTextSize,
    checkTouchTargetSize,
  };
}

// 動的なaria-label生成
export function useAriaLabel() {
  const generateRoundCardLabel = useCallback((round: any): string => {
    return `${round.courseName}でのラウンド、日付: ${round.playDate}、スコア: ${round.totalScore}、パー: ${round.totalPar}`;
  }, []);

  const generateScoreLabel = useCallback((score: number, par: number): string => {
    const diff = score - par;
    let diffText = '';
    
    if (diff < 0) {
      diffText = `パーより${Math.abs(diff)}打少ない`;
    } else if (diff > 0) {
      diffText = `パーより${diff}打多い`;
    } else {
      diffText = 'パー';
    }
    
    return `スコア: ${score}、${diffText}`;
  }, []);

  const generateStatsLabel = useCallback((title: string, value: any, subtitle?: string): string => {
    return `${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`;
  }, []);

  return {
    generateRoundCardLabel,
    generateScoreLabel,
    generateStatsLabel,
  };
}

export default {
  useKeyboardNavigation,
  useFocusManagement,
  useScreenReaderAnnouncement,
  useAccessibilityCheck,
  useAriaLabel,
};