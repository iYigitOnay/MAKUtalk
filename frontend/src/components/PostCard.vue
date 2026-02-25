<template>
  <div
    @click="$router.push(`/post/${post.id}`)"
    class="p-4 bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors cursor-pointer border-b border-gray-200 dark:border-primary-900/20"
  >
    <!-- Header -->
    <div class="flex gap-4">
      <!-- Avatar -->
      <img
        v-if="post.author?.avatarUrl"
        :src="post.author.avatarUrl"
        :alt="post.author.username"
        class="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />
      <div
        v-else
        class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
      >
        {{ post.author?.username?.charAt(0).toUpperCase() }}
      </div>

      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <!-- Header Row -->
        <div class="flex items-center justify-between gap-2 mb-1">
          <div class="flex items-center gap-2 min-w-0">
            <p class="font-bold text-gray-900 dark:text-white truncate">
              {{ post.author?.fullName || post.author?.username }}
            </p>
            <p class="text-gray-500 dark:text-gray-400 truncate">
              @{{ post.author?.username }}
            </p>
            <p class="text-gray-500 dark:text-gray-400">·</p>
            <p class="text-gray-500 dark:text-gray-400 flex-shrink-0">
              {{ formatDate(post.createdAt) }}
            </p>
          </div>

          <!-- Owner Actions -->
          <div v-if="isOwner" class="flex gap-1">
            <button
              @click.stop="$emit('delete', post.id)"
              class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
              title="Sil"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Category Badge -->
        <div v-if="post.category" class="mb-2">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-primary-600"
          >
            <span v-if="post.category.icon" class="mr-1">{{
              post.category.icon
            }}</span>
            {{ post.category.name }}
          </span>
        </div>

        <!-- Content -->
        <p
          class="text-gray-900 dark:text-white text-base leading-normal whitespace-pre-wrap mb-3"
        >
          <HashtagText :text="post.content" />
        </p>

        <!-- Engagement Stats -->
        <div
          class="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3 py-3 border-b border-gray-100 dark:border-primary-900/20"
        >
          <button
            @click.stop="$emit('showComments', post.id)"
            class="hover:text-primary-600 transition-colors duration-200 flex items-center gap-1"
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {{ post._count?.comments || 0 }}
            <span class="hidden sm:inline">yorum</span>
          </button>
          <button
            class="hover:text-red-600 transition-colors duration-200 flex items-center gap-1"
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {{ post._count?.likes || 0 }}
            <span class="hidden sm:inline">beğeni</span>
          </button>
          <button
            class="hover:text-green-600 transition-colors duration-200 flex items-center gap-1"
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
                d="M7 16V4m0 0L3 8m0 0l4 4M17 8v12m0 0l4-4m0 0l-4 4"
              />
            </svg>
            {{ post._count?.reposts || 0 }}
            <span class="hidden sm:inline">paylaşım</span>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-around text-gray-500 dark:text-gray-400 -mx-4">
          <!-- Like Button -->
          <button
            v-if="authStore.isAuthenticated"
            @click.stop="handleLikeToggle"
            :disabled="likeLoading"
            class="flex-1 flex items-center justify-center gap-2 py-2 hover:text-red-600 transition-colors duration-200 disabled:opacity-50 rounded hover:scale-110 active:scale-95"
          >
            <svg
              class="w-4 h-4 transition-all duration-200"
              :class="{ 'fill-red-600 text-red-600': post.isLiked }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          <!-- Comment Button -->
          <button
            @click.stop="$emit('showComments', post.id)"
            class="flex-1 flex items-center justify-center gap-2 py-2 hover:text-primary-600 transition-colors duration-200 rounded hover:scale-110 active:scale-95"
          >
            <svg
              class="w-4 h-4 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>

          <!-- Share Button -->
          <button
            @click.stop="handleShare"
            class="flex-1 flex items-center justify-center gap-2 py-2 hover:text-green-600 transition-colors duration-200 rounded hover:scale-110 active:scale-95"
          >
            <svg
              class="w-4 h-4 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useLikesStore } from "@/stores/likes";
import { usePostsStore } from "@/stores/posts";
import { useToast } from "vue-toastification";
import HashtagText from "./HashtagText.vue";
import type { Post } from "@/types";

interface Props {
  post: Post;
}

const props = defineProps<Props>();
const authStore = useAuthStore();
const likesStore = useLikesStore();
const postsStore = usePostsStore();
const toast = useToast();

const likeLoading = ref(false);

defineEmits<{
  edit: [post: Post];
  delete: [postId: number];
  showComments: [postId: number];
}>();

const isOwner = computed(() => {
  return authStore.user?.id === props.post.authorId;
});

const handleLikeToggle = async () => {
  likeLoading.value = true;
  try {
    const result = await likesStore.toggleLike(props.post.id);

    // Local state'i güncelle
    const currentLikes = props.post._count?.likes || 0;
    const newLikes = result.liked ? currentLikes + 1 : currentLikes - 1;

    postsStore.updatePostLocally(props.post.id, {
      isLiked: result.liked,
      _count: { likes: newLikes, comments: props.post._count?.comments || 0 },
    });
  } catch (error: any) {
    const message = error.message?.[0] || "Beğeni işlemi başarısız.";
    toast.error(message);
  } finally {
    likeLoading.value = false;
  }
};

const handleShare = async () => {
  try {
    // TODO: Backend: repost işlevi ekle
    // Şu anda sadece UI gösterimi yapacağız
    toast.success("Paylaşım başarılı!");
  } catch (error: any) {
    toast.error("Paylaşım işlemi başarısız.");
  }
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>
