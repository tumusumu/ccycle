'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Chinese to English food name mapping for API search
// Includes both full names and short forms for better matching
const FOOD_NAME_MAP: Record<string, string> = {
  // Meat - full and short forms
  '牛肉': 'beef',
  '牛': 'beef',
  '鸡肉': 'chicken',
  '鸡': 'chicken',
  '鸡胸肉': 'chicken breast',
  '鸡胸': 'chicken breast',
  '鸡腿': 'chicken thigh',
  '鸡翅': 'chicken wing',
  '猪肉': 'pork',
  '猪': 'pork',
  '猪里脊': 'pork tenderloin',
  '羊肉': 'lamb',
  '羊': 'lamb',
  '鸭肉': 'duck',
  '鸭': 'duck',
  // Seafood
  '三文鱼': 'salmon',
  '鱼肉': 'fish',
  '鱼': 'fish',
  '虾': 'shrimp',
  '虾仁': 'shrimp',
  '大虾': 'prawn',
  '金枪鱼': 'tuna',
  '吞拿鱼': 'tuna',
  '鳕鱼': 'cod',
  '带鱼': 'hairtail',
  '鲈鱼': 'sea bass',
  '龙虾': 'lobster',
  '蟹': 'crab',
  '螃蟹': 'crab',
  // Grains
  '燕麦': 'oatmeal',
  '麦片': 'oatmeal',
  '米饭': 'rice',
  '米': 'rice',
  '白米': 'white rice',
  '糙米': 'brown rice',
  '面条': 'noodles',
  '面': 'noodles',
  '面包': 'bread',
  '馒头': 'steamed bun',
  '红薯': 'sweet potato',
  '地瓜': 'sweet potato',
  '紫薯': 'purple sweet potato',
  '土豆': 'potato',
  '玉米': 'corn',
  // Eggs & Dairy
  '鸡蛋': 'egg',
  '蛋': 'egg',
  '蛋白': 'egg white',
  '蛋黄': 'egg yolk',
  '牛奶': 'milk',
  '奶': 'milk',
  '酸奶': 'yogurt',
  '奶酪': 'cheese',
  '芝士': 'cheese',
  // Vegetables
  '西兰花': 'broccoli',
  '花椰菜': 'broccoli',
  '菠菜': 'spinach',
  '生菜': 'lettuce',
  '番茄': 'tomato',
  '西红柿': 'tomato',
  '黄瓜': 'cucumber',
  '胡萝卜': 'carrot',
  '白菜': 'cabbage',
  '卷心菜': 'cabbage',
  '芹菜': 'celery',
  '青椒': 'green pepper',
  '洋葱': 'onion',
  '蘑菇': 'mushroom',
  // Legumes & Nuts
  '豆腐': 'tofu',
  '豆浆': 'soy milk',
  '黄豆': 'soybean',
  '花生': 'peanut',
  '杏仁': 'almond',
  '核桃': 'walnut',
  '腰果': 'cashew',
  // Fruits
  '苹果': 'apple',
  '香蕉': 'banana',
  '橙子': 'orange',
  '葡萄': 'grape',
  '蓝莓': 'blueberry',
  '草莓': 'strawberry',
  '牛油果': 'avocado',
  // Protein supplements
  '蛋白粉': 'whey protein',
  '乳清蛋白': 'whey protein',
  '增肌粉': 'mass gainer',
};

// Local nutrition data fallback (per 100g)
// Used when API fails or for quick results
const LOCAL_NUTRITION_DATA: Record<string, { name: string; protein: number; fat: number; carbs: number; calories: number }> = {
  'beef': { name: '牛肉 (本地数据)', protein: 21, fat: 2.5, carbs: 0, calories: 106 },
  'chicken': { name: '鸡肉 (本地数据)', protein: 23, fat: 1.2, carbs: 0, calories: 105 },
  'chicken breast': { name: '鸡胸肉 (本地数据)', protein: 24, fat: 1.5, carbs: 0, calories: 110 },
  'pork': { name: '猪肉 (本地数据)', protein: 20, fat: 7, carbs: 0, calories: 143 },
  'fish': { name: '鱼肉 (本地数据)', protein: 18, fat: 3, carbs: 0, calories: 99 },
  'salmon': { name: '三文鱼 (本地数据)', protein: 20, fat: 13, carbs: 0, calories: 200 },
  'shrimp': { name: '虾肉 (本地数据)', protein: 18.6, fat: 0.8, carbs: 0, calories: 82 },
  'egg': { name: '鸡蛋 (本地数据)', protein: 13, fat: 11, carbs: 1, calories: 155 },
  'rice': { name: '米饭-熟 (本地数据)', protein: 2.6, fat: 0.3, carbs: 28, calories: 130 },
  'oatmeal': { name: '燕麦 (本地数据)', protein: 15, fat: 6.9, carbs: 66, calories: 389 },
  'whey protein': { name: '蛋白粉 (本地数据)', protein: 78, fat: 4, carbs: 7, calories: 380 },
  'tofu': { name: '豆腐 (本地数据)', protein: 8, fat: 4, carbs: 2, calories: 76 },
  'milk': { name: '牛奶 (本地数据)', protein: 3.4, fat: 3.6, carbs: 4.8, calories: 64 },
  'broccoli': { name: '西兰花 (本地数据)', protein: 2.8, fat: 0.4, carbs: 7, calories: 34 },
  'sweet potato': { name: '红薯 (本地数据)', protein: 1.6, fat: 0.1, carbs: 20, calories: 86 },
  'banana': { name: '香蕉 (本地数据)', protein: 1.1, fat: 0.3, carbs: 23, calories: 89 },
  'avocado': { name: '牛油果 (本地数据)', protein: 2, fat: 15, carbs: 9, calories: 160 },
};

/**
 * Get local fallback results for a query
 */
function getLocalResults(englishQuery: string): INutritionResult[] {
  const query = englishQuery.toLowerCase();
  const results: INutritionResult[] = [];

  for (const [key, data] of Object.entries(LOCAL_NUTRITION_DATA)) {
    if (key.includes(query) || query.includes(key)) {
      results.push({
        fdcId: -1 * (results.length + 1), // Negative ID for local data
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
 * Returns original query if no translation found
 */
function translateToEnglish(query: string): string {
  const trimmed = query.trim();

  // Check for exact match
  if (FOOD_NAME_MAP[trimmed]) {
    return FOOD_NAME_MAP[trimmed];
  }

  // Check for partial match (if query contains a known Chinese word)
  for (const [chinese, english] of Object.entries(FOOD_NAME_MAP)) {
    if (trimmed.includes(chinese)) {
      return trimmed.replace(chinese, english);
    }
  }

  // Return original if no translation needed
  return trimmed;
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

// Common foods for quick search buttons
const QUICK_SEARCH_FOODS = ['牛肉', '鸡肉', '鱼', '虾', '鸡蛋', '米饭', '燕麦', '豆腐'];

export function NutritionSearch({ onSelect, onClose, className = '' }: INutritionSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<INutritionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState(''); // Track searched term for display

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    // Translate Chinese to English for API search
    const trimmedQuery = query.trim();
    setLastSearchedQuery(trimmedQuery); // Save for display in no-results message
    const searchQuery = translateToEnglish(trimmedQuery);

    // Debug logging
    console.log('[NutritionSearch] Original query:', trimmedQuery);
    console.log('[NutritionSearch] Translated query:', searchQuery);
    console.log('[NutritionSearch] Was translated:', trimmedQuery !== searchQuery);

    try {
      const url = `/api/nutrition/search?q=${encodeURIComponent(searchQuery)}`;
      console.log('[NutritionSearch] Fetching:', url);

      const res = await fetch(url, { signal: abortController.signal });

      console.log('[NutritionSearch] Response status:', res.status);

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      const data = await res.json();
      console.log('[NutritionSearch] Response data:', data);

      // Check again after parsing JSON
      if (!isMountedRef.current) return;

      if (!res.ok) {
        console.error('[NutritionSearch] API error:', data);
        // Try local fallback
        const localResults = getLocalResults(searchQuery);
        console.log('[NutritionSearch] Using local fallback, found:', localResults.length);

        if (localResults.length > 0) {
          setResults(localResults);
          setError(null);
        } else if (data.code === 'RATE_LIMIT') {
          setError('API请求过于频繁，请稍后再试');
          setResults([]);
        } else {
          setError('搜索失败，请重试');
          setResults([]);
        }
        return;
      }

      console.log('[NutritionSearch] Results count:', data.results?.length || 0);

      // If API returns no results, try local fallback
      if (!data.results || data.results.length === 0) {
        const localResults = getLocalResults(searchQuery);
        console.log('[NutritionSearch] API empty, trying local fallback:', localResults.length);
        if (localResults.length > 0) {
          setResults(localResults);
          return;
        }
      }

      setResults(data.results || []);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Only set error if still mounted
      if (isMountedRef.current) {
        // Try local fallback on network error
        const localResults = getLocalResults(searchQuery);
        console.log('[NutritionSearch] Network error, trying local fallback:', localResults.length);

        if (localResults.length > 0) {
          setResults(localResults);
          setError(null);
        } else {
          setError('网络错误，请检查连接后重试');
          setResults([]);
        }
      }
    } finally {
      // Only update loading state if still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelect = (result: INutritionResult) => {
    onSelect(result);
    onClose();
  };

  // Handle quick search button click
  const handleQuickSearch = (food: string) => {
    setQuery(food);
    // Trigger search after state update
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.value = food;
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    }, 0);
    // Directly perform search
    setQuery(food);
  };

  // Effect to trigger search when query changes via quick search
  const handleQuickSearchClick = async (food: string) => {
    setQuery(food);
    setLastSearchedQuery(food);
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const searchQuery = translateToEnglish(food);
    console.log('[NutritionSearch] Quick search:', food, '→', searchQuery);

    try {
      const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(searchQuery)}`);
      if (!isMountedRef.current) return;

      const data = await res.json();

      if (!res.ok || !data.results || data.results.length === 0) {
        // Try local fallback
        const localResults = getLocalResults(searchQuery);
        if (localResults.length > 0) {
          setResults(localResults);
          setError(null);
        } else {
          setResults([]);
        }
      } else {
        setResults(data.results);
      }
    } catch {
      const localResults = getLocalResults(searchQuery);
      if (localResults.length > 0) {
        setResults(localResults);
        setError(null);
      } else {
        setResults([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Handle background click to close
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
      {/* Centered modal with responsive width */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[90vw] max-w-[500px] rounded-2xl max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E8EB]">
          <h2 className="text-lg font-semibold text-[#2C3E50]">搜索食材营养</h2>
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
              placeholder="输入食材名称（中英文均可）"
              className="flex-1 px-4 py-3 border border-[#CCCCCC] rounded-lg text-base"
              autoFocus
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="px-6"
            >
              {isLoading ? '搜索中...' : '搜索'}
            </Button>
          </div>
          <p className="text-xs text-[#AEB6BF] mt-2">
            提示：支持中文搜索，如「鸡胸肉」「牛肉」「三文鱼」
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
              {/* Icon and Title */}
              <div className="text-center mb-4">
                <span className="text-4xl">🔍</span>
                <h3 className="text-base font-medium text-[#2C3E50] mt-2">
                  未找到「{lastSearchedQuery}」的营养数据
                </h3>
              </div>

              {/* Search Tips */}
              <div className="mb-4">
                <p className="text-sm font-medium text-[#5D6D7E] mb-2">💡 搜索建议：</p>
                <ul className="text-xs text-[#5D6D7E] space-y-1 ml-5">
                  <li>• 尝试更通用的名称（如「鸡肉」而不是「鸡胸肉」）</li>
                  <li>• 使用英文搜索可能获得更多结果</li>
                  <li>• 检查是否有拼写错误</li>
                </ul>
              </div>

              {/* Quick Search Buttons */}
              <div>
                <p className="text-sm font-medium text-[#5D6D7E] mb-2">📋 试试这些常用食材：</p>
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
                          {result.foodName}
                        </h3>
                        {result.brandName && (
                          <p className="text-xs text-[#AEB6BF] mt-0.5">{result.brandName}</p>
                        )}
                      </div>
                      <span className="text-xs text-[#4A90D9] shrink-0">选择 →</span>
                    </div>

                    {/* Nutrition Info */}
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
              <p className="text-4xl mb-2">🔍</p>
              <p className="mb-4">输入食材名称开始搜索</p>

              {/* Quick Search Buttons */}
              <div className="mt-4">
                <p className="text-sm text-[#AEB6BF] mb-2">或点击常用食材：</p>
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
