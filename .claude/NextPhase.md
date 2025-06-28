# Phase 1: 基盤構築 - 詳細タスクリスト

## 概要
Firebase連携と基本アプリケーション構造の構築を行う。認証機能の基盤を整備し、ルーティングと状態管理を設定する。

## 優先度と実施順序

### 🔥 高優先度（即座に着手）

#### 1. Firebase基盤整備
**目標**: Firebaseプロジェクトとの接続確立

**タスク詳細**:
- [ ] **1.1 Firebase設定ファイル作成** (30分)
  - `src/services/firebase.ts` - Firebase初期化設定
  - 環境変数からの設定値読み込み
  - Firebase SDK初期化（Auth, Firestore, Functions）

- [ ] **1.2 環境変数設定確認** (15分)
  - `.env.local` の設定値確認
  - Firebase Console からの設定値取得方法をドキュメント化

- [ ] **1.3 接続テスト実装** (20分)
  - Firebaseコンソールとの接続確認
  - 簡単なFirestore読み書きテスト
  - 認証機能の動作確認

#### 2. 認証基盤整備
**目標**: Firebase Authenticationの基本設定

**タスク詳細**:
- [ ] **2.1 認証コンテキスト作成** (45分)
  - `src/contexts/AuthContext.tsx` - 認証状態管理
  - 認証状態の型定義
  - ログイン・ログアウト関数

- [ ] **2.2 認証フック作成** (30分)
  - `src/hooks/useAuth.ts` - 認証状態取得フック
  - 認証ガード用フック
  - 認証状態の永続化

- [ ] **2.3 保護ルート機能** (25分)
  - `src/components/ProtectedRoute.tsx` - 認証ガード
  - 未認証時のリダイレクト処理

#### 3. ルーティング設定
**目標**: React Routerによる画面遷移の基盤構築

**タスク詳細**:
- [ ] **3.1 ルーター設定** (35分)
  - `src/router/index.tsx` - ルーティング定義
  - 認証が必要なルートの設定
  - エラーページ・404ページ

- [ ] **3.2 レイアウト構造** (40分)
  - `src/components/layout/AppLayout.tsx` - メインレイアウト
  - ヘッダー・サイドバー・フッターコンポーネント
  - レスポンシブ対応

### ⚡ 中優先度（基盤完成後）

#### 4. 状態管理設定
**目標**: Zustand + React Queryによる状態管理

**タスク詳細**:
- [ ] **4.1 Zustand ストア作成** (30分)
  - `src/store/authStore.ts` - 認証状態管理
  - `src/store/uiStore.ts` - UI状態管理
  - ストアの型定義

- [ ] **4.2 React Query設定** (25分)
  - `src/services/queryClient.ts` - Query Client設定
  - デフォルトオプション設定
  - エラーハンドリング設定

#### 5. 基本UI コンポーネント
**目標**: 再利用可能なUIコンポーネントの作成

**タスク詳細**:
- [ ] **5.1 共通コンポーネント** (60分)
  - Loading コンポーネント
  - ErrorBoundary コンポーネント
  - Toast 通知コンポーネント

- [ ] **5.2 レイアウトコンポーネント** (45分)
  - Header コンポーネント（ナビゲーション）
  - Sidebar コンポーネント（メニュー）
  - Footer コンポーネント

### 📝 低優先度（余裕があれば）

#### 6. 開発体験向上
**タスク詳細**:
- [ ] **6.1 開発ツール設定** (20分)
  - React DevTools 設定確認
  - Redux DevTools Extension for Zustand

- [ ] **6.2 デバッグ機能** (15分)
  - 開発環境での詳細ログ出力
  - Firebase Emulator の活用

## 完了条件

### Phase 1 完了の判定基準
1. **Firebase接続**: Firebaseプロジェクトに正常に接続できる
2. **認証基盤**: ログイン・ログアウトが動作する
3. **ルーティング**: 認証状態に応じた画面遷移ができる
4. **レイアウト**: 基本的なアプリケーションレイアウトが表示される
5. **開発環境**: `npm run dev` で開発サーバーが正常に起動する

### 動作確認項目
- [ ] Firebase コンソールでプロジェクトが作成されている
- [ ] フロントエンドからFirebaseに接続できる
- [ ] 仮ユーザーでログイン・ログアウトができる
- [ ] 認証状態に応じてページが切り替わる
- [ ] レスポンシブデザインが動作する
- [ ] Lint・Format が正常に動作する

## 推定作業時間
- **合計**: 約 6-8 時間
- **高優先度**: 約 4 時間
- **中優先度**: 約 2-3 時間
- **低優先度**: 約 1 時間

## 次フェーズへの引き継ぎ事項

### Phase 2 (認証機能実装) への準備
1. Firebase Authentication の設定完了
2. 認証コンテキストとフックの動作確認
3. ログイン・登録画面の設計確認

### 技術的負債・改善点の記録
- パフォーマンス最適化が必要な箇所
- セキュリティ面で強化が必要な部分
- UX改善のアイデア

## リスク・注意点

### 技術的リスク
1. **Firebase設定ミス**: 設定値の間違いによる接続エラー
2. **認証フローの複雑化**: 過度に複雑な認証ロジック
3. **ルーティングの競合**: 認証ガードとルーティングの衝突

### 対策
1. **段階的実装**: 小さな単位で動作確認を行う
2. **設定の検証**: Firebase Console での設定確認を徹底
3. **シンプルな設計**: 最初は最小限の機能で動作させる

## 参考資料

### Firebase関連
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth/web/start)

### React関連
- [React Router v6](https://reactrouter.com/en/main)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query v5](https://tanstack.com/query/latest/docs/react/overview)