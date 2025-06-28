# フロントエンド詳細設計書

## 1. 技術スタック詳細

### Core Technologies
- **React 18.x** with TypeScript
- **Material-UI (MUI) v5** - コンポーネントライブラリ
- **React Router v6** - SPA ルーティング
- **React Hook Form** - フォーム管理
- **React Query (TanStack Query)** - サーバーステート管理
- **Zustand** - クライアントサイドステート管理

### Build & Development Tools
- **Vite** - 開発サーバー・ビルドツール
- **ESLint + Prettier** - コード品質管理
- **TypeScript 5.x** - 型安全性

## 2. アプリケーション構成

### ディレクトリ構造
```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── ui/             # 基本UIコンポーネント
│   ├── forms/          # フォームコンポーネント
│   └── layout/         # レイアウトコンポーネント
├── pages/              # ページコンポーネント
│   ├── auth/           # 認証関連ページ
│   ├── dashboard/      # ダッシュボード
│   ├── rounds/         # ラウンド管理
│   └── profile/        # プロフィール
├── hooks/              # カスタムフック
├── services/           # API通信・Firebase連携
├── store/              # グローバルステート
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
└── constants/          # 定数定義
```

## 3. 画面設計詳細

### 3.1 認証画面
- **ログイン画面** (`/login`)
  - Email/Password フォーム
  - Google OAuth ボタン
  - 新規登録リンク
- **新規登録画面** (`/register`)
  - Email/Password/名前/ハンディキャップ 入力
  - 利用規約同意チェックボックス

### 3.2 メイン画面レイアウト
- **ヘッダー**: ナビゲーション、ユーザーメニュー
- **サイドバー**: メイン機能へのリンク（モバイルではドロワー）
- **メインコンテンツ**: 各ページの内容

### 3.3 ダッシュボード (`/dashboard`)
- **サマリーカード**
  - 今月の平均スコア
  - 直近5ラウンドの平均
  - 総ラウンド数
- **直近ラウンド一覧** (最新5件)
- **スコア推移グラフ** (Chart.js使用)

### 3.4 ラウンド管理
- **ラウンド一覧** (`/rounds`)
  - テーブル表示 (日付、ゴルフ場、スコア、同伴者)
  - フィルター機能 (期間、ゴルフ場)
  - ページネーション
- **ラウンド詳細** (`/rounds/:id`)
  - ホール別スコア表示
  - 同伴者情報
  - 編集・削除ボタン
- **ラウンド入力/編集** (`/rounds/new`, `/rounds/:id/edit`)
  - ステップ形式フォーム
    1. 基本情報 (日付、ゴルフ場、スタート時間)
    2. 同伴者選択
    3. スコア入力 (18ホール分)

### 3.5 プロフィール (`/profile`)
- ユーザー情報編集
- ハンディキャップ履歴
- アカウント設定

## 4. コンポーネント設計

### 4.1 共通コンポーネント

#### Layout Components
```typescript
// AppLayout.tsx - メインレイアウト
interface AppLayoutProps {
  children: React.ReactNode;
}

// Header.tsx - ヘッダー
interface HeaderProps {
  user: User;
  onLogout: () => void;
}

// Sidebar.tsx - サイドバー
interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}
```

#### UI Components
```typescript
// ScoreCard.tsx - スコア表示カード
interface ScoreCardProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

// RoundTable.tsx - ラウンド一覧テーブル
interface RoundTableProps {
  rounds: Round[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// ScoreInput.tsx - スコア入力コンポーネント
interface ScoreInputProps {
  holeNumber: number;
  par: number;
  value: number;
  onChange: (value: number) => void;
}
```

### 4.2 フォームコンポーネント

#### RoundForm.tsx
```typescript
interface RoundFormProps {
  initialData?: Partial<Round>;
  onSubmit: (data: RoundFormData) => void;
  loading?: boolean;
}

interface RoundFormData {
  playDate: string;
  courseId: string;
  startTime: string;
  participants: ParticipantData[];
  scores: ScoreData[];
}
```

## 5. 状態管理設計

### 5.1 グローバルステート (Zustand)
```typescript
interface AppStore {
  // 認証状態
  user: User | null;
  isAuthenticated: boolean;
  
  // UI状態
  sidebarOpen: boolean;
  loading: boolean;
  
  // アクション
  setUser: (user: User | null) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
}
```

### 5.2 サーバーステート (React Query)
```typescript
// ラウンドデータ
const useRounds = (filters?: RoundFilters) => {
  return useQuery({
    queryKey: ['rounds', filters],
    queryFn: () => fetchRounds(filters)
  });
};

// 統計データ
const useStats = (period: string) => {
  return useQuery({
    queryKey: ['stats', period],
    queryFn: () => fetchStats(period)
  });
};
```

## 6. ルーティング設計

```typescript
// Router.tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "rounds", element: <RoundsList /> },
      { path: "rounds/new", element: <RoundForm /> },
      { path: "rounds/:id", element: <RoundDetail /> },
      { path: "rounds/:id/edit", element: <RoundForm /> },
      { path: "profile", element: <Profile /> },
    ]
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);
```

## 7. バリデーション設計

### フォームバリデーション (React Hook Form + Zod)
```typescript
// schemas/roundSchema.ts
const roundSchema = z.object({
  playDate: z.string().min(1, "プレイ日を選択してください"),
  courseId: z.string().min(1, "ゴルフ場を選択してください"),
  scores: z.array(z.object({
    holeNumber: z.number().min(1).max(18),
    strokes: z.number().min(1).max(15)
  })).length(18, "18ホール分のスコアを入力してください")
});
```

## 8. エラーハンドリング

### エラー境界
```typescript
// ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  // React Error Boundary実装
}

// ErrorFallback.tsx
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}
```

### APIエラーハンドリング
```typescript
// React Query エラーハンドリング
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        // グローバルエラーハンドリング
        toast.error(getErrorMessage(error));
      }
    }
  }
});
```

## 9. パフォーマンス最適化

### Code Splitting
```typescript
// 画面ごとの遅延読み込み
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RoundsList = lazy(() => import('./pages/RoundsList'));
```

### Memo化
```typescript
// 重いコンポーネントのメモ化
const ScoreChart = React.memo(ScoreChartComponent);
const RoundTable = React.memo(RoundTableComponent);
```

## 10. レスポンシブデザイン

### ブレークポイント
- **Mobile**: 0-599px
- **Tablet**: 600-959px  
- **Desktop**: 960px+

### Material-UI Theme設定
```typescript
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});
```