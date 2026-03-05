<!-- src/views/Profile.vue -->
<template>
  <div class="max-w-4xl mx-auto pb-20 text-left">
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
          <img v-if="displayedUser.coverUrl" :src="getImageUrl(displayedUser.coverUrl)" alt="Cover" class="w-full h-full object-cover" />
        </div>
        <button v-if="isMyProfile" @click="showEditModal = true" class="absolute top-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-full text-sm font-bold backdrop-blur-sm transition-all hover:scale-105 active:scale-95">Profili Düzenle</button>
        <div class="absolute -bottom-16 left-6">
          <div class="p-1 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow-xl">
            <img v-if="displayedUser.avatarUrl" :src="getImageUrl(displayedUser.avatarUrl)" alt="Avatar" class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 object-cover" />
            <div v-else class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span class="text-white font-bold text-4xl">{{ userInitials }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Info -->
      <div class="bg-white dark:bg-gray-900/40 rounded-b-xl border-x border-b border-slate-200 dark:border-primary-900/30 pt-20 px-6 pb-6 shadow-sm">
        
        <!-- ÜST SATIR: İSİM, ROZETLER VE BUTONLAR -->
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
          
          <!-- Sol Taraf: İsim ve Rozetler -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h1 class="text-2xl font-black text-slate-900 dark:text-white truncate max-w-full">
                {{ displayedUser.fullName || displayedUser.username }}
              </h1>
              
              <!-- Elit Rozetler -->
              <div v-if="(displayedUser.badges?.length || displayedUser.role === 'ADMIN')" class="flex flex-wrap gap-1.5 items-center">
                <div v-if="displayedUser.role === 'ADMIN'" class="group relative flex items-center justify-center">
                  <div class="p-1.5 rounded-full text-white shadow-lg transition-all hover:scale-110" :style="{ backgroundColor: '#1E3A8A' }">
                    <component :is="getBadgeComponent('crown')" class="w-3.5 h-3.5" />
                  </div>
                  <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none">Sistem Kurucusu</div>
                </div>
                <div v-for="ub in displayedUser.badges" :key="ub.badge.id" class="group relative flex items-center justify-center">
                  <div class="p-1.5 rounded-full shadow-sm transition-all hover:scale-110 border flex items-center justify-center" :style="{ backgroundColor: ub.badge.color, color: getContrastColor(ub.badge.color), borderColor: ub.badge.color === '#FFFFFF' ? '#e2e8f0' : 'rgba(0,0,0,0.05)' }">
                    <component :is="getBadgeComponent(ub.badge.icon)" class="w-3.5 h-3.5" />
                  </div>
                  <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-[100] pointer-events-none shadow-xl border border-white/10 uppercase tracking-widest">{{ ub.badge.name }}</div>
                </div>
              </div>
            </div>
            <p class="text-slate-500 dark:text-gray-400 font-bold">@{{ displayedUser.username }}</p>
          </div>

          <!-- Sağ Taraf: Etkileşim Butonları -->
          <div v-if="!isMyProfile && authStore.isAuthenticated" class="flex items-center gap-2 flex-shrink-0">
            <button @click="handleFollowToggle" :disabled="followLoading" class="px-6 py-2.5 rounded-full font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 min-w-[120px]" :class="[isFollowing ? 'bg-slate-200 dark:bg-gray-800 text-slate-900 dark:text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20']">
              {{ isFollowing ? "Takipten Çık" : "Takip Et" }}
            </button>
            <button @click="router.push({ name: 'Messages', query: { userId: displayedUser.id } })" class="p-2.5 rounded-full border border-slate-200 dark:border-gray-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"><component :is="getBadgeComponent('message-square')" class="w-5 h-5" /></button>
            <div class="relative">
              <button @click="showOptionsMenu = !showOptionsMenu" class="p-2.5 rounded-full border border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all shadow-sm"><component :is="getBadgeComponent('more-vertical')" class="w-5 h-5 text-gray-500" /></button>
              <div v-if="showOptionsMenu" class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                <button @click="openUserReport" class="w-full text-left px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors flex items-center gap-3"><component :is="getBadgeComponent('alert-triangle')" class="w-5 h-5" />Şikayet Et</button>
                <button @click="openBlockConfirm" class="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"><component :is="getBadgeComponent('user-x')" class="w-5 h-5" />{{ displayedUser.isBlocked ? "Engeli Kaldır" : "Engelle" }}</button>
                <div v-if="authStore.user?.role === 'ADMIN'" class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p class="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Yönetici Paneli</p>
                  <button v-if="!isMyProfile" @click="handleAdminBanToggle" class="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"><component :is="getBadgeComponent('shield-off')" class="w-5 h-5" />{{ displayedUser.isBanned ? "Yasağı Kaldır" : "Yasakla" }}</button>
                  <button v-if="!isMyProfile" @click="handleAdminDeleteUser" class="w-full text-left px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"><component :is="getBadgeComponent('trash-2')" class="w-5 h-5" />Tamamen Sil</button>
                  <button @click="openBadgeModal" class="w-full text-left px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center gap-3"><component :is="getBadgeComponent('award')" class="w-5 h-5" />Rozet Yönetimi</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bio & Stats -->
        <div class="mt-6 space-y-4 border-t border-slate-50 dark:border-white/5 pt-6">
          <p v-if="displayedUser.bio" class="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed whitespace-pre-wrap max-w-2xl">{{ displayedUser.bio }}</p>
          <div class="flex gap-8 justify-start items-center">
            <div class="flex items-center gap-1.5"><span class="text-base font-black text-gray-900 dark:text-white">{{ displayedUser._count?.posts || 0 }}</span><span class="text-sm font-medium text-gray-500 dark:text-gray-400">Paylaşım</span></div>
            <button @click="openFollowModal('followers')" class="flex items-center gap-1.5 transition-all active:scale-95" :class="isMyProfile ? 'hover:opacity-70 cursor-pointer' : 'cursor-default'"><span class="text-base font-black text-gray-900 dark:text-white">{{ displayedUser._count?.followers || 0 }}</span><span class="text-sm font-medium text-gray-500 dark:text-gray-400">Takipçi</span></button>
            <button @click="openFollowModal('following')" class="flex items-center gap-1.5 transition-all active:scale-95" :class="isMyProfile ? 'hover:opacity-70 cursor-pointer' : 'cursor-default'"><span class="text-base font-black text-gray-900 dark:text-white">{{ displayedUser._count?.following || 0 }}</span><span class="text-sm font-medium text-gray-500 dark:text-gray-400">Takip</span></button>
          </div>
        </div>

        <template v-if="canViewContent">
          <div class="flex border-b border-slate-100 dark:border-gray-800 mt-8 mb-6">
            <button v-for="tab in ['posts', 'reposts', 'likes']" :key="tab" @click="activeTab = tab as any" :class="['px-8 py-4 text-[11px] font-black uppercase tracking-[0.1em] border-b-2 transition-all', activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600']">{{ tab === 'posts' ? 'Gönderiler' : tab === 'reposts' ? 'Remakü' : 'Beğeniler' }}</button>
          </div>
          <div v-if="postsLoading" class="py-10 text-center"><div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          <div v-else-if="currentTabPosts.length === 0" class="py-20 text-center"><p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Henüz içerik yok</p></div>
          <div v-else class="space-y-4">
            <PostCard v-for="post in currentTabPosts" :key="post.id" :post="post" @delete="handleDeletePost" @report="handleOpenPostReport" @showComments="handleShowComments" @interaction="handleInteraction" />
          </div>
        </template>
      </div>
    </template>

    <!-- MODALS -->
    <FollowModal :is-open="followModal.isOpen" :title="followModal.title" :users="followModal.users" @close="followModal.isOpen = false" />
    <EditProfileModal :is-open="showEditModal" :user="displayedUser" @close="showEditModal = false" @save="handleSaveProfile" />
    <CommentsModal :is-open="commentsModalOpen" :post-id="selectedPostId" @close="commentsModalOpen = false" />
    
    <DeleteConfirmModal 
      :is-open="confirmModal.show"
      :loading="confirmModal.loading"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText"
      :variant="confirmModal.variant"
      @confirm="handleConfirmAction"
      @cancel="confirmModal.show = false"
    />

    <!-- GLOBAL REPORT MODAL -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showGlobalReport" class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md" @click.self="closeReport">
          <div class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
              <button v-if="reportStep === 2" @click="reportStep = 1" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500"><component :is="getBadgeComponent('chevron-left')" class="w-5 h-5" /></button>
              <div v-else class="w-9"></div>
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Şikayet Bildirimi</h3>
              <button @click="closeReport" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"><component :is="getBadgeComponent('x')" class="w-5 h-5" /></button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar max-h-[60vh]">
              <div v-if="reportStep === 1">
                <button v-for="(cat, name) in reportCategories" :key="name" @click="selectReportCategory(name as string)" class="w-full text-left p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all flex items-center justify-between group">
                  <span class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ name }}</span>
                  <component :is="getBadgeComponent('chevron-right')" class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
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

    <!-- BADGE MANAGEMENT MODAL (ADMIN ONLY) -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showBadgeModal" class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md" @click.self="showBadgeModal = false">
          <div class="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div class="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between"><h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Rozet Yönetimi</h3><button @click="showBadgeModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"><component :is="getBadgeComponent('x')" class="w-5 h-5" /></button></div>
            <div class="p-6 max-h-[60vh] overflow-y-auto no-scrollbar grid grid-cols-2 gap-3">
              <button v-for="badge in allBadges" :key="badge.id" @click="handleToggleBadge(badge.id)" :class="['relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group', hasBadge(badge.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-white/5 hover:border-slate-200 dark:hover:border-white/10']">
                <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" :style="{ backgroundColor: badge.color, color: getContrastColor(badge.color), border: badge.color === '#FFFFFF' ? '1px solid #e2e8f0' : 'none' }">
                  <component :is="getBadgeComponent(badge.icon)" class="w-5 h-5" />
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{{ badge.name }}</span>
                <div v-if="hasBadge(badge.id)" class="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm"><component :is="getBadgeComponent('check')" class="w-2.5 h-2.5 text-white" /></div>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useFollowStore } from "@/stores/follow";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import PostCard from "@/components/PostCard.vue";
import CommentsModal from "@/components/CommentsModal.vue";
import EditProfileModal from "@/components/EditProfileModal.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import FollowModal from "@/components/FollowModal.vue";

// LUCIDE ICONS IMPORT
import * as LucideIcons from "lucide-vue-next";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const followStore = useFollowStore();
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

// LUCIDE ICON RESOLVER
const getBadgeComponent = (iconName: string) => {
  if (!iconName) return LucideIcons.HelpCircle;
  const pascalName = iconName.split(/[-_]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return (LucideIcons as any)[pascalName] || (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
};

// CONFIRM MODAL STATE
const confirmModal = ref({
  show: false,
  loading: false,
  title: "",
  message: "",
  confirmText: "",
  variant: 'info' as 'danger' | 'info',
  action: null as (() => Promise<void>) | null
});

const openConfirm = (title: string, message: string, confirmText: string, variant: 'danger' | 'info', action: () => Promise<void>) => {
  confirmModal.value = { show: true, loading: false, title, message, confirmText, variant, action };
  showOptionsMenu.value = false;
};

const handleConfirmAction = async () => {
  if (!confirmModal.value.action) return;
  confirmModal.value.loading = true;
  try {
    await confirmModal.value.action();
    confirmModal.value.show = false;
  } catch {
    toast.error("İşlem gerçekleştirilemedi.");
  } finally {
    confirmModal.value.loading = false;
  }
};

// FOLLOW MODAL
const followModal = ref({ isOpen: false, title: "", users: [] as any[] });
const openFollowModal = async (type: 'followers' | 'following') => {
  if (!isMyProfile.value) return; 
  followModal.value.title = type === 'followers' ? 'Takipçilerim' : 'Takip Ettiklerim';
  followModal.value.users = []; followModal.value.isOpen = true;
  try {
    const res = await apiClient.get(`/follow/${type}/${displayedUser.value.id}`);
    followModal.value.users = res.data.map((item: any) => type === 'followers' ? item.follower : item.following);
  } catch { toast.error("Liste yüklenemedi."); followModal.value.isOpen = false; }
};

// REPORT SYSTEM
const showGlobalReport = ref(false);
const reportStep = ref(1);
const selectedReportCategory = ref("");
const reportType = ref<"post" | "user">("post");
const reportTargetId = ref<number | string | null>(null);
const reportLoading = ref(false);
const reportCategories: Record<string, string[]> = {
  Nefret: ["Hakaretler", "Irkçı veya cinsiyetçi klişeler", "İnsanlıktan çıkarma", "Korku veya ayrımcılığa teşvik"],
  "Taciz ve Rahatsızlık": ["Hakaret", "İstenmeyen Cinsel İçerik", "Hedefli Taciz"],
  "Şiddet içeren konuşma": ["Şiddet Tehditleri", "Zarar Verme İsteği", "Şiddeti Yüceltme"],
  Mahremiyet: ["Özel bilgileri paylaşmak", "Rızam olmadan özel görüntü paylaşımı"],
  "Yasadışı Davranışlar": ["İnsan sömürüsü", "Cinsel şiddet", "Yasadışı ürün satışı"]
};

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

// ACTIONS
const openBlockConfirm = () => {
  const isBlocking = !displayedUser.value.isBlocked;
  openConfirm(
    isBlocking ? "Kullanıcıyı Engelle?" : "Engeli Kaldır?",
    isBlocking ? "Bu kullanıcıyla tüm takipleşme bağın kopacak." : "Bu kullanıcının engeli kaldırılacak.",
    isBlocking ? 'danger' : 'info',
    async () => {
      await apiClient.post(`/users/${displayedUser.value.id}/block`);
      displayedUser.value.isBlocked = !displayedUser.value.isBlocked;
      if (displayedUser.value.isBlocked && displayedUser.value.isFollowing) {
        displayedUser.value.isFollowing = false;
        displayedUser.value._count.followers = Math.max(0, displayedUser.value._count.followers - 1);
      }
      toast.success(displayedUser.value.isBlocked ? "Kullanıcı engellendi." : "Engel kaldırıldı.");
    }
  );
};

const handleAdminBanToggle = () => {
  const isBanning = !displayedUser.value.isBanned;
  openConfirm(
    isBanning ? "Kullanıcıyı Yasakla?" : "Yasağı Kaldır?",
    isBanning ? "Bu kullanıcı artık sisteme giriş yapamayacak." : "Bu kullanıcının yasağı kaldırılacak.",
    isBanning ? "EVET, YASAKLA" : "YASAĞI KALDIR",
    'danger',
    async () => {
      await apiClient.post(`/users/${displayedUser.value.id}/ban`);
      displayedUser.value.isBanned = !displayedUser.value.isBanned;
      toast.success(`Kullanıcı ${displayedUser.value.isBanned ? 'yasaklandı' : 'yasağı kaldırıldı'}.`);
    }
  );
};

const handleAdminDeleteUser = () => {
  openConfirm(
    "KALICI OLARAK SİL?",
    "Bu kullanıcı ve tüm verileri TAMAMEN silinecek. Bu işlem geri alınamaz!",
    "SİL GİTSİN",
    'danger',
    async () => {
      await apiClient.delete(`/users/${displayedUser.value.id}`);
      toast.success("Kullanıcı tamamen silindi.");
      router.push('/');
    }
  );
};

// BADGE MANAGEMENT
const showBadgeModal = ref(false);
const allBadges = ref<any[]>([]);
const openBadgeModal = async () => {
  try {
    const res = await apiClient.get('/users/badges/all');
    allBadges.value = res.data;
    showBadgeModal.value = true;
    showOptionsMenu.value = false;
  } catch { toast.error("Rozetler yüklenemedi."); }
};

const hasBadge = (badgeId: number) => displayedUser.value?.badges?.some((ub: any) => ub.badgeId === badgeId);

const handleToggleBadge = async (badgeId: number) => {
  try {
    const res = await apiClient.post(`/users/${displayedUser.value.id}/badges/${badgeId}`);
    if (res.data.assigned) {
      const newBadge = allBadges.value.find(b => b.id === badgeId);
      displayedUser.value.badges.push({ badgeId, badge: newBadge });
      toast.success("Rozet atandı! 🎖️");
    } else {
      displayedUser.value.badges = displayedUser.value.badges.filter((ub: any) => ub.badgeId !== badgeId);
      toast.success("Rozet geri alındı.");
    }
  } catch { toast.error("İşlem başarısız."); }
};

// HELPERS
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor || hexcolor === 'transparent') return 'white';
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#0f172a' : 'white';
};

const userInitials = computed(() => { if (!displayedUser.value) return ""; const name = displayedUser.value.fullName || displayedUser.value.username; return name.charAt(0).toUpperCase(); });
const currentTabPosts = computed(() => { if (activeTab.value === "posts") return userPosts.value; if (activeTab.value === "reposts") return reposts.value; if (activeTab.value === "likes") return likedPosts.value; return []; });
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
      userPosts.value = p.data; reposts.value = r; likedPosts.value = l.data;
    }
  } catch { error.value = "Kullanıcı bulunamadı."; }
  finally { loading.value = false; postsLoading.value = false; }
};

const handleFollowToggle = async () => { if (!authStore.user) return; followLoading.value = true; try { const result = await followStore.toggleFollow(displayedUser.value.id); if (result.status === "FOLLOWING") { displayedUser.value.isFollowing = true; displayedUser.value._count.followers++; } else { displayedUser.value.isFollowing = false; displayedUser.value._count.followers = Math.max(0, displayedUser.value._count.followers - 1); } toast.success(result.message); } catch { toast.error("İşlem başarısız."); } finally { followLoading.value = false; } };
const handleSaveProfile = async (data: any) => {
  try {
    const res = await apiClient.patch(
      `/users/${displayedUser.value.id}`,
      data,
      {
        params: { currentUserId: authStore.user?.id },
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    displayedUser.value = { ...displayedUser.value, ...res.data };
    if (authStore.user?.id === Number(displayedUser.value.id))
      authStore.updateUser(res.data);
    showEditModal.value = false;
    toast.success("Profil güncellendi! ✨");
  } catch {
    toast.error("Güncelleme başarısız.");
  }
};
const handleInteraction = (data: any) => { const { type, postId, status } = data; const update = (list: any[]) => { list.forEach(p => { const t = p.repostOf || p; if (t.id === postId) { if (type === 'like') { t.isLiked = status; t._count.likes += status ? 1 : -1; } if (type === 'repost') { t.isReposted = status; t._count.reposts += status ? 1 : -1; } } }); }; update(userPosts.value); update(reposts.value); update(likedPosts.value); };
const handleDeletePost = async (postId: number) => { if (!confirm("Silmek istediğine emin misin?")) return; try { await postsStore.deletePost(postId); fetchProfile(); } catch {} };
const handleShowComments = (id: number) => { selectedPostId.value = id; commentsModalOpen.value = true; };

onMounted(fetchProfile);
watch(() => route.params.id, fetchProfile);
</script>

<style scoped>
.btn-primary { @apply px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
