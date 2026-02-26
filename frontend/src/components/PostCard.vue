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
          class="w-12 h-12 rounded-full object-cover shadow-sm"
        />
        <div
          v-else
          class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shadow-sm"
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
              class="font-bold text-gray-900 dark:text-white truncate hover:underline flex items-center gap-1.5"
            >
              {{ displayPost.author.fullName || displayPost.author.username }}
              
              <!-- Rozetler (Anasayfa Akışı - İsim Yanı) -->
              <div v-if="displayPost.author && (displayPost.author.badges?.length || displayPost.author.role === 'ADMIN')" class="flex gap-1 flex-shrink-0 items-center ml-1">
                <!-- Kurucu (Admin Otomatik) -->
                <div v-if="displayPost.author.role === 'ADMIN'" class="flex items-center justify-center group relative">
                  <div 
                    class="p-0.5 rounded-full text-white shadow-sm transition-transform hover:scale-110"
                    :style="{ 
                      backgroundColor: '#1E3A8A',
                      boxShadow: '0 0 8px rgba(30, 58, 138, 0.4)'
                    }"
                  >
                    <div class="w-2.5 h-2.5" v-html="getBadgeIcon('founder')"></div>
                  </div>
                </div>

                <div v-for="ub in displayPost.author.badges" :key="ub.id || ub.badge?.id" class="flex items-center justify-center group relative">
                  <div 
                    v-if="ub.badge"
                    class="p-0.5 rounded-full shadow-sm transition-transform hover:scale-110 border"
                    :style="{ 
                      backgroundColor: ub.badge.color,
                      color: ub.badge.color === '#FFFFFF' || ub.badge.color.toLowerCase() === '#ffffff' ? '#1e293b' : 'white',
                      borderColor: ub.badge.color === '#FFFFFF' || ub.badge.color.toLowerCase() === '#ffffff' ? '#e2e8f0' : 'transparent'
                    }"
                  >
                    <div class="w-2.5 h-2.5" v-html="getBadgeIcon(ub.badge.icon)"></div>
                  </div>
                </div>
              </div>
            </router-link>
            <router-link
              :to="`/profile/${displayPost.author.username}`"
              @click.stop
              class="text-gray-500 dark:text-gray-400 truncate text-sm"
            >
              @{{ displayPost.author.username }}
            </router-link>
            <p class="text-gray-500 dark:text-gray-400 text-xs">· {{ formatDate(displayPost.createdAt) }}</p>
          </div>

          <!-- Owner Actions -->
          <div v-if="isOwner" class="flex gap-1">
            <button
              @click.stop="$emit('delete', post.id)"
              class="p-2 text-gray-400 hover:text-red-600 rounded-full transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Category & Sentiment Badges -->
        <div class="flex flex-wrap gap-2 mb-2">
          <div v-if="displayPost.category">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm" :style="{ backgroundColor: displayPost.category.color || '#3b82f6' }">
              {{ displayPost.category.name }}
            </span>
          </div>
          <div v-if="displayPost.sentiment">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm transition-all hover:scale-105 border" :class="getSentimentStyles(displayPost.sentiment).class">
              {{ translateSentiment(displayPost.sentiment) }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <p class="text-gray-900 dark:text-white text-[15px] leading-normal whitespace-pre-wrap mb-3">
          <HashtagText :text="displayPost.content || ''" />
        </p>

        <!-- Action Buttons -->
        <div class="flex justify-between text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-50 dark:border-primary-900/10">
          <button v-if="authStore.isAuthenticated" @click.stop="handleLikeToggle" :disabled="likeLoading" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 group" :class="{ 'text-red-600': displayPost.isLiked }">
            <svg class="w-5 h-5 transition-transform group-active:scale-125" :class="displayPost.isLiked ? 'fill-red-600' : 'fill-none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <span class="text-xs font-bold">{{ displayPost._count?.likes || 0 }}</span>
          </button>

          <button @click.stop="$emit('showComments', displayPost.id)" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 group">
            <svg class="w-5 h-5 transition-transform group-active:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span class="text-xs font-bold">{{ displayPost._count?.comments || 0 }}</span>
          </button>

          <button v-if="authStore.isAuthenticated" @click.stop="handleRepost" :disabled="repostLoading" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 group" :class="{ 'text-green-600': displayPost.isReposted }">
            <svg class="w-5 h-5 transition-transform group-active:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15" /></svg>
            <span class="text-xs font-bold">{{ displayPost._count?.reposts || 0 }}</span>
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

const badgeIcons: Record<string, string> = {
  founder: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
  academic: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 12.083 0 0012 20.055a11.952 12.083 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>',
  herald: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>',
  social: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
  merchant: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>',
  observer: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>',
  voice: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>',
  athlete: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  inventor: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>',
  musician: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>'
};

const getBadgeIcon = (iconName: string) => badgeIcons[iconName] || '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';

const translateSentiment = (sentiment: string) => {
  const translations: Record<string, string> = { 'positive': 'Neşeli', 'negative': 'Kızgın', 'neutral': 'Sakin', 'Neşeli': 'Neşeli', 'Hüzünlü': 'Hüzünlü', 'Kızgın': 'Kızgın', 'Endişeli': 'Endişeli', 'Meraklı': 'Meraklı', 'Sakin': 'Sakin', 'Ciddi': 'Ciddi' };
  return translations[sentiment] || sentiment;
};

const getSentimentStyles = (sentiment: string) => {
  const styles: Record<string, { class: string }> = { 'Neşeli': { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200' }, 'positive': { class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200' }, 'Hüzünlü': { class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200' }, 'negative': { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200' }, 'Kızgın': { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200' }, 'Endişeli': { class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200' }, 'Meraklı': { class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200' }, 'Sakin': { class: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200' }, 'neutral': { class: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200' }, 'Ciddi': { class: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 border-gray-200' } };
  return styles[sentiment] || { class: 'bg-gray-100 text-gray-600 border-gray-200' };
};

const handleLikeToggle = async () => {
  if (!displayPost.value) return;
  const targetId = displayPost.value.id;
  likeLoading.value = true;
  try {
    const result = await likesStore.toggleLike(targetId);
    postsStore.updatePostLocally(targetId, { isLiked: result.liked, _count: { likes: result.liked ? (displayPost.value._count?.likes || 0) + 1 : Math.max(0, (displayPost.value._count?.likes || 0) - 1) } });
    emit('interaction', { type: 'like', postId: targetId, status: result.liked, post: displayPost.value });
  } catch (error: any) { console.error("Like error:", error); } finally { likeLoading.value = false; }
};

const handleRepost = async () => {
  if (!displayPost.value) return;
  repostLoading.value = true;
  try {
    const result = await postsStore.toggleRepost(displayPost.value.id);
    postsStore.updatePostLocally(displayPost.value.id, { isReposted: result.reposted, _count: { reposts: result.reposted ? (displayPost.value._count?.reposts || 0) + 1 : Math.max(0, (displayPost.value._count?.reposts || 0) - 1) } });
    emit('interaction', { type: 'repost', postId: displayPost.value.id, status: result.reposted, post: result.post });
    if (result.reposted) toast.success("Remakülendi! ✨");
  } catch (error: any) { console.error("Repost error:", error); } finally { repostLoading.value = false; }
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
