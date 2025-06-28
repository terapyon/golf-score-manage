import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { User as AppUser } from '../types';

interface AuthContextType {
  // 状態
  currentUser: AppUser | null;
  loading: boolean;
  
  // 認証関数
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // プロフィール関数
  updateUserProfile: (data: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ユーザーデータをFirestoreから取得
  const fetchUserData = async (firebaseUser: User): Promise<AppUser | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: userData.name || firebaseUser.displayName || '',
          handicap: userData.handicap || 0,
          avatar: userData.avatar || firebaseUser.photoURL || undefined,
          preferences: userData.preferences || {
            defaultTee: 'レギュラー',
            scoreDisplayMode: 'stroke' as const,
            notifications: {
              email: true,
              push: true,
            },
          },
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // 新規ユーザーのFirestoreドキュメント作成
  const createUserDocument = async (
    firebaseUser: User,
    additionalData: { name: string; handicap?: number } = { name: '' }
  ) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: additionalData.name || firebaseUser.displayName || '',
      handicap: additionalData.handicap || 0,
      avatar: firebaseUser.photoURL || '',
      preferences: {
        defaultTee: 'レギュラー',
        scoreDisplayMode: 'stroke',
        notifications: {
          email: true,
          push: true,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(userRef, userData);
    return userData;
  };

  // Email/Password ログイン
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password 新規登録
  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<void> => {
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Firebase Authのプロフィール更新
      await updateProfile(user, { displayName: name });
      
      // Firestoreにユーザードキュメント作成
      await createUserDocument(user, { name });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google ログイン
  const loginWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // 既存ユーザーかチェック
      const userData = await fetchUserData(user);
      if (!userData) {
        // 新規ユーザーの場合、Firestoreドキュメント作成
        await createUserDocument(user);
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ログアウト
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // プロフィール更新
  const updateUserProfile = async (data: Partial<AppUser>): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      setLoading(true);
      const userRef = doc(db, 'users', currentUser.uid);
      
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(userRef, updateData);
      
      // ローカル状態を更新
      setCurrentUser(prev => prev ? { ...prev, ...updateData } : null);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};