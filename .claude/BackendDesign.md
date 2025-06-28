# バックエンドAPI詳細設計書

## 1. アーキテクチャ概要

### 技術スタック
- **Firebase Functions** (Node.js 18.x + TypeScript)
- **Express.js** - HTTP APIフレームワーク
- **Firebase Admin SDK** - Firestore/Auth管理
- **cors** - CORS対応
- **helmet** - セキュリティヘッダー
- **express-rate-limit** - レート制限

### デプロイメント構成
```
Firebase Project
├── Hosting (React App)
├── Functions (API Server)
├── Firestore (Database)
└── Authentication
```

## 2. API エンドポイント設計

### 2.1 認証API

#### ユーザー登録
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "山田太郎",
  "handicap": 18
}

Response:
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "name": "山田太郎",
    "handicap": 18,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### プロフィール更新
```http
PUT /api/auth/profile
Authorization: Bearer <idToken>
Content-Type: application/json

{
  "name": "山田次郎",
  "handicap": 16
}

Response:
{
  "success": true,
  "user": {
    "uid": "user123",
    "name": "山田次郎",
    "handicap": 16,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2.2 ラウンドAPI

#### ラウンド一覧取得
```http
GET /api/rounds?page=1&limit=10&from=2024-01-01&to=2024-12-31&courseId=course123
Authorization: Bearer <idToken>

Response:
{
  "success": true,
  "data": {
    "rounds": [
      {
        "id": "round123",
        "userId": "user123",
        "courseId": "course123",
        "courseName": "富士カントリークラブ",
        "playDate": "2024-01-15",
        "startTime": "08:30",
        "totalScore": 95,
        "participants": [
          {
            "userId": "user456",
            "name": "佐藤花子",
            "type": "registered"
          },
          {
            "name": "鈴木一郎",
            "type": "guest"
          }
        ],
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### ラウンド詳細取得
```http
GET /api/rounds/:roundId
Authorization: Bearer <idToken>

Response:
{
  "success": true,
  "data": {
    "id": "round123",
    "userId": "user123",
    "course": {
      "id": "course123",
      "name": "富士カントリークラブ",
      "address": "静岡県富士市...",
      "holes": [
        { "number": 1, "par": 4, "yardage": 350 },
        { "number": 2, "par": 3, "yardage": 180 }
        // ... 18ホール分
      ]
    },
    "playDate": "2024-01-15",
    "startTime": "08:30",
    "scores": [
      { "holeNumber": 1, "strokes": 5, "par": 4 },
      { "holeNumber": 2, "strokes": 3, "par": 3 }
      // ... 18ホール分
    ],
    "totalScore": 95,
    "participants": [...]
  }
}
```

#### ラウンド作成
```http
POST /api/rounds
Authorization: Bearer <idToken>
Content-Type: application/json

{
  "courseId": "course123",
  "playDate": "2024-01-15",
  "startTime": "08:30",
  "participants": [
    { "userId": "user456" },
    { "name": "鈴木一郎", "type": "guest" }
  ],
  "scores": [
    { "holeNumber": 1, "strokes": 5 },
    { "holeNumber": 2, "strokes": 3 }
    // ... 18ホール分
  ]
}

Response:
{
  "success": true,
  "data": {
    "id": "round124",
    "totalScore": 95,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### ラウンド更新
```http
PUT /api/rounds/:roundId
Authorization: Bearer <idToken>
Content-Type: application/json

{
  "scores": [
    { "holeNumber": 1, "strokes": 4 },
    // ... 更新するスコア
  ]
}
```

#### ラウンド削除
```http
DELETE /api/rounds/:roundId
Authorization: Bearer <idToken>

Response:
{
  "success": true,
  "message": "ラウンドが削除されました"
}
```

### 2.3 統計API

#### 統計データ取得
```http
GET /api/stats?period=last10&from=2024-01-01&to=2024-12-31
Authorization: Bearer <idToken>

Response:
{
  "success": true,
  "data": {
    "totalRounds": 25,
    "averageScore": 92.5,
    "bestScore": 85,
    "worstScore": 105,
    "periodStats": {
      "period": "last10",
      "averageScore": 90.2,
      "improvement": -2.3
    },
    "courseStats": [
      {
        "courseId": "course123",
        "courseName": "富士カントリークラブ",
        "rounds": 5,
        "averageScore": 93.2
      }
    ],
    "monthlyTrend": [
      { "month": "2024-01", "averageScore": 95.0 },
      { "month": "2024-02", "averageScore": 92.5 }
    ]
  }
}
```

### 2.4 ゴルフ場API

#### ゴルフ場一覧取得
```http
GET /api/courses?search=富士&prefecture=静岡県
Authorization: Bearer <idToken>

Response:
{
  "success": true,
  "data": [
    {
      "id": "course123",
      "name": "富士カントリークラブ",
      "address": "静岡県富士市...",
      "prefecture": "静岡県",
      "holesCount": 18,
      "parTotal": 72,
      "yardageTotal": 6500,
      "tees": [
        { "name": "レギュラー", "color": "white" },
        { "name": "バック", "color": "blue" }
      ]
    }
  ]
}
```

#### ゴルフ場詳細取得
```http
GET /api/courses/:courseId
Authorization: Bearer <idToken>

Response:
{
  "success": true,
  "data": {
    "id": "course123",
    "name": "富士カントリークラブ",
    "address": "静岡県富士市...",
    "holes": [
      {
        "number": 1,
        "par": 4,
        "yardage": { "regular": 350, "back": 380 },
        "handicap": 10
      }
      // ... 18ホール分
    ]
  }
}
```

## 3. Firebase Functions 実装構造

### 3.1 プロジェクト構造
```
functions/
├── src/
│   ├── controllers/     # API コントローラー
│   │   ├── authController.ts
│   │   ├── roundsController.ts
│   │   ├── statsController.ts
│   │   └── coursesController.ts
│   ├── middleware/      # ミドルウェア
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── services/        # ビジネスロジック
│   │   ├── authService.ts
│   │   ├── roundsService.ts
│   │   ├── statsService.ts
│   │   └── coursesService.ts
│   ├── models/          # データモデル
│   │   └── types.ts
│   ├── utils/           # ユーティリティ
│   │   ├── validation.ts
│   │   └── helpers.ts
│   └── index.ts         # エントリーポイント
├── package.json
└── tsconfig.json
```

### 3.2 ミドルウェア実装

#### 認証ミドルウェア
```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';

interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header missing'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(idToken);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};
```

#### バリデーションミドルウェア
```typescript
// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

// バリデーションスキーマ
export const roundCreateSchema = z.object({
  courseId: z.string().min(1),
  playDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  scores: z.array(z.object({
    holeNumber: z.number().min(1).max(18),
    strokes: z.number().min(1).max(15)
  })).length(18),
  participants: z.array(z.object({
    userId: z.string().optional(),
    name: z.string().optional(),
    type: z.enum(['registered', 'guest']).optional()
  }))
});
```

### 3.3 サービス層実装

#### RoundsService
```typescript
// services/roundsService.ts
import { db } from '../config/firebase';
import { Round, RoundFilters, RoundCreateData } from '../models/types';

export class RoundsService {
  private readonly collection = db.collection('rounds');

  async createRound(userId: string, data: RoundCreateData): Promise<Round> {
    const totalScore = data.scores.reduce((sum, score) => sum + score.strokes, 0);
    
    const roundData = {
      ...data,
      userId,
      totalScore,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await this.collection.add(roundData);
    
    // 統計を更新
    await this.updateUserStats(userId);
    
    return { id: docRef.id, ...roundData };
  }

  async getRounds(userId: string, filters: RoundFilters) {
    let query = this.collection
      .where('userId', '==', userId)
      .orderBy('playDate', 'desc');

    if (filters.from) {
      query = query.where('playDate', '>=', filters.from);
    }
    if (filters.to) {
      query = query.where('playDate', '<=', filters.to);
    }
    if (filters.courseId) {
      query = query.where('courseId', '==', filters.courseId);
    }

    const snapshot = await query
      .limit(filters.limit || 10)
      .offset((filters.page - 1) * (filters.limit || 10))
      .get();

    const rounds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Round[];

    return rounds;
  }

  private async updateUserStats(userId: string) {
    // 統計データ更新ロジック
    // 別途Cloud Functionで非同期実行することも可能
  }
}
```

### 3.4 エラーハンドリング

```typescript
// middleware/errorHandler.ts
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('API Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  if (error.message.includes('permission-denied')) {
    return res.status(403).json({
      success: false,
      error: 'Permission denied'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

## 4. セキュリティ設計

### 4.1 認証・認可
- **Firebase Authentication** による JWT トークン検証
- **ユーザー固有データのアクセス制御** (userId フィルタリング)
- **管理者権限チェック** (特定機能のみ)

### 4.2 レート制限
```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト上限
  message: {
    success: false,
    error: 'Too many requests'
  }
});
```

### 4.3 CORS設定
```typescript
import cors from 'cors';

const corsOptions = {
  origin: [
    'https://your-app.web.app',
    'https://your-app.firebaseapp.com'
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

## 5. デプロイメント設定

### 5.1 Firebase Functions設定
```json
// firebase.json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18",
    "memory": "512MB",
    "timeout": "60s"
  }
}
```

### 5.2 環境変数
```typescript
// functions/src/config/index.ts
export const config = {
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [],
  environment: process.env.NODE_ENV || 'development'
};
```