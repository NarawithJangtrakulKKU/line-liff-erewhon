'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Liff } from '@line/liff';

type Profile = NonNullable<Awaited<ReturnType<Liff['getProfile']>>>;

interface DatabaseUser {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LiffContextType {
  profile: Profile | null;
  dbUser: DatabaseUser | null;
  isInitialized: boolean;
  isLoggedIn: boolean;
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

export const LiffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  // ฟังก์ชันเก็บข้อมูล user ลง database
  const saveUserToDatabase = async (profile: Profile) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineUserId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDbUser(data.user);
        console.log('User saved to database:', data.user);
      } else {
        console.error('Failed to save user to database');
      }
    } catch (error) {
      console.error('Error saving user to database:', error);
    }
  };

  // ฟังก์ชันดึงข้อมูล user จาก database
  const fetchUserFromDatabase = async (lineUserId: string) => {
    try {
      const response = await fetch(`/api/user?lineUserId=${lineUserId}`);
      
      if (response.ok) {
        const data = await response.json();
        setDbUser(data.user);
        return data.user;
      }
    } catch (error) {
      console.error('Error fetching user from database:', error);
    }
    return null;
  };

  const refreshUserData = async () => {
    if (profile) {
      await fetchUserFromDatabase(profile.userId);
    }
  };

  useEffect(() => {
    const initializeLiff = async () => {
      try {
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
              
              // 🔥 สำคัญ! เก็บข้อมูล user ลง database ทันทีที่ auto login
              await saveUserToDatabase(userProfile);
              await fetchUserFromDatabase(userProfile.userId);
              
            } else {
              setIsLoggedIn(false);
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
  }, [liffId]);

  const login = () => {
    const liff = (window as any).liff;
    if (liff && !liff.isLoggedIn()) {
      liff.login();
    }
  };

  const logout = () => {
    const liff = (window as any).liff;
    if (liff) {
      liff.logout();
      setProfile(null);
      setDbUser(null);
      setIsLoggedIn(false);
    }
  };

  const sendMessage = async (message: string) => {
    try {
      const liff = (window as any).liff;
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
        isInitialized,
        isLoggedIn,
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