<!-- src/views/PostDetail.vue -->
<template>
  <div class="max-w-2xl mx-auto min-h-screen bg-white dark:bg-gray-950 pb-20 sm:pb-8 transition-colors duration-500">
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
      <!-- Post Body -->
      <article class="p-4 sm:p-6 border-b border-gray-100 dark:border-primary-900/10">
        <!-- Author Info -->
        <div v-if="post.author" class="flex items-center gap-3 mb-4">
          <router-link :to="`/profile/${post.author.username}`" class="block flex-shrink-0">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-black text-blue-600 uppercase shadow-inner overflow-hidden border border-gray-100 dark:border-white/5">
              <img v-if="post.author.avatarUrl" :src="getImageUrl(post.author.avatarUrl)" class="w-full h-full object-cover" />
              <span v-else>{{ post.author.username?.charAt(0) }}</span>
            </div>
          </router-link>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <router-link :to="`/profile/${post.author.username}`" class="font-black text-gray-900 dark:text-white hover:underline truncate">
                {{ post.author.fullName || post.author.username }}
              </router-link>
              <div v-if="post.author.role === 'ADMIN'" class="p-0.5 rounded-full bg-blue-600 text-white shadow-sm"><svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg></div>
            </div>
            <p class="text-gray-500 dark:text-gray-400 text-sm truncate">@{{ post.author.username }}</p>
          </div>
        </div>

        <!-- Post Content -->
        <div class="space-y-4">
          <p class="text-gray-900 dark:text-white text-[15px] leading-normal whitespace-pre-wrap">
            <HashtagText :text="post.content || ''" />
          </p>
          
          <div v-if="post.imageUrl" class="rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl bg-slate-50 dark:bg-gray-900">
            <img :src="getImageUrl(post.imageUrl)" class="w-full h-auto max-h-[600px] object-contain" alt="Post content" />
          </div>

          <div class="flex items-center justify-between text-gray-400 text-[10px] font-bold uppercase tracking-widest pt-4">
            <span v-if="post.createdAt">{{ new Date(post.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }} · {{ new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
            <div v-if="post.category" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg" :style="{ backgroundColor: post.category.color }">
              {{ post.category.name }}
            </div>
          </div>
        </div>

        <!-- Interactions Stats -->
        <div class="flex gap-6 py-4 mt-4 border-y border-gray-100 dark:border-primary-900/10">
          <div class="text-sm font-bold"><span class="font-black text-gray-900 dark:text-white">{{ post._count?.likes || 0 }}</span> <span class="text-gray-400 uppercase text-[10px] tracking-widest ml-1">Beğeni</span></div>
          <div class="text-sm font-bold"><span class="font-black text-gray-900 dark:text-white">{{ post._count?.comments || 0 }}</span> <span class="text-gray-400 uppercase text-[10px] tracking-widest ml-1">Yorum</span></div>
          <div class="text-sm font-bold"><span class="font-black text-gray-900 dark:text-white">{{ post._count?.reposts || 0 }}</span> <span class="text-gray-400 uppercase text-[10px] tracking-widest ml-1">Remakü</span></div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-around py-2">
          <button @click="handleLike" :class="post.isLiked ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all active:scale-95 group">
            <svg class="w-6 h-6 transition-transform group-active:scale-125" :class="post.isLiked ? 'fill-red-600' : 'fill-none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          <button @click="focusComment" class="flex-1 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 py-3 rounded-2xl transition-all active:scale-95 group">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </button>
          <button @click="handleRepost" :class="post.isReposted ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'" class="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all active:scale-95 group">
            <svg class="w-6 h-6 transition-transform group-active:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15" /></svg>
          </button>
        </div>
      </article>

      <!-- Comments Section -->
      <div class="px-4 py-6">
        <h2 class="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter italic">Yorumlar ({{ comments?.length || 0 }})</h2>
        
        <!-- Add Comment -->
        <div v-if="authStore.isAuthenticated" class="flex gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner">
            <img v-if="authStore.user?.avatarUrl" :src="getImageUrl(authStore.user.avatarUrl)" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center font-black text-blue-600 uppercase">{{ authStore.user?.username?.charAt(0) }}</div>
          </div>
          <div class="flex-1 space-y-3">
            <textarea 
              ref="commentInput"
              v-model="commentContent" 
              rows="2" 
              placeholder="Fikrini paylaş..." 
              class="w-full p-4 bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[1.5rem] text-[15px] focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all dark:text-white"
            ></textarea>
            <div class="flex justify-end">
              <button @click="submitComment" :disabled="!commentContent.trim() || commentLoading" class="px-6 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl uppercase hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-95">Yorum Yap</button>
            </div>
          </div>
        </div>

        <!-- Comments List -->
        <div v-if="comments && comments.length > 0" class="space-y-6">
          <div v-for="comment in comments" :key="comment.id" class="flex gap-3 animate-fade-in">
            <router-link v-if="comment.author" :to="`/profile/${comment.author.username}`" class="flex-shrink-0">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center font-black text-blue-600 uppercase shadow-inner overflow-hidden border border-gray-100 dark:border-white/5">
                <img v-if="comment.author.avatarUrl" :src="getImageUrl(comment.author.avatarUrl)" class="w-full h-full object-cover" />
                <span v-else>{{ comment.author.username?.charAt(0) }}</span>
              </div>
            </router-link>
            <div v-if="comment.author" class="flex-1">
              <div class="bg-slate-50 dark:bg-gray-900/50 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5">
                <div class="flex items-center justify-between mb-1">
                  <router-link :to="`/profile/${comment.author.username}`" class="font-black text-xs text-gray-900 dark:text-white hover:underline">@{{ comment.author.username }}</router-link>
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-10 text-center opacity-40">
          <p class="text-xs font-black uppercase tracking-[0.2em] italic">Henüz yorum yapılmamış.</p>
        </div>
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

const fetchPost = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get(`/posts/${route.params.id}?currentUserId=${authStore.user?.id || ''}`);
    post.value = res.data;
    
    // Yorumları ayrı bir try-catch ile çekelim ki yorum hatası postu bozmasın
    try {
      const commentsRes = await apiClient.get(`/comments/post/${route.params.id}`);
      comments.value = Array.isArray(commentsRes.data) ? commentsRes.data : [];
    } catch (cErr) {
      console.error("Comments load error:", cErr);
      comments.value = [];
    }
  } catch (error) {
    console.error("Post load error:", error);
    toast.error("Gönderi yüklenemedi.");
  } finally {
    loading.value = false;
  }
};

const handleLike = async () => {
  if (!authStore.isAuthenticated) return toast.info("Önce giriş yapmalısın.");
  try {
    const res = await apiClient.post(`/likes/toggle/${post.value.id}`);
    post.value.isLiked = res.data.liked;
    post.value._count.likes += res.data.liked ? 1 : -1;
  } catch { toast.error("İşlem başarısız."); }
};

const handleRepost = async () => {
  if (!authStore.isAuthenticated) return toast.info("Önce giriş yapmalısın.");
  try {
    const res = await apiClient.post(`/posts/${post.value.id}/repost`);
    post.value.isReposted = res.data.reposted;
    post.value._count.reposts += res.data.reposted ? 1 : -1;
    toast.success(res.data.reposted ? "Remakülendi! ✨" : "Geri alındı.");
  } catch { toast.error("İşlem başarısız."); }
};

const submitComment = async () => {
  if (!commentContent.value.trim()) return;
  commentLoading.value = true;
  try {
    // Backend endpoint: POST /comments/post/:postId
    const res = await apiClient.post(`/comments/post/${post.value.id}`, { 
      content: commentContent.value 
    });
    
    if (!comments.value) comments.value = [];
    comments.value.unshift(res.data);
    commentContent.value = '';
    if (post.value._count) post.value._count.comments++;
    toast.success("Yorumun eklendi! 💬");
  } catch (error) { 
    console.error("Comment submit error:", error);
    toast.error("Yorum yapılamadı."); 
  }
  finally { commentLoading.value = false; }
};

const focusComment = () => commentInput.value?.focus();

const formatDate = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
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
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
};

onMounted(fetchPost);
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
