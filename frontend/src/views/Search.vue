<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen"
  >
    <div
      class="sticky top-0 z-10 backdrop-blur bg-gradient-to-b from-white/95 via-white/90 to-white/85 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-primary-950/50 border-b border-gray-200 dark:border-primary-900/30 p-6"
    >
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0"
        >
          <svg
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h2
          class="text-2xl font-black text-slate-900 dark:text-white tracking-tight"
        >
          Keşfet
        </h2>
      </div>

      <!-- Search Input -->
      <div class="relative group">
        <svg
          class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
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
          class="w-full pl-11 pr-4 py-3 bg-slate-100/50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm"
        />
      </div>
    </div>

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
        Kişiler
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
        Gönderiler
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
      ></div>
    </div>

    <div
      v-else-if="!searchQuery"
      class="p-4 space-y-8 animate-in fade-in duration-500 lg:hidden"
    >
      <!-- Haftanın Nabzı (Trend Kategoriler - Web Stili) -->
      <section v-if="trendingCategories.length > 0">
        <div
          class="px-2 py-3 border-b border-gray-100 dark:border-primary-900/10 mb-4"
        >
          <h2
            class="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-[0.15em]"
          >
            Haftanın Nabzı
          </h2>
        </div>

        <div class="space-y-3">
          <div
            v-for="cat in trendingCategories.slice(0, 4)"
            :key="cat.id"
            class="relative px-5 py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-primary-900/10 transition-all overflow-hidden group cursor-default"
          >
            <!-- Kategori Renk Şeridi -->
            <div
              class="absolute left-0 top-0 bottom-0 w-1.5"
              :style="{ backgroundColor: cat.color || '#3b82f6' }"
            ></div>

            <div class="flex items-center justify-between">
              <div>
                <p
                  class="font-black text-gray-900 dark:text-white text-[14px] leading-tight mb-1.5 uppercase tracking-tight"
                >
                  {{ cat.name }}
                </p>
                <div class="flex items-center gap-2.5">
                  <!-- Canlı Nabız Göstergesi -->
                  <div class="relative flex h-2 w-2">
                    <span
                      class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      :style="{ backgroundColor: cat.color || '#3b82f6' }"
                    ></span>
                    <span
                      class="relative inline-flex rounded-full h-2 w-2"
                      :style="{ backgroundColor: cat.color || '#3b82f6' }"
                    ></span>
                  </div>
                  <p
                    class="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    {{ cat.weeklyPostCount }} YENİ PAYLAŞIM
                  </p>
                </div>
              </div>

              <!-- Trend Grafiği İkonu -->
              <div class="relative">
                <svg
                  class="w-8 h-8 opacity-20"
                  :style="{ color: cat.color || '#3b82f6' }"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Popüler Hashtagler (Web Stili) -->
      <section>
        <div
          class="px-2 py-3 border-b border-gray-100 dark:border-primary-900/10 mb-4 flex justify-between items-center"
        >
          <h2
            class="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-[0.15em]"
          >
            Popüler Etiketler
          </h2>
          <div
            v-if="trendsLoading"
            class="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>

        <div
          v-if="trendingHashtags.length > 0"
          class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-primary-900/10 divide-y divide-gray-50 dark:divide-primary-900/10 overflow-hidden shadow-sm"
        >
          <button
            v-for="tag in trendingHashtags"
            :key="tag.name"
            @click="$router.push(`/hashtag/${tag.name}`)"
            class="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group flex items-center justify-between"
          >
            <div>
              <p
                class="font-bold text-gray-900 dark:text-white text-sm tracking-tight"
              >
                #{{ tag.name }}
              </p>
              <p
                class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-0.5"
              >
                {{ tag.count }} GÖNDERİ
              </p>
            </div>
            <svg
              class="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <div
          v-else-if="!trendsLoading"
          class="py-10 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl opacity-30 italic text-xs font-black uppercase"
        >
          Henüz trend etiket yok.
        </div>
      </section>

      <!-- Footer Info -->
      <div class="py-10 text-center opacity-20">
        <p
          class="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]"
        >
          MAKUtalk Discover Engine
        </p>
      </div>
    </div>

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

    <div v-else>
      <div v-if="activeTab === 'all'">
        <div v-if="results.users?.length">
          <div
            class="px-4 py-3 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-950/30 border-b border-gray-200 dark:border-primary-900/30"
          >
            Kişiler
          </div>
          <div class="divide-y divide-gray-200 dark:divide-primary-900/20">
            <div
              v-for="user in results.users"
              :key="user.id"
              class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <img
                  v-if="user.avatarUrl"
                  :src="getImageUrl(user.avatarUrl)"
                  :alt="user.username"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg"
                >
                  {{ user.username?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">
                    {{ user.fullName || user.username }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    @{{ user.username }}
                  </p>
                </div>
              </div>
              <router-link
                :to="`/profile/${user.username}`"
                class="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
              >
                Profil
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="postsStore.searchResults?.length">
          <div
            class="px-4 py-3 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-950/30 border-b border-gray-200 dark:border-primary-900/30"
          >
            Gönderiler
          </div>
          <div class="divide-y divide-gray-200 dark:divide-primary-900/20">
            <PostCard
              v-for="post in postsStore.searchResults"
              :key="post.id"
              :post="post"
            />
          </div>
        </div>
      </div>

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
              v-if="user.avatarUrl"
              :src="user.avatarUrl"
              :alt="user.username"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div
              v-else
              class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg"
            >
              {{ user.username?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ user.fullName || user.username }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                @{{ user.username }}
              </p>
            </div>
          </div>
          <router-link
            :to="`/profile/${user.username}`"
            class="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
          >
            Profil
          </router-link>
        </div>
      </div>

      <!-- Posts Tab -->
      <div
        v-else-if="activeTab === 'posts' && postsStore.searchResults?.length"
        class="divide-y divide-gray-200 dark:divide-primary-900/20"
      >
        <PostCard v-for="post in postsStore.searchResults" :key="post.id" :post="post" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useProfileStore } from "@/stores/profile";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import PostCard from "@/components/PostCard.vue";
import type { Post, User } from "@/types";

const route = useRoute();
const authStore = useAuthStore();
const postsStore = usePostsStore();
const profileStore = useProfileStore();
const toast = useToast();

const getImageUrl = (path: string | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const searchQuery = ref("");
const activeTab = ref<"all" | "users" | "posts">("all");
const loading = ref(false);
const results = ref<{ users: User[] }>({ users: [] });

// CANLI SENKRONİZASYON: Global post değişimlerini izle ve arama sonuçlarına yansıt
watch(
  [() => postsStore.posts, () => profileStore.userPosts, () => profileStore.userLikedPosts],
  () => {
    if (!postsStore.searchResults.length) return;

    // Tüm global kaynakları birleştirip bir "gerçeklik haritası" oluştur
    const globalPosts = [...postsStore.posts, ...profileStore.userPosts, ...profileStore.userLikedPosts];
    
    postsStore.searchResults = postsStore.searchResults.map(searchPost => {
      // Bu postun (veya eğer bu bir repost ise orijinalinin) global bir kopyasını bul
      const targetId = searchPost.repostId || searchPost.id;
      
      const match = globalPosts.find(p => (p.repostId || p.id) === targetId);
      
      if (match) {
        return {
          ...searchPost,
          isLiked: match.isLiked,
          isReposted: match.isReposted,
          _count: { ...match._count }
        };
      }
      return searchPost;
    });
  },
  { deep: true }
);

// Trends data
const trendingCategories = ref<any[]>([]);
const trendingHashtags = ref<any[]>([]);
const trendsLoading = ref(false);

const fetchTrends = async () => {
  trendsLoading.value = true;
  try {
    const [catRes, tagRes] = await Promise.all([
      apiClient.get("/categories/trending"),
      apiClient.get("/search/hashtags/popular?limit=12"),
    ]);
    trendingCategories.value = catRes.data;
    trendingHashtags.value = tagRes.data.map((t: any) => ({
      name: t.tag,
      count: t.count,
    }));
  } catch (err) {
    console.error("Trends fetch error:", err);
  } finally {
    trendsLoading.value = false;
  }
};

let searchTimeout: ReturnType<typeof setTimeout>;

const hasResults = computed(() => {
  return (
    (results.value.users?.length || 0) > 0 ||
    (postsStore.searchResults?.length || 0) > 0
  );
});

const handleSearch = () => {
  clearTimeout(searchTimeout);

  if (searchQuery.value.trim().length < 2) {
    results.value.users = [];
    postsStore.searchResults = [];
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
      results.value.users = response.data.users || [];
      postsStore.searchResults = response.data.posts || [];
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
  fetchTrends();
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

// CANLI PROFİL GÜNCELLEMESİ: Kendi bilgilerimiz değişirse arama sonuçlarını tazele
watch(
  () => authStore.user,
  (newUser) => {
    if (!newUser || !hasResults.value) return;

    const userId = Number(newUser.id);

    // 1. Kullanıcılar listesindeki kendimizi güncelle
    if (results.value.users) {
      results.value.users = results.value.users.map((u) =>
        Number(u.id) === userId ? { ...u, ...newUser } : u,
      );
    }

    // 2. Postlardaki yazar bilgilerimizi güncelle
    if (postsStore.searchResults) {
      postsStore.searchResults = postsStore.searchResults.map((p) => {
        if (Number(p.authorId) === userId) {
          return { ...p, author: { ...p.author, ...newUser } };
        }
        return p;
      });
    }
  },
  { deep: true },
);
</script>
