'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Chinese to English food name mapping for API search
const FOOD_NAME_MAP: Record<string, string> = {
  // Meat
  '牛肉': 'beef',
  '鸡肉': 'chicken',
  '鸡胸肉': 'chicken breast',
  '鸡腿': 'chicken thigh',
  '猪肉': 'pork',
  '猪里脊': 'pork tenderloin',
  '羊肉': 'lamb',
  // Seafood
  '三文鱼': 'salmon',
  '鱼': 'fish',
  '虾': 'shrimp',
  '虾仁': 'shrimp',
  '金枪鱼': 'tuna',
  '鳕鱼': 'cod',
  '带鱼': 'hairtail fish',
  '鲈鱼': 'sea bass',
  // Grains
  '燕麦': 'oatmeal',
  '米饭': 'rice cooked',
  '糙米': 'brown rice',
  '面条': 'noodles',
  '面包': 'bread',
  '馒头': 'steamed bun',
  // Eggs & Dairy
  '鸡蛋': 'egg',
  '蛋白': 'egg white',
  '牛奶': 'milk',
  '酸奶': 'yogurt',
  '奶酪': 'cheese',
  // Vegetables
  '西兰花': 'broccoli',
  '菠菜': 'spinach',
  '生菜': 'lettuce',
  '番茄': 'tomato',
  '西红柿': 'tomato',
  '黄瓜': 'cucumber',
  '胡萝卜': 'carrot',
  '土豆': 'potato',
  '红薯': 'sweet potato',
  '紫薯': 'purple sweet potato',
  // Legumes & Nuts
  '豆腐': 'tofu',
  '豆浆': 'soy milk',
  '花生': 'peanut',
  '杏仁': 'almond',
  '核桃': 'walnut',
  // Protein supplements
  '蛋白粉': 'whey protein',
  '乳清蛋白': 'whey protein',
};

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

export function NutritionSearch({ onSelect, onClose, className = '' }: INutritionSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<INutritionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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
        if (data.code === 'RATE_LIMIT') {
          setError('API请求过于频繁，请稍后再试');
        } else {
          setError('搜索失败，请重试');
        }
        setResults([]);
        return;
      }

      console.log('[NutritionSearch] Results count:', data.results?.length || 0);
      setResults(data.results || []);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Only set error if still mounted
      if (isMountedRef.current) {
        setError('网络错误，请检查连接后重试');
        setResults([]);
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
            <div className="text-center py-8 text-[#5D6D7E]">
              <p>未找到相关食材</p>
              <p className="text-xs mt-1">请尝试其他关键词</p>
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
            <div className="text-center py-8 text-[#5D6D7E]">
              <p className="text-4xl mb-2">🔍</p>
              <p>输入食材名称开始搜索</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
