"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLiff } from './LiffContext';
import axios from 'axios';

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { dbUser } = useLiff();

  // ฟังก์ชันดึงข้อมูลตะกร้า
  const refreshCart = useCallback(async () => {
    if (!dbUser?.id) {
      setCartCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`/api/cart`, { 
        params: { userId: dbUser.id } 
      });
      setCartCount(response.data.items?.length || 0);
    } catch (error) {
      console.error('[CartContext] Error fetching cart:', error);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [dbUser?.id]);

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้า
  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!dbUser?.id) {
      console.error('[CartContext] User not logged in');
      return false;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('/api/cart', {
        productId,
        quantity,
        userId: dbUser.id
      });

      if (response.data.cartCount !== undefined) {
        setCartCount(response.data.cartCount);
      } else {
        // ถ้า API ไม่ส่ง cartCount มา ให้ refresh cart
        await refreshCart();
      }
      
      return true;
    } catch (error) {
      console.error('[CartContext] Error adding to cart:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // เมื่อ user เปลี่ยน ให้ refresh cart
  useEffect(() => {
    if (dbUser?.id) {
      refreshCart();
    } else {
      setCartCount(0);
    }
  }, [dbUser, refreshCart]);

  const contextValue: CartContextType = {
    cartCount,
    refreshCart,
    addToCart,
    isLoading
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 