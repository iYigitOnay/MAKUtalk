<!-- src/components/PostCard.vue -->
<template>
  <div
    v-if="displayPost"
    class="bg-white dark:bg-gray-950/40 hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-all duration-500 cursor-default border-b border-gray-200 dark:border-primary-900/20 relative"
    :class="[
      isThreadParent ? 'border-none' : '', 
      (displayPost.isAcademic && !displayPost.isLiked) 
        ? 'academic-unread shadow-sm z-10' 
        : '',
      showMenu ? 'z-[50]' : 'z-0'
    ]"
  >
    <!-- Academic Decorative Pattern -->
    <div v-if="displayPost.isAcademic && !displayPost.isLiked" class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

    <!-- Tıklanabilir İçerik Alanı -->
    <div @click="$router.push(`/post/${displayPost.id}`)" class="p-4 pb-0 cursor-pointer relative z-10">
      <!-- Pinned Header - Sadece profil sayfalarında gösterilir -->
      <div
        v-if="displayPost.isPinned && isProfileView"
        class="flex items-center gap-2 mb-2 ml-14 sm:ml-16 text-blue-500 text-[10px] font-black uppercase tracking-widest"
      >
        <component :is="getBadgeComponent('pin')" class="w-3 h-3 fill-current" />
        SABİTLENDİ
      </div>

      <!-- Reply Header -->
      <div
        v-if="displayPost.parentId"
        class="flex items-center gap-1.5 mb-2 ml-14 sm:ml-16 text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold"
        @click.stop
      >
        <component :is="getBadgeComponent('corner-down-right')" class="w-4 h-4 text-blue-500" />
        <span v-if="displayPost.parent?.author">
          <router-link :to="`/profile/${displayPost.parent.author.username}`" class="text-blue-500 hover:underline">@{{ displayPost.parent.author.username }}</router-link> yanitlanıyor
        </span>
      </div>

      <!-- Repost Header -->
      <div
        v-if="post.repostOf"
        class="flex items-center gap-2 mb-2 ml-14 sm:ml-16 text-gray-500 dark:text-gray-400 text-sm font-semibold"
        @click.stop
      >
        <component :is="getBadgeComponent('repeat')" class="w-4 h-4" />
        <router-link :to="`/profile/${post.author?.username}`" class="hover:underline">{{ isMe ? "Sen" : post.author?.fullName || post.author?.username }}</router-link> remaküledi
      </div>

      <div class="flex gap-3 sm:gap-4 items-stretch">
        <!-- Avatar -->
        <div class="flex flex-col items-center">
          <router-link v-if="displayPost.author" :to="`/profile/${displayPost.author.username}`" @click.stop class="flex-shrink-0 relative z-10">
            <UserAvatar :user="displayPost.author" size="lg" />
          </router-link>
          <div v-if="isThreadParent" class="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 mt-2 mb-[-1rem] rounded-full"></div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-1">
            <div class="flex items-center gap-1.5 min-w-0 font-black text-gray-900 dark:text-white truncate">
              <router-link :to="`/profile/${displayPost.author.username}`" class="hover:underline" @click.stop>{{ displayPost.author.fullName || displayPost.author.username }}</router-link>
              <div v-if="displayPost.isAcademic" class="flex-shrink-0 flex items-center gap-1.5">
                <div class="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[7px] font-black rounded border border-emerald-200 dark:border-emerald-800 uppercase tracking-tighter">AKADEMİK</div>
              </div>
              <router-link :to="`/profile/${displayPost.author.username}`" class="text-gray-500 dark:text-gray-400 truncate text-sm font-normal" @click.stop>@{{ displayPost.author.username }}</router-link>
              <p class="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0 font-normal">· {{ formatDate(displayPost.createdAt) }}</p>
            </div>
            
            <!-- Menü Butonu -->
            <div class="relative flex-shrink-0" @click.stop>
              <button @click="showMenu = !showMenu" class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all">
                <component :is="getBadgeComponent('more-vertical')" class="w-5 h-5" />
              </button>
              <div v-if="showMenu" class="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl z-[100] py-1.5 overflow-hidden">
                <button @click="handleCopyLink" class="w-full text-left px-3 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2.5"><component :is="getBadgeComponent('link')" class="w-4 h-4 text-gray-400" />Bağlantıyı Kopyala</button>
                
                <button v-if="isOwner" @click="handleTogglePin" class="w-full text-left px-3 py-2 text-[13px] font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2.5">
                  <component :is="getBadgeComponent('pin')" class="w-4 h-4" />
                  {{ displayPost.isPinned ? 'Sabiti Kaldır' : 'Profile Sabitle' }}
                </button>

                <button v-if="isAdmin" @click="handleRefreshAI" class="w-full text-left px-3 py-2 text-[13px] font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center gap-2.5">
                  <component :is="getBadgeComponent('refresh-cw')" class="w-4 h-4" />
                  AI Analizini Yenile
                </button>

                <button v-if="!isOwner" @click="$emit('report', displayPost.id); showMenu = false;" class="w-full text-left px-3 py-2 text-[13px] font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-2.5">
                  <component :is="getBadgeComponent('flag')" class="w-4 h-4" />
                  Şikayet Et
                </button>

                <button v-if="isOwner || isAdmin" @click="$emit('delete', post.id); showMenu = false;" class="w-full text-left px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2.5"><component :is="getBadgeComponent('trash-2')" class="w-4 h-4" />Gönderiyi Sil</button>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5 mb-2">
            <span
              v-if="displayPost.category && !displayPost.parentId"
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

          <p class="text-gray-900 dark:text-white text-[15px] leading-normal whitespace-pre-wrap mb-3">
            <HashtagText :text="displayPost.content || ''" />
          </p>

          <div v-if="displayPost.imageUrl" class="mb-3 rounded-2xl overflow-hidden border border-gray-100 dark:border-primary-900/10 bg-slate-50 dark:bg-gray-800">
            <img :src="getImageUrl(displayPost.imageUrl)" class="w-full h-auto max-h-[512px] object-cover" loading="lazy" />
          </div>

          <!-- Video Attachment -->
          <div v-if="displayPost.videoUrl" class="mb-3" @click.stop>
            <VideoPlayer 
              :video-url="displayPost.videoUrl" 
              :thumbnail-url="displayPost.thumbnailUrl" 
            />
          </div>

          <!-- Document Attachment (Academic) -->
          <div v-if="displayPost.documentUrl" class="mb-3">
            <a 
              :href="getImageUrl(displayPost.documentUrl)" 
              target="_blank" 
              download 
              class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group overflow-hidden relative"
            >
              <!-- Extension-based Background Accent -->
              <div 
                class="absolute left-0 top-0 w-1 h-full"
                :class="{
                  'bg-red-500': getFileExt(displayPost.documentUrl) === 'pdf',
                  'bg-blue-500': ['doc', 'docx'].includes(getFileExt(displayPost.documentUrl)),
                  'bg-green-500': ['xls', 'xlsx'].includes(getFileExt(displayPost.documentUrl)),
                  'bg-orange-500': !['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(getFileExt(displayPost.documentUrl))
                }"
              ></div>

              <div 
                class="p-2 rounded-lg group-hover:scale-110 transition-transform"
                :class="{
                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400': getFileExt(displayPost.documentUrl) === 'pdf',
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400': ['doc', 'docx'].includes(getFileExt(displayPost.documentUrl)),
                  'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': ['xls', 'xlsx'].includes(getFileExt(displayPost.documentUrl)),
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400': !['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(getFileExt(displayPost.documentUrl))
                }"
              >
                <component :is="getBadgeComponent(getFileExt(displayPost.documentUrl) === 'pdf' ? 'file-text' : 'file')" class="w-6 h-6" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {{ getFileName(displayPost.documentUrl) }}
                </p>
                <p class="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  {{ getFileExt(displayPost.documentUrl) }} Dökümanı · İndirmek için tıklayın
                </p>
              </div>
              <component :is="getBadgeComponent('download')" class="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Aksiyon Butonları Alanı (Tıklama Alanının Dışında!) -->
    <div class="px-4 pb-4 ml-14 sm:ml-16">
      <div class="flex justify-between items-center text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-50 dark:border-primary-900/10">
        <!-- LIKE / OKUDUM -->
        <button @click.stop="handleLikeToggle" :disabled="likeLoading" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all group" :class="[displayPost.isAcademic ? 'hover:bg-green-50 dark:hover:bg-green-900/20' : 'hover:bg-red-50 dark:hover:bg-red-900/20', (post.isLiked || displayPost.isLiked) ? (displayPost.isAcademic ? 'text-green-600' : 'text-red-600') : '']">
          <component v-if="displayPost.isAcademic" :is="getBadgeComponent('check-circle')" class="w-5 h-5" :class="(post.isLiked || displayPost.isLiked) ? 'text-green-600' : ''" />
          <component v-else :is="getBadgeComponent('heart')" class="w-5 h-5" :class="(post.isLiked || displayPost.isLiked) ? 'fill-red-600 text-red-600' : 'fill-none'" />
          <span class="text-xs font-black">{{ displayPost._count?.likes || 0 }}</span>
        </button>

        <!-- COMMENT / SORU SOR -->
        <button @click.stop="handleCommentsClick" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 group">
          <component :is="getBadgeComponent('message-square')" class="w-5 h-5" />
          <span class="text-xs font-black">{{ displayPost._count?.replies || 0 }}</span>
        </button>

        <!-- REPOST / KAYDET -->
        <button v-if="displayPost.isAcademic" @click.stop="handleBookmark" :disabled="bookmarkLoading" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-yellow-50 dark:hover:bg-yellow-900/20 group" :class="(post.isBookmarked || displayPost.isBookmarked) ? 'text-yellow-600' : ''">
          <component :is="getBadgeComponent('bookmark')" class="w-5 h-5" :class="(post.isBookmarked || displayPost.isBookmarked) ? 'fill-yellow-600 text-yellow-600' : 'fill-none'" />
        </button>
        <button v-else @click.stop="handleRepost" :disabled="repostLoading" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-green-50 dark:hover:bg-green-900/20 group" :class="(post.isReposted || displayPost.isReposted) ? 'text-green-600' : ''">
          <component :is="getBadgeComponent('repeat')" class="w-5 h-5" />
          <span class="text-xs font-black">{{ displayPost._count?.reposts || 0 }}</span>
        </button>

        <!-- SHARE -->
        <button @click.stop="handleShare" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white group">
          <component :is="getBadgeComponent('send')" class="w-5 h-5" />
        </button>
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
import VideoPlayer from "./VideoPlayer.vue";
import UserAvatar from "./UserAvatar.vue";
import type { Post } from "@/types";
import * as LucideIcons from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    post: Post;
    isThreadParent?: boolean;
    isProfileView?: boolean;
  }>(),
  {
    isThreadParent: false,
    isProfileView: false,
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
const bookmarkLoading = ref(false);
const showMenu = ref(false);

const handleTogglePin = async () => {
  if (!displayPost.value) return;
  try {
    await postsStore.togglePin(displayPost.value.id);
    toast.success(displayPost.value.isPinned ? "Profiline sabitlendi!" : "Sabit kaldırıldı.");
    showMenu.value = false;
  } catch (error) {
    toast.error("İşlem başarısız.");
  }
};

const handleBookmark = async () => {
  if (!displayPost.value) return;
  const targetId = displayPost.value.id;
  if (bookmarkLoading.value) return;

  bookmarkLoading.value = true;
  try {
    const res = await postsStore.toggleBookmark(targetId);
    if (res.bookmarked) toast.success("Kaydedilenlere eklendi!");
  } catch (error) {
    console.error("Bookmark error:", error);
  } finally {
    bookmarkLoading.value = false;
  }
};

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
    await likesStore.toggleLike(targetId);
    // NOT: Merkezi Store Güncellemesi artık LikesStore.toggleLike içinde yapılıyor!
    // Bu sayede tüm PostCard örnekleri anında güncellenir.
    
    // Eğer bu bir akademik post ise ve ilk kez beğeniliyorsa, "Okundu" sayalım.
    if (displayPost.value.isAcademic && !displayPost.value.isRead) {
      await postsStore.markAsRead(targetId);
    }
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
    // toggleRepost artik kendi icinde updatePostLocally cagirdigi icin burada tekrar cagirmaya gerek yok!
    const res = await postsStore.toggleRepost(targetId);
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
  postsStore.openShareModal(displayPost.value);
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

const getFileExt = (path: string) => {
  if (!path) return "";
  return path.split(".").pop()?.toLowerCase() || "";
};

const getFileName = (path: string) => {
  if (!path) return "Döküman";
  const parts = path.split("-");
  return parts.length > 2 ? parts.slice(2).join("-") : "Ekli Döküman";
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

<style scoped>
.academic-unread {
  position: relative;
  background-color: rgba(16, 185, 129, 0.03);
}

.dark .academic-unread {
  background-color: rgba(16, 185, 129, 0.02);
}

.academic-unread::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: #059669;
  z-index: 20;
  animation: emerald-pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.dark .academic-unread::before {
  background-color: #10b981;
}

@keyframes emerald-pulse {
  0%,
  100% {
    opacity: 1;
    box-shadow: 2px 0 10px rgba(16, 185, 129, 0.3);
    width: 4px;
  }
  50% {
    opacity: 0.7;
    box-shadow: 4px 0 20px rgba(16, 185, 129, 0.5);
    width: 5px;
  }
}
</style>
