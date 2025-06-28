# データベース詳細設計書

## 1. Firestore データベース設計

### 1.1 コレクション構造概要
```
golf-score-app (Project)
├── users/              # ユーザー情報
├── courses/            # ゴルフ場マスタ
├── rounds/             # ラウンド記録
├── stats/              # 統計キャッシュ（任意）
└── course_holes/       # ゴルフ場ホール詳細
```

## 2. コレクション詳細設計

### 2.1 users コレクション

#### ドキュメント構造
```typescript
interface User {
  uid: string;                    // Firebase Auth UID (ドキュメントID)
  email: string;                  // メールアドレス
  name: string;                   // 表示名
  handicap: number;               // ハンディキャップ
  avatar?: string;                // プロフィール画像URL
  preferences: {                  // ユーザー設定
    defaultTee: string;           // デフォルトティー
    scoreDisplayMode: 'stroke' | 'net'; // スコア表示モード
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### インデックス
```javascript
// 複合インデックス不要（単一フィールドクエリのみ）
```

#### セキュリティルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 2.2 courses コレクション

#### ドキュメント構造
```typescript
interface Course {
  id: string;                     // ドキュメントID
  name: string;                   // ゴルフ場名
  nameKana: string;               // ひらがな（検索用）
  address: string;                // 住所
  prefecture: string;             // 都道府県
  city: string;                   // 市区町村
  postalCode: string;             // 郵便番号
  phone: string;                  // 電話番号
  website?: string;               // ウェブサイトURL
  holesCount: 18 | 27 | 36;       // ホール数
  parTotal: number;               // 総パー数
  yardageTotal: number;           // 総ヤード数
  tees: CourseTeeName[];          // ティー種類
  rating?: {                      // レーティング
    [teeName: string]: {
      courseRating: number;
      slopeRating: number;
    };
  };
  facilities: string[];           // 施設情報
  isActive: boolean;              // 有効フラグ
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CourseTeeName {
  name: string;                   // ティー名（レギュラー、バック等）
  color: string;                  // ティーカラー
  gender: 'men' | 'women' | 'unisex'; // 対象性別
}
```

#### インデックス
```javascript
// 複合インデックス
prefecture + name         // 都道府県別検索
nameKana                 // ひらがな検索
isActive + prefecture    // アクティブ＋都道府県検索
```

#### セキュリティルール
```javascript
match /courses/{courseId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 2.3 course_holes サブコレクション

#### ドキュメント構造
```typescript
interface CourseHole {
  courseId: string;               // 親コースID
  holeNumber: number;             // ホール番号 (1-18)
  par: 3 | 4 | 5;                // パー数
  handicap: number;               // ハンディキャップ (1-18)
  yardage: {                      // ヤード数（ティー別）
    [teeName: string]: number;
  };
  description?: string;           // ホール説明
  hazards?: string[];             // ハザード情報
}
```

#### コレクションパス
```
courses/{courseId}/holes/{holeNumber}
```

### 2.4 rounds コレクション

#### ドキュメント構造
```typescript
interface Round {
  id: string;                     // ドキュメントID
  userId: string;                 // プレイヤーUID
  courseId: string;               // ゴルフ場ID
  courseName: string;             // ゴルフ場名（非正規化）
  playDate: string;               // プレイ日 (YYYY-MM-DD)
  startTime: string;              // スタート時間 (HH:mm)
  weather?: string;               // 天気
  temperature?: number;           // 気温
  windSpeed?: number;             // 風速
  teeName: string;                // 使用ティー名
  totalScore: number;             // 総スコア
  totalPar: number;               // 総パー
  scores: RoundScore[];           // ホール別スコア
  participants: RoundParticipant[]; // 同伴者
  memo?: string;                  // メモ
  isCompleted: boolean;           // 完了フラグ
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface RoundScore {
  holeNumber: number;             // ホール番号
  par: number;                    // パー数
  strokes: number;                // 打数
  putts?: number;                 // パット数
  fairwayHit?: boolean;          // フェアウェイキープ
  greenInRegulation?: boolean;    // パーオン
  penalties?: number;             // ペナルティ数
}

interface RoundParticipant {
  userId?: string;                // 登録ユーザーのUID
  name: string;                   // 表示名
  type: 'registered' | 'guest';   // 参加者タイプ
  handicap?: number;              // ハンディキャップ
  totalScore?: number;            // スコア（任意）
}
```

#### インデックス
```javascript
// 複合インデックス
userId + playDate desc          // ユーザー別日付順
userId + courseId + playDate   // ユーザー別コース別日付順
userId + isCompleted + playDate // ユーザー別完了状態別日付順
playDate desc                  // 全体日付順（管理者用）
```

#### セキュリティルール
```javascript
match /rounds/{roundId} {
  allow read, write: if request.auth != null && 
    request.auth.uid == resource.data.userId;
  allow read: if request.auth != null && 
    request.auth.uid in resource.data.participants[].userId;
}
```

### 2.5 stats コレクション (集計キャッシュ)

#### ドキュメント構造
```typescript
interface UserStats {
  userId: string;                 // ユーザーUID
  totalRounds: number;            // 総ラウンド数
  averageScore: number;           // 平均スコア
  bestScore: number;              // ベストスコア
  worstScore: number;             // ワーストスコア
  currentHandicap: number;        // 現在のハンディキャップ
  
  // 期間別統計
  last5Rounds: {
    averageScore: number;
    improvement: number;          // 改善度
    dates: string[];              // 対象日付
  };
  last10Rounds: {
    averageScore: number;
    improvement: number;
  };
  thisYear: {
    rounds: number;
    averageScore: number;
  };
  
  // コース別統計
  courseStats: {
    [courseId: string]: {
      courseName: string;
      rounds: number;
      averageScore: number;
      bestScore: number;
    };
  };
  
  // 月別推移
  monthlyStats: {
    [yearMonth: string]: {        // "2024-01" format
      rounds: number;
      averageScore: number;
    };
  };
  
  updatedAt: Timestamp;
}
```

#### セキュリティルール
```javascript
match /stats/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Cloud Functionからのみ更新
}
```

## 3. データ整合性・制約

### 3.1 バリデーション制約
```typescript
// ラウンドデータ検証
const validateRoundData = (round: Round): boolean => {
  // 必須フィールドチェック
  if (!round.userId || !round.courseId || !round.playDate) {
    return false;
  }
  
  // スコア範囲チェック
  const invalidScores = round.scores.some(score => 
    score.strokes < 1 || score.strokes > 15
  );
  if (invalidScores) return false;
  
  // 日付妥当性チェック
  const playDate = new Date(round.playDate);
  const now = new Date();
  if (playDate > now) return false;
  
  return true;
};
```

### 3.2 データ非正規化戦略
- **courseName** を rounds に保存（表示高速化）
- **participantNames** を rounds に保存（JOIN回避）
- **stats** コレクションで集計データをキャッシュ

## 4. Cloud Firestore セキュリティルール

### 4.1 完全なセキュリティルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ユーザー認証チェック関数
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // 管理者チェック関数
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ユーザー本人チェック関数
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // users コレクション
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      allow read: if isAdmin();
    }
    
    // courses コレクション
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
      
      // course_holes サブコレクション
      match /holes/{holeId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
    }
    
    // rounds コレクション
    match /rounds/{roundId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.userId;
      allow read: if isAdmin();
    }
    
    // stats コレクション
    match /stats/{userId} {
      allow read: if isOwner(userId);
      allow write: if false; // Cloud Functionからのみ
    }
  }
}
```

## 5. データマイグレーション・メンテナンス

### 5.1 初期データセットアップ
```typescript
// courses 初期データ投入用スクリプト
const setupInitialCourses = async () => {
  const courses = [
    {
      name: "富士カントリークラブ",
      nameKana: "ふじかんとりーくらぶ",
      prefecture: "静岡県",
      city: "富士市",
      holesCount: 18,
      parTotal: 72,
      // ...
    }
    // 主要ゴルフ場データ
  ];
  
  for (const course of courses) {
    await db.collection('courses').add(course);
  }
};
```

### 5.2 統計データ再計算
```typescript
// Cloud Function: 統計データ再計算
export const recalculateUserStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  const userId = context.auth.uid;
  const rounds = await db.collection('rounds')
    .where('userId', '==', userId)
    .orderBy('playDate', 'desc')
    .get();
  
  // 統計計算ロジック
  const stats = calculateUserStats(rounds.docs.map(doc => doc.data()));
  
  await db.collection('stats').doc(userId).set(stats);
});
```

## 6. バックアップ・復旧戦略

### 6.1 自動バックアップ設定
```bash
# Firebase CLI でバックアップスケジュール設定
gcloud firestore export gs://backup-bucket/$(date +%Y%m%d) --collection-ids=users,rounds,courses
```

### 6.2 データエクスポート機能
```typescript
// ユーザーデータエクスポート機能
export const exportUserData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  const userId = context.auth.uid;
  
  // ユーザーのラウンドデータを取得
  const rounds = await db.collection('rounds')
    .where('userId', '==', userId)
    .get();
  
  const exportData = {
    user: await db.collection('users').doc(userId).get().then(doc => doc.data()),
    rounds: rounds.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  };
  
  return exportData;
});
```

## 7. パフォーマンス最適化

### 7.1 読み取り最適化
- 頻繁にアクセスされるデータの非正規化
- 適切なインデックス設計
- ページネーション実装

### 7.2 書き込み最適化
- バッチ処理の活用
- トランザクション使用による整合性確保
- Cloud Functions での非同期処理

### 7.3 コスト最適化
- 不要なインデックスの削除
- TTL設定によるログデータの自動削除
- 複合クエリの最適化