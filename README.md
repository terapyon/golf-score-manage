# ゴルフスコア管理システム

ゴルフのスコア履歴を管理・分析するWebアプリケーションです。

## 📋 機能概要

- **認証機能**: メール/パスワード・Google OAuth ログイン
- **ラウンド記録**: 18ホールの詳細スコア入力・管理
- **スコア分析**: 統計情報・トレンド表示
- **プロフィール管理**: ユーザー設定・ハンディキャップ管理
- **レスポンシブ対応**: PC・タブレット・スマートフォン対応

## 🚀 クイックスタート

### 1. 前提条件

- Node.js 18以上
- npm または yarn
- Firebase CLI

### 2. セットアップ

```bash
# リポジトリクローン
git clone <repository-url>
cd golf-score-manager

# 自動セットアップ（推奨）
./scripts/setup-dev.sh

# または手動セットアップ
npm install
cp .env.local.example .env.local
```

### 3. 開発サーバー起動

```bash
# ターミナル1: Firebase エミュレーター起動
npm run emulators

# ターミナル2: 開発サーバー起動  
npm run dev

# ブラウザで http://localhost:3000 にアクセス
```

### 4. サンプルデータ投入

```bash
npm run seed:emulator
```

## 🛠️ 技術スタック

### フロントエンド

- **React 18** + **TypeScript**: モダンなUI開発
- **Vite**: 高速な開発・ビルドツール
- **Material-UI v5**: UIコンポーネントライブラリ
- **React Hook Form** + **Zod**: フォーム管理・バリデーション
- **React Query (TanStack Query)**: サーバー状態管理
- **Zustand**: クライアント状態管理
- **React Router v6**: ルーティング

### バックエンド

- **Firebase**: 
  - Authentication: ユーザー認証
  - Firestore: NoSQLデータベース
  - Functions: サーバーレス関数
  - Storage: ファイルストレージ
  - Hosting: Webホスティング

### 開発ツール

- **ESLint** + **Prettier**: コード品質・フォーマット
- **TypeScript**: 型安全性
- **Vitest**: テストフレームワーク

## 📁 プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── ui/             # 基本UIコンポーネント
│   └── layout/         # レイアウトコンポーネント
├── pages/              # ページコンポーネント
│   ├── auth/           # 認証関連ページ
│   ├── dashboard/      # ダッシュボード
│   ├── rounds/         # ラウンド管理
│   └── profile/        # プロフィール
├── hooks/              # カスタムフック
├── services/           # API・外部サービス連携
├── store/              # 状態管理
├── utils/              # ユーティリティ関数
├── types/              # TypeScript型定義
└── constants/          # 定数定義

docs/                   # ドキュメント
scripts/                # スクリプト類
firebase/               # Firebase設定
```

## 🔧 利用可能なコマンド

### 開発

```bash
npm run dev              # 開発サーバー起動
npm run emulators        # Firebase エミュレーター起動
npm run seed:emulator    # サンプルデータ投入
```

### ビルド・デプロイ

```bash
npm run build               # 本番ビルド
npm run build:staging       # ステージング用ビルド
npm run deploy:staging      # ステージング環境デプロイ
npm run deploy:production   # 本番環境デプロイ
```

### 開発支援

```bash
npm run lint             # ESLint実行
npm run lint:fix         # ESLint自動修正
npm run typecheck        # TypeScript型チェック
npm run format           # Prettier実行
npm run test             # テスト実行
npm run test:ui          # テストUI起動
```

### Firebase

```bash
npm run emulators:ui     # エミュレーターUI起動
npm run backup:emulator  # エミュレーターデータバックアップ
npm run restore:emulator # エミュレーターデータ復元
```

## 🌐 環境構成

| 環境 | 用途 | URL |
|------|------|-----|
| Local | ローカル開発 | http://localhost:3000 |
| Staging | テスト環境 | https://golf-score-manager-staging.web.app |
| Production | 本番環境 | https://golf-score-manager-prod.web.app |

## 📚 ドキュメント

- [Firebase セットアップガイド](./docs/FIREBASE_SETUP.md)
- [デプロイメントガイド](./docs/DEPLOYMENT_GUIDE.md)
- [コンポーネント設計](./docs/COMPONENT_DESIGN.md)
- [API仕様](./docs/API_SPECIFICATION.md)

## 🔐 環境変数

### ローカル開発（.env.local）

```env
VITE_FIREBASE_USE_EMULATOR=true
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_ENVIRONMENT=local
```

### ステージング・本番

必要な環境変数については[FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)を参照してください。

## 🧪 テスト

```bash
# 単体テスト実行
npm run test

# テストカバレッジ確認
npm run test:coverage

# E2Eテスト実行
npm run test:e2e
```

## 📊 パフォーマンス

- **Core Web Vitals** 監視対応
- **Code Splitting** による最適化
- **Lazy Loading** 実装
- **Firebase Performance Monitoring** 統合

## 🔒 セキュリティ

- **Firestore Security Rules** による適切なアクセス制御
- **Firebase Authentication** によるユーザー認証
- **HTTPS** 通信の強制
- **CSP** (Content Security Policy) 設定

## 🤝 開発ガイドライン

### コードスタイル

- **ESLint** + **Prettier** の設定に従う
- **TypeScript** の型安全性を重視
- **関数コンポーネント** + **Hooks** を使用

### コミット規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードフォーマット
refactor: リファクタリング
test: テスト追加・修正
```

### ブランチ戦略

- `main`: 本番環境
- `develop`: ステージング環境
- `feature/*`: 機能開発

## 📄 ライセンス

MIT License

## 🙋‍♂️ サポート

質問や問題がある場合は、Issue を作成してください。

---

**Happy Golfing! ⛳️**