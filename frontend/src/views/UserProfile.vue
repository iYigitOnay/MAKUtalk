<template>
  <div class="max-w-4xl mx-auto">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Yükleniyor...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card text-center py-12">
      <p class="text-red-500 dark:text-red-400">{{ error }}</p>
      <router-link to="/" class="btn-primary mt-4 inline-block">
        Ana Sayfaya Dön
      </router-link>
    </div>

    <!-- Profile -->
    <div v-else-if="user">
      <!-- Profile Header -->
      <div class="card dark:bg-gray-900 dark:border-primary-900/20 mb-6">
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div
              class="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center"
            >
              <span
                class="text-primary-700 dark:text-primary-400 font-bold text-3xl"
              >
                {{ userInitials }}
              </span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ user.fullName || user.username }}
              </h1>
              <p class="text-gray-500 dark:text-gray-400">
                @{{ user.username }}
              </p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {{ formatDate(user.createdAt) }} tarihinde katıldı
              </p>
            </div>
          </div>

          <!-- Follow Button -->
          <button
            v-if="authStore.user && authStore.user.id !== user.id"
            @click="handleFollowToggle"
            :disabled="followLoading"
            :class="[
              'px-6 py-2 rounded-lg font-medium transition disabled:opacity-50',
              user.isFollowing
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                : 'btn-primary',
            ]"
          >
            {{
              followLoading
                ? "..."
                : user.isFollowing
                  ? "Takipten Çık"
                  : "Takip Et"
            }}
          </button>
        </div>

        <!-- Bio -->
        <div v-if="user.bio" class="mb-6">
          <p class="text-gray-700 dark:text-gray-300">{{ user.bio }}</p>
        </div>

        <!-- Stats -->
        <div
          class="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200 dark:border-primary-900/20"
        >
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ user._count.posts }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Paylaşım</p>
          </div>
          <button
            @click="showFollowersModal = true"
            class="text-center hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition"
          >
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ user._count.followers }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Takipçi</p>
          </button>
          <button
            @click="showFollowingModal = true"
            class="text-center hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition"
          >
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ user._count.following }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Takip</p>
          </button>
        </div>
      </div>

      <!-- User Posts -->
      <div class="space-y-4">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          Paylaşımlar
        </h2>

        <div v-if="postsLoading" class="text-center py-8">
          <p class="text-gray-500">Yükleniyor...</p>
        </div>

        <div v-else-if="!userPosts.length" class="card text-center py-12">
          <p class="text-gray-500">Henüz paylaşım yok.</p>
        </div>

        <PostCard
          v-for="post in userPosts"
          :key="post.id"
          :post="post"
          @delete="handleDeletePost"
          @report="openPostReport"
          @showComments="handleShowComments"
        />
      </div>
    </div>

    <!-- REPORT MODAL (POST) -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showPostReportModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <button v-if="reportStep === 2" @click="reportStep = 1" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
              <div v-else class="w-9"></div>
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">İçeriği Şikayet Et</h3>
              <button @click="showPostReportModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar max-h-[60vh]">
              <div v-if="reportStep === 1">
                <button v-for="(cat, name) in reportCategories" :key="name" @click="selectReportCategory(name as string)" class="w-full text-left p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all flex items-center justify-between group">
                  <span class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ name }}</span>
                  <svg class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div v-else class="space-y-1.5">
                <div class="px-4 py-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">{{ selectedReportCategory }}</div>
                <button v-for="sub in reportCategories[selectedReportCategory]" :key="sub" @click="submitPostReport(sub)" :disabled="reportLoading" class="w-full text-left p-3.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all group">
                  <span class="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-red-600">{{ sub }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Followers Modal -->
    <FollowModal
      :is-open="showFollowersModal"
      :users="followers"
      title="Takipçiler"
      @close="showFollowersModal = false"
    />

    <!-- Following Modal -->
    <FollowModal
      :is-open="showFollowingModal"
      :users="following"
      title="Takip Edilenler"
      @close="showFollowingModal = false"
    />

    <!-- Comments Modal -->
    <CommentsModal
      :is-open="commentsModalOpen"
      :post-id="selectedPostId"
      @close="commentsModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFollowStore } from "@/stores/follow";
import { usePostsStore } from "@/stores/posts";
import { useCommentsStore } from "@/stores/comments";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import PostCard from "@/components/PostCard.vue";
import FollowModal from "@/components/FollowModal.vue";
import CommentsModal from "@/components/CommentsModal.vue";
import type { Post } from "@/types";

const route = useRoute();
const authStore = useAuthStore();
const followStore = useFollowStore();
const postsStore = usePostsStore();
const commentsStore = useCommentsStore();
const toast = useToast();

const userId = computed(() => parseInt(route.params.id as string));

const user = ref<any>(null);
const userPosts = ref<Post[]>([]);
const followers = ref([]);
const following = ref([]);

const loading = ref(true);
const postsLoading = ref(true);
const followLoading = ref(false);
const error = ref("");

const showFollowersModal = ref(false);
const showFollowingModal = ref(false);
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);

// Şikayet State & Fonksiyonları
const showPostReportModal = ref(false);
const reportStep = ref(1);
const selectedReportCategory = ref("");
const postToReport = ref<number | null>(null);
const reportLoading = ref(false);

const openPostReport = (postId: number) => {
  postToReport.value = postId;
  showPostReportModal.value = true;
  reportStep.value = 1;
};

const selectReportCategory = (name: string) => {
  selectedReportCategory.value = name;
  reportStep.value = 2;
};

const submitPostReport = async (subReason: string) => {
  if (!postToReport.value) return;
  reportLoading.value = true;
  try {
    await apiClient.post("/users/report", {
      reportedPostId: postToReport.value,
      reason: selectedReportCategory.value,
      subReason: subReason,
    });
    toast.success("Şikayet iletildi! 🛡️");
    showPostReportModal.value = false;
  } catch {
    toast.error("Şikayet gönderilemedi.");
  } finally {
    reportLoading.value = false;
  }
};

const reportCategories: Record<string, string[]> = {
  Nefret: ["Hakaretler", "Irkçı veya cinsiyetçi klişeler", "İnsanlıktan çıkarma", "Korku veya ayrımcılığa teşvik"],
  "Taciz ve Rahatsızlık": ["Hakaret", "İstenmeyen Cinsel İçerik", "Hedefli Taciz"],
  "Şiddet içeren konuşma": ["Şiddet Tehditleri", "Zarar Verme İsteği", "Şiddeti Yüceltme"],
  Mahremiyet: ["Özel bilgileri paylaşmak", "Rızam olmadan özel görüntü paylaşımı"],
  "Yasadışı Davranışlar": ["İnsan sömürüsü", "Cinsel şiddet", "Yasadışı ürün satışı"]
};

// Yorum sayısı senkronizasyonu
watch(() => commentsStore.lastAddedCommentId, (newId) => {
  if (newId && selectedPostId.value) {
    const postId = selectedPostId.value;
    const post = userPosts.value.find(p => p.id === postId);
    if (post) {
      if (!post._count) post._count = { comments: 0, likes: 0, reposts: 0 };
      post._count.comments++;
    }
    commentsStore.lastAddedCommentId = null;
  }
});

const userInitials = computed(() => {
  if (!user.value) return "";
  const name = user.value.fullName || user.value.username;
  return name.charAt(0).toUpperCase();
});

const fetchUserProfile = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (authStore.user) {
      params.currentUserId = authStore.user.id;
    }

    const response = await apiClient.get(`/users/${userId.value}`, { params });
    user.value = response.data;
  } catch (err: any) {
    error.value = err.response?.data?.message?.[0] || "Kullanıcı bulunamadı.";
  } finally {
    loading.value = false;
  }
};

const fetchUserPosts = async () => {
  postsLoading.value = true;
  try {
    const params: any = {};
    if (authStore.user) {
      params.currentUserId = authStore.user.id;
    }

    const response = await apiClient.get(`/users/${userId.value}/posts`, {
      params,
    });
    userPosts.value = response.data;
  } catch (err) {
    console.error("Failed to fetch user posts:", err);
  } finally {
    postsLoading.value = false;
  }
};

const fetchFollowData = async () => {
  try {
    const followersData = await followStore.getFollowers(userId.value);
    followers.value = followersData.map((f: any) => f.follower);

    const followingData = await followStore.getFollowing(userId.value);
    following.value = followingData.map((f: any) => f.following);
  } catch (err) {
    console.error("Failed to fetch follow data:", err);
  }
};

const handleFollowToggle = async () => {
  if (!authStore.user) {
    toast.error("Takip etmek için giriş yapmalısınız.");
    return;
  }

  followLoading.value = true;
  try {
    const result = await followStore.toggleFollow(userId.value);
    user.value.isFollowing = result.following;

    // Update follower count
    if (result.following) {
      user.value._count.followers++;
    } else {
      user.value._count.followers--;
    }

    toast.success(result.message);
  } catch (err: any) {
    const message = err.message?.[0] || "İşlem başarısız.";
    toast.error(message);
  } finally {
    followLoading.value = false;
  }
};

const handleDeletePost = async (postId: number) => {
  if (!confirm("Bu paylaşımı silmek istediğinden emin misin?")) return;

  try {
    await postsStore.deletePost(postId);
    userPosts.value = userPosts.value.filter((p) => p.id !== postId);
    toast.success("Paylaşım silindi.");
  } catch (error: any) {
    const message = error.message?.[0] || "Silme işlemi başarısız.";
    toast.error(message);
  }
};

const handleShowComments = (postId: number) => {
  selectedPostId.value = postId;
  commentsModalOpen.value = true;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

onMounted(() => {
  fetchUserProfile();
  fetchUserPosts();
  fetchFollowData();
});
</script>
