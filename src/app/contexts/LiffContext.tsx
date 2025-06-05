'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { Liff } from '@line/liff';
import { apiClient } from '@/lib/api';

declare global {
  interface Window {
    liff: {
      init: (config: { liffId: string }) => Promise<void>;
      isLoggedIn: () => boolean;
      getProfile: () => Promise<Profile>;
      getAccessToken: () => string;
      login: () => void;
      logout: () => void;
      isInClient: () => boolean;
      sendMessages: (messages: { type: string; text: string }[]) => Promise<void>;
    };
  }
}

type Profile = NonNullable<Awaited<ReturnType<Liff['getProfile']>>>;

interface DatabaseUser {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface LiffContextType {
  profile: Profile | null;
  dbUser: DatabaseUser | null;
  isInitialized: boolean;
  isLoggedIn: boolean;
  isAuthenticated: boolean; // สำหรับตรวจสอบ JWT
  token: string | null;
  login: () => void;
  logout: () => void;
  sendMessage: (message: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const LiffContext = createContext<LiffContextType | undefined>(undefined);

export const useLiff = () => {
  const context = useContext(LiffContext);
  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffProvider');
  }
  return context;
};

export const LiffProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  // Wrap functions in useCallback to prevent re-creation on every render
  const saveUserToDatabase = useCallback(async (profile: Profile) => {
    try {
      const response = await apiClient.post('/user', {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      });

      const data = response.data;
      setDbUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      console.log('User saved to database with JWT:', data.user);
      return data;
    } catch (error) {
      console.error('Error saving user to database:', error);
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  // ฟังก์ชันดึงข้อมูล user จาก database
  const fetchUserFromDatabase = useCallback(async (lineUserId: string) => {
    try {
      const response = await apiClient.get('/user', {
        params: { lineUserId }
      });
      
      const data = response.data;
      setDbUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Error fetching user from database:', error);
      return null;
    }
  }, []);

  // ฟังก์ชันตรวจสอบ JWT Token ที่มีอยู่
  const checkExistingAuth = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      
      const data = response.data;
      setDbUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error checking existing auth:', error);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  const refreshUserData = async () => {
    if (profile) {
      await fetchUserFromDatabase(profile.userId);
    }
  };

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        // ตรวจสอบ JWT ที่มีอยู่ก่อน
        const hasValidToken = await checkExistingAuth();

        if (!liffId) {
          console.warn('LIFF ID not found. Running in demo mode.');
          setIsInitialized(true);
          return;
        }

        // โหลด LIFF SDK
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.async = true;
        
        script.onload = async () => {
          try {
            const liff = (await import('@line/liff')).default;
            await liff.init({ liffId });
            
            if (liff.isLoggedIn()) {
              const userProfile = await liff.getProfile();
              setProfile(userProfile);
              setIsLoggedIn(true);
              
              // ถ้ายังไม่มี valid token ให้สร้างใหม่
              if (!hasValidToken) {
                // 🔥 สำคัญ! เก็บข้อมูล user ลง database และสร้าง JWT
                await saveUserToDatabase(userProfile);
              } else {
                // ถ้ามี valid token แล้ว ให้ดึงข้อมูลล่าสุดจาก database
                await fetchUserFromDatabase(userProfile.userId);
              }
              
            } else {
              setIsLoggedIn(false);
              setIsAuthenticated(false);
            }
            
            setIsInitialized(true);
          } catch (error) {
            console.error('LIFF initialization failed:', error);
            setIsInitialized(true);
          }
        };

        script.onerror = () => {
          console.error('Failed to load LIFF SDK');
          setIsInitialized(true);
        };

        document.head.appendChild(script);

        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (error) {
        console.error('Error in LIFF initialization:', error);
        setIsInitialized(true);
      }
    };

    initializeLiff();
  }, [liffId, checkExistingAuth, fetchUserFromDatabase, saveUserToDatabase]);

  const login = () => {
    const liff = (window as typeof window & { liff?: Liff }).liff;
    if (liff && !liff.isLoggedIn()) {
      liff.login();
    }
  };

  const logout = async () => {
    try {
      // เรียก API เพื่อ logout และลบ cookies
      await apiClient.post('/auth/logout');

      // Logout จาก LIFF
      const liff = (window as typeof window & { liff?: Liff }).liff;
      if (liff) {
        liff.logout();
      }

      // Clear states
      setProfile(null);
      setDbUser(null);
      setToken(null);
      setIsLoggedIn(false);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // ถึงแม้ logout API จะ error ก็ยัง clear states
      setProfile(null);
      setDbUser(null);
      setToken(null);
      setIsLoggedIn(false);
      setIsAuthenticated(false);
    }
  };

  const sendMessage = async (message: string) => {
    try {
      const liff = (window as typeof window & { liff?: Liff }).liff;
      if (liff && liff.isInClient()) {
        await liff.sendMessages([
          {
            type: 'text',
            text: message,
          },
        ]);
      } else {
        console.log('Cannot send message: Not in LINE client');
      }
    } catch (error) {
      console.error('Send message failed:', error);
    }
  };

  return (
    <LiffContext.Provider
      value={{
        profile,
        dbUser,
        token,
        isInitialized,
        isLoggedIn,
        isAuthenticated,
        login,
        logout,
        sendMessage,
        refreshUserData,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
};