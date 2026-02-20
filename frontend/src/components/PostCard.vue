<template>
  <div class="card hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div
          class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
        >
          <span class="text-primary-700 font-semibold">
            {{ post.author.username.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <p class="font-medium text-gray-900">
            {{ post.author.fullName || post.author.username }}
          </p>
          <p class="text-sm text-gray-500">@{{ post.author.username }}</p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">{{
          formatDate(post.createdAt)
        }}</span>

        <!-- Owner Actions -->
        <div v-if="isOwner" class="flex space-x-1">
          <button
            @click="$emit('edit', post)"
            class="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition"
            title="Düzenle"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            @click="$emit('delete', post.id)"
            class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
    </div>

    <!-- Category Badge -->
    <div v-if="post.category" class="mb-3">
      <span
        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
        :style="{ backgroundColor: post.category.color }"
      >
        <span v-if="post.category.icon" class="mr-1">{{
          post.category.icon
        }}</span>
        {{ post.category.name }}
      </span>
    </div>

    <!-- Content -->
    <div class="text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">
      <HashtagText :text="post.content" />
    </div>

    <!-- Actions Bar -->
    <div class="flex items-center space-x-6 pt-4 border-t border-gray-100">
      <!-- Like Button -->
      <button
        v-if="authStore.isAuthenticated"
        @click="handleLikeToggle"
        :disabled="likeLoading"
        class="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition disabled:opacity-50"
      >
        <svg
          class="w-5 h-5"
          :class="{ 'fill-red-500 text-red-500': post.isLiked }"
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
        <span class="text-sm font-medium">{{ post._count?.likes || 0 }}</span>
      </button>

      <!-- Comment Button -->
      <button
        @click="$emit('showComments', post.id)"
        class="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition"
      >
        <svg
          class="w-5 h-5"
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
        <span class="text-sm font-medium">{{
          post._count?.comments || 0
        }}</span>
      </button>
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
      _count: { ...props.post._count, likes: newLikes },
    });
  } catch (error: any) {
    const message = error.message?.[0] || "Beğeni işlemi başarısız.";
    toast.error(message);
  } finally {
    likeLoading.value = false;
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
