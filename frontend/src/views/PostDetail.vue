<!-- src/views/PostDetail.vue -->
<template>
  <div class="max-w-2xl mx-auto min-h-screen bg-white dark:bg-gray-950 pb-20 sm:pb-8 transition-colors duration-500 relative">
    
    <!-- MODERATION OVERLAYS -->
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
    
    <div v-else class="animate-fade-in flex flex-col">
      
      <!-- 1. ÜST POSTLAR (ATALAR - ANCESTORS) -->
      <div v-if="parents && parents.length > 0" class="flex flex-col">
        <PostCard 
          v-for="parent in parents" 
          :key="parent.id" 
          :post="parent" 
          :isThreadParent="true"
          @delete="openDeletePost" 
          @report="handleReportPost" 
        />
      </div>

      <!-- 2. ANA ODAK POST (MAIN POST) -->
      <div class="relative">
        <PostCard 
          :post="post" 
          :isThreadParent="false"
          @delete="openDeletePost" 
          @report="handleReportPost" 
          @showComments="focusCommentInput"
        />
      </div>

      <!-- 3. YANIT VERME ALANI (REPLY BOX) -->
      <div class="px-4 py-4 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-white/5">
        <div v-if="authStore.isAuthenticated" class="flex gap-3">
          <div class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner">
            <img v-if="authStore.user?.avatarUrl" :src="getImageUrl(authStore.user.avatarUrl)" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center font-bold text-blue-600 uppercase">{{ authStore.user?.username?.charAt(0) }}</div>
          </div>
          <div class="flex-1 space-y-3 relative">
            <textarea ref="commentInput" v-model="commentContent" @input="handleInput" rows="2" placeholder="Yanıtını gönder..." class="w-full p-4 bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[1.5rem] text-[15px] focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all dark:text-white"></textarea>
            
            <!-- MENTION TOOLTIP -->
            <div v-if="showMentions" :style="{ top: mentionPos.y + 'px', left: mentionPos.x + 'px' }" class="absolute z-[60] w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
              <div class="max-h-48 overflow-y-auto no-scrollbar">
                <button v-for="user in mentionUsers" :key="user.id" @click="selectMention(user.username)" class="w-full flex items-center gap-3 p-2.5 hover:bg-blue-600 hover:text-white transition-colors group text-left">
                  <img v-if="user.avatarUrl" :src="getImageUrl(user.avatarUrl)" class="w-7 h-7 rounded-full object-cover border border-white/20" />
                  <div v-else class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-[10px] font-black group-hover:bg-white group-hover:text-blue-600 transition-colors">{{ user.username.charAt(0).toUpperCase() }}</div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-xs font-bold truncate">{{ user.fullName || user.username }}</span>
                    <span class="text-[10px] opacity-70 truncate">@{{ user.username }}</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="flex justify-end">
              <button @click="submitReply" :disabled="!commentContent.trim() || commentLoading" class="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl uppercase hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-95">Yanıtla</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. CEVAPLAR (REPLIES) -->
      <div v-if="replies && replies.length > 0" class="flex flex-col">
        <PostCard 
          v-for="reply in replies" 
          :key="reply.id" 
          :post="reply" 
          :isThreadParent="false"
          @delete="openDeletePost" 
          @report="handleReportPost" 
        />
      </div>
      <div v-else class="py-10 text-center opacity-40">
        <p class="text-xs font-bold uppercase italic">İlk yanıtlayan sen ol!</p>
      </div>

    </div>

    <!-- 1. CUSTOM DELETE CONFIRMATION -->
    <DeleteConfirmModal
      :is-open="showDeleteConfirm"
      :loading="isDeleting"
      title="Gönderiyi Sil?"
      message="Bu işlem geri alınamaz. İçerik tamamen kaldırılacaktır."
      confirm-text="SİL"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="closeDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePostsStore } from '@/stores/posts';
import apiClient from '@/api/client';
import { useToast } from 'vue-toastification';
import PostCard from '@/components/PostCard.vue';
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue';
import type { Post } from '@/types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const postsStore = usePostsStore();
const toast = useToast();

const loading = ref(true);
const parents = ref<Post[]>([]);
const post = ref<Post | null>(null);
const replies = ref<Post[]>([]);

const commentContent = ref('');
const commentLoading = ref(false);
const commentInput = ref<HTMLTextAreaElement | null>(null);

// MENTION STATES
const mentionUsers = ref<any[]>([]);
const showMentions = ref(false);
const mentionPos = ref({ x: 0, y: 0 });

const getCursorXY = (el: HTMLTextAreaElement, cursorIndex: number) => {
  const style = window.getComputedStyle(el);
  const mirror = document.createElement("div");
  const copyStyle = [
    "fontFamily", "fontSize", "fontWeight", "lineHeight", "padding", 
    "border", "width", "boxSizing", "whiteSpace", "wordBreak"
  ];
  copyStyle.forEach((prop) => {
    (mirror.style as any)[prop] = (style as any)[prop];
  });
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.top = "0";
  mirror.style.left = "0";
  mirror.textContent = el.value.substring(0, cursorIndex);
  
  const span = document.createElement("span");
  span.textContent = el.value.substring(cursorIndex) || ".";
  mirror.appendChild(span);
  
  document.body.appendChild(mirror);
  const { offsetLeft: x, offsetTop: y } = span;
  document.body.removeChild(mirror);
  
  return { 
    x: Math.min(x, el.clientWidth - 250), 
    y: Math.min(y + 25, el.clientHeight + 40) 
  };
};

const handleInput = async (e: any) => {
  const val = e.target.value;
  const cursor = e.target.selectionStart;
  const words = val.substring(0, cursor).split(/\s/);
  const lastWord = words[words.length - 1];

  if (lastWord && lastWord.startsWith("@")) {
    const q = lastWord.substring(1);
    mentionPos.value = getCursorXY(e.target, cursor - q.length - 1);
    
    try {
      const res = await apiClient.get(`/users/search-mentions?q=${q}`);
      mentionUsers.value = res.data;
      showMentions.value = mentionUsers.value.length > 0;
    } catch {
      showMentions.value = false;
    }
  } else {
    showMentions.value = false;
  }
};

const selectMention = (username: string) => {
  const val = commentContent.value;
  const el = commentInput.value;
  const cursor = el?.selectionStart || val.length;
  
  const beforeCursor = val.substring(0, cursor);
  const afterCursor = val.substring(cursor);
  const lastAt = beforeCursor.lastIndexOf("@");

  commentContent.value = beforeCursor.substring(0, lastAt) + `@${username} ` + afterCursor;
  showMentions.value = false;
  el?.focus();
};

const isAdmin = computed(() => authStore.user?.role === 'ADMIN' || authStore.user?.email === '2312101063@ogr.mehmetakif.edu.tr');
const showDeleteConfirm = ref(false);
const deleteTarget = ref<number | null>(null);
const isDeleting = ref(false);
const showReportModal = ref(false);
const reportStep = ref(1);
const selectedCategory = ref("");
const reportTarget = ref<number | null>(null);

const reportCategories: Record<string, string[]> = {
  Nefret: ["Hakaretler", "Irkçı veya cinsiyetçi klişeler", "İnsanlıktan çıkarma", "Korku veya ayrımcılığa teşvik"],
  "Taciz ve Rahatsızlık": ["Hakaret", "İstenmeyen Cinsel İçerik", "Hedefli Taciz"],
  "Şiddet içeren konuşma": ["Şiddet Tehditleri", "Zarar Verme İsteği", "Şiddeti Yüceltme"],
  Mahremiyet: ["Özel bilgileri paylaşmak", "Rızam olmadan özel görüntü paylaşımı"],
  "Yasadışı Davranışlar": ["İnsan sömürüsü", "Cinsel şiddet", "Yasadışı ürün satışı"]
};

// YENİ THREAD SİSTEMİ İLE FETCH
const fetchThread = async () => {
  const postId = Number(route.params.id);
  if (isNaN(postId)) {
    toast.error("Geçersiz gönderi ID'si.");
    return;
  }

  loading.value = true;
  try {
    console.log("Fetching thread for post:", postId);
    const threadData = await postsStore.fetchThread(postId, authStore.user?.id);
    
    if (!threadData || !threadData.post) {
      console.error("Invalid thread data received:", threadData);
      post.value = null;
      toast.error("Gönderi bulunamadı.");
      return;
    }

    parents.value = threadData.parents || [];
    post.value = threadData.post;
    replies.value = threadData.replies || [];
    console.log("Thread data loaded successfully.");
  } catch (error: any) { 
    console.error("Thread fetch error:", error);
    toast.error(error.message || "Gönderi yüklenemedi."); 
  } finally { 
    loading.value = false; 
  }
};

// Aynı sayfada farklı bir post'a (örneğin bir yanıta) tıklandığında sayfayı yenile
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchThread();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

const focusCommentInput = () => { commentInput.value?.focus(); };

// ARTIK YORUM DEĞİL, BİR 'POST' OLUŞTURUYORUZ (parentId ile)
const submitReply = async () => {
  if (!commentContent.value.trim() || !post.value) return;
  commentLoading.value = true;
  try {
    const newReply = await postsStore.createPost(
      commentContent.value,
      true, // published
      undefined, // categoryId (opsiyonel)
      undefined, // image (opsiyonel)
      post.value.id // parentId
    );
    
    // Yeni cevabı listeye ekle
    replies.value.unshift(newReply);
    commentContent.value = '';
    
    toast.success("Yanıt gönderildi! 💬");
  } catch (error) { 
    toast.error("Yanıt gönderilemedi."); 
  } finally { 
    commentLoading.value = false; 
  }
};

// SİLME İŞLEMLERİ
const openDeletePost = (id: number) => { deleteTarget.value = id; showDeleteConfirm.value = true; };
const closeDelete = () => { deleteTarget.value = null; showDeleteConfirm.value = false; };

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await postsStore.deletePost(deleteTarget.value);
    toast.success("Silindi.");
    
    if (deleteTarget.value === post.value?.id) {
      // Eğer ana post silindiyse geri dön
      router.back();
    } else {
      // Eğer bir cevap silindiyse veya ata silindiyse listeden çıkar
      replies.value = replies.value.filter(r => r.id !== deleteTarget.value);
      parents.value = parents.value.filter(p => p.id !== deleteTarget.value);
    }
    showDeleteConfirm.value = false;
  } catch { 
    toast.error("Silinemedi!"); 
  } finally { 
    isDeleting.value = false;
    deleteTarget.value = null;
  }
};

// RAPORLAMA İŞLEMLERİ
const handleReportPost = (id: number) => { reportTarget.value = id; showReportModal.value = true; reportStep.value = 1; };
const selectReportCategory = (name: string) => { selectedCategory.value = name; reportStep.value = 2; };
const submitReport = async (sub: string) => {
  if (!reportTarget.value) return;
  try {
    const payload = { 
      reason: selectedCategory.value, 
      subReason: sub,
      reportedPostId: reportTarget.value 
    };
    await apiClient.post('/users/report', payload);
    toast.warning("Bildirildi.");
  } catch { 
    toast.error("Hata!"); 
  } finally { 
    closeReport(); 
  }
};
const closeReport = () => { showReportModal.value = false; reportTarget.value = null; };

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

onMounted(() => {
  fetchThread();
});
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
