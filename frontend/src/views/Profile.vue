<!-- src/views/Profile.vue -->
<template>
  <div class="max-w-4xl mx-auto pb-20">
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
        <div class="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-primary-700 dark:to-primary-800 rounded-t-xl overflow-hidden shadow-lg">
          <img v-if="displayedUser.coverUrl" :src="displayedUser.coverUrl" alt="Cover" class="w-full h-full object-cover" />
        </div>
        <button v-if="isMyProfile" @click="showEditModal = true" class="absolute top-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-full text-sm font-bold backdrop-blur-sm transition-all hover:scale-105 active:scale-95">Profili Düzenle</button>
        <div class="absolute -bottom-16 left-6">
          <div class="p-1 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow-xl">
            <img v-if="displayedUser.avatarUrl" :src="displayedUser.avatarUrl" alt="Avatar" class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 object-cover" />
            <div v-else class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span class="text-white font-bold text-4xl">{{ userInitials }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Info -->
      <div class="bg-white dark:bg-gray-900/40 rounded-b-xl border-x border-b border-slate-200 dark:border-primary-900/30 pt-20 px-6 pb-6 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white flex items-center flex-wrap gap-2">
              {{ displayedUser.fullName || displayedUser.username }}
              <div v-if="(displayedUser.badges?.length || displayedUser.role === 'ADMIN')" class="flex gap-1.5 ml-1">
                <div v-if="displayedUser.role === 'ADMIN'" class="group relative flex items-center justify-center">
                  <div class="p-1.5 rounded-full text-white shadow-lg transition-all hover:scale-110" :style="{ backgroundColor: '#1E3A8A' }">
                    <div class="w-3.5 h-3.5" v-html="getBadgeIcon('founder')"></div>
                  </div>
                </div>
                <div v-for="ub in displayedUser.badges" :key="ub.badge.id" class="group relative flex items-center justify-center">
                  <div class="p-1.5 rounded-full shadow-sm transition-all hover:scale-110 border" :style="{ backgroundColor: ub.badge.color }">
                    <div class="w-3.5 h-3.5" v-html="getBadgeIcon(ub.badge.icon)"></div>
                  </div>
                </div>
              </div>
            </h1>
            <p class="text-slate-500 dark:text-gray-400 font-bold">@{{ displayedUser.username }}</p>
          </div>

          <div v-if="!isMyProfile && authStore.isAuthenticated" class="flex gap-2 relative">
            <button @click="handleFollowToggle" :disabled="followLoading" class="px-6 py-2 rounded-full font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50" :class="[isFollowing ? 'bg-slate-200 dark:bg-gray-800 text-slate-900 dark:text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20']">
              {{ isFollowing ? "Takipten Çık" : "Takip Et" }}
            </button>
            <button @click="router.push({ name: 'Messages', query: { userId: displayedUser.id } })" class="p-2.5 rounded-full border border-slate-200 dark:border-gray-800 text-blue-600 transition-all"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></button>
            <div class="relative">
              <button @click="showOptionsMenu = !showOptionsMenu" class="p-2.5 rounded-full border border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg></button>
              <div
                v-if="showOptionsMenu"
                class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  @click="openUserReport"
                  class="w-full text-left px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors flex items-center gap-3"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Şikayet Et
                </button>
                <button
                  @click="openBlockConfirm"
                  class="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ displayedUser.isBlocked ? "Engeli Kaldır" : "Engelle" }}
                </button>

                <div
                  v-if="authStore.user?.role === 'ADMIN'"
                  class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <p class="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Yönetici Paneli</p>
                  <button
                    v-if="!isMyProfile"
                    @click="handleAdminBanToggle"
                    class="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    {{ displayedUser.isBanned ? "Yasağı Kaldır" : "Yasakla" }}
                  </button>
                  <button
                    v-if="!isMyProfile"
                    @click="handleAdminDeleteUser"
                    class="w-full text-left px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Tamamen Sil
                  </button>
                  <button
                    @click="openBadgeModal"
                    class="w-full text-left px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center gap-3"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                    Rozet Yönetimi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template v-if="canViewContent">
          <div class="flex border-b border-slate-100 dark:border-gray-800 mb-6">
            <button v-for="tab in ['posts', 'reposts', 'likes']" :key="tab" @click="activeTab = tab as any" :class="['px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all', activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600']">{{ tab === 'posts' ? 'Gönderiler' : tab === 'reposts' ? 'Remakü' : 'Beğeniler' }}</button>
          </div>
          <div v-if="postsLoading" class="py-10 text-center"><div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          <div v-else-if="currentTabPosts.length === 0" class="py-20 text-center"><p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Henüz içerik yok</p></div>
          <div v-else class="space-y-4">
            <PostCard v-for="post in currentTabPosts" :key="post.id" :post="post" @delete="handleDeletePost" @report="handleOpenPostReport" @showComments="handleShowComments" @interaction="handleInteraction" />
          </div>
        </template>
      </div>
    </template>

    <!-- GLOBAL CENTERED REPORT MODAL -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showGlobalReport" class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md" @click.self="closeReport">
          <div class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <button v-if="reportStep === 2" @click="reportStep = 1" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
              <div v-else class="w-9"></div>
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Şikayet Bildirimi</h3>
              <button @click="closeReport" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
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
                <button v-for="sub in reportCategories[selectedReportCategory]" :key="sub" @click="submitReport(sub)" :disabled="reportLoading" class="w-full text-left p-3.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:border-red-900/30 transition-all group">
                  <span class="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-red-600">{{ sub }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- OTHER MODALS -->
    <EditProfileModal :is-open="showEditModal" :user="displayedUser" @close="showEditModal = false" @save="handleSaveProfile" />
    <CommentsModal :is-open="commentsModalOpen" :post-id="selectedPostId" @close="commentsModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useFollowStore } from "@/stores/follow";
import { useChatStore } from "@/stores/chat";
import { useNotificationsStore } from "@/stores/notifications";
import { useCommentsStore } from "@/stores/comments";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import PostCard from "@/components/PostCard.vue";
import CommentsModal from "@/components/CommentsModal.vue";
import EditProfileModal from "@/components/EditProfileModal.vue";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const followStore = useFollowStore();
const chatStore = useChatStore();
const notificationsStore = useNotificationsStore();
const commentsStore = useCommentsStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const displayedUser = ref<any>(null);
const userPosts = ref<any[]>([]);
const reposts = ref<any[]>([]);
const likedPosts = ref<any[]>([]);
const activeTab = ref<"posts" | "reposts" | "likes">("posts");
const loading = ref(true);
const postsLoading = ref(true);
const followLoading = ref(false);
const error = ref("");

const showOptionsMenu = ref(false);
const showEditModal = ref(false);
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);

// UNIFIED REPORT SYSTEM
const showGlobalReport = ref(false);
const reportStep = ref(1);
const selectedReportCategory = ref("");
const reportType = ref<"post" | "user">("post");
const reportTargetId = ref<number | string | null>(null);
const reportLoading = ref(false);

const openUserReport = () => {
  reportType.value = "user";
  reportTargetId.value = displayedUser.value.username;
  showGlobalReport.value = true;
  reportStep.value = 1;
  showOptionsMenu.value = false;
};

const handleOpenPostReport = (postId: number) => {
  reportType.value = "post";
  reportTargetId.value = postId;
  showGlobalReport.value = true;
  reportStep.value = 1;
};

const selectReportCategory = (name: string) => {
  selectedReportCategory.value = name;
  reportStep.value = 2;
};

const submitReport = async (subReason: string) => {
  reportLoading.value = true;
  try {
    const payload: any = { reason: selectedReportCategory.value, subReason };
    if (reportType.value === "user") payload.reportedUsername = reportTargetId.value;
    else payload.reportedPostId = reportTargetId.value;
    await apiClient.post("/users/report", payload);
    toast.success("Şikayet iletildi! 🛡️");
    closeReport();
  } catch {
    toast.error("Şikayet gönderilemedi.");
  } finally {
    reportLoading.value = false;
  }
};

const closeReport = () => { showGlobalReport.value = false; reportStep.value = 1; };

const reportCategories: Record<string, string[]> = {
  Nefret: ["Hakaretler", "Irkçı veya cinsiyetçi klişeler", "İnsanlıktan çıkarma", "Korku veya ayrımcılığa teşvik"],
  "Taciz ve Rahatsızlık": ["Hakaret", "İstenmeyen Cinsel İçerik", "Hedefli Taciz"],
  "Şiddet içeren konuşma": ["Şiddet Tehditleri", "Zarar Verme İsteği", "Şiddeti Yüceltme"],
  Mahremiyet: ["Özel bilgileri paylaşmak", "Rızam olmadan özel görüntü paylaşımı"],
  "Yasadışı Davranışlar": ["İnsan sömürüsü", "Cinsel şiddet", "Yasadışı ürün satışı"]
};

// HELPERS
const userInitials = computed(() => {
  if (!displayedUser.value) return "";
  const name = displayedUser.value.fullName || displayedUser.value.username;
  return name.charAt(0).toUpperCase();
});

const currentTabPosts = computed(() => {
  if (activeTab.value === "posts") return userPosts.value;
  if (activeTab.value === "reposts") return reposts.value;
  if (activeTab.value === "likes") return likedPosts.value;
  return [];
});

const isMyProfile = computed(() => authStore.user?.id === displayedUser.value?.id);
const isFollowing = computed(() => displayedUser.value?.isFollowing);
const canViewContent = computed(() => isMyProfile.value || !displayedUser.value?.isPrivate || isFollowing.value);

const fetchProfile = async () => {
  const username = route.params.id as string || authStore.user?.username;
  if (!username) return;
  loading.value = true;
  try {
    const res = await apiClient.get(`/users/username/${username}`, { params: { currentUserId: authStore.user?.id } });
    displayedUser.value = res.data;
    if (canViewContent.value) {
      const [p, r, l] = await Promise.all([
        apiClient.get(`/users/${displayedUser.value.id}/posts`, { params: { currentUserId: authStore.user?.id } }),
        postsStore.fetchUserReposts(displayedUser.value.id, authStore.user?.id),
        apiClient.get(`/posts/user/${displayedUser.value.id}/likes`, { params: { currentUserId: authStore.user?.id } })
      ]);
      userPosts.value = p.data;
      reposts.value = r;
      likedPosts.value = l.data;
    }
  } catch { error.value = "Kullanıcı bulunamadı."; }
  finally { loading.value = false; postsLoading.value = false; }
};

const handleFollowToggle = async () => {
  if (!authStore.user) return;
  followLoading.value = true;
  try {
    const result = await followStore.toggleFollow(displayedUser.value.id);
    if (result.status === "FOLLOWING") {
      displayedUser.value.isFollowing = true;
      displayedUser.value._count.followers++;
    } else {
      displayedUser.value.isFollowing = false;
      displayedUser.value._count.followers = Math.max(0, displayedUser.value._count.followers - 1);
    }
    toast.success(result.message);
  } catch { toast.error("İşlem başarısız."); }
  finally { followLoading.value = false; }
};

const handleSaveProfile = async (data: any) => {
  try {
    const { username, ...updateData } = data;
    const res = await apiClient.patch(`/users/${displayedUser.value.id}`, updateData, { params: { currentUserId: authStore.user?.id } });
    displayedUser.value = { ...displayedUser.value, ...res.data };
    if (authStore.user?.id === Number(displayedUser.value.id)) authStore.updateUser(res.data);
    showEditModal.value = false;
    toast.success("Profil güncellendi! ✨");
  } catch { toast.error("Güncelleme başarısız."); }
};

const handleInteraction = (data: any) => {
  const { type, postId, status } = data;
  const update = (list: any[]) => {
    list.forEach(p => {
      const t = p.repostOf || p;
      if (t.id === postId) {
        if (type === 'like') { t.isLiked = status; t._count.likes += status ? 1 : -1; }
        if (type === 'repost') { t.isReposted = status; t._count.reposts += status ? 1 : -1; }
      }
    });
  };
  update(userPosts.value); update(reposts.value); update(likedPosts.value);
};

const handleDeletePost = async (postId: number) => {
  if (!confirm("Silmek istediğine emin misin?")) return;
  try { await postsStore.deletePost(postId); fetchProfile(); } catch {}
};

const handleShowComments = (id: number) => { selectedPostId.value = id; commentsModalOpen.value = true; };

const getBadgeIcon = (iconName: string) => {
  const icons: Record<string, string> = {
    founder: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
    academic: '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 12.083 0 0012 20.055a11.952 12.083 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>'
  };
  return icons[iconName] || '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
};

onMounted(fetchProfile);
watch(() => route.params.id, fetchProfile);
</script>

<style scoped>
.btn-primary { @apply px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
