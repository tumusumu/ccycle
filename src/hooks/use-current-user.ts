'use client';

import { useState, useEffect, useCallback } from 'react';
import { IUserProfile } from '@/types/user';

/**
 * Get current user ID from cookie (client-side)
 */
export function getCurrentUserIdClient(): string | null {
  if (typeof window === 'undefined') return null;
  
  // 从客户端可读的 cookie 中获取 userId
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'ccycle_user_id_client') {
      return value;
    }
  }
  return null;
}

/**
 * Set current user ID (not needed anymore - set by server)
 * @deprecated Server sets cookies during login/register
 */
export function setCurrentUserId(userId: string): void {
  // No longer needed - server sets cookies
  console.warn('setCurrentUserId is deprecated - cookies are set by server');
}

/**
 * Clear current user (logout)
 */
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;

  // Clear both cookies
  document.cookie = 'ccycle_user_id=; path=/; max-age=0';
  document.cookie = 'ccycle_user_id_client=; path=/; max-age=0';

  // Clear all user-specific data from localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('intake-')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Hook to get and manage current user
 */
export function useCurrentUser() {
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const storedUserId = getCurrentUserIdClient();
    setUserId(storedUserId);

    if (!storedUserId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else if (res.status === 404) {
        // User not found, clear stored ID
        clearCurrentUser();
        setUser(null);
        setUserId(null);
      }
    } catch {
      // Network error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    clearCurrentUser();
    setUser(null);
    setUserId(null);
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    userId,
    isLoading,
    isLoggedIn: !!userId,
    logout,
    refresh,
  };
}
