'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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
  // Snack (加餐)
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
  updateIntake: (key: keyof IMealIntake, value: number | string | boolean) => void;
  updateMultiple: (updates: Partial<IMealIntake>) => void;
  resetIntake: () => void;
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

export function IntakeProvider({ children }: { children: ReactNode }) {
  const [intake, setIntake] = useState<IMealIntake>(defaultIntake);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`intake-${today}`);
    if (stored) {
      try {
        setIntake(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`intake-${today}`, JSON.stringify(intake));
    }
  }, [intake, isHydrated]);

  const updateIntake = useCallback((key: keyof IMealIntake, value: number | string | boolean) => {
    setIntake((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateMultiple = useCallback((updates: Partial<IMealIntake>) => {
    setIntake((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetIntake = useCallback(() => {
    setIntake(defaultIntake);
  }, []);

  return (
    <IntakeContext.Provider value={{ intake, updateIntake, updateMultiple, resetIntake }}>
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
