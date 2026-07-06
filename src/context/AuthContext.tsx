/* eslint-disable react/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  enterGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (email: string, password: string) => {
    if (!auth) {
      return Promise.reject(new Error("Cloud Authentication is not configured. Config .env variables."));
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email: string, password: string) => {
    if (!auth) {
      return Promise.reject(new Error("Cloud Authentication is not configured. Config .env variables."));
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    if (!auth) {
      return Promise.resolve();
    }
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    if (!auth) {
      return Promise.reject(new Error("Cloud Authentication is not configured. Config .env variables."));
    }
    return sendPasswordResetEmail(auth, email);
  };

  const signInWithGoogle = () => {
    if (!auth) {
      return Promise.reject(new Error("Cloud Authentication is not configured. Config .env variables."));
    }
    return signInWithPopup(auth, googleProvider);
  };

  const enterGuestMode = () => {
    setCurrentUser({
      uid: 'guest_user',
      email: 'guest@aethernote.local',
      emailVerified: true,
      displayName: 'Guest Space',
    } as any);
  };

  useEffect(() => {
    if (!auth) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle,
    enterGuestMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
