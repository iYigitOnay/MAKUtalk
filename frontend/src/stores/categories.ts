import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";
import type { Category } from "@/types";

export interface TrendingCategory extends Category {
  weeklyPostCount: number;
}

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref<Category[]>([]);
  const trendingCategories = ref<TrendingCategory[]>([]);
  const loading = ref(false);

  const fetchCategories = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get<Category[]>("/categories");
      categories.value = response.data;
    } catch (error) {
      console.error("Categories fetch error:", error);
    } finally {
      loading.value = false;
    }
  };

  const fetchTrendingCategories = async () => {
    try {
      const response = await apiClient.get<TrendingCategory[]>("/categories/trending");
      trendingCategories.value = response.data;
    } catch (error) {
      console.error("Trending categories fetch error:", error);
    }
  };

  return {
    categories,
    trendingCategories,
    loading,
    fetchCategories,
    fetchTrendingCategories,
  };
});
