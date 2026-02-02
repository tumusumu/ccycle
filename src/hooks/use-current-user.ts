'use client';

import { useState, useEffect, useCallback } from 'react';
import { IUserProfile } from '@/types/user';

const USER_ID_KEY = 'ccycle_user_id';

/**
 * Get current user ID from localStorage (client-side)
 */
export function getCurrentUserIdClient(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * Set current user ID in localStorage and cookie
 */
export function setCurrentUserId(userId: string): void {
  if (typeof window === 'undefined') return;

  // Set in localStorage
  localStorage.setItem(USER_ID_KEY, userId);

  // Set cookie for server-side access (expires in 1 year)
  document.cookie = `ccycle_user_id=${userId}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}

/**
 * Clear current user (logout)
 */
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(USER_ID_KEY);
  document.cookie = 'ccycle_user_id=; path=/; max-age=0';

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
