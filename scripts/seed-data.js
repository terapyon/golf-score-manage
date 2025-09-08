// Firebase エミュレーター用サンプルデータ投入スクリプト
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  collection, 
  doc, 
  setDoc,
  addDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  connectAuthEmulator, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';

// エミュレーター専用設定
const firebaseConfig = {
  apiKey: 'demo-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:demo'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// エミュレーターに強制接続
try {
  connectFirestoreEmulator(db, 'firebase-emulator', 8080);
  console.log('🔧 Firestore エミュレーターに接続: firebase-emulator:8080');
} catch (error) {
  console.log('エミュレーター接続スキップ（既に接続済み）:', error.message);
}

try {
  connectAuthEmulator(auth, 'http://firebase-emulator:9099', { disableWarnings: true });
  console.log('🔧 Auth エミュレーターに接続: firebase-emulator:9099');
} catch (error) {
  console.log('Auth エミュレーター接続スキップ（既に接続済み）:', error.message);
}

// サンプルコースデータ
const sampleCourses = [
  {
    id: 'dummy-course-1',
    name: 'テストゴルフクラブ',
    nameKana: 'てすとごるふくらぶ',
    address: '東京都渋谷区テスト1-1-1',
    prefecture: '東京都',
    city: '渋谷区',
    postalCode: '150-0000',
    phone: '03-0000-0000',
    website: 'https://example.com',
    holesCount: 18,
    parTotal: 72,
    yardageTotal: 6500,
    tees: [
      { name: 'レディース', color: 'red', gender: 'women' },
      { name: 'レギュラー', color: 'white', gender: 'unisex' },
      { name: 'バック', color: 'blue', gender: 'men' },
      { name: 'チャンピオン', color: 'black', gender: 'men' }
    ],
    rating: {
      'レギュラー': { courseRating: 70.5, slopeRating: 125 },
      'バック': { courseRating: 72.0, slopeRating: 130 },
      'チャンピオン': { courseRating: 74.5, slopeRating: 135 }
    },
    facilities: ['レストラン', 'プロショップ', '練習場', 'ロッカー'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'dummy-course-2',
    name: 'サンプルカントリークラブ',
    nameKana: 'さんぷるかんとりーくらぶ',
    address: '神奈川県横浜市サンプル2-2-2',
    prefecture: '神奈川県',
    city: '横浜市',
    postalCode: '220-0000',
    phone: '045-0000-0000',
    website: 'https://sample-cc.example.com',
    holesCount: 18,
    parTotal: 71,
    yardageTotal: 6200,
    tees: [
      { name: 'レディース', color: 'red', gender: 'women' },
      { name: 'レギュラー', color: 'white', gender: 'unisex' },
      { name: 'バック', color: 'blue', gender: 'men' }
    ],
    rating: {
      'レギュラー': { courseRating: 69.8, slopeRating: 120 },
      'バック': { courseRating: 71.2, slopeRating: 125 }
    },
    facilities: ['レストラン', 'プロショップ', '練習場'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// サンプルコースホールデータ
const generateCourseHoles = (courseId, parTotal) => {
  const holes = [];
  let currentPar = 0;
  
  for (let i = 1; i <= 18; i++) {
    // パーの配分（4が中心、3と5をバランスよく）
    let par;
    if (i <= 6) {
      par = i % 3 === 1 ? 4 : (i % 3 === 2 ? 3 : 5);
    } else if (i <= 12) {
      par = 4;
    } else {
      par = i % 3 === 1 ? 5 : (i % 3 === 2 ? 3 : 4);
    }
    
    currentPar += par;
    
    // 最後のホールで調整
    if (i === 18) {
      const diff = parTotal - currentPar;
      par = Math.max(3, Math.min(5, par + diff));
    }
    
    holes.push({
      courseId,
      holeNumber: i,
      par,
      handicap: Math.floor(Math.random() * 18) + 1,
      yardage: {
        'レディース': par === 3 ? 120 + Math.random() * 50 : (par === 4 ? 250 + Math.random() * 100 : 350 + Math.random() * 100),
        'レギュラー': par === 3 ? 150 + Math.random() * 50 : (par === 4 ? 320 + Math.random() * 100 : 450 + Math.random() * 100),
        'バック': par === 3 ? 170 + Math.random() * 50 : (par === 4 ? 380 + Math.random() * 100 : 520 + Math.random() * 100),
        'チャンピオン': par === 3 ? 190 + Math.random() * 50 : (par === 4 ? 420 + Math.random() * 100 : 580 + Math.random() * 100)
      },
      description: `${i}番ホール`,
      hazards: []
    });
  }
  
  return holes;
};

// サンプルラウンドデータ
const generateSampleRounds = (userId) => {
  const rounds = [];
  const today = new Date();
  
  for (let i = 0; i < 5; i++) {
    const playDate = new Date(today);
    playDate.setDate(today.getDate() - (i * 7 + Math.floor(Math.random() * 6)));
    
    const scores = [];
    let totalScore = 0;
    
    for (let hole = 1; hole <= 18; hole++) {
      const par = hole <= 6 ? (hole % 3 === 1 ? 4 : (hole % 3 === 2 ? 3 : 5)) : 4;
      const strokes = par + Math.floor(Math.random() * 4) - 1; // パー±1-2の範囲
      
      scores.push({
        holeNumber: hole,
        par,
        strokes: Math.max(1, strokes),
        putts: Math.floor(Math.random() * 3) + 1,
        fairwayHit: par > 3 ? Math.random() > 0.3 : null,
        greenInRegulation: Math.random() > 0.4,
        penalties: Math.random() > 0.8 ? 1 : 0
      });
      
      totalScore += Math.max(1, strokes);
    }
    
    rounds.push({
      userId,
      courseId: i % 2 === 0 ? 'dummy-course-1' : 'dummy-course-2',
      courseName: i % 2 === 0 ? 'テストゴルフクラブ' : 'サンプルカントリークラブ',
      playDate: playDate.toISOString().split('T')[0],
      startTime: '08:30',
      weather: ['晴れ', '曇り', '雨', '晴れ', '曇り'][i],
      temperature: 20 + Math.floor(Math.random() * 15),
      windSpeed: Math.floor(Math.random() * 10),
      teeName: 'レギュラー',
      totalScore,
      totalPar: 72,
      scores,
      participants: [
        {
          name: 'テストユーザー',
          type: 'registered',
          handicap: 15,
          totalScore
        },
        {
          name: `ゲスト${i + 1}`,
          type: 'guest',
          handicap: 20,
          totalScore: totalScore + Math.floor(Math.random() * 10) - 5
        }
      ],
      memo: i === 0 ? 'アプローチの調子が良かった' : '',
      isCompleted: true,
      createdAt: new Date(playDate.getTime() + 8 * 60 * 60 * 1000), // プレー日の8時間後
      updatedAt: new Date(playDate.getTime() + 8 * 60 * 60 * 1000)
    });
  }
  
  return rounds;
};

// サンプル統計データ
const generateSampleStats = (userId, rounds) => {
  const scores = rounds.map(r => r.totalScore);
  const totalRounds = rounds.length;
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalRounds;
  const bestScore = Math.min(...scores);
  const worstScore = Math.max(...scores);
  
  return {
    userId,
    totalRounds,
    averageScore,
    bestScore,
    worstScore,
    currentHandicap: 15,
    last5Rounds: {
      averageScore,
      improvement: -2,
      dates: rounds.slice(0, 5).map(r => r.playDate)
    },
    last10Rounds: {
      averageScore,
      improvement: -1
    },
    thisYear: {
      rounds: totalRounds,
      averageScore
    },
    courseStats: {
      'dummy-course-1': {
        courseName: 'テストゴルフクラブ',
        rounds: Math.ceil(totalRounds / 2),
        averageScore: averageScore - 1,
        bestScore: bestScore
      },
      'dummy-course-2': {
        courseName: 'サンプルカントリークラブ',
        rounds: Math.floor(totalRounds / 2),
        averageScore: averageScore + 1,
        bestScore: bestScore + 2
      }
    },
    monthlyStats: {},
    updatedAt: new Date()
  };
};

// データクリーニング関数
function cleanData(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && value.constructor === Object) {
        cleaned[key] = cleanData(value);
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map(item => 
          item && typeof item === 'object' ? cleanData(item) : item
        ).filter(item => item !== undefined);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

// テストユーザー作成関数
async function createTestUser() {
  console.log('👤 テストユーザーを作成中...');
  
  const testEmail = 'test@example.com';
  const testPassword = 'test123456';
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    
    console.log(`✅ テストユーザー作成完了: ${testEmail}`);
    console.log(`   UID: ${user.uid}`);
    
    // ユーザープロフィール情報をFirestoreに追加
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: testEmail,
      name: 'テストユーザー',
      handicap: 15,
      preferredTees: 'レギュラー',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
    
    console.log('✅ テストユーザーのプロフィール情報を作成');
    
    return user.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ テストユーザーは既に存在します');
      // 既存ユーザーのUIDを取得するため、ダミーのUIDを返す
      return 'test-user-123';
    } else {
      console.error('❌ テストユーザー作成エラー:', error);
      throw error;
    }
  }
}

// データ投入メイン関数
async function seedData() {
  console.log('🌱 サンプルデータの投入を開始...');
  
  try {
    // 0. テストユーザー作成
    const testUserId = await createTestUser();
    
    // 1. コースデータ投入
    console.log('📍 コースデータを投入中...');
    for (const course of sampleCourses) {
      await setDoc(doc(db, 'courses', course.id), course);
      console.log(`✅ コース投入完了: ${course.name}`);
      
      // コースホールデータ投入
      const holes = generateCourseHoles(course.id, course.parTotal);
      for (const hole of holes) {
        await addDoc(collection(db, 'courseHoles'), hole);
      }
      console.log(`✅ ホール情報投入完了: ${course.name} (${holes.length}ホール)`);
    }
    
    // 2. サンプルユーザー用データ
    
    // ラウンドデータ投入
    console.log('🏌️ ラウンドデータを投入中...');
    const sampleRounds = generateSampleRounds(testUserId);
    for (const round of sampleRounds) {
      const cleanedRound = cleanData(round);
      await addDoc(collection(db, 'rounds'), cleanedRound);
    }
    console.log(`✅ ラウンドデータ投入完了: ${sampleRounds.length}件`);
    
    // 統計データ投入
    console.log('📊 統計データを投入中...');
    const sampleStats = generateSampleStats(testUserId, sampleRounds);
    await setDoc(doc(db, 'userStats', testUserId), sampleStats);
    console.log('✅ 統計データ投入完了');
    
    console.log('🎉 サンプルデータの投入が完了しました！');
    console.log('');
    console.log('📝 テスト用ログイン情報:');
    console.log('  Email: test@example.com');
    console.log('  Password: test123456');
    console.log(`  ユーザーID: ${testUserId}`);
    
  } catch (error) {
    console.error('❌ データ投入エラー:', error);
  }
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData().then(() => {
    console.log('スクリプト完了');
    process.exit(0);
  }).catch((error) => {
    console.error('スクリプトエラー:', error);
    process.exit(1);
  });
}

export { seedData };