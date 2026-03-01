<!-- src/views/HashtagPage.vue -->
<template>
  <div class="max-w-2xl mx-auto min-h-screen bg-white dark:bg-gray-950 pb-20 sm:pb-8 transition-colors duration-500">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-primary-900/10 px-4 py-3 flex items-center gap-6">
      <button @click="$router.back()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90 text-gray-600 dark:text-gray-300">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>
      <div>
        <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">#{{ hashtag }}</h1>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{{ posts.length }} Paylaşım</p>
      </div>
    </header>

    <!-- Posts Section -->
    <div class="p-4">
      <div v-if="loading" class="py-20 text-center">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <div v-else-if="!posts.length" class="py-20 text-center bg-slate-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/5">
        <div class="mb-4 text-4xl opacity-20">#️⃣</div>
        <p class="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-widest">Bu hashtag ile ilgili henüz paylaşım yapılmamış.</p>
      </div>

      <div v-else class="space-y-4 animate-fade-in">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @delete="handleDeletePost"
          @showComments="handleShowComments"
        />
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
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import PostCard from "@/components/PostCard.vue";
import CommentsModal from "@/components/CommentsModal.vue";
import type { Post } from "@/types";

const route = useRoute();
const authStore = useAuthStore();
const postsStore = usePostsStore();
const toast = useToast();

const hashtag = computed(() => route.params.tag as string);
const posts = ref<Post[]>([]);
const loading = ref(true);
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);

const fetchHashtagPosts = async () => {
  if (!hashtag.value) return;
  loading.value = true;
  try {
    // SearchService içindeki searchByHashtag metodunu kullanan /search/hashtag endpoint'ini kullanıyoruz
    const res = await apiClient.get('/search/hashtag', {
      params: { 
        tag: hashtag.value,
        userId: authStore.user?.id
      }
    });
    posts.value = res.data;
  } catch (error) {
    console.error("Failed to fetch hashtag posts:", error);
    toast.error("Paylaşımlar yüklenemedi.");
  } finally {
    loading.value = false;
  }
};

const handleDeletePost = async (postId: number) => {
  try {
    await postsStore.deletePost(postId);
    posts.value = posts.value.filter((p) => p.id !== postId);
    toast.success("Paylaşım silindi.");
  } catch (error: any) {
    toast.error("Silme işlemi başarısız.");
  }
};

const handleShowComments = (postId: number) => {
  selectedPostId.value = postId;
  commentsModalOpen.value = true;
};

// Rota parametresi değiştiğinde (başka bir hashtag'e tıklandığında) veriyi yenile
watch(() => route.params.tag, () => {
  fetchHashtagPosts();
});

onMounted(fetchHashtagPosts);
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
