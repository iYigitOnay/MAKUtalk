<!-- src/views/Bookmarks.vue -->
<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen font-sans bg-white dark:bg-gray-950"
  >
    <!-- Header -->
    <div
      class="sticky top-0 z-40 backdrop-blur bg-gradient-to-b from-white/95 via-white/90 to-white/85 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-primary-950/50 border-b border-gray-200 dark:border-primary-900/30 p-6"
    >
      <div class="flex items-center gap-3">
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
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <div>
          <h2
            class="text-2xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Kaydedilenler
          </h2>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="pb-20">
      <div
        v-if="postsStore.loading"
        class="py-20 flex flex-col items-center justify-center text-center"
      >
        <div
          class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <p class="text-gray-500 font-bold">Yükleniyor...</p>
      </div>

      <div
        v-else-if="!postsStore.posts.length"
        class="py-32 px-10 flex flex-col items-center justify-center text-center"
      >
        <div
          class="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6"
        >
          <svg
            class="w-12 h-12 text-gray-300 dark:text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Henüz bir şey kaydetmedin
        </h2>
        <p class="text-gray-500 dark:text-gray-400 max-w-xs">
          Daha sonra tekrar bakmak istediğin gönderileri kaydederek burada
          toplayabilirsin.
        </p>
      </div>

      <div
        v-else
        class="divide-y divide-gray-100 dark:divide-white/5 animate-in fade-in duration-500"
      >
        <PostCard
          v-for="post in postsStore.posts"
          :key="post.id"
          :post="post"
          @delete="handleDeletePost"
          @showComments="handleShowComments"
        />
      </div>
    </div>

    <CommentsModal
      :is-open="commentsModalOpen"
      :post-id="selectedPostId"
      @close="commentsModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import PostCard from "@/components/PostCard.vue";
import CommentsModal from "@/components/CommentsModal.vue";

const authStore = useAuthStore();
const postsStore = usePostsStore();

const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);

onMounted(() => {
  postsStore.fetchBookmarks();
});

const handleDeletePost = (id: number) => {
  postsStore.deletePost(id);
};

const handleShowComments = (id: number) => {
  selectedPostId.value = id;
  commentsModalOpen.value = true;
};
</script>
