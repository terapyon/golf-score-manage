# デプロイメントガイド

このドキュメントでは、ゴルフスコア管理システムのデプロイ手順を説明します。

## 環境構成

| 環境 | プロジェクトID | 用途 | URL |
|------|----------------|------|-----|
| Local | demo-project | ローカル開発（エミュレーター） | http://localhost:3000 |
| Staging | golf-score-manager-staging | テスト・検証環境 | https://golf-score-manager-staging.web.app |
| Production | golf-score-manager-prod | 本番環境 | https://golf-score-manager-prod.web.app |

## 前提条件

1. Firebase CLI がインストール済み
2. Firebase プロジェクトが作成済み
3. 必要な権限でFirebaseにログイン済み

```bash
firebase login
firebase projects:list
```

## 1. ローカル開発環境

### 1.1 初回セットアップ

```bash
# セットアップスクリプト実行
./scripts/setup-dev.sh

# または手動セットアップ
npm install
cp .env.local.example .env.local
```

### 1.2 開発サーバー起動

```bash
# ターミナル1: Firebase エミュレーター起動
npm run emulators

# ターミナル2: 開発サーバー起動
npm run dev

# サンプルデータ投入（必要に応じて）
npm run seed:emulator
```

### 1.3 アクセス先

- **アプリ**: http://localhost:3000
- **Firebase UI**: http://localhost:4000
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099

## 2. ステージング環境

### 2.1 初回セットアップ

```bash
# ステージング用環境変数作成
cp .env.staging.example .env.staging

# Firebase Console から取得した設定値を記入
# vim .env.staging
```

### 2.2 デプロイ

```bash
# ステージング環境にデプロイ
npm run deploy:staging

# または個別にデプロイ
firebase use staging
npm run build:staging
firebase deploy
```

### 2.3 Functions のみデプロイ

```bash
npm run deploy:functions:staging
```

## 3. 本番環境

### 3.1 初回セットアップ

```bash
# 本番用環境変数作成
cp .env.production.example .env.production

# Firebase Console から取得した設定値を記入
# vim .env.production
```

### 3.2 デプロイ

```bash
# 本番環境にデプロイ
npm run deploy:production

# または個別にデプロイ
firebase use production
npm run build:production
firebase deploy
```

### 3.3 本番デプロイ前のチェックリスト

- [ ] ステージング環境でのテスト完了
- [ ] Firestore セキュリティルールの確認
- [ ] 環境変数の設定確認
- [ ] パフォーマンステスト実施
- [ ] バックアップの確認

## 4. 環境変数の設定

### 4.1 必須環境変数

各環境で以下の環境変数を設定してください：

```env
# Firebase 設定（Firebase Console から取得）
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# 環境設定
VITE_FIREBASE_USE_EMULATOR=false  # ローカルのみtrue
VITE_ENVIRONMENT=production       # local/staging/production
VITE_APP_DEBUG=false             # ローカルのみtrue
VITE_APP_LOG_LEVEL=error         # debug/info/warn/error
```

### 4.2 Firebase Console での設定

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 対象プロジェクトを選択
3. 「プロジェクトの設定」→「全般」タブ
4. 「アプリ」セクションでWeb アプリの設定をコピー

## 5. データベース設定

### 5.1 Firestore セキュリティルール

本番環境では以下のルールを適用：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /rounds/{roundId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    match /userStats/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // コース情報は認証済みユーザーが読み取り可能
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if false; // 管理者のみ（Functions経由）
    }
  }
}
```

### 5.2 データベースインデックス

必要なインデックス（`firestore.indexes.json`）：

```json
{
  "indexes": [
    {
      "collectionGroup": "rounds",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "playDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "rounds",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "courseId", "order": "ASCENDING" },
        { "fieldPath": "playDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## 6. 監視・ログ

### 6.1 Firebase Performance Monitoring

```javascript
// 本番環境でのみ有効
import { getPerformance } from 'firebase/performance';

if (process.env.NODE_ENV === 'production') {
  const perf = getPerformance(app);
}
```

### 6.2 エラー監視

コンソールエラーの監視：

```javascript
// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // TODO: エラーレポーティングサービスへ送信
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // TODO: エラーレポーティングサービスへ送信
});
```

## 7. バックアップ・復旧

### 7.1 Firestore バックアップ

```bash
# 本番データのエクスポート
gcloud firestore export gs://golf-score-manager-prod-backup/$(date +%Y%m%d)

# ステージング環境でのインポート
gcloud firestore import gs://golf-score-manager-prod-backup/20231128
```

### 7.2 エミュレーターデータのバックアップ

```bash
# エミュレーターデータのエクスポート
npm run backup:emulator

# エミュレーターデータの復元
npm run restore:emulator
```

## 8. トラブルシューティング

### 8.1 デプロイエラー

**Error: HTTP Error: 403, The caller does not have permission**
```bash
# 権限確認とログイン
firebase login --reauth
firebase projects:list
```

**Build エラー**
```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install

# TypeScript エラーチェック
npm run typecheck
```

### 8.2 Firebase エラー

**Emulator connection failed**
```bash
# エミュレーター再起動
firebase emulators:kill
npm run emulators
```

**Functions deployment timeout**
```bash
# Functions のメモリ・タイムアウト設定確認
# firebase.json の functions 設定を調整
```

## 9. CI/CD パイプライン（GitHub Actions）

### 9.1 ワークフロー例

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build (Staging)
        if: github.ref == 'refs/heads/develop'
        run: npm run build:staging
      
      - name: Build (Production)
        if: github.ref == 'refs/heads/main'
        run: npm run build:production
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
```

## 10. セキュリティ考慮事項

### 10.1 環境変数の管理

- `.env.*` ファイルは Git にコミットしない
- 機密情報は Firebase Functions の環境変数に設定
- API キーの適切な制限設定

### 10.2 Firestore セキュリティ

- 本番環境では厳格なセキュリティルールを適用
- ユーザーデータの適切な分離
- 管理機能は Firebase Functions 経由のみ

### 10.3 HTTPS / CORS

- 本番環境では HTTPS 必須
- 適切な CORS 設定
- CSP（Content Security Policy）の設定

## 11. 定期メンテナンス

### 11.1 依存関係の更新

```bash
# 毎月実行
npm outdated
npm update
npm audit fix
```

### 11.2 Firebase SDK の更新

```bash
# 四半期ごとに実行
npm install firebase@latest
```

### 11.3 監視項目

- Firebase 使用量・課金状況
- パフォーマンス指標
- エラー発生率
- ユーザーアクティビティ