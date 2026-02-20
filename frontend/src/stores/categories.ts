import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";
import type { Category } from "@/types";

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);

  const fetchCategories = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get<Category[]>("/categories");
      categories.value = response.data;
    } catch (error) {
      console.error("Categories fetch error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    categories,
    loading,
    fetchCategories,
  };
});
