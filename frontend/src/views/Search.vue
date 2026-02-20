<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Search Bar -->
    <div class="card">
      <div class="relative">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Kullanıcı veya içerik ara..."
          class="input-field pl-12"
        />
        <svg
          class="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
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
      </div>

      <!-- Tabs -->
      <div class="flex space-x-4 mt-4 border-b">
        <button
          @click="activeTab = 'all'"
          :class="[
            'pb-3 px-2 font-medium transition',
            activeTab === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          Tümü
        </button>
        <button
          @click="activeTab = 'users'"
          :class="[
            'pb-3 px-2 font-medium transition',
            activeTab === 'users'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          Kullanıcılar ({{ results.users?.length || 0 }})
        </button>
        <button
          @click="activeTab = 'posts'"
          :class="[
            'pb-3 px-2 font-medium transition',
            activeTab === 'posts'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          Paylaşımlar ({{ results.posts?.length || 0 }})
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Aranıyor...</p>
    </div>

    <!-- Initial State -->
    <div v-else-if="!searchQuery" class="card text-center py-12">
      <svg
        class="w-16 h-16 mx-auto text-gray-400 mb-4"
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
      <p class="text-gray-500">Kullanıcı veya paylaşım aramak için yazmaya başla</p>
    </div>

    <!-- Empty Results -->
    <div v-else-if="searchQuery && !hasResults" class="card text-center py-12">
      <svg
        class="w-16 h-16 mx-auto text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-gray-500">"{{ searchQuery }}" için sonuç bulunamadı.</p>
    </div>

    <!-- Results -->
    <div v-else-if="hasResults">
      <!-- Users -->
      <div v-if="(activeTab === 'all' || activeTab === 'users') && results.users?.length">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Kullanıcılar</h3>
        <div class="space-y-3">
          <div
            v-for="user in results.users"
            :key="user.id"
            class="card flex items-center justify-between hover:shadow-md transition"
          >
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-700 font-semibold">
                  {{ user.username.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ user.fullName || user.username }}</p>
                <p class="text-sm text-gray-500">@{{ user.username }}</p>
                <p v-if="user.bio" class="text-sm text-gray-600 mt-1 line-clamp-1">{{ user.bio }}</p>
              </div>
            </div>
            <router-link
              :to="`/user/${user.id}`"
              class="btn-outline text-sm"
            >
              Profil
            </router-link>
          </div>
        </div>
      </div>

      <!-- Posts -->
      <div v-if="(activeTab === 'all' || activeTab === 'posts') && results.posts?.length">
        <h3 class="text-lg font-bold text-gray-900 mb-4 mt-6">Paylaşımlar</h3>
        <div class="space-y-4">
          <PostCard
            v-for="post in results.posts"
            :key="post.id"
            :post="post"
            @delete="handleDeletePost"
            @showComments="handleShowComments"
          />
        </div>
      </div>
    </div>

    <!-- Comments Modal -->
    <CommentsModal
      :is-open="commentsModalOpen"
      :post-id="selectedPostId"
      @close="commentsModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'; // ← computed eklendi
import { useAuthStore } from '@/stores/auth';
import { usePostsStore } from '@/stores/posts';
import { useToast } from 'vue-toastification';
import apiClient from '@/api/client';
import PostCard from '@/components/PostCard.vue';
import CommentsModal from '@/components/CommentsModal.vue';
import type { Post, User } from '@/types';

const authStore = useAuthStore();
const postsStore = usePostsStore();
const toast = useToast();

const searchQuery = ref('');
const activeTab = ref<'all' | 'users' | 'posts'>('all');
const loading = ref(false);
const results = ref<{ users: User[]; posts: Post[] }>({ users: [], posts: [] });
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);

let searchTimeout: NodeJS.Timeout;

const hasResults = computed(() => {
  return (results.value.users?.length || 0) > 0 || (results.value.posts?.length || 0) > 0;
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

      const response = await apiClient.get('/search', { params });
      results.value = response.data;
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Arama sırasında bir hata oluştu.');
    } finally {
      loading.value = false;
    }
  }, 500);
};

const handleDeletePost = async (postId: number) => {
  if (!confirm('Bu paylaşımı silmek istediğinden emin misin?')) return;

  try {
    await postsStore.deletePost(postId);
    results.value.posts = results.value.posts.filter((p) => p.id !== postId);
    toast.success('Paylaşım silindi.');
  } catch (error: any) {
    const message = error.message?.[0] || 'Silme işlemi başarısız.';
    toast.error(message);
  }
};

const handleShowComments = (postId: number) => {
  selectedPostId.value = postId;
  commentsModalOpen.value = true;
};
</script>