<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen"
  >
    <!-- Header with Search Bar -->
    <div
      class="sticky top-0 z-10 backdrop-blur bg-gradient-to-b from-white/90 to-white/80 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-primary-950/50 border-b border-gray-200 dark:border-primary-900/30 px-4 py-4"
    >
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Ara</h2>

      <!-- Search Input -->
      <div class="relative">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          @input="handleSearch"
          @keydown.enter="handleSearch"
          type="text"
          placeholder="Gönderi, kişi veya hashtag ara..."
          class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-full border border-gray-200 dark:border-primary-500/20 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
        />
      </div>
    </div>

    <!-- Results Tabs -->
    <div
      v-if="searchQuery"
      class="sticky top-20 z-10 backdrop-blur bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-primary-900/30 flex"
    >
      <button
        @click="activeTab = 'all'"
        :class="[
          'flex-1 px-4 py-3 font-semibold text-center transition-all border-b-2',
          activeTab === 'all'
            ? 'text-primary-600 dark:text-primary-400 border-primary-600'
            : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white',
        ]"
      >
        Tümü
      </button>
      <button
        @click="activeTab = 'users'"
        :class="[
          'flex-1 px-4 py-3 font-semibold text-center transition-all border-b-2',
          activeTab === 'users'
            ? 'text-primary-600 dark:text-primary-400 border-primary-600'
            : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white',
        ]"
      >
        👥 Kişiler
      </button>
      <button
        @click="activeTab = 'posts'"
        :class="[
          'flex-1 px-4 py-3 font-semibold text-center transition-all border-b-2',
          activeTab === 'posts'
            ? 'text-primary-600 dark:text-primary-400 border-primary-600'
            : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white',
        ]"
      >
        📝 Gönderiler
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
      ></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!searchQuery"
      class="flex flex-col items-center justify-center h-64 text-center px-4"
    >
      <svg
        class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <p class="text-gray-500 dark:text-gray-400">Arama yap</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
        Gönderi, kişi veya hashtag ara
      </p>
    </div>

    <!-- No Results State -->
    <div
      v-else-if="searchQuery && !hasResults"
      class="flex flex-col items-center justify-center h-64 text-center px-4"
    >
      <svg
        class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 21l-4.35-4.35m0 0A7.5 7.5 0 105.65 5.65a7.5 7.5 0 0010 10z"
        />
      </svg>
      <p class="text-gray-500 dark:text-gray-400">
        "{{ searchQuery }}" için sonuç bulunamadı
      </p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
        Farklı bir arama terimi deneyin
      </p>
    </div>

    <!-- Results -->
    <div v-else>
      <!-- All Results Tab -->
      <div v-if="activeTab === 'all'">
        <!-- Users Section -->
        <div v-if="results.users?.length">
          <div
            class="px-4 py-3 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-950/30 border-b border-gray-200 dark:border-primary-900/30"
          >
            👥 Kişiler
          </div>
          <div class="divide-y divide-gray-200 dark:divide-primary-900/20">
            <div
              v-for="user in results.users"
              :key="user.id"
              class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="user.avatarUrl"
                  :alt="user.username"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">
                    {{ user.fullName }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    @{{ user.username }}
                  </p>
                </div>
              </div>
              <router-link
                :to="`/user/${user.id}`"
                class="px-4 py-2 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all"
              >
                Profil
              </router-link>
            </div>
          </div>
        </div>

        <!-- Posts Section -->
        <div v-if="results.posts?.length">
          <div
            class="px-4 py-3 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-950/30 border-b border-gray-200 dark:border-primary-900/30"
          >
            📝 Gönderiler
          </div>
          <div class="divide-y divide-gray-200 dark:divide-primary-900/20">
            <PostCard
              v-for="post in results.posts"
              :key="post.id"
              :post="post"
            />
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div
        v-else-if="activeTab === 'users' && results.users?.length"
        class="divide-y divide-gray-200 dark:divide-primary-900/20"
      >
        <div
          v-for="user in results.users"
          :key="user.id"
          class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <img
              :src="user.avatarUrl"
              :alt="user.username"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ user.fullName }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                @{{ user.username }}
              </p>
            </div>
          </div>
          <router-link
            :to="`/user/${user.id}`"
            class="px-4 py-2 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all"
          >
            Profil
          </router-link>
        </div>
      </div>

      <!-- Posts Tab -->
      <div
        v-else-if="activeTab === 'posts' && results.posts?.length"
        class="divide-y divide-gray-200 dark:divide-primary-900/20"
      >
        <PostCard v-for="post in results.posts" :key="post.id" :post="post" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import PostCard from "@/components/PostCard.vue";
import type { Post, User } from "@/types";

const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const searchQuery = ref("");
const activeTab = ref<"all" | "users" | "posts">("all");
const loading = ref(false);
const results = ref<{ users: User[]; posts: Post[] }>({ users: [], posts: [] });

let searchTimeout: ReturnType<typeof setTimeout>;

const hasResults = computed(() => {
  return (
    (results.value.users?.length || 0) > 0 ||
    (results.value.posts?.length || 0) > 0
  );
});

const handleSearch = () => {
  clearTimeout(searchTimeout);

  if (searchQuery.value.trim().length < 2) {
    results.value = { users: [], posts: [] };
    return;
  }

  searchTimeout = setTimeout(async () => {
    loading.value = true;
    try {
      const params: any = { q: searchQuery.value };
      if (authStore.user) {
        params.userId = authStore.user.id;
      }

      const response = await apiClient.get("/search", { params });
      results.value = response.data;
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Arama sırasında bir hata oluştu.");
    } finally {
      loading.value = false;
    }
  }, 500);
};

// URL query parametresini oku ve arama yap
onMounted(() => {
  const query = route.query.q as string;
  if (query) {
    searchQuery.value = query;
    handleSearch();
  }
});

// Route değişikliklerini dinle (URL query param değiştiğinde)
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery as string;
      handleSearch();
    }
  },
);
</script>
