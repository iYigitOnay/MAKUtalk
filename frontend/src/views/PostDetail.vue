<!-- src/views/PostDetail.vue -->
<template>
  <div class="max-w-2xl mx-auto min-h-screen bg-white dark:bg-gray-950 pb-20 sm:pb-8 transition-colors duration-500 relative">
    
    <!-- MODERATION OVERLAYS -->
    <!-- 1. CUSTOM DELETE CONFIRMATION -->
    <transition name="fade">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-[110] bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl flex items-center justify-center p-8">
        <div class="text-center max-w-xs animate-in zoom-in-95 duration-200">
          <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">İçeriği Sil?</h3>
          <p class="text-gray-500 text-sm mt-2 mb-8">Bu işlem geri alınamaz. İçerik tamamen kaldırılacaktır.</p>
          <div class="flex flex-col gap-3">
            <button @click="confirmDelete" class="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all">SİL</button>
            <button @click="closeDelete" class="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">VAZGEÇ</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 2. CATEGORIZED REPORT MODAL -->
    <transition name="fade">
      <div v-if="showReportModal" class="fixed inset-0 z-[110] bg-white dark:bg-gray-950 flex flex-col">
        <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
          <button v-if="reportStep === 2" @click="reportStep = 1" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
          <div v-else class="w-9"></div>
          <h3 class="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Bildirim</h3>
          <button @click="closeReport" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
          <div v-if="reportStep === 1">
            <button v-for="(cat, name) in reportCategories" :key="name" @click="selectReportCategory(name as string)" class="w-full text-left p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all flex items-center justify-between group">
              <span class="font-bold text-gray-700 dark:text-gray-300">{{ name }}</span>
              <svg class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div v-else class="space-y-2">
            <button v-for="sub in reportCategories[selectedCategory]" :key="sub" @click="submitReport(sub)" class="w-full text-left p-4 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all">
              <span class="font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600">{{ sub }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Back Header -->
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-primary-900/10 px-4 py-3 flex items-center gap-6">
      <button @click="$router.back()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90 text-gray-600 dark:text-gray-300">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>
      <h1 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Paylaşım</h1>
    </header>

    <div v-if="loading" class="py-20 text-center"><div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
    <div v-else-if="!post" class="py-20 text-center text-gray-500 font-bold uppercase text-xs tracking-widest italic border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2.5rem] mx-4">Gönderi bulunamadı veya silinmiş olabilir.</div>
    
    <div v-else class="animate-fade-in">
      <!-- Post Body: Arka plan beyaz yapıldı, border kaldırıldı -->
      <article class="bg-white dark:bg-gray-950">
        <PostCard :post="post" @delete="openDeletePost" @report="handleReportPost" />
      </article>

      <!-- Comments Section -->
      <div class="px-4 py-6 bg-white dark:bg-gray-950">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 ml-2">Yorumlar ({{ comments?.length || 0 }})</h2>
        
        <!-- Add Comment -->
        <div v-if="authStore.isAuthenticated" class="flex gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner">
            <img v-if="authStore.user?.avatarUrl" :src="getImageUrl(authStore.user.avatarUrl)" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center font-bold text-blue-600 uppercase">{{ authStore.user?.username?.charAt(0) }}</div>
          </div>
          <div class="flex-1 space-y-3">
            <textarea ref="commentInput" v-model="commentContent" rows="2" placeholder="Fikrini paylaş..." class="w-full p-4 bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[1.5rem] text-[15px] focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all dark:text-white"></textarea>
            <div class="flex justify-end">
              <button @click="submitComment" :disabled="!commentContent.trim() || commentLoading" class="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl uppercase hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-95">Yorum Yap</button>
            </div>
          </div>
        </div>

        <!-- Comments List -->
        <div v-if="comments && comments.length > 0" class="space-y-6">
          <div v-for="comment in comments" :key="comment.id" class="flex gap-3 animate-fade-in group">
            <router-link v-if="comment.author" :to="`/profile/${comment.author.username}`" class="flex-shrink-0">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center font-bold text-blue-600 uppercase shadow-inner overflow-hidden border border-gray-100 dark:border-white/5">
                <img v-if="comment.author.avatarUrl" :src="getImageUrl(comment.author.avatarUrl)" class="w-full h-full object-cover" />
                <span v-else>{{ comment.author.username?.charAt(0) }}</span>
              </div>
            </router-link>
            <div v-if="comment.author" class="flex-1 min-w-0">
              <div class="bg-slate-50 dark:bg-gray-900/50 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5 relative">
                <div class="flex items-center justify-between mb-1">
                  <router-link :to="`/profile/${comment.author.username}`" class="font-bold text-xs text-gray-900 dark:text-white hover:underline">@{{ comment.author.username }}</router-link>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-gray-400 uppercase">{{ formatDate(comment.createdAt) }}</span>
                    <button v-if="authStore.user?.id === comment.userId || isAdmin" @click="openDeleteComment(comment.id)" class="text-gray-400 hover:text-red-500 transition-colors" :title="isAdmin ? 'Yönetici Olarak Sil' : 'Yorumu Sil'"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    <button v-if="authStore.user?.id !== comment.userId" @click="openReportComment(comment.id)" class="text-gray-400 hover:text-orange-500 transition-colors" title="Rapor Et"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg></button>
                  </div>
                </div>
                <HashtagText :text="comment.content" class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed" />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-10 text-center opacity-40"><p class="text-xs font-bold uppercase italic">Henüz yorum yapılmamış.</p></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/client';
import { useToast } from 'vue-toastification';
import HashtagText from '@/components/HashtagText.vue';
import PostCard from '@/components/PostCard.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const post = ref<any>(null);
const comments = ref<any[]>([]);
const loading = ref(true);
const commentContent = ref('');
const commentLoading = ref(false);
const commentInput = ref<HTMLTextAreaElement | null>(null);

const isAdmin = computed(() => authStore.user?.role === 'ADMIN' || authStore.user?.email === '2312101063@ogr.mehmetakif.edu.tr');
const showDeleteConfirm = ref(false);
const deleteTarget = ref<{ type: 'post' | 'comment', id: number } | null>(null);
const showReportModal = ref(false);
const reportStep = ref(1);
const selectedCategory = ref("");
const reportTarget = ref<{ type: 'post' | 'comment', id: number } | null>(null);

const reportCategories: Record<string, string[]> = {
  Nefret: ["Hakaretler", "Irkçı veya cinsiyetçi klişeler", "İnsanlıktan çıkarma", "Korku veya ayrımcılığa teşvik"],
  "Taciz ve Rahatsızlık": ["Hakaret", "İstenmeyen Cinsel İçerik", "Hedefli Taciz"],
  "Şiddet içeren konuşma": ["Şiddet Tehditleri", "Zarar Verme İsteği", "Şiddeti Yüceltme"],
  Mahremiyet: ["Özel bilgileri paylaşmak", "Rızam olmadan özel görüntü paylaşımı"],
  "Yasadışı Davranışlar": ["İnsan sömürüsü", "Cinsel şiddet", "Yasadışı ürün satışı"]
};

const fetchPost = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get(`/posts/${route.params.id}?currentUserId=${authStore.user?.id || ''}`);
    post.value = res.data;
    try {
      const commentsRes = await apiClient.get(`/comments/post/${route.params.id}`);
      comments.value = Array.isArray(commentsRes.data) ? commentsRes.data : [];
    } catch { comments.value = []; }
  } catch { toast.error("Gönderi yüklenemedi."); }
  finally { loading.value = false; }
};

const submitComment = async () => {
  if (!commentContent.value.trim()) return;
  commentLoading.value = true;
  try {
    const res = await apiClient.post(`/comments/post/${post.value.id}`, { content: commentContent.value });
    comments.value.unshift(res.data);
    commentContent.value = '';
    if (post.value._count) post.value._count.comments++;
    toast.success("Yorumun eklendi! 💬");
  } catch { toast.error("Yorum yapılamadı."); }
  finally { commentLoading.value = false; }
};

const openDeletePost = (id: number) => { deleteTarget.value = { type: 'post', id }; showDeleteConfirm.value = true; };
const openDeleteComment = (id: number) => { deleteTarget.value = { type: 'comment', id }; showDeleteConfirm.value = true; };
const closeDelete = () => { deleteTarget.value = null; showDeleteConfirm.value = false; };

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  try {
    if (deleteTarget.value.type === 'post') { await apiClient.delete(`/posts/${deleteTarget.value.id}`); toast.success("Gönderi silindi."); router.back(); }
    else { await apiClient.delete(`/comments/${deleteTarget.value.id}`); comments.value = comments.value.filter(c => c.id !== deleteTarget.value?.id); if (post.value._count) post.value._count.comments--; toast.success("Yorum silindi."); }
  } catch { toast.error("Hata!"); }
  finally { closeDelete(); }
};

const handleReportPost = (id: number) => { reportTarget.value = { type: 'post', id }; showReportModal.value = true; reportStep.value = 1; };
const openReportComment = (id: number) => { reportTarget.value = { type: 'comment', id }; showReportModal.value = true; reportStep.value = 1; };
const selectReportCategory = (name: string) => { selectedCategory.value = name; reportStep.value = 2; };
const submitReport = async (sub: string) => {
  if (!reportTarget.value) return;
  try {
    const payload: any = { reason: selectedCategory.value, subReason: sub };
    if (reportTarget.value.type === 'post') payload.reportedPostId = reportTarget.value.id;
    else payload.reportedCommentId = reportTarget.value.id;
    await apiClient.post('/users/report', payload);
    toast.warning("Bildirildi.");
  } catch { toast.error("Hata!"); }
  finally { closeReport(); }
};
const closeReport = () => { showReportModal.value = false; reportTarget.value = null; };

const formatDate = (date: string) => {
  const d = new Date(date);
  const diff = Math.floor((new Date().getTime() - d.getTime()) / 60000);
  if (diff < 1) return "Az önce";
  if (diff < 60) return `${diff}d`;
  if (diff < 1440) return `${Math.floor(diff/60)}s`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

onMounted(fetchPost);
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
