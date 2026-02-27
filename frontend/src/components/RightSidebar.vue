<!-- src/components/RightSidebar.vue -->
<template>
  <div class="p-4 space-y-4">
    <!-- Arama -->
    <div class="relative group">
      <input
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        type="text"
        placeholder="MAKUtalk'ta ara..."
        class="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 text-sm border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
      />
      <div
        class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
      >
        <svg
          class="w-4.5 h-4.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
          />
        </svg>
      </div>
    </div>

    <!-- Haftanın Nabzı (Trend Kategoriler) -->
    <div
      v-if="categoriesStore.trendingCategories.length > 0"
      class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-primary-900/20 overflow-hidden shadow-sm"
    >
      <div class="px-4 py-3 border-b border-gray-100 dark:border-primary-900/10 bg-gray-50/50 dark:bg-gray-800/50">
        <h2 class="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-[0.15em]">
          Haftanın Nabzı
        </h2>
      </div>
      
      <div class="p-2 space-y-2">
        <div
          v-for="cat in categoriesStore.trendingCategories.slice(0, 3)"
          :key="cat.id"
          class="relative px-4 py-3 rounded-xl border border-gray-100 dark:border-primary-900/10 transition-all hover:shadow-md hover:-translate-y-0.5 overflow-hidden group"
        >
          <!-- Kategori Renk Şeridi -->
          <div 
            class="absolute left-0 top-0 bottom-0 w-1.5"
            :style="{ backgroundColor: cat.color }"
          ></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-black text-gray-900 dark:text-white text-[13px] leading-tight mb-1">
                {{ cat.name }}
              </p>
              <div class="flex items-center gap-2.5">
                <!-- Canlı Nabız Göstergesi -->
                <div class="relative flex h-2 w-2">
                  <span 
                    class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    :style="{ backgroundColor: cat.color }"
                  ></span>
                  <span 
                    class="relative inline-flex rounded-full h-2 w-2"
                    :style="{ backgroundColor: cat.color }"
                  ></span>
                </div>
                <p class="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {{ cat.weeklyPostCount }} YENİ PAYLAŞIM
                </p>
              </div>
            </div>
            
            <!-- Küçük bir trend göstergesi (Sadece Yanıp Sönen) -->
            <div class="relative group-hover:scale-110 transition-transform duration-300">
              <div 
                class="absolute inset-0 blur-md opacity-25 animate-pulse"
                :style="{ color: cat.color }"
              >
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
              </div>
              <svg 
                class="w-7 h-7 relative z-10" 
                :style="{ color: cat.color }" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popüler Hashtagler -->
    <div
      class="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-primary-900/20 overflow-hidden"
    >
      <div
        class="px-4 py-3 border-b border-gray-200 dark:border-primary-900/20"
      >
        <h2 class="font-black text-gray-900 dark:text-white">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
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
let refreshInterval: any = null;

const sortedCategories = computed(() => {
  const order = [
    "Genel",
    "Duyuru",
    "Etkinlik",
    "Arıza-Kayıp",
    "Satılık",
    "Soru-Cevap",
  ];
  return [...categoriesStore.categories].sort((a, b) => {
    const indexA = order.indexOf(a.name);
    const indexB = order.indexOf(b.name);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
});

const refreshData = async () => {
  await Promise.all([
    categoriesStore.fetchTrendingCategories(),
    fetchHashtags()
  ]);
};

onMounted(async () => {
  await categoriesStore.fetchCategories();
  await refreshData();
  
  // Canlı Güncelleme: Her post atıldığında trendleri hemen tazele
  postsStore.onPostCreated(() => {
    console.log("🔥 Yeni post algılandı, trendler güncelleniyor...");
    refreshData();
  });

  refreshInterval = setInterval(refreshData, 5 * 60 * 1000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
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
