<!-- src/views/Profile.vue -->
<template>
  <div class="max-w-4xl mx-auto pb-20 text-left overflow-x-hidden">
    <!-- Loading & Error States -->
    <div v-if="loading" class="text-center py-20">
      <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="mt-4 text-slate-500 dark:text-gray-400 font-bold">Yükleniyor...</p>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <div class="text-6xl mb-4">😕</div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">{{ error }}</h2>
      <router-link to="/" class="btn-primary inline-block">Ana Sayfaya Dön</router-link>
    </div>

    <template v-else-if="displayedUser">
      <!-- Profile Header -->
      <div class="relative">
        <div class="h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-primary-700 dark:to-primary-800 rounded-t-xl overflow-hidden shadow-lg">
          <img v-if="displayedUser.coverUrl" :src="getImageUrl(displayedUser.coverUrl)" alt="Cover" class="w-full h-full object-cover" />
        </div>
        <button v-if="isMyProfile" @click="showEditModal = true" class="absolute top-3 right-3 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full text-[10px] sm:text-sm font-bold backdrop-blur-sm transition-all z-10">
          Profili Düzenle
        </button>
        <div class="absolute -bottom-10 sm:-bottom-16 left-4 sm:left-6">
          <div @click="displayedUser.avatarUrl ? (showAvatarZoom = true) : null" class="relative group p-1 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow-xl overflow-hidden" :class="[displayedUser.avatarUrl ? 'cursor-pointer' : '']">
            <img v-if="displayedUser.avatarUrl" :src="getImageUrl(displayedUser.avatarUrl)" alt="Avatar" class="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-950 object-cover" />
            <div v-else class="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-950 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span class="text-white font-bold text-2xl sm:text-4xl">{{ userInitials }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Info Section -->
      <div class="bg-white dark:bg-gray-900/40 rounded-b-xl border-x border-b border-slate-200 dark:border-primary-900/30 pt-12 sm:pt-20 px-4 sm:px-6 pb-6 shadow-sm overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h1 class="text-lg sm:text-2xl font-black text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-full">{{ displayedUser.fullName || displayedUser.username }}</h1>
              <div v-if="displayedUser.role === 'ADMIN'" class="p-1 rounded-full text-white bg-[#1E3A8A] shadow-sm">
                <component :is="getBadgeComponent('crown')" class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <p class="text-xs sm:text-base text-slate-500 dark:text-gray-400 font-bold">@{{ displayedUser.username }}</p>
          </div>

          <div v-if="!isMyProfile && authStore.isAuthenticated" class="flex items-center gap-2">
            <button @click="handleFollowToggle" :disabled="followLoading" class="px-5 py-2 sm:py-2.5 rounded-full font-black text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50" :class="[isFollowing ? 'bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-white' : 'bg-blue-600 text-white shadow-blue-500/20']">
              {{ isFollowing ? "Takipten Çık" : "Takip Et" }}
            </button>
          </div>
        </div>

        <div class="mt-4 sm:mt-6 space-y-4 border-t border-slate-50 dark:border-white/5 pt-4 sm:pt-6 text-left">
          <p v-if="displayedUser.bio" class="text-gray-700 dark:text-gray-300 text-xs sm:text-[15px] leading-relaxed whitespace-pre-wrap max-w-2xl">{{ displayedUser.bio }}</p>
          <div class="grid grid-cols-3 gap-1 sm:flex sm:gap-8 justify-items-center sm:justify-start items-center">
            <div class="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
              <span class="text-[15px] sm:text-base font-black text-gray-900 dark:text-white">{{ displayedUser._count?.posts || 0 }}</span>
              <span class="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Paylaşım</span>
            </div>
            <div class="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
              <span class="text-[15px] sm:text-base font-black text-gray-900 dark:text-white">{{ displayedUser._count?.followers || 0 }}</span>
              <span class="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Takipçi</span>
            </div>
            <div class="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
              <span class="text-[15px] sm:text-base font-black text-gray-900 dark:text-white">{{ displayedUser._count?.following || 0 }}</span>
              <span class="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Takip</span>
            </div>
          </div>
        </div>

        <template v-if="canViewContent">
          <div class="flex border-b border-slate-100 dark:border-gray-800 mt-6 sm:mt-8 mb-4 sm:mb-6 overflow-x-auto no-scrollbar">
            <button v-for="tab in ['posts', 'replies', 'reposts', 'likes']" :key="tab" @click="activeTab = tab as any" :class="['flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap', activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600']">
              {{ tab === 'posts' ? 'Gönderiler' : tab === 'replies' ? 'Yanıtlar' : tab === 'reposts' ? 'Remakü' : 'Beğeniler' }}
            </button>
          </div>
          
          <div v-if="postsLoading" class="py-10 text-center">
            <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <div v-else-if="!currentTabPosts || currentTabPosts.length === 0" class="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Henüz içerik yok</div>
          <div v-else class="space-y-3 sm:space-y-4">
            <PostCard 
              v-for="p in currentTabPosts" 
              :key="p.id" 
              :post="p" 
              @delete="handleDeletePost" 
              @showComments="handleShowComments" 
            />
          </div>
        </template>
      </div>
    </template>

    <EditProfileModal :is-open="showEditModal" :user="displayedUser" @close="showEditModal = false" @save="handleSaveProfile" />
    <CommentsModal :is-open="commentsModalOpen" :post-id="selectedPostId" @close="commentsModalOpen = false" />
    <DeleteConfirmModal
      :is-open="showDeleteModal"
      :loading="isDeleting"
      title="Gönderiyi Sil?"
      message="Bu işlem geri alınamaz. İçerik tamamen kaldırılacaktır."
      confirm-text="SİL"
      variant="danger"
      @confirm="handleConfirmDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useProfileStore } from "@/stores/profile";
import { useFollowStore } from "@/stores/follow";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import PostCard from "@/components/PostCard.vue";
import EditProfileModal from "@/components/EditProfileModal.vue";
import CommentsModal from "@/components/CommentsModal.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import * as LucideIcons from "lucide-vue-next";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const profileStore = useProfileStore();
const followStore = useFollowStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const error = ref("");
const followLoading = ref(false);
const showEditModal = ref(false);
const showAvatarZoom = ref(false);
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);
const activeTab = ref<"posts" | "replies" | "reposts" | "likes">("posts");

const showDeleteModal = ref(false);
const postIdToDelete = ref<number | null>(null);
const isDeleting = ref(false);

const displayedUser = computed(() => profileStore.profileUser);
const loading = computed(() => profileStore.loadingProfile);
const postsLoading = computed(() => profileStore.loadingPosts);

const currentTabPosts = computed(() => {
  if (activeTab.value === "posts") return profileStore.userPosts;
  if (activeTab.value === "replies") return profileStore.userReplies;
  if (activeTab.value === "reposts") return profileStore.userReposts;
  return profileStore.userLikedPosts;
});

const isMyProfile = computed(() => authStore.user?.id === displayedUser.value?.id);
const isFollowing = computed(() => displayedUser.value?.isFollowing);
const canViewContent = computed(() => isMyProfile.value || !displayedUser.value?.isPrivate || isFollowing.value);
const userInitials = computed(() => (displayedUser.value?.fullName || displayedUser.value?.username || "?").charAt(0).toUpperCase());

const fetchProfile = async () => {
  const username = (route.params.id as string) || authStore.user?.username;
  if (!username) return;
  profileStore.clearProfile();
  error.value = "";
  try {
    await profileStore.fetchProfileByUsername(username);
    if (displayedUser.value && canViewContent.value) {
      await profileStore.fetchProfileContent(displayedUser.value.id);
    }
  } catch (err) {
    error.value = "Kullanıcı bulunamadı.";
  }
};

const handleFollowToggle = async () => {
  if (!authStore.user || !displayedUser.value) return;
  followLoading.value = true;
  try {
    const res = await followStore.toggleFollow(displayedUser.value.id);
    profileStore.updateFollowStateLocally(res.status === "FOLLOWING", displayedUser.value.isPrivate);
    if (profileStore.profileUser) {
      profileStore.profileUser.isFollowing = (res.status === "FOLLOWING");
    }
    toast.success(res.message);
  } finally {
    followLoading.value = false;
  }
};

const handleSaveProfile = async (data: any) => {
  try {
    const res = await apiClient.patch(`/users/${displayedUser.value?.id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    profileStore.profileUser = { ...profileStore.profileUser, ...res.data };
    if (isMyProfile.value) authStore.updateUser(res.data);
    showEditModal.value = false;
    toast.success("Profil güncellendi.");
  } catch {
    toast.error("Hata!");
  }
};

const handleDeletePost = (postId: number) => {
  postIdToDelete.value = postId;
  showDeleteModal.value = true;
};

const handleConfirmDelete = async () => {
  if (postIdToDelete.value === null) return;
  isDeleting.value = true;
  try {
    await postsStore.deletePost(postIdToDelete.value);
    toast.success("Silindi.");
    showDeleteModal.value = false;
  } catch {
    toast.error("Hata!");
  } finally {
    isDeleting.value = false;
    postIdToDelete.value = null;
  }
};

const handleShowComments = (id: number) => {
  selectedPostId.value = id;
  commentsModalOpen.value = true;
};

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return `${apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const getBadgeComponent = (name: string) => {
  if (!name) return LucideIcons.HelpCircle;
  const pascal = name.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  return (LucideIcons as any)[pascal] || LucideIcons.HelpCircle;
};

onMounted(fetchProfile);
watch(() => route.params.id, fetchProfile);
</script>

<style scoped>
.btn-primary { @apply px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
