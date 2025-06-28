# Firebase プロジェクトセットアップガイド

このドキュメントでは、ゴルフスコア管理システムのためのFirebaseプロジェクトの作成と設定方法を説明します。

## 概要

3つの環境を構築します：
- **ローカル開発環境**: Firebase Emulator を使用
- **ステージング環境**: Firebase プロジェクト（テスト用）
- **本番環境**: Firebase プロジェクト（プロダクション用）

## 前提条件

1. Google アカウント
2. Node.js (v18以上)
3. Firebase CLI のインストール

```bash
npm install -g firebase-tools
```

## 1. Firebase Console でのプロジェクト作成

### 1.1 本番用プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力：`golf-score-manager-prod`
4. Google Analytics を有効にする（推奨）
5. Analytics アカウントを選択または新規作成
6. 「プロジェクトを作成」をクリック

### 1.2 ステージング用プロジェクトの作成

1. 同様に新しいプロジェクトを作成
2. プロジェクト名：`golf-score-manager-staging`
3. 同じ手順で作成

## 2. Firebase サービスの有効化

各プロジェクト（本番・ステージング）で以下を設定：

### 2.1 Authentication の設定

1. 左サイドバーから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 以下のプロバイダーを有効化：
   - **メール/パスワード**: 有効にする
   - **Google**: 有効にして、サポートメールを設定

### 2.2 Firestore Database の設定

1. 左サイドバーから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. セキュリティルールの設定：
   - 開発中は「テストモードで開始」を選択
   - 本番稼働前に適切なルールに変更
4. ロケーションを選択：`asia-northeast1`（東京）

### 2.3 Storage の設定

1. 左サイドバーから「Storage」を選択
2. 「始める」をクリック
3. セキュリティルールはデフォルトのまま
4. ロケーション：`asia-northeast1`

### 2.4 Hosting の設定

1. 左サイドバーから「Hosting」を選択
2. 「始める」をクリック
3. Firebase CLI の指示に従う（後で実行）

## 3. Web アプリの追加

各プロジェクトで以下を実行：

1. プロジェクト概要ページで「アプリを追加」をクリック
2. Web アイコン（`</>`）を選択
3. アプリの登録：
   - **本番用**: アプリ名 `Golf Score Manager (Production)`
   - **ステージング用**: アプリ名 `Golf Score Manager (Staging)`
4. Firebase Hosting は後で設定するのでチェックしない
5. 「アプリを登録」をクリック
6. **設定オブジェクトをコピーして保存**（重要！）

### 設定例（実際の値は異なります）:

```javascript
// 本番用設定例
const firebaseConfigProd = {
  apiKey: "AIzaSyB...",
  authDomain: "golf-score-manager-prod.firebaseapp.com",
  projectId: "golf-score-manager-prod",
  storageBucket: "golf-score-manager-prod.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
  measurementId: "G-ABCDEFGHIJ"
};

// ステージング用設定例
const firebaseConfigStaging = {
  apiKey: "AIzaSyC...",
  authDomain: "golf-score-manager-staging.firebaseapp.com",
  projectId: "golf-score-manager-staging",
  storageBucket: "golf-score-manager-staging.appspot.com",
  messagingSenderId: "987654321",
  appId: "1:987654321:web:def456abc123",
  measurementId: "G-KLMNOPQRST"
};
```

## 4. Firebase CLI での認証

```bash
# Firebase にログイン
firebase login

# プロジェクトの確認
firebase projects:list
```

## 5. プロジェクトの初期化

アプリのルートディレクトリで以下を実行：

```bash
# Firebase プロジェクトの初期化
firebase init

# 以下のサービスを選択（スペースキーで選択）:
# - Firestore
# - Functions
# - Hosting
# - Storage
# - Emulators

# プロジェクト選択時は本番用プロジェクトを選択
# - Use an existing project: golf-score-manager-prod
```

### 初期化時の設定

1. **Firestore**:
   - Rules file: `firestore.rules` (デフォルト)
   - Indexes file: `firestore.indexes.json` (デフォルト)

2. **Functions**:
   - Language: `TypeScript`
   - ESLint: `Yes`
   - Install dependencies: `Yes`

3. **Hosting**:
   - Public directory: `dist`
   - Single page app: `Yes`
   - GitHub auto builds: `No`

4. **Storage**:
   - Rules file: `storage.rules` (デフォルト)

5. **Emulators**:
   - Select emulators:
     - Authentication Emulator
     - Functions Emulator
     - Firestore Emulator
     - Storage Emulator
     - Hosting Emulator
   - Ports: デフォルトのまま

## 6. 環境設定ファイルの作成

プロジェクトで以下のファイルを作成：

### 6.1 `.env.local` (ローカル開発用)
```env
VITE_FIREBASE_USE_EMULATOR=true
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:demo
VITE_ENVIRONMENT=local
```

### 6.2 `.env.staging` (ステージング用)
```env
VITE_FIREBASE_USE_EMULATOR=false
VITE_FIREBASE_API_KEY=あなたのステージング用APIキー
VITE_FIREBASE_AUTH_DOMAIN=golf-score-manager-staging.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=golf-score-manager-staging
VITE_FIREBASE_STORAGE_BUCKET=golf-score-manager-staging.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=あなたのステージング用ID
VITE_FIREBASE_APP_ID=あなたのステージング用アプリID
VITE_ENVIRONMENT=staging
```

### 6.3 `.env.production` (本番用)
```env
VITE_FIREBASE_USE_EMULATOR=false
VITE_FIREBASE_API_KEY=あなたの本番用APIキー
VITE_FIREBASE_AUTH_DOMAIN=golf-score-manager-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=golf-score-manager-prod
VITE_FIREBASE_STORAGE_BUCKET=golf-score-manager-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=あなたの本番用ID
VITE_FIREBASE_APP_ID=あなたの本番用アプリID
VITE_ENVIRONMENT=production
```

## 7. Firestore セキュリティルールの設定

`firestore.rules` ファイルを以下のように更新：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /rounds/{roundId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /userStats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // コース情報は認証済みユーザーが読み取り可能
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if false; // 管理者のみ（Functions経由）
    }
  }
}
```

## 8. 初期データの投入

### 8.1 サンプルコースデータ

Firestore に以下のサンプルデータを投入：

```javascript
// courses コレクション
{
  id: "dummy-course-1",
  name: "テストゴルフクラブ",
  nameKana: "てすとごるふくらぶ",
  address: "東京都渋谷区テスト1-1-1",
  prefecture: "東京都",
  city: "渋谷区",
  postalCode: "150-0000",
  phone: "03-0000-0000",
  website: "https://example.com",
  holesCount: 18,
  parTotal: 72,
  yardageTotal: 6500,
  tees: [
    { name: "レディース", color: "red", gender: "women" },
    { name: "レギュラー", color: "white", gender: "unisex" },
    { name: "バック", color: "blue", gender: "men" },
    { name: "チャンピオン", color: "black", gender: "men" }
  ],
  facilities: ["レストラン", "プロショップ", "練習場"],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## 9. テスト手順

### 9.1 ローカル開発環境
```bash
# エミュレーター起動
npm run emulators

# 開発サーバー起動（別ターミナル）
npm run dev
```

### 9.2 ステージング環境
```bash
# ステージング環境でビルド
npm run build:staging

# ステージング環境にデプロイ
npm run deploy:staging
```

### 9.3 本番環境
```bash
# 本番環境でビルド
npm run build:production

# 本番環境にデプロイ
npm run deploy:production
```

## 10. 注意事項

1. **セキュリティ**: 環境変数ファイル（`.env.*`）は Git にコミットしない
2. **API キー**: Firebase のAPIキーは公開情報として扱われるため、Firestore ルールでアクセス制御する
3. **コスト管理**: Firebase の使用量を定期的に監視する
4. **バックアップ**: 本番データの定期バックアップを設定する

## 11. トラブルシューティング

### エミュレーターが起動しない場合
```bash
# ポートを確認
lsof -i :9099 -i :5001 -i :8080 -i :9199

# Firebase CLI を最新版に更新
npm install -g firebase-tools@latest
```

### 認証エラーが発生する場合
```bash
# Firebase に再ログイン
firebase logout
firebase login
```

## 次のステップ

1. 上記手順に従ってFirebaseプロジェクトを作成
2. 環境変数ファイルに実際の設定値を入力
3. エミュレーターでローカル開発を開始
4. ステージング環境でテスト
5. 本番環境にデプロイ