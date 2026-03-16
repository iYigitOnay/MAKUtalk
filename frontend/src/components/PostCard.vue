<!-- src/components/PostCard.vue -->
<template>
  <div
    v-if="displayPost"
    @click="$router.push(`/post/${displayPost.id}`)"
    class="p-4 bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors cursor-pointer"
    :class="
      !isThreadParent
        ? 'border-b border-gray-200 dark:border-primary-900/20'
        : ''
    "
  >
    <!-- Reply Header (TWITTER MANTIĞI) -->
    <div
      v-if="displayPost.parentId"
      class="flex items-center gap-1.5 mb-2 ml-14 sm:ml-16 text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold"
      @click.stop
    >
      <component
        :is="getBadgeComponent('corner-down-right')"
        class="w-4 h-4 text-blue-500"
      />
      <span v-if="displayPost.parent?.author">
        <router-link
          :to="`/profile/${displayPost.parent.author.username}`"
          class="text-blue-500 hover:underline"
        >
          @{{ displayPost.parent.author.username }}
        </router-link>
        yanıtlanıyor
      </span>
      <span v-else class="text-blue-500">Bir gönderiye yanıt</span>
    </div>

    <!-- Repost Header -->
    <div
      v-if="post.repostOf"
      class="flex items-center gap-2 mb-2 ml-14 sm:ml-16 text-gray-500 dark:text-gray-400 text-sm font-semibold"
      @click.stop
    >
      <component :is="getBadgeComponent('repeat')" class="w-4 h-4" />
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
    <div class="flex gap-3 sm:gap-4 items-stretch">
      <!-- Avatar & Thread Line -->
      <div class="flex flex-col items-center">
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
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm"
          />
          <div
            v-else
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shadow-sm text-sm sm:text-base"
          >
            {{ displayPost.author.username?.charAt(0).toUpperCase() }}
          </div>
        </router-link>

        <!-- Thread Line -->
        <div
          v-if="isThreadParent"
          class="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 mt-2 mb-[-1rem] rounded-full"
        ></div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-1">
          <div class="flex items-center gap-1.5 min-w-0">
            <div
              class="font-black text-gray-900 dark:text-white truncate flex items-center gap-1.5"
            >
              <router-link
                :to="`/profile/${displayPost.author.username}`"
                class="hover:underline"
                @click.stop
              >
                {{ displayPost.author.fullName || displayPost.author.username }}
              </router-link>
              
              <!-- BADGES (ELİT ROZETLER) -->
              <div v-if="displayPost.author.badges?.length || displayPost.author.role === 'ADMIN'" class="flex gap-1 items-center">
                <div v-if="displayPost.author.role === 'ADMIN'" class="group relative flex items-center justify-center">
                  <div class="p-0.5 rounded-full text-white bg-[#1E3A8A] shadow-sm transition-transform hover:scale-110">
                    <component :is="getBadgeComponent('crown')" class="w-2.5 h-2.5" />
                  </div>
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-0.5 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[100] pointer-events-none uppercase">Sistem Kurucusu</div>
                </div>
                <div v-for="ub in displayPost.author.badges" :key="ub.badge?.id || ub.id" class="group relative flex items-center justify-center">
                  <div class="p-0.5 rounded-full border border-gray-100 shadow-sm transition-transform hover:scale-110" :style="{ backgroundColor: ub.badge?.color || '#3b82f6', color: 'white' }">
                    <component :is="getBadgeComponent(ub.badge?.icon || 'award')" class="w-2.5 h-2.5" />
                  </div>
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-0.5 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[100] pointer-events-none uppercase">{{ ub.badge?.name }}</div>
                </div>
              </div>
            </div>
            <router-link
              :to="`/profile/${displayPost.author.username}`"
              class="text-gray-500 dark:text-gray-400 truncate text-sm"
              @click.stop
            >
              @{{ displayPost.author.username }}
            </router-link>
            <p class="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">
              · {{ formatDate(displayPost.createdAt) }}
            </p>
          </div>

          <div class="relative flex-shrink-0" @click.stop>
            <button
              @click="showMenu = !showMenu"
              class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
            >
              <component
                :is="getBadgeComponent('more-vertical')"
                class="w-5 h-5"
              />
            </button>
            <div
              v-if="showMenu"
              class="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl z-[100] py-1.5 overflow-hidden"
            >
              <button
                @click="handleCopyLink"
                class="w-full text-left px-3 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2.5"
              >
                <component
                  :is="getBadgeComponent('link')"
                  class="w-4 h-4 text-gray-400"
                />
                Bağlantıyı Kopyala
              </button>
              <button
                @click="
                  $emit('report', displayPost.id);
                  showMenu = false;
                "
                class="w-full text-left px-3 py-2 text-[13px] font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-2.5"
              >
                <component
                  :is="getBadgeComponent('alert-triangle')"
                  class="w-4 h-4"
                />
                Şikayet Et
              </button>
              <button
                v-if="isAdmin"
                @click="handleRefreshAI"
                class="w-full text-left px-3 py-2 text-[13px] font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2.5"
              >
                <component
                  :is="getBadgeComponent('sparkles')"
                  class="w-4 h-4"
                />
                AI Analizini Yenile
              </button>
              <button
                v-if="isOwner || isAdmin"
                @click="
                  $emit('delete', post.id);
                  showMenu = false;
                "
                class="w-full text-left px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2.5"
              >
                <component :is="getBadgeComponent('trash-2')" class="w-4 h-4" />
                Gönderiyi Sil
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 mb-2">
          <span
            v-if="displayPost.category"
            class="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white"
            :style="{
              backgroundColor: displayPost.category.color || '#3b82f6',
            }"
          >
            {{ displayPost.category.name }}
          </span>
          <span
            v-if="displayPost.sentiment"
            class="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border"
            :class="getSentimentStyles(displayPost.sentiment).class"
          >
            {{ translateSentiment(displayPost.sentiment) }}
          </span>
        </div>

        <p
          class="text-gray-900 dark:text-white text-[15px] leading-normal whitespace-pre-wrap mb-3"
        >
          <HashtagText :text="displayPost.content || ''" />
        </p>

        <div
          v-if="displayPost.imageUrl"
          class="mb-3 rounded-2xl overflow-hidden border border-gray-100 dark:border-primary-900/10 bg-slate-50 dark:bg-gray-800"
        >
          <img
            :src="getImageUrl(displayPost.imageUrl)"
            class="w-full h-auto max-h-[512px] object-cover"
            alt="Post content"
            loading="lazy"
          />
        </div>

        <!-- Action Buttons (REVISED) -->
        <div
          class="flex justify-between items-center text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-50 dark:border-primary-900/10"
        >
          <!-- LIKE -->
          <button
            v-if="authStore.isAuthenticated"
            @click.stop="handleLikeToggle"
            :disabled="likeLoading"
            class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-red-50 dark:hover:bg-red-900/20 group"
            :class="
              post.isLiked || displayPost.isLiked
                ? 'text-red-600'
                : 'text-gray-500 dark:text-gray-400'
            "
          >
            <component
              :is="getBadgeComponent('heart')"
              class="w-5 h-5 transition-transform group-active:scale-125"
              :class="
                post.isLiked || displayPost.isLiked
                  ? 'fill-red-600'
                  : 'fill-none'
              "
            />
            <span class="text-xs font-black">{{
              displayPost._count?.likes || 0
            }}</span>
          </button>

          <!-- REPLY / COMMENT -->
          <button
            @click.stop="handleCommentsClick"
            class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 group text-gray-500 dark:text-gray-400"
          >
            <component
              :is="getBadgeComponent('message-square')"
              class="w-5 h-5 transition-transform group-active:scale-125"
            />
            <span class="text-xs font-black">{{
              displayPost._count?.replies || 0
            }}</span>
          </button>

          <!-- REPOST (REMAKÜ) -->
          <button
            v-if="authStore.isAuthenticated"
            @click.stop="handleRepost"
            :disabled="repostLoading"
            class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-green-50 dark:hover:bg-green-900/20 group"
            :class="
              post.isReposted || displayPost.isReposted
                ? 'text-green-600'
                : 'text-gray-500 dark:text-gray-400'
            "
          >
            <component
              :is="getBadgeComponent('repeat')"
              class="w-5 h-5 transition-transform group-active:scale-125"
            />
            <span class="text-xs font-black">{{
              displayPost._count?.reposts || 0
            }}</span>
          </button>

          <!-- SHARE / SEND (YENİ!) -->
          <button
            @click.stop="handleShare"
            class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white group"
          >
            <component
              :is="getBadgeComponent('send')"
              class="w-5 h-5 transition-transform group-active:scale-125"
            />
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
import * as LucideIcons from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    post: Post;
    isThreadParent?: boolean;
  }>(),
  {
    isThreadParent: false,
  },
);

const emit = defineEmits<{
  edit: [post: Post];
  delete: [postId: number];
  report: [postId: number];
  showComments: [postId: number];
}>();

const authStore = useAuthStore();
const likesStore = useLikesStore();
const postsStore = usePostsStore();
const toast = useToast();

const likeLoading = ref(false);
const repostLoading = ref(false);
const showMenu = ref(false);

const displayPost = computed(() => props.post.repostOf || props.post);
const isMe = computed(() => authStore.user?.id === props.post.authorId);
const isOwner = computed(() => authStore.user?.id === props.post.authorId);
const isAdmin = computed(() => authStore.user?.role === "ADMIN");

const handleRefreshAI = async () => {
  try {
    const res = await postsStore.refreshAI(displayPost.value.id);
    postsStore.updatePostLocally(displayPost.value.id, {
      sentiment: res.sentiment,
      sentimentScore: res.sentimentScore,
    });
    toast.success("AI Analizi yenilendi!");
    showMenu.value = false;
  } catch (error) {
    toast.error("AI yenileme hatası!");
  }
};

const getBadgeComponent = (iconName: string) => {
  if (!iconName) return LucideIcons.HelpCircle;
  const pascalName = iconName
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  return (
    (LucideIcons as any)[pascalName] ||
    (LucideIcons as any)[iconName] ||
    LucideIcons.HelpCircle
  );
};

const handleCommentsClick = () => {
  console.log("Comment icon clicked for post:", displayPost.value.id);
  emit("showComments", displayPost.value.id);
};

const handleLikeToggle = async () => {
  if (!displayPost.value) return;
  const targetId = displayPost.value.id;
  if (likeLoading.value) return;

  likeLoading.value = true;
  try {
    const result = await likesStore.toggleLike(targetId);
    // Merkezi Store Güncellemesi (Tüm kopyaları etkiler)
    postsStore.updatePostLocally(targetId, {
      isLiked: result.liked,
      _count: {
        likes: result.liked
          ? (displayPost.value._count?.likes || 0) + 1
          : Math.max(0, (displayPost.value._count?.likes || 0) - 1),
      },
    });
  } catch (error) {
    console.error("Like error:", error);
  } finally {
    likeLoading.value = false;
  }
};

const handleRepost = async () => {
  if (!displayPost.value) return;
  const targetId = displayPost.value.id;
  if (repostLoading.value) return;

  repostLoading.value = true;
  try {
    const res = await postsStore.toggleRepost(targetId);
    // Merkezi Store Güncellemesi (Tüm kopyaları etkiler)
    postsStore.updatePostLocally(targetId, {
      isReposted: res.reposted,
      _count: {
        reposts: res.reposted
          ? (displayPost.value._count?.reposts || 0) + 1
          : Math.max(0, (displayPost.value._count?.reposts || 0) - 1),
      },
    });
    if (res.reposted) toast.success("Remakülendi!");
  } catch (error) {
    console.error("Repost error:", error);
  } finally {
    repostLoading.value = false;
  }
};

const handleCopyLink = () => {
  const url = `${window.location.origin}/post/${displayPost.value.id}`;
  navigator.clipboard.writeText(url);
  toast.success("Bağlantı kopyalandı! 🔗");
  showMenu.value = false;
};

const handleShare = () => {
  toast.info("Paylaşma özelliği yakında eklenecek!");
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
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
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
</script>
