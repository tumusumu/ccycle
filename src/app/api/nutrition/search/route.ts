import { NextRequest, NextResponse } from 'next/server';

// USDA FoodData Central API
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';

interface IUSDANutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface IUSDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandName?: string;
  foodNutrients: IUSDANutrient[];
}

interface IUSDASearchResponse {
  foods: IUSDAFood[];
  totalHits: number;
}

export interface INutritionSearchResult {
  fdcId: number;
  foodName: string;
  brandName?: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
  dataType: string;
}

// USDA nutrient IDs
const NUTRIENT_IDS = {
  PROTEIN: 1003,
  FAT: 1004,
  CARBS: 1005,
  CALORIES: 1008,
};

function extractNutrient(nutrients: IUSDANutrient[], nutrientId: number): number {
  const nutrient = nutrients.find((n) => n.nutrientId === nutrientId);
  return nutrient ? Math.round(nutrient.value * 10) / 10 : 0;
}

function transformUSDAFood(food: IUSDAFood): INutritionSearchResult {
  return {
    fdcId: food.fdcId,
    foodName: food.description,
    brandName: food.brandName,
    protein: extractNutrient(food.foodNutrients, NUTRIENT_IDS.PROTEIN),
    fat: extractNutrient(food.foodNutrients, NUTRIENT_IDS.FAT),
    carbs: extractNutrient(food.foodNutrients, NUTRIENT_IDS.CARBS),
    calories: extractNutrient(food.foodNutrients, NUTRIENT_IDS.CALORIES),
    dataType: food.dataType,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const pageSize = searchParams.get('pageSize') || '10';

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'Search query is required', code: 'MISSING_QUERY' },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`${USDA_API_BASE}/foods/search`);
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('query', query.trim());
    url.searchParams.set('pageSize', pageSize);
    // Prefer foundation and SR Legacy data types for more accurate nutrition data
    url.searchParams.set('dataType', 'Foundation,SR Legacy,Survey (FNDDS)');

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.', code: 'RATE_LIMIT' },
          { status: 429 }
        );
      }
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data: IUSDASearchResponse = await response.json();

    const results: INutritionSearchResult[] = data.foods
      .map(transformUSDAFood)
      // Filter out items with no nutrition data
      .filter((item) => item.protein > 0 || item.fat > 0 || item.carbs > 0 || item.calories > 0);

    return NextResponse.json({
      results,
      totalHits: data.totalHits,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Nutrition search error:', error);
    return NextResponse.json(
      { error: 'Failed to search nutrition data', code: 'SEARCH_FAILED' },
      { status: 500 }
    );
  }
}
