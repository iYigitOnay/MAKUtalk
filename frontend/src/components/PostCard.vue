<!-- src/components/PostCard.vue -->
<template>
  <div
    v-if="displayPost"
    @click="$router.push(`/post/${displayPost.id}`)"
    class="p-4 bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors cursor-pointer border-b border-gray-200 dark:border-primary-900/20"
  >
    <!-- Repost Header -->
    <div
      v-if="post.repostOf"
      class="flex items-center gap-2 mb-2 ml-9 text-gray-500 dark:text-gray-400 text-sm font-semibold"
      @click.stop
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
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15"
        />
      </svg>
      <router-link
        :to="`/profile/${post.author?.username}`"
        class="hover:underline"
        >{{
          isMe ? "Sen" : post.author?.fullName || post.author?.username
        }}</router-link
      >
      remaküledi
    </div>

    <!-- Main Post Content -->
    <div class="flex gap-4 items-start">
      <!-- Avatar -->
      <router-link
        v-if="displayPost.author"
        :to="`/profile/${displayPost.author.username}`"
        @click.stop
        class="flex-shrink-0 relative z-10"
      >
        <img
          v-if="displayPost.author.avatarUrl"
          :src="getImageUrl(displayPost.author.avatarUrl)"
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
          <div class="flex items-center gap-1.5 min-w-0">
            <div
              class="font-black text-gray-900 dark:text-white truncate flex items-center gap-1.5 relative"
            >
              <router-link
                :to="`/profile/${displayPost.author.username}`"
                class="hover:underline"
                @click.stop
                >{{
                  displayPost.author.fullName || displayPost.author.username
                }}</router-link
              >

              <!-- ELİT ROZETLER (Post Sahibinin Rozetleri) -->
              <div
                v-if="
                  displayPost.author.badges?.length ||
                  displayPost.author.role === 'ADMIN'
                "
                class="flex gap-1 items-center"
              >
                <!-- Kurucu Rozeti -->
                <div
                  v-if="displayPost.author.role === 'ADMIN'"
                  class="group relative flex items-center justify-center"
                >
                  <div
                    class="p-0.5 rounded-full text-white shadow-sm transition-transform hover:scale-110"
                    :style="{ backgroundColor: '#1E3A8A' }"
                  >
                    <component
                      :is="getBadgeComponent('crown')"
                      class="w-2.5 h-2.5"
                    />
                  </div>
                  <div
                    class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-[100] pointer-events-none shadow-2xl border border-white/10 uppercase tracking-widest"
                  >
                    Sistem Kurucusu
                  </div>
                </div>

                <!-- Diğer Rozetler -->
                <div
                  v-for="ub in displayPost.author.badges"
                  :key="ub.id || ub.badge?.id"
                  class="flex items-center justify-center group relative"
                >
                  <div
                    v-if="ub.badge"
                    class="p-0.5 rounded-full shadow-sm transition-transform hover:scale-110 border flex items-center justify-center"
                    :style="{
                      backgroundColor: ub.badge.color,
                      color: getContrastColor(ub.badge.color),
                      borderColor:
                        ub.badge.color === '#FFFFFF'
                          ? '#e2e8f0'
                          : 'rgba(0,0,0,0.05)',
                    }"
                  >
                    <component
                      :is="getBadgeComponent(ub.badge.icon)"
                      class="w-2.5 h-2.5"
                    />
                  </div>
                  <!-- Tooltip -->
                  <div
                    class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white px-2 py-1 rounded-lg text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-[110] pointer-events-none shadow-2xl border border-white/10 uppercase tracking-widest"
                  >
                    {{ ub.badge.name }}
                  </div>
                </div>
              </div>
            </div>
            <router-link
              :to="`/profile/${displayPost.author.username}`"
              class="text-gray-500 dark:text-gray-400 truncate text-sm"
              @click.stop
              >@{{ displayPost.author.username }}</router-link
            >
            <p class="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">
              · {{ formatDate(displayPost.createdAt) }}
            </p>
          </div>

          <!-- Options Menu -->
          <div class="relative flex-shrink-0" @click.stop>
            <button
              @click="showMenu = !showMenu"
              class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
              :class="{
                'text-blue-600 bg-blue-50 dark:bg-blue-900/20': showMenu,
              }"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                />
              </svg>
            </button>
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95 translate-y-[-10px]"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-[-10px]"
            >
              <div
                v-if="showMenu"
                class="absolute right-0 mt-1 w-48 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl z-[100] py-1.5 overflow-hidden"
              >
                <button
                  @click="handleCopyLink"
                  class="w-full text-left px-3 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2.5"
                >
                  <svg
                    class="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    /></svg
                  >Bağlantıyı Kopyala
                </button>
                <button
                  v-if="!isOwner"
                  @click="handleReport"
                  class="w-full text-left px-3 py-2 text-[13px] font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors flex items-center gap-2.5"
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    /></svg
                  >Rapor Et
                </button>
                <button
                  v-if="isOwner"
                  @click="
                    $emit('delete', post.id);
                    showMenu = false;
                  "
                  class="w-full text-left px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2.5"
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
                    /></svg
                  >Gönderiyi Sil
                </button>
                <div
                  v-if="isAdmin"
                  class="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-white/5"
                >
                  <p
                    class="px-3 py-1 text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5"
                  >
                    YÖNETİCİ
                  </p>
                  <button
                    v-if="!isOwner"
                    @click="
                      $emit('delete', post.id);
                      showMenu = false;
                    "
                    class="w-full text-left px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2.5"
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
                      /></svg
                    >Gönderiyi Sil
                  </button>
                  <button
                    @click="handleRefreshSentiment"
                    class="w-full text-left px-3 py-2 text-[13px] font-semibold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-2.5"
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      /></svg
                    >AI Analizini Yenile
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Category & Sentiment (Placed directly under the name row) -->
        <div class="flex flex-wrap gap-1.5 mb-2">
          <span
            v-if="displayPost.category"
            class="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white shadow-sm"
            :style="{
              backgroundColor: displayPost.category.color || '#3b82f6',
            }"
            >{{ displayPost.category.name }}</span
          >
          <span
            v-if="displayPost.sentiment"
            class="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm transition-all hover:scale-105 border"
            :class="getSentimentStyles(displayPost.sentiment).class"
            >{{ translateSentiment(displayPost.sentiment) }}</span
          >
        </div>

        <!-- Global Overlay -->
        <div
          v-if="showMenu"
          @click="showMenu = false"
          class="fixed inset-0 z-[90] bg-transparent"
        ></div>

        <!-- Content -->
        <p
          class="text-gray-900 dark:text-white text-[15px] leading-normal whitespace-pre-wrap mb-3"
        >
          <HashtagText :text="displayPost.content || ''" />
        </p>

        <!-- Post Image -->
        <div
          v-if="displayPost.imageUrl"
          class="mb-3 rounded-2xl overflow-hidden border border-gray-100 dark:border-primary-900/10 shadow-sm bg-slate-50 dark:bg-gray-800"
        >
          <img
            :src="getImageUrl(displayPost.imageUrl)"
            class="w-full h-auto max-h-[512px] object-cover hover:scale-[1.01] transition-transform duration-500"
            alt="Post content"
            loading="lazy"
          />
        </div>

        <!-- Action Buttons -->
        <div
          class="flex justify-between text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-50 dark:border-primary-900/10"
        >
          <button
            v-if="authStore.isAuthenticated"
            @click.stop="handleLikeToggle"
            :disabled="likeLoading"
            class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 group"
            :class="{ 'text-red-600': displayPost.isLiked }"
          >
            <svg
              class="w-5 h-5 transition-transform group-active:scale-125"
              :class="displayPost.isLiked ? 'fill-red-600' : 'fill-none'"
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
            <span class="text-xs font-black">{{
              displayPost._count?.likes || 0
            }}</span>
          </button>
          <button
            @click.stop="$emit('showComments', displayPost.id)"
            class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 group"
          >
            <svg
              class="w-5 h-5 transition-transform group-active:scale-125"
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
            <span class="text-xs font-black">{{
              displayPost._count?.comments || 0
            }}</span>
          </button>
          <button
            v-if="authStore.isAuthenticated"
            @click.stop="handleRepost"
            :disabled="repostLoading"
            class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 group"
            :class="{ 'text-green-600': displayPost.isReposted }"
          >
            <svg
              class="w-5 h-5 transition-transform group-active:scale-125"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15"
              />
            </svg>
            <span class="text-xs font-black">{{
              displayPost._count?.reposts || 0
            }}</span>
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

// LUCIDE ICONS IMPORT
import * as LucideIcons from "lucide-vue-next";

const props = defineProps<{ post: Post }>();
const authStore = useAuthStore();
const likesStore = useLikesStore();
const postsStore = usePostsStore();
const toast = useToast();

const likeLoading = ref(false);
const repostLoading = ref(false);
const showMenu = ref(false);

// LUCIDE ICON RESOLVER
const getBadgeComponent = (iconName: string) => {
  if (!iconName) return LucideIcons.HelpCircle;
  const pascalName = iconName
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return (
    (LucideIcons as any)[pascalName] ||
    (LucideIcons as any)[iconName] ||
    LucideIcons.HelpCircle
  );
};

const isAdmin = computed(
  () =>
    authStore.user?.role === "ADMIN" ||
    authStore.user?.email === "2312101063@ogr.mehmetakif.edu.tr",
);
const handleCopyLink = () => {
  const url = `${window.location.origin}/post/${displayPost.value.id}`;
  navigator.clipboard.writeText(url);
  toast.success("Bağlantı kopyalandı! 🔗");
  showMenu.value = false;
};
const handleReport = () => {
  emit("report", displayPost.value.id);
  showMenu.value = false;
};
const handleRefreshSentiment = async () => {
  try {
    const res = await postsStore.refreshSentiment(displayPost.value.id);
    postsStore.updatePostLocally(displayPost.value.id, {
      sentiment: res.sentiment,
      sentimentScore: res.sentimentScore,
    });
    toast.success("AI Analizi yenilendi! 🧠");
  } catch {
    toast.error("AI analizi başarısız.");
  } finally {
    showMenu.value = false;
  }
};

const emit = defineEmits<{
  edit: [post: Post];
  delete: [postId: number];
  report: [postId: number];
  showComments: [postId: number];
  interaction: [
    data: { type: string; postId: number; status: boolean; post?: Post },
  ];
}>();

const displayPost = computed(() => props.post.repostOf || props.post);
const isMe = computed(() => authStore.user?.id === props.post.authorId);
const isOwner = computed(() => authStore.user?.id === props.post.authorId);

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor || hexcolor === "transparent") return "white";
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#0f172a" : "white";
};

const translateSentiment = (sentiment: string) => {
  const translations: Record<string, string> = {
    positive: "Neşeli",
    negative: "Kızgın",
    neutral: "Sakin",
    Neşeli: "Neşeli",
    Hüzünlü: "Hüzünlü",
    Kızgın: "Kızgın",
    Endişeli: "Endişeli",
    Meraklı: "Meraklı",
    Sakin: "Sakin",
    Ciddi: "Ciddi",
  };
  return translations[sentiment] || sentiment;
};
const getSentimentStyles = (sentiment: string) => {
  const styles: Record<string, { class: string }> = {
    Neşeli: {
      class:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200",
    },
    positive: {
      class:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200",
    },
    Hüzünlü: {
      class:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
    },
    negative: {
      class:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200",
    },
    Kızgın: {
      class:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200",
    },
    Endişeli: {
      class:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200",
    },
    Meraklı: {
      class:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200",
    },
    Sakin: {
      class:
        "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200",
    },
    neutral: {
      class:
        "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200",
    },
    Ciddi: {
      class:
        "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 border-gray-200",
    },
  };
  return (
    styles[sentiment] || { class: "bg-gray-100 text-gray-600 border-gray-200" }
  );
};
const handleLikeToggle = async () => {
  if (!displayPost.value) return;
  const targetId = displayPost.value.id;
  likeLoading.value = true;
  try {
    const result = await likesStore.toggleLike(targetId);
    postsStore.updatePostLocally(targetId, {
      isLiked: result.liked,
      _count: {
        likes: result.liked
          ? (displayPost.value._count?.likes || 0) + 1
          : Math.max(0, (displayPost.value._count?.likes || 0) - 1),
      },
    });
    emit("interaction", {
      type: "like",
      postId: targetId,
      status: result.liked,
      post: displayPost.value,
    });
  } catch (error: any) {
    console.error("Like error:", error);
  } finally {
    likeLoading.value = false;
  }
};
const handleRepost = async () => {
  if (!displayPost.value) return;
  repostLoading.value = true;
  try {
    const result = await postsStore.toggleRepost(displayPost.value.id);
    postsStore.updatePostLocally(displayPost.value.id, {
      isReposted: result.reposted,
      _count: {
        reposts: result.reposted
          ? (displayPost.value._count?.reposts || 0) + 1
          : Math.max(0, (displayPost.value._count?.reposts || 0) - 1),
      },
    });
    emit("interaction", {
      type: "repost",
      postId: displayPost.value.id,
      status: result.reposted,
      post: result.post,
    });
    if (result.reposted) toast.success("Remakülendi! ✨");
  } catch (error: any) {
    console.error("Repost error:", error);
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
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
</script>
