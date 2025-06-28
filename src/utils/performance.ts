// パフォーマンス監視ユーティリティ

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface NavigationTiming {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, any> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.initializeObservers();
  }

  // パフォーマンス監視の開始
  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Navigation Timing の監視
    this.observeNavigationTiming();

    // Core Web Vitals の監視
    this.observeWebVitals();

    // Long Tasks の監視
    this.observeLongTasks();

    // Memory Usage の監視
    this.observeMemoryUsage();
  }

  // Navigation Timing の測定
  private observeNavigationTiming() {
    if (typeof window === 'undefined' || !window.performance) return;

    const observer = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!navigation) return;

      const timing: NavigationTiming = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: 0,
        firstContentfulPaint: 0,
      };

      // Paint Timing
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-paint') {
          timing.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          timing.firstContentfulPaint = entry.startTime;
        }
      });

      this.recordMetric('navigation-timing', timing.domContentLoaded, { timing });
    };

    // DOM読み込み完了後に実行
    if (document.readyState === 'complete') {
      observer();
    } else {
      window.addEventListener('load', observer);
    }
  }

  // Core Web Vitals の監視
  private observeWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('largest-contentful-paint', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const fid = (entry as any).processingStart - entry.startTime;
          this.recordMetric('first-input-delay', fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.recordMetric('cumulative-layout-shift', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }

  // Long Tasks の監視
  private observeLongTasks() {
    if (typeof window === 'undefined') return;

    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric('long-task', entry.duration, {
            startTime: entry.startTime,
            attribution: (entry as any).attribution,
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', longTaskObserver);
    } catch (e) {
      console.warn('Long task observer not supported');
    }
  }

  // メモリ使用量の監視
  private observeMemoryUsage() {
    if (typeof window === 'undefined' || !(performance as any).memory) return;

    const recordMemory = () => {
      const memory = (performance as any).memory;
      this.recordMetric('memory-usage', memory.usedJSHeapSize, {
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      });
    };

    // 定期的にメモリ使用量を記録
    const interval = setInterval(recordMemory, 30000); // 30秒ごと
    this.observers.set('memory', { disconnect: () => clearInterval(interval) });
  }

  // メトリクスの記録
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // 開発環境でのログ出力
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${name} = ${value}ms`, metadata);
    }

    // メトリクスの制限（メモリリーク防止）
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  // カスタムメトリクスの測定
  measureFunction<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const duration = performance.now() - startTime;
    this.recordMetric(`function-${name}`, duration);
    return result;
  }

  // 非同期関数の測定
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    const duration = performance.now() - startTime;
    this.recordMetric(`async-function-${name}`, duration);
    return result;
  }

  // React コンポーネントのレンダリング時間測定
  measureRender(componentName: string, renderFn: () => void) {
    return this.measureFunction(`render-${componentName}`, renderFn);
  }

  // API リクエストの測定
  measureApiRequest(endpoint: string, requestFn: () => Promise<any>) {
    return this.measureAsyncFunction(`api-${endpoint}`, requestFn);
  }

  // メトリクスの取得
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name);
    }
    return [...this.metrics];
  }

  // メトリクスの統計
  getMetricStats(name: string) {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // パーセンタイル計算
    const sorted = values.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p75 = sorted[Math.floor(sorted.length * 0.75)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    return {
      count: metrics.length,
      avg,
      min,
      max,
      p50,
      p75,
      p95,
    };
  }

  // パフォーマンスレポートの生成
  generateReport(): any {
    const report = {
      timestamp: new Date().toISOString(),
      navigation: this.getMetricStats('navigation-timing'),
      webVitals: {
        lcp: this.getMetricStats('largest-contentful-paint'),
        fid: this.getMetricStats('first-input-delay'),
        cls: this.getMetricStats('cumulative-layout-shift'),
      },
      resources: {
        longTasks: this.getMetricStats('long-task'),
        memory: this.getMetricStats('memory-usage'),
      },
      custom: {},
    };

    // カスタムメトリクス
    const customMetrics = this.metrics
      .filter(m => m.name.startsWith('function-') || m.name.startsWith('api-'))
      .reduce((acc, metric) => {
        if (!acc[metric.name]) {
          acc[metric.name] = this.getMetricStats(metric.name);
        }
        return acc;
      }, {} as Record<string, any>);

    report.custom = customMetrics;
    return report;
  }

  // メトリクスのクリア
  clearMetrics() {
    this.metrics = [];
  }

  // 監視の停止
  disconnect() {
    this.observers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    this.observers.clear();
    this.isEnabled = false;
  }

  // 監視の再開
  reconnect() {
    this.isEnabled = true;
    this.initializeObservers();
  }
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor();

// React Hook
export function usePerformanceMonitor() {
  const measureRender = (componentName: string) => {
    return (fn: () => void) => performanceMonitor.measureRender(componentName, fn);
  };

  const measureApi = (endpoint: string) => {
    return (fn: () => Promise<any>) => performanceMonitor.measureApiRequest(endpoint, fn);
  };

  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsyncFunction: performanceMonitor.measureAsyncFunction.bind(performanceMonitor),
    measureRender,
    measureApi,
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getStats: performanceMonitor.getMetricStats.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
  };
}

// HOC: パフォーマンス測定
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;

  return React.memo((props: P) => {
    return performanceMonitor.measureRender(displayName, () => (
      <WrappedComponent {...props} />
    ));
  });
}

export default performanceMonitor;