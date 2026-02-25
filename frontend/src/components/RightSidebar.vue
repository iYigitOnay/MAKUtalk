<!-- src/components/RightSidebar.vue -->
<template>
  <div class="p-4 space-y-4">
    <!-- Arama -->
    <div class="relative">
      <input
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        @input="searchQuery"
        type="text"
        placeholder="MAKUtalk'ta ara..."
        class="w-full pl-10 pr-10 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm border border-transparent focus:border-primary-600 outline-none transition-colors"
      />
      <button
        @click="handleSearch"
        type="button"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors p-1"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
          />
        </svg>
      </button>
    </div>

    <!-- Kategoriler -->
    <div
      class="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-primary-900/20 overflow-hidden"
    >
      <div
        class="px-4 py-3 border-b border-gray-200 dark:border-primary-900/20"
      >
        <h2 class="font-bold text-gray-900 dark:text-white">Kategoriler</h2>
      </div>

      <div v-if="categoriesStore.loading" class="p-4 space-y-2">
        <div
          v-for="i in 5"
          :key="i"
          class="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
        />
      </div>

      <div v-else class="p-2 space-y-1">
        <button
          @click="selectCategory(null)"
          :class="[
            'w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            !activeCategory
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
        >
          Tümü
        </button>

        <button
          v-for="cat in categoriesStore.categories"
          :key="cat.id"
          @click="selectCategory(cat.id)"
          :class="[
            'w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
            activeCategory === cat.id
              ? 'text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
          ]"
          :style="
            activeCategory === cat.id ? { backgroundColor: cat.color } : {}
          "
        >
          <span class="truncate">{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Popüler Hashtagler -->
    <div
      class="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-primary-900/20 overflow-hidden"
    >
      <div
        class="px-4 py-3 border-b border-gray-200 dark:border-primary-900/20"
      >
        <h2 class="font-bold text-gray-900 dark:text-white">
          Popüler Hashtagler
        </h2>
      </div>

      <div v-if="loadingHashtags" class="p-4 space-y-2">
        <div
          v-for="i in 5"
          :key="i"
          class="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
        />
      </div>

      <div v-else-if="hashtags.length > 0" class="p-2 space-y-1">
        <button
          v-for="tag in hashtags"
          :key="tag.tag"
          @click="searchHashtag(tag.tag)"
          class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">
                #{{ tag.tag }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ tag.count }} gönderi
              </p>
            </div>
            <svg
              class="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      </div>

      <div v-else class="p-4 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Hashtag bulunamadı
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCategoriesStore } from "@/stores/categories";
import { usePostsStore } from "@/stores/posts";
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/api/client";

const router = useRouter();
const categoriesStore = useCategoriesStore();
const postsStore = usePostsStore();
const authStore = useAuthStore();

const searchQuery = ref("");
const hashtags = ref<{ tag: string; count: number }[]>([]);
const loadingHashtags = ref(true);
const activeCategory = ref<number | null>(null);

onMounted(async () => {
  await categoriesStore.fetchCategories();
  await fetchHashtags();
});

async function fetchHashtags() {
  try {
    const res = await apiClient.get("/search/hashtags/popular?limit=8");
    hashtags.value = res.data;
  } catch {
    hashtags.value = [];
  } finally {
    loadingHashtags.value = false;
  }
}

function selectCategory(id: number | null) {
  activeCategory.value = id;
  if (id) {
    postsStore.fetchPostsByCategory(id, authStore.user?.id);
  } else {
    postsStore.resetCategory();
    postsStore.fetchPosts(authStore.user?.id);
  }
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
  }
}

function searchHashtag(tag: string) {
  router.push(`/search?q=${encodeURIComponent(tag)}`);
}
</script>
