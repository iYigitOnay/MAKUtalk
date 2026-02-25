<template>
  <div
    v-if="displayPost"
    @click="$router.push(`/post/${displayPost.id}`)"
    class="p-4 bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors cursor-pointer border-b border-gray-200 dark:border-primary-900/20"
  >
    <!-- Repost Header -->
    <div v-if="post.repostOf" class="flex items-center gap-2 mb-2 ml-9 text-gray-500 dark:text-gray-400 text-sm font-semibold">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15" />
      </svg>
      <router-link :to="`/profile/${post.author?.username}`" @click.stop class="hover:underline">
        {{ isMe ? 'Sen' : post.author?.fullName || post.author?.username }}
      </router-link> 
      remaküledi
    </div>

    <!-- Main Post Content -->
    <div class="flex gap-4">
      <!-- Avatar -->
      <router-link
        v-if="displayPost.author"
        :to="`/profile/${displayPost.author.username}`"
        @click.stop
        class="flex-shrink-0"
      >
        <img
          v-if="displayPost.author.avatarUrl"
          :src="displayPost.author.avatarUrl"
          :alt="displayPost.author.username"
          class="w-12 h-12 rounded-full object-cover"
        />
        <div
          v-else
          class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold"
        >
          {{ displayPost.author.username?.charAt(0).toUpperCase() }}
        </div>
      </router-link>

      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <!-- Header Row -->
        <div class="flex items-center justify-between gap-2 mb-1">
          <div class="flex items-center gap-2 min-w-0" v-if="displayPost.author">
            <router-link
              :to="`/profile/${displayPost.author.username}`"
              @click.stop
              class="font-bold text-gray-900 dark:text-white truncate hover:underline"
            >
              {{ displayPost.author.fullName || displayPost.author.username }}
            </router-link>
            <router-link
              :to="`/profile/${displayPost.author.username}`"
              @click.stop
              class="text-gray-500 dark:text-gray-400 truncate"
            >
              @{{ displayPost.author.username }}
            </router-link>
            <p class="text-gray-500 dark:text-gray-400">·</p>
            <p class="text-gray-500 dark:text-gray-400 flex-shrink-0 text-sm font-medium">
              {{ formatDate(displayPost.createdAt) }}
            </p>
          </div>

          <!-- Owner Actions -->
          <div v-if="isOwner" class="flex gap-1">
            <button
              @click.stop="$emit('delete', post.id)"
              class="p-2 text-gray-500 hover:text-red-600 rounded-full transition-colors"
              title="Sil"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Category Badge -->
        <div v-if="displayPost.category" class="mb-2">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
            :style="{ backgroundColor: displayPost.category.color || '#3b82f6' }"
          >
            {{ displayPost.category.name }}
          </span>
        </div>

        <!-- Content -->
        <p class="text-gray-900 dark:text-white text-base leading-normal whitespace-pre-wrap mb-3">
          <HashtagText :text="displayPost.content || ''" />
        </p>

        <!-- Engagement Stats (Sıralama: Beğeni, Yorum, Remakü) -->
        <div class="flex gap-5 text-[13px] text-gray-500 dark:text-gray-400 mb-3 py-2.5 border-b border-gray-100 dark:border-primary-900/10">
          <div class="flex items-center gap-1">
            <span class="font-bold text-gray-900 dark:text-white">{{ displayPost._count?.likes || 0 }}</span>
            <span>beğeni</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="font-bold text-gray-900 dark:text-white">{{ displayPost._count?.comments || 0 }}</span>
            <span>yorum</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="font-bold text-gray-900 dark:text-white">{{ displayPost._count?.reposts || 0 }}</span>
            <span>remakü</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-around text-gray-500 dark:text-gray-400 -mx-4">
          <!-- Like Button -->
          <button
            v-if="authStore.isAuthenticated"
            @click.stop="handleLikeToggle"
            :disabled="likeLoading"
            class="flex-1 flex items-center justify-center py-2 transition-all active:scale-90 disabled:opacity-50 group"
          >
            <svg 
              class="w-5 h-5 transition-colors duration-200" 
              :class="displayPost.isLiked ? 'fill-red-600 text-red-600' : 'text-gray-500 group-hover:text-red-600'" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <!-- Comment Button -->
          <button 
            @click.stop="$emit('showComments', displayPost.id)" 
            class="flex-1 flex items-center justify-center py-2 transition-all active:scale-90 group"
          >
            <svg 
              class="w-5 h-5 transition-colors duration-200 text-gray-500 group-hover:text-primary-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          <!-- Repost Button -->
          <button
            v-if="authStore.isAuthenticated"
            @click.stop="handleRepost"
            :disabled="repostLoading"
            class="flex-1 flex items-center justify-center py-2 transition-all active:scale-90 disabled:opacity-50 group"
          >
            <svg 
              class="w-5 h-5 transition-colors duration-200" 
              :class="displayPost.isReposted ? 'text-green-600' : 'text-gray-500 group-hover:text-green-600'" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15" />
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

const props = defineProps<{ post: Post }>();
const authStore = useAuthStore();
const likesStore = useLikesStore();
const postsStore = usePostsStore();
const toast = useToast();

const likeLoading = ref(false);
const repostLoading = ref(false);

const emit = defineEmits<{
  edit: [post: Post];
  delete: [postId: number];
  showComments: [postId: number];
  interaction: [data: { type: string, postId: number, status: boolean, post?: Post }];
}>();

const displayPost = computed(() => props.post.repostOf || props.post);
const isOwner = computed(() => authStore.user?.id === props.post.authorId);
const isMe = computed(() => authStore.user?.id === props.post.authorId);

const handleLikeToggle = async () => {
  if (!displayPost.value) return;
  likeLoading.value = true;
  try {
    const result = await likesStore.toggleLike(displayPost.value.id);
    
    // Tüm kopyaları senkronize güncelle
    postsStore.updatePostLocally(displayPost.value.id, {
      isLiked: result.liked,
      _count: { 
        likes: result.liked 
          ? (displayPost.value._count?.likes || 0) + 1 
          : Math.max(0, (displayPost.value._count?.likes || 0) - 1) 
      }
    });

    emit('interaction', { type: 'like', postId: displayPost.value.id, status: result.liked });
  } catch (error: any) {
    console.error("Like toggle error:", error);
    toast.error("Beğeni işlemi başarısız oldu.");
  } finally {
    likeLoading.value = false;
  }
};

const handleRepost = async () => {
  if (!displayPost.value) return;
  repostLoading.value = true;
  try {
    const result = await postsStore.toggleRepost(displayPost.value.id);

    // Tüm kopyaları senkronize güncelle
    postsStore.updatePostLocally(displayPost.value.id, {
      isReposted: result.reposted,
      _count: { 
        reposts: result.reposted 
          ? (displayPost.value._count?.reposts || 0) + 1 
          : Math.max(0, (displayPost.value._count?.reposts || 0) - 1) 
      }
    });

    // Üst bileşene haber ver (Profil anlık güncelleme için)
    emit('interaction', { 
      type: 'repost', 
      postId: displayPost.value.id, 
      status: result.reposted,
      post: result.post
    });

    if (result.reposted) toast.success("Remakülendi! ✨");
    else toast.info("Remakü geri alındı.");
  } catch (error: any) {
    console.error("Repost toggle error:", error);
    toast.error("Remakü işlemi başarısız oldu.");
  } finally {
    repostLoading.value = false;
  }
};

const formatDate = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  const diffMs = new Date().getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins}d`;
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return `${diffHours}s`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};
</script>
