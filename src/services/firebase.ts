import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// 環境情報の取得
const isEmulatorMode = process.env.VITE_FIREBASE_USE_EMULATOR === 'true';
const environment = process.env.VITE_ENVIRONMENT || 'development';

// Firebase設定
const firebaseConfig = isEmulatorMode ? {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com", 
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
} : {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log(`🔥 Firebase初期化: ${environment}環境 ${isEmulatorMode ? '(エミュレーター)' : '(クラウド)'}`);

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// 各サービスの初期化
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'asia-northeast1'); // 東京リージョン
export const storage = getStorage(app);

// Analytics（本番環境のみ）
export let analytics: any = null;
if (!isEmulatorMode && typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// エミュレーター接続（ローカル開発環境）
if (isEmulatorMode) {
  console.log('🔧 Firebase エミュレーターに接続中...');
  
  try {
    // 認証エミュレーター
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('✅ Auth エミュレーター接続');
  } catch (error) {
    console.warn('Auth エミュレーター接続失敗:', error);
  }

  try {
    // Firestoreエミュレーター
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Firestore エミュレーター接続');
  } catch (error) {
    console.warn('Firestore エミュレーター接続失敗:', error);
  }

  try {
    // Functionsエミュレーター
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ Functions エミュレーター接続');
  } catch (error) {
    console.warn('Functions エミュレーター接続失敗:', error);
  }

  try {
    // Storageエミュレーター
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✅ Storage エミュレーター接続');
  } catch (error) {
    console.warn('Storage エミュレーター接続失敗:', error);
  }
}

// 設定値の検証
export const validateFirebaseConfig = (): boolean => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('Missing Firebase configuration variables:', missingVars);
    return false;
  }

  return true;
};

// Firebase接続テスト
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // 設定値の検証
    if (!validateFirebaseConfig()) {
      return false;
    }

    // Firestoreの基本的な読み取りテスト
    const { doc, getDoc } = await import('firebase/firestore');
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    
    console.log('Firebase connection successful');
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
};

export default app;