'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { getCurrentUserIdClient } from '@/hooks/use-current-user';

export interface IMealIntake {
  // Breakfast
  oatmealGrams: number;
  wholeEggs: number;
  whiteOnlyEggs: number;
  breakfastCompleted: boolean;
  // Lunch
  lunchRiceGrams: number;
  lunchMeatType: string;
  lunchMeatGrams: number;
  lunchCompleted: boolean;
  // Snack (add meal)
  snackRiceGrams: number;
  snackMeatType: string;
  snackMeatGrams: number;
  snackCompleted: boolean;
  // Dinner
  dinnerRiceGrams: number;
  dinnerMeatType: string;
  dinnerMeatGrams: number;
  dinnerCompleted: boolean;
  // Exercise
  strengthMinutes: number;
  strengthCompleted: boolean;
  cardioMinutes: number;
  cardioCompleted: boolean;
}

interface IIntakeContext {
  intake: IMealIntake;
  dailyMealPlanId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  updateIntake: (key: keyof IMealIntake, value: number | string | boolean) => void;
  updateMultiple: (updates: Partial<IMealIntake>) => void;
  resetIntake: () => void;
  saveToDatabase: (updates?: Partial<IMealIntake>) => Promise<boolean>;
  loadFromDatabase: () => Promise<void>;
}

const defaultIntake: IMealIntake = {
  oatmealGrams: 0,
  wholeEggs: 0,
  whiteOnlyEggs: 0,
  breakfastCompleted: false,
  lunchRiceGrams: 0,
  lunchMeatType: '',
  lunchMeatGrams: 0,
  lunchCompleted: false,
  snackRiceGrams: 0,
  snackMeatType: '',
  snackMeatGrams: 0,
  snackCompleted: false,
  dinnerRiceGrams: 0,
  dinnerMeatType: '',
  dinnerMeatGrams: 0,
  dinnerCompleted: false,
  strengthMinutes: 0,
  strengthCompleted: false,
  cardioMinutes: 0,
  cardioCompleted: false,
};

const IntakeContext = createContext<IIntakeContext | null>(null);

function getLocalStorageKey(): string | null {
  const userId = getCurrentUserIdClient();
  if (!userId) return null;
  const today = new Date().toISOString().split('T')[0];
  return `intake-${userId}-${today}`;
}

export function IntakeProvider({ children }: { children: ReactNode }) {
  const [intake, setIntake] = useState<IMealIntake>(defaultIntake);
  const [dailyMealPlanId, setDailyMealPlanId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasLoadedFromDb = useRef(false);

  // Load from database on mount
  const loadFromDatabase = useCallback(async () => {
    if (hasLoadedFromDb.current) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/intake/today');

      if (res.ok) {
        const data = await res.json();
        setDailyMealPlanId(data.dailyMealPlanId);

        if (data.intake) {
          // Database has data - use it
          setIntake({
            oatmealGrams: data.intake.oatmealGrams ?? 0,
            wholeEggs: data.intake.wholeEggs ?? 0,
            whiteOnlyEggs: data.intake.whiteOnlyEggs ?? 0,
            breakfastCompleted: data.intake.breakfastCompleted ?? false,
            lunchRiceGrams: data.intake.lunchRiceGrams ?? 0,
            lunchMeatType: data.intake.lunchMeatType ?? '',
            lunchMeatGrams: data.intake.lunchMeatGrams ?? 0,
            lunchCompleted: data.intake.lunchCompleted ?? false,
            snackRiceGrams: data.intake.snackRiceGrams ?? 0,
            snackMeatType: data.intake.snackMeatType ?? '',
            snackMeatGrams: data.intake.snackMeatGrams ?? 0,
            snackCompleted: data.intake.snackCompleted ?? false,
            dinnerRiceGrams: data.intake.dinnerRiceGrams ?? 0,
            dinnerMeatType: data.intake.dinnerMeatType ?? '',
            dinnerMeatGrams: data.intake.dinnerMeatGrams ?? 0,
            dinnerCompleted: data.intake.dinnerCompleted ?? false,
            strengthMinutes: data.intake.strengthMinutes ?? 0,
            strengthCompleted: data.intake.strengthCompleted ?? false,
            cardioMinutes: data.intake.cardioMinutes ?? 0,
            cardioCompleted: data.intake.cardioCompleted ?? false,
          });
          // Update localStorage to match database
          const storageKey = getLocalStorageKey();
          if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(data.intake));
          }
        } else {
          // No database data - try localStorage as fallback
          const fallbackKey = getLocalStorageKey();
          if (fallbackKey) {
            const stored = localStorage.getItem(fallbackKey);
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                setIntake(parsed);
              } catch {
                // ignore parse errors
              }
            }
          }
        }
        hasLoadedFromDb.current = true;
      } else {
        // API error - fall back to localStorage
        const fallbackKey = getLocalStorageKey();
        if (fallbackKey) {
          const stored = localStorage.getItem(fallbackKey);
          if (stored) {
            try {
              setIntake(JSON.parse(stored));
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch {
      // Network error - fall back to localStorage
      const fallbackKey = getLocalStorageKey();
      if (fallbackKey) {
        const stored = localStorage.getItem(fallbackKey);
        if (stored) {
          try {
            setIntake(JSON.parse(stored));
          } catch {
            // ignore parse errors
          }
        }
      }
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  }, []);

  // Load from database on mount
  useEffect(() => {
    loadFromDatabase();
  }, [loadFromDatabase]);

  // Save to localStorage on change (as cache)
  useEffect(() => {
    if (isHydrated) {
      const storageKey = getLocalStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(intake));
      }
    }
  }, [intake, isHydrated]);

  // Save to database
  const saveToDatabase = useCallback(async (updates?: Partial<IMealIntake>): Promise<boolean> => {
    const dataToSave = updates || intake;

    // Also update local state if updates provided
    if (updates) {
      setIntake((prev) => ({ ...prev, ...updates }));
    }

    try {
      setIsSyncing(true);
      const res = await fetch('/api/intake/today', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.dailyMealPlanId) {
          setDailyMealPlanId(data.dailyMealPlanId);
        }
        return true;
      }
      return false;
    } catch {
      // Save failed but local state is updated
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [intake]);

  const updateIntake = useCallback((key: keyof IMealIntake, value: number | string | boolean) => {
    setIntake((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateMultiple = useCallback((updates: Partial<IMealIntake>) => {
    setIntake((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetIntake = useCallback(() => {
    setIntake(defaultIntake);
    hasLoadedFromDb.current = false;
  }, []);

  return (
    <IntakeContext.Provider value={{
      intake,
      dailyMealPlanId,
      isLoading,
      isSyncing,
      updateIntake,
      updateMultiple,
      resetIntake,
      saveToDatabase,
      loadFromDatabase,
    }}>
      {children}
    </IntakeContext.Provider>
  );
}

export function useIntake() {
  const context = useContext(IntakeContext);
  if (!context) {
    throw new Error('useIntake must be used within an IntakeProvider');
  }
  return context;
}
