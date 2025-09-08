// テストユーザーのみ作成するスクリプト
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  doc, 
  setDoc 
} from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

// エミュレーターに強制接続
try {
  connectAuthEmulator(auth, 'http://firebase-emulator:9099', { disableWarnings: true });
  console.log('🔧 Auth エミュレーターに接続: firebase-emulator:9099');
} catch (error) {
  console.log('Auth エミュレーター接続スキップ（既に接続済み）:', error.message);
}

try {
  connectFirestoreEmulator(db, 'firebase-emulator', 8080);
  console.log('🔧 Firestore エミュレーターに接続: firebase-emulator:8080');
} catch (error) {
  console.log('Firestore エミュレーター接続スキップ（既に接続済み）:', error.message);
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
    console.log('');
    console.log('📝 ログイン情報:');
    console.log('  Email: test@example.com');
    console.log('  Password: test123456');
    console.log(`  UID: ${user.uid}`);
    
    return user.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ テストユーザーは既に存在します');
      console.log('');
      console.log('📝 既存のログイン情報:');
      console.log('  Email: test@example.com');
      console.log('  Password: test123456');
    } else {
      console.error('❌ テストユーザー作成エラー:', error);
      throw error;
    }
  }
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUser().then(() => {
    console.log('スクリプト完了');
    process.exit(0);
  }).catch((error) => {
    console.error('スクリプトエラー:', error);
    process.exit(1);
  });
}

export { createTestUser };