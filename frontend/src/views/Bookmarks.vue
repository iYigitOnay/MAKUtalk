<!-- src/views/Bookmarks.vue -->
<template>
  <div class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen font-sans">
    <!-- Header -->
    <div class="sticky top-0 z-[45] bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-primary-900/10 px-4 py-4 flex items-center gap-4">
      <button @click="router.back()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <div>
        <h1 class="text-xl font-black text-gray-900 dark:text-white">Akademik Arşiv</h1>
        <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">Kaydedilen Duyuru ve Notlar</p>
      </div>
    </div>

    <!-- Feed -->
    <div class="pb-20">
      <div v-if="postsStore.loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="!postsStore.posts.length" class="flex flex-col items-center justify-center h-[60vh] px-8 text-center">
        <div class="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-6">
          <svg class="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Henüz bir şey kaydetmedin</h3>
        <p class="text-gray-500 text-sm max-w-xs">Akademik Panel'deki önemli duyuruları ve ders notlarını buraya kaydederek daha sonra kolayca erişebilirsin.</p>
        <button @click="router.push('/')" class="mt-6 px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold hover:scale-105 transition-transform">
          Akademik Panel'e Git
        </button>
      </div>

      <div v-else>
        <PostCard 
          v-for="post in postsStore.posts" 
          :key="post.id" 
          :post="post" 
          @show-comments="handleShowComments"
        />
      </div>
    </div>

    <!-- Global Modals -->
    <CommentsModal
      :is-open="showCommentsModal"
      :post-id="selectedPostId"
      @close="showCommentsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { usePostsStore } from "@/stores/posts";
import PostCard from "@/components/PostCard.vue";
import CommentsModal from "@/components/CommentsModal.vue";

const router = useRouter();
const postsStore = usePostsStore();

const showCommentsModal = ref(false);
const selectedPostId = ref<number | null>(null);

const handleShowComments = (postId: number) => {
  selectedPostId.value = postId;
  showCommentsModal.value = true;
};

onMounted(async () => {
  await postsStore.fetchBookmarkedPosts();
});
</script>
