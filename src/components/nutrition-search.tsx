'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Chinese to English food name mapping - basic ingredients only
const FOOD_NAME_MAP: Record<string, string> = {
  // Meat
  '牛肉': 'beef raw',
  '牛': 'beef raw',
  '鸡肉': 'chicken raw',
  '鸡': 'chicken raw',
  '鸡胸肉': 'chicken breast raw',
  '鸡胸': 'chicken breast raw',
  '鸡腿肉': 'chicken thigh raw',
  '鸡腿': 'chicken thigh raw',
  '猪肉': 'pork raw',
  '猪': 'pork raw',
  '猪里脊': 'pork tenderloin raw',
  // Seafood
  '鱼': 'fish raw',
  '鱼肉': 'fish raw',
  '三文鱼': 'salmon raw',
  '虾': 'shrimp raw',
  '虾仁': 'shrimp raw',
  // Eggs
  '鸡蛋': 'egg raw',
  '蛋': 'egg raw',
  '蛋白': 'egg white raw',
  '蛋黄': 'egg yolk raw',
  // Grains
  '米饭': 'rice cooked',
  '米': 'rice',
  '燕麦': 'oats raw',
  '麦片': 'oats raw',
  // Protein supplement
  '蛋白粉': 'whey protein',
  '乳清蛋白': 'whey protein',
};

// Local nutrition data - raw ingredients only (per 100g)
const LOCAL_NUTRITION_DATA: Record<string, { name: string; protein: number; fat: number; carbs: number; calories: number }> = {
  'beef': { name: '牛肉 (生)', protein: 21, fat: 2.5, carbs: 0, calories: 106 },
  'chicken': { name: '鸡肉 (生)', protein: 23, fat: 1.2, carbs: 0, calories: 105 },
  'chicken breast': { name: '鸡胸肉 (生)', protein: 24, fat: 1.5, carbs: 0, calories: 110 },
  'pork': { name: '猪肉 (生)', protein: 20, fat: 7, carbs: 0, calories: 143 },
  'fish': { name: '鱼肉 (生)', protein: 18, fat: 3, carbs: 0, calories: 99 },
  'shrimp': { name: '虾 (生)', protein: 18.6, fat: 0.8, carbs: 0, calories: 82 },
  'egg': { name: '鸡蛋 (生)', protein: 13, fat: 11, carbs: 1, calories: 155 },
  'rice': { name: '米饭 (熟)', protein: 2.6, fat: 0.3, carbs: 28, calories: 130 },
  'oats': { name: '燕麦 (生)', protein: 15, fat: 6.9, carbs: 66, calories: 389 },
  'whey protein': { name: '蛋白粉', protein: 78, fat: 4, carbs: 7, calories: 380 },
};

// English to Chinese translation - basic terms only
const ENGLISH_TO_CHINESE: Record<string, string> = {
  // Proteins
  'chicken': '鸡肉',
  'beef': '牛肉',
  'pork': '猪肉',
  'fish': '鱼',
  'salmon': '三文鱼',
  'shrimp': '虾',
  'egg': '蛋',
  'eggs': '蛋',
  // Parts
  'breast': '胸肉',
  'thigh': '腿肉',
  'tenderloin': '里脊',
  'ground': '碎',
  // States
  'raw': '生',
  'cooked': '熟',
  // Grains
  'rice': '米饭',
  'oats': '燕麦',
  'oatmeal': '燕麦',
  // Descriptors
  'skinless': '去皮',
  'boneless': '去骨',
  'lean': '瘦',
  'whole': '全',
  'white': '白',
};

// Blacklist keywords for filtering out cooked/prepared dishes
const BLACKLIST_KEYWORDS = [
  'soup', 'salad', 'fried', 'roasted', 'cooked', 'canned', 'prepared',
  'baked', 'grilled', 'stewed', 'braised', 'steamed', 'boiled',
  'sauce', 'gravy', 'curry', 'stir-fry', 'stir fry',
  'sandwich', 'burger', 'pizza', 'pasta', 'noodle',
  'biryani', 'teriyaki', 'tikka', 'masala',
  'orange chicken', 'general tso', 'kung pao', 'sweet and sour',
  'nugget', 'patty', 'sausage', 'bacon', 'ham',
  'deli', 'lunch meat', 'processed',
  'with vegetables', 'with rice', 'with sauce',
  'meal', 'dinner', 'entree', 'dish',
];

/**
 * Check if a food name should be filtered out (is a prepared dish)
 */
function shouldFilterOut(foodName: string): boolean {
  const lower = foodName.toLowerCase();
  return BLACKLIST_KEYWORDS.some(keyword => lower.includes(keyword));
}

/**
 * Calculate priority score for sorting (higher = better)
 * Raw ingredients rank higher
 */
function getPriorityScore(foodName: string): number {
  const lower = foodName.toLowerCase();
  let score = 0;

  // Prefer raw ingredients
  if (lower.includes('raw')) score += 100;

  // Foundation and SR Legacy data types are more accurate
  // (This is handled by dataType, but we can use it in the name too)

  // Penalize anything that sounds prepared
  if (lower.includes('cooked')) score -= 20;
  if (lower.includes('with')) score -= 50;

  // Prefer simpler names (fewer words = likely more basic ingredient)
  const wordCount = foodName.split(/[\s,]+/).length;
  score -= wordCount * 2;

  return score;
}

/**
 * Translate English food name to Chinese
 */
function translateFoodName(englishName: string): string {
  if (!englishName) return englishName;

  // Check if already contains Chinese characters
  if (/[\u4e00-\u9fa5]/.test(englishName)) {
    return englishName;
  }

  const lower = englishName.toLowerCase().trim();
  let result = lower;

  // Sort by length (longer phrases first)
  const sortedEntries = Object.entries(ENGLISH_TO_CHINESE)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [en, zh] of sortedEntries) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    result = result.replace(regex, zh);
  }

  // Clean up
  result = result
    .replace(/,\s*/g, ' ')
    .replace(/\s+/g, '')
    .trim();

  // If still mostly English, show both
  const chineseChars = (result.match(/[\u4e00-\u9fa5]/g) || []).length;
  const totalChars = result.replace(/\s/g, '').length;

  if (chineseChars < totalChars * 0.3 && chineseChars > 0) {
    return `${result} (${englishName})`;
  }

  return result || englishName;
}

/**
 * Get local fallback results for a query
 */
function getLocalResults(englishQuery: string): INutritionResult[] {
  const query = englishQuery.toLowerCase().replace(' raw', '').replace(' cooked', '');
  const results: INutritionResult[] = [];

  for (const [key, data] of Object.entries(LOCAL_NUTRITION_DATA)) {
    if (key.includes(query) || query.includes(key)) {
      results.push({
        fdcId: -1 * (results.length + 1),
        foodName: data.name,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        calories: data.calories,
        dataType: 'Local',
      });
    }
  }

  return results;
}

/**
 * Translate Chinese food name to English for API search
 */
function translateToEnglish(query: string): string {
  const trimmed = query.trim();

  if (FOOD_NAME_MAP[trimmed]) {
    return FOOD_NAME_MAP[trimmed];
  }

  for (const [chinese, english] of Object.entries(FOOD_NAME_MAP)) {
    if (trimmed.includes(chinese)) {
      return trimmed.replace(chinese, english);
    }
  }

  return trimmed;
}

/**
 * Filter and sort API results to show only raw ingredients
 */
function filterAndSortResults(results: INutritionResult[]): INutritionResult[] {
  return results
    // Filter out prepared dishes
    .filter(result => !shouldFilterOut(result.foodName))
    // Sort by priority (raw first)
    .sort((a, b) => getPriorityScore(b.foodName) - getPriorityScore(a.foodName))
    // Limit to top 10 results
    .slice(0, 10);
}

export interface INutritionResult {
  fdcId: number;
  foodName: string;
  brandName?: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
  dataType: string;
}

export interface INutritionSearchProps {
  onSelect: (result: INutritionResult) => void;
  onClose: () => void;
  className?: string;
}

// Quick search - basic ingredients only (8 items)
const QUICK_SEARCH_FOODS = ['牛肉', '鸡肉', '猪肉', '鱼', '虾', '鸡蛋', '米饭', '燕麦'];

export function NutritionSearch({ onSelect, onClose, className = '' }: INutritionSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<INutritionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const performSearch = useCallback(async (searchTerm: string) => {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setResults([]);
    setError(null);
    setIsLoading(true);
    setHasSearched(true);
    setLastSearchedQuery(trimmedTerm);

    const searchQuery = translateToEnglish(trimmedTerm);

    try {
      const url = `/api/nutrition/search?q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url, { signal: abortController.signal });

      if (!isMountedRef.current || abortController.signal.aborted) {
        return;
      }

      const data = await res.json();

      if (!isMountedRef.current || abortController.signal.aborted) {
        return;
      }

      if (!res.ok) {
        const localResults = getLocalResults(searchQuery);
        if (localResults.length > 0) {
          setResults(localResults);
        } else if (data.code === 'RATE_LIMIT') {
          setError('API请求过于频繁，请稍后再试');
        } else {
          setError('搜索失败，请重试');
        }
        return;
      }

      // Filter and sort results to show only raw ingredients
      const filteredResults = filterAndSortResults(data.results || []);

      if (filteredResults.length === 0) {
        const localResults = getLocalResults(searchQuery);
        if (localResults.length > 0) {
          setResults(localResults);
          return;
        }
      }

      setResults(filteredResults);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      if (isMountedRef.current && !abortController.signal.aborted) {
        const localResults = getLocalResults(searchQuery);
        if (localResults.length > 0) {
          setResults(localResults);
        } else {
          setError('网络错误，请检查连接后重试');
        }
      }
    } finally {
      if (isMountedRef.current && abortControllerRef.current === abortController) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleSearch = useCallback(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelect = (result: INutritionResult) => {
    onSelect(result);
    onClose();
  };

  const handleQuickSearchClick = useCallback((food: string) => {
    setQuery(food);
    performSearch(food);
  }, [performSearch]);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-[9999] ${className}`}
      onClick={handleBackgroundClick}
    >
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[90vw] max-w-[500px] rounded-2xl max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E8EB]">
          <h2 className="text-lg font-semibold text-[#2C3E50]">搜索食材</h2>
          <button
            onClick={onClose}
            className="text-[#5D6D7E] hover:text-[#2C3E50] text-xl"
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-[#E5E8EB]">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入食材名称"
              className="flex-1 px-4 py-3 border border-[#CCCCCC] rounded-lg text-base"
              autoFocus
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="px-6"
            >
              {isLoading ? '...' : '搜索'}
            </Button>
          </div>
          <p className="text-xs text-[#AEB6BF] mt-2">
            提示：只搜索基础食材（如「鸡胸肉」），不包括做好的菜品
          </p>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <Card className="!p-4 bg-[#FEE2E2] border-[#FECACA]">
              <p className="text-sm text-[#DC2626]">{error}</p>
            </Card>
          )}

          {!error && hasSearched && results.length === 0 && !isLoading && (
            <div className="bg-[#F8FAFC] rounded-xl p-5">
              <div className="text-center mb-4">
                <span className="text-4xl">🔍</span>
                <h3 className="text-base font-medium text-[#2C3E50] mt-2">
                  未找到「{lastSearchedQuery}」
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-[#5D6D7E] mb-2">搜索建议：</p>
                <ul className="text-xs text-[#5D6D7E] space-y-1 ml-5">
                  <li>• 使用基础食材名（如「鸡肉」而不是「宫保鸡丁」）</li>
                  <li>• 直接搜索原材料的生重</li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium text-[#5D6D7E] mb-2">常用食材：</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCH_FOODS.map((food) => (
                    <button
                      key={food}
                      onClick={() => handleQuickSearchClick(food)}
                      className="px-3 py-1.5 text-sm border border-[#4A90D9] text-[#4A90D9] rounded-full hover:bg-[#4A90D9] hover:text-white transition-colors"
                    >
                      {food}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!error && results.length > 0 && (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.fdcId}
                  onClick={() => handleSelect(result)}
                  className="cursor-pointer"
                >
                  <Card className="!p-4 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[#2C3E50] line-clamp-2">
                          {translateFoodName(result.foodName)}
                        </h3>
                      </div>
                      <span className="text-xs text-[#4A90D9] shrink-0">选择 →</span>
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                      <div className="bg-[#E8F5E9] rounded-lg py-2">
                        <p className="text-xs text-[#5D6D7E]">蛋白质</p>
                        <p className="text-sm font-semibold text-[#2E7D32]">{result.protein}g</p>
                      </div>
                      <div className="bg-[#FFF3E0] rounded-lg py-2">
                        <p className="text-xs text-[#5D6D7E]">脂肪</p>
                        <p className="text-sm font-semibold text-[#E65100]">{result.fat}g</p>
                      </div>
                      <div className="bg-[#E3F2FD] rounded-lg py-2">
                        <p className="text-xs text-[#5D6D7E]">碳水</p>
                        <p className="text-sm font-semibold text-[#1565C0]">{result.carbs}g</p>
                      </div>
                      <div className="bg-[#F3E5F5] rounded-lg py-2">
                        <p className="text-xs text-[#5D6D7E]">热量</p>
                        <p className="text-sm font-semibold text-[#7B1FA2]">{result.calories}</p>
                      </div>
                    </div>

                    <p className="text-xs text-[#AEB6BF] mt-2 text-right">每100g</p>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {!hasSearched && !isLoading && (
            <div className="text-center py-4 text-[#5D6D7E]">
              <p className="text-4xl mb-2">🥩</p>
              <p className="mb-4">记录原材料的生重</p>

              <div className="mt-4">
                <p className="text-sm text-[#AEB6BF] mb-2">常用食材：</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {QUICK_SEARCH_FOODS.map((food) => (
                    <button
                      key={food}
                      onClick={() => handleQuickSearchClick(food)}
                      className="px-3 py-1.5 text-sm border border-[#4A90D9] text-[#4A90D9] rounded-full hover:bg-[#4A90D9] hover:text-white transition-colors"
                    >
                      {food}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
