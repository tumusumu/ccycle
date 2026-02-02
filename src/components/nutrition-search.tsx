'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'RATE_LIMIT') {
          setError('API请求过于频繁，请稍后再试');
        } else {
          setError('搜索失败，请重试');
        }
        setResults([]);
        return;
      }

      setResults(data.results || []);
    } catch {
      setError('网络错误，请检查连接后重试');
      setResults([]);
    } finally {
      setIsLoading(false);
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

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 ${className}`}>
      <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[85vh] flex flex-col">
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
              placeholder="输入食材名称（英文效果更好）"
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
            提示：使用英文搜索更准确，如 &quot;chicken breast&quot;, &quot;beef&quot;, &quot;salmon&quot;
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
