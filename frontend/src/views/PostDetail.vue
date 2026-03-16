<!-- src/views/PostDetail.vue -->
<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 pb-20">
    
    <!-- Standard Minimal Header -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-white/[0.05] px-4 py-3 flex items-center gap-6">  
      <button @click="$router.back()" class="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all text-gray-900 dark:text-white active:scale-90">       
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>
      <h1 class="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Gönderi</h1>
    </header>

    <div v-if="loading" class="py-20 text-center"><div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
    
    <div v-else-if="post" class="max-w-2xl mx-auto animate-in fade-in duration-300">

      <!-- 1. ANCESTOR THREAD -->
      <div v-if="parents.length > 0">
        <PostCard
          v-for="parent in parents"
          :key="parent.id"
          :post="parent"
          :isThreadParent="true"
          class="!bg-transparent !border-b-0"
        />
      </div>

      <!-- 2. MAIN POST -->
      <article class="p-4 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-white/[0.05]">
        <!-- Author Info -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <router-link :to="`/profile/${post.author.username}`">
              <img :src="getImageUrl(post.author.avatarUrl)" class="w-11 h-11 rounded-full object-cover border border-gray-100 dark:border-white/10 shadow-sm" />
            </router-link>
            <div class="flex flex-col">
              <div class="flex items-center gap-1.5 text-slate-900 dark:text-white">
                <router-link :to="`/profile/${post.author.username}`" class="font-black text-[15px] hover:underline">
                  {{ post.author.fullName || post.author.username }}
                </router-link>
                
                <!-- BADGES -->
                <div v-if="post.author.badges?.length || post.author.role === 'ADMIN'" class="flex gap-1 items-center">
                  <div v-if="post.author.role === 'ADMIN'" class="group relative flex items-center justify-center">
                    <div class="p-0.5 rounded-full text-white bg-[#1E3A8A] shadow-sm">
                      <component :is="getBadgeComponent('crown')" class="w-2.5 h-2.5" />
                    </div>
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-0.5 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[100] pointer-events-none uppercase">Kurucu</div>
                  </div>
                  <div v-for="ub in post.author.badges" :key="ub.badge?.id || ub.id" class="group relative flex items-center justify-center">
                    <div class="p-0.5 rounded-full border border-gray-100 shadow-sm" :style="{ backgroundColor: ub.badge?.color || '#3b82f6', color: 'white' }">
                      <component :is="getBadgeComponent(ub.badge?.icon || 'award')" class="w-2.5 h-2.5" />
                    </div>
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-0.5 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[100] pointer-events-none uppercase">{{ ub.badge?.name }}</div>
                  </div>
                </div>
              </div>
              <span class="text-sm text-gray-500 font-medium leading-none">@{{ post.author.username }}</span>
            </div>
          </div>

          <div class="relative">
            <button @click="showPostMenu = !showPostMenu" class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all">
              <component :is="getBadgeComponent('more-vertical')" class="w-5 h-5" />
            </button>
            <div v-if="showPostMenu" class="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl z-[100] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <button @click="handleCopyLink" class="w-full text-left px-3 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2.5">
                <component :is="getBadgeComponent('link')" class="w-4 h-4 text-gray-400" /> Bağlantıyı Kopyala
              </button>
              <button @click="openReportModal(post.id)" class="w-full text-left px-3 py-2 text-[13px] font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-2.5">
                <component :is="getBadgeComponent('alert-triangle')" class="w-4 h-4" /> Şikayet Et
              </button>
              <button v-if="isAdmin" @click="handleRefreshAI" class="w-full text-left px-3 py-2 text-[13px] font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2.5">
                <component :is="getBadgeComponent('sparkles')" class="w-4 h-4" /> AI Yenile
              </button>
              <button v-if="isOwner || isAdmin" @click="openDeletePost(post.id)" class="w-full text-left px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2.5">
                <component :is="getBadgeComponent('trash-2')" class="w-4 h-4" /> Gönderiyi Sil
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 mb-2.5 px-1">
          <span v-if="post.category" class="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase text-white" :style="{ backgroundColor: post.category.color || '#3b82f6' }">{{ post.category.name }}</span>
          <span v-if="post.sentiment" class="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase border" :class="getSentimentStyles(post.sentiment).class">{{ translateSentiment(post.sentiment) }}</span>
        </div>

        <div class="mb-4">
          <p class="text-[15px] sm:text-[16px] text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap px-1">
            <HashtagText :text="post.content" />
          </p>
        </div>

        <div v-if="post.imageUrl" class="mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.05]">
          <img :src="getImageUrl(post.imageUrl)" class="w-full h-auto max-h-[550px] object-cover" />
        </div>

        <div class="flex items-center gap-2 text-[11px] font-bold text-gray-400 border-b border-gray-50 dark:border-white/[0.03] pb-4 mb-4 px-1">
          <span>{{ formatDate(post.createdAt, true) }}</span>
          <span class="opacity-30">·</span>
          <span class="text-blue-600 font-black">MAKU Talk</span>
        </div>

        <div class="flex items-center justify-between px-2">
          <button @click="handleLike" class="flex items-center gap-2 group" :class="post.isLiked ? 'text-red-600' : 'text-gray-500'">
            <div class="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-all">
              <component :is="getBadgeComponent('heart')" class="w-5 h-5 transition-transform group-active:scale-125" :class="post.isLiked ? 'fill-red-600' : 'fill-none'" />
            </div>
            <span class="text-xs font-black">{{ post._count?.likes || 0 }}</span>
          </button>

          <button @click="focusCommentInput" class="flex items-center gap-2 group text-gray-500 hover:text-blue-600 transition-all">
            <div class="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
              <component :is="getBadgeComponent('message-square')" class="w-5 h-5 transition-transform group-active:scale-125" />
            </div>
            <span class="text-xs font-black">{{ post._count?.replies || 0 }}</span>
          </button>

          <button @click="handleRepost" class="flex items-center gap-2 group" :class="post.isReposted ? 'text-green-600' : 'text-gray-500'">
            <div class="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-all">
              <component :is="getBadgeComponent('repeat')" class="w-5 h-5 transition-transform group-active:scale-125" />
            </div>
            <span class="text-xs font-black">{{ post._count?.reposts || 0 }}</span>
          </button>

          <button @click="handleShare" class="flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white group">
            <component :is="getBadgeComponent('send')" class="w-5 h-5 transition-transform group-active:scale-125 text-gray-500 dark:text-gray-400 group-hover:text-current" />
          </button>
        </div>
      </article>

      <!-- 3. ADVANCED REPLY BOX (WITH ANIMATED COUNTER) -->
      <div v-if="authStore.isAuthenticated" class="p-4 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-white/[0.05]">
        <div class="flex gap-3">
          <img :src="getImageUrl(authStore.user?.avatarUrl)" class="w-10 h-10 rounded-full object-cover" />
          <div class="flex-1">
            <textarea 
              ref="commentInput" 
              v-model="commentContent" 
              placeholder="Fikirlerini paylaş..." 
              rows="1" 
              maxlength="280"
              class="w-full bg-transparent border-none outline-none py-2 text-[15px] dark:text-white placeholder-gray-400 resize-none no-scrollbar overflow-hidden"
              @input="resizeTextarea"
              @keydown.enter.prevent="submitReply"
            ></textarea>

            <!-- REPLY IMAGE PREVIEW -->
            <div v-if="selectedImagePreview" class="relative mt-2 mb-4 inline-block">
              <img :src="selectedImagePreview" class="max-h-48 rounded-2xl border border-gray-100 dark:border-white/10 shadow-lg shadow-blue-500/5" />
              <button @click="removeSelectedImage" class="absolute -top-2 -right-2 p-1 bg-gray-900/80 text-white rounded-full hover:bg-black transition-all">
                <component :is="getBadgeComponent('x')" class="w-4 h-4" />
              </button>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-white/[0.03] relative">
              <div class="flex items-center gap-1">
                <button @click="triggerFileInput" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-all group" title="Resim Ekle">
                  <component :is="getBadgeComponent('image')" class="w-5 h-5" />
                </button>
                <EmojiPicker @update:modelValue="onEmojiSelect" />
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
              </div>
              
              <div class="flex items-center gap-4">
                <!-- ANIMATED CHARACTER COUNTER -->
                <transition name="scale-fade">
                  <div v-if="commentContent.length > 0" class="flex items-center gap-2">
                    <div class="relative w-6 h-6 flex items-center justify-center">
                      <svg class="w-full h-full -rotate-90">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="transparent" class="text-gray-100 dark:text-gray-800" />
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" fill="transparent" class="transition-all duration-500" :class="commentContent.length > 280 ? 'text-red-500' : commentContent.length > 240 ? 'text-orange-500' : 'text-blue-500'" :stroke-dasharray="63" :stroke-dashoffset="63 - (Math.min(commentContent.length, 280) / 280) * 63" stroke-linecap="round" />
                      </svg>
                      <span v-if="commentContent.length > 240" class="absolute text-[8px] font-black" :class="commentContent.length >= 280 ? 'text-red-500' : 'text-gray-400'">{{ 280 - commentContent.length }}</span>
                    </div>
                    <div v-if="commentContent.length >= 280" class="w-px h-4 bg-gray-200 dark:bg-gray-800"></div>
                  </div>
                </transition>

                <button @click="submitReply" :disabled="(!commentContent.trim() && !selectedImage) || commentContent.length > 280 || commentLoading" class="px-5 py-1.5 bg-blue-600 text-white font-black text-xs rounded-full hover:bg-blue-700 transition-all disabled:opacity-40 shadow-lg shadow-blue-500/10 active:scale-95">
                  {{ commentLoading ? 'GÖNDERİLİYOR...' : 'YANITLA' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. REPLIES LIST -->
      <div v-if="replies.length > 0">
        <PostCard 
          v-for="reply in replies" 
          :key="reply.id" 
          :post="reply" 
          class="!bg-transparent !border-b !border-gray-100 dark:!border-white/[0.03]" 
          @report="openReportModal"
          @delete="openDeletePost"
        />
      </div>
      <div v-else class="py-20 text-center opacity-30 italic font-black uppercase text-[10px] tracking-[0.3em]">Henüz yanıt yok</div>

    </div>

    <!-- MODALS -->
    <DeleteConfirmModal :is-open="showDeleteConfirm" :loading="isDeleting" title="Gönderiyi Sil?" message="Bu işlem geri alınamaz." confirm-text="SİL" variant="danger" @confirm="confirmDelete" @cancel="showDeleteConfirm = false" />
    
    <!-- REPORT MODAL (MODERN & FUNCTIONAL) -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showReportModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md" @click.self="showReportModal = false">
          <div class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div class="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <button v-if="reportStep === 2" @click="reportStep = 1" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500">
                <component :is="getBadgeComponent('chevron-left')" class="w-5 h-5" />
              </button>
              <div v-else class="w-9"></div>
              <h3 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Bildirim Gönder</h3>
              <button @click="showReportModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400">
                <component :is="getBadgeComponent('x')" class="w-5 h-5" />
              </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-1.5 max-h-[60vh] no-scrollbar text-left">
              <div v-if="reportStep === 1">
                <button v-for="(subs, cat) in reportCategories" :key="cat" @click="selectReportCategory(cat)" class="w-full text-left p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between group">
                  {{ cat }}
                  <component :is="getBadgeComponent('chevron-right')" class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div v-else>
                <div class="px-4 py-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">{{ selectedReportCategory }}</div>
                <button v-for="sub in reportCategories[selectedReportCategory]" :key="sub" @click="submitReport(sub)" class="w-full text-left p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 group font-bold text-gray-700 dark:text-gray-300">
                  {{ sub }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePostsStore } from '@/stores/posts';
import { useLikesStore } from '@/stores/likes';
import { useProfileStore } from '@/stores/profile';
import apiClient from '@/api/client';
import { useToast } from 'vue-toastification';
import PostCard from '@/components/PostCard.vue';
import HashtagText from '@/components/HashtagText.vue';
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue';
import EmojiPicker from '@/components/EmojiPicker.vue';
import type { Post } from '@/types';
import * as LucideIcons from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const postsStore = usePostsStore();
const likesStore = useLikesStore();
const profileStore = useProfileStore();
const toast = useToast();

const loading = ref(true);

// GÜÇLÜ STATE MANAGEMENT: Artık lokal kopya değil, Store'daki reaktif veriyi kullanıyoruz!
const parents = computed(() => postsStore.currentThread.parents || []);
const post = computed(() => postsStore.currentThread.post || null);
const replies = computed(() => postsStore.currentThread.replies || []);

const commentContent = ref('');
const commentLoading = ref(false);
const commentInput = ref<HTMLTextAreaElement | null>(null);
const showPostMenu = ref(false);

// IMAGE UPLOAD STATE
const fileInput = ref<HTMLInputElement | null>(null);
const selectedImage = ref<File | null>(null);
const selectedImagePreview = ref<string | null>(null);

const isOwner = computed(() => authStore.user?.id === post.value?.authorId);
const isAdmin = computed(() => authStore.user?.role === "ADMIN");

const fetchThread = async () => {
  const postId = Number(route.params.id);
  if (isNaN(postId)) return;
  loading.value = true;
  try {
    await postsStore.fetchThread(postId, authStore.user?.id);
  } catch (error: any) {
    toast.error("Gönderi yüklenemedi.");
  } finally {
    loading.value = false;
  }
};

// ACTIONS
const triggerFileInput = () => fileInput.value?.click();
const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    selectedImage.value = file;
    selectedImagePreview.value = URL.createObjectURL(file);
  }
};
const removeSelectedImage = () => {
  selectedImage.value = null;
  selectedImagePreview.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

const onEmojiSelect = (emoji: string) => {
  commentContent.value += emoji;
  resizeTextarea();
};

const submitReply = async () => {
  if ((!commentContent.value.trim() && !selectedImage.value) || commentContent.value.length > 280 || !post.value) return;
  commentLoading.value = true;
  try {
    const newReply = await postsStore.createPost(
      commentContent.value, 
      true, 
      undefined, 
      selectedImage.value || undefined, 
      post.value.id
    );
    // Artık lokal 'replies' listesine değil, store'daki listeye unshift yapıyoruz
    postsStore.currentThread.replies.unshift(newReply);
    commentContent.value = '';
    removeSelectedImage();
    resizeTextarea(); // Reset size after submit
    toast.success("Yanıtlandı! 🚀");
  } catch { toast.error("Yanıt gönderilemedi."); }
  finally { commentLoading.value = false; }
};

const handleLike = async () => {
  if (!post.value || !authStore.isAuthenticated) return;
  try {
    const res = await likesStore.toggleLike(post.value.id);
    // Bu metod çalıştığında computed post nesnesi anında güncellenecek
    postsStore.updatePostLocally(post.value.id, { 
      isLiked: res.liked, 
      _count: {
        likes: res.liked ? (post.value._count?.likes || 0) + 1 : Math.max(0, (post.value._count?.likes || 0) - 1)
      } 
    });
  } catch { toast.error("Hata!"); }
};

const handleRepost = async () => {
  if (!post.value || !authStore.isAuthenticated) return;
  try {
    const res = await postsStore.toggleRepost(post.value.id);
    // toggleRepost zaten store içinde updatePostLocally tetikliyor
  } catch { toast.error("Hata!"); }
};

const handleRefreshAI = async () => {
  if (!post.value) return;
  try {
    const res = await postsStore.refreshSentiment(post.value.id);
    postsStore.updatePostLocally(post.value.id, { sentiment: res.sentiment, sentimentScore: res.sentimentScore });
    toast.success("AI Yenilendi");
    showPostMenu.value = false;
  } catch { toast.error("Hata!"); }
};

const handleCopyLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  toast.success("Bağlantı kopyalandı! 🔗");
  showPostMenu.value = false;
};

const handleShare = () => { toast.info("Paylaşım yakında..."); };

// REPORT LOGIC
const showReportModal = ref(false);
const reportStep = ref(1);
const selectedReportCategory = ref("");
const reportTargetId = ref<number | null>(null);
const reportCategories: Record<string, string[]> = {
  "Şiddet veya Tehdit": ["Şiddet eğilimi", "Tehdit edici dil", "Zarar verme teşviki"],
  "Taciz ve Siber Zorbalık": ["Sürekli rahatsız etme", "Özel bilgi ifşası (Doxxing)", "Şantaj"],
  "Nefret Söylemi": ["Irkçı söylemler", "Ayrımcılık", "Dini/Cinsel yönelim saldırısı"],
  "Spam ve Yanıltıcı İçerik": ["Bot hesap", "Dolandırıcılık/Oltalama", "Yalan haber yayma"],
  "Cinsellik ve Çıplaklık": ["Uygunsuz profil fotoğrafı", "Cinsel içerik paylaşımı", "İzinsiz mahrem görüntü"],
  "Diğer": ["Sahte hesap (Taklit)", "Topluluk kurallarını ihlal", "Yasadışı madde satışı"]
};

const openReportModal = (id: number) => {
  reportTargetId.value = id;
  showReportModal.value = true;
  reportStep.value = 1;
  showPostMenu.value = false;
};

const selectReportCategory = (cat: string) => {
  selectedReportCategory.value = cat;
  reportStep.value = 2;
};

const submitReport = async (sub: string) => {
  try {
    await profileStore.reportUser({
      reportedPostId: reportTargetId.value || undefined,
      reason: selectedReportCategory.value,
      subReason: sub
    });
    toast.success("Bildiriminiz incelenmek üzere alındı.");
    showReportModal.value = false;
  } catch { toast.error("Hata oluştu."); }
};

// UTILS
const getBadgeComponent = (name: string) => {
  if (!name) return LucideIcons.HelpCircle;
  const pascal = name.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  return (LucideIcons as any)[pascal] || LucideIcons.HelpCircle;
};

const translateSentiment = (s: string) => {
  const t: any = { positive: "Neşeli", negative: "Kızgın", neutral: "Sakin", Sakin: "Sakin", Neşeli: "Neşeli", Kızgın: "Kızgın", Hüzünlü: "Hüzünlü" };
  return t[s] || s;
};

const getSentimentStyles = (sentiment: string) => {
  const styles: any = {
    Neşeli: { class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200" },
    Kızgın: { class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200" },
    Sakin: { class: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200" },
    positive: { class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200" },
    negative: { class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200" }
  };
  return styles[sentiment] || { class: "bg-gray-100 text-gray-600 border-gray-200" };
};

const formatDate = (date: string, full = false) => {
  if (!date) return "";
  const d = new Date(date);
  if (full) return d.toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return `${apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

// DELETE LOGIC
const deleteTarget = ref<number | null>(null);
const showDeleteConfirm = ref(false);
const isDeleting = ref(false);
const openDeletePost = (id: number) => { 
  deleteTarget.value = id; 
  showDeleteConfirm.value = true; 
  showPostMenu.value = false;
};
const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await postsStore.deletePost(deleteTarget.value);
    toast.success("Silindi.");
    if (deleteTarget.value === post.value?.id) router.back();
    // Reaktivite sayesinde store guncellendiginde liste de otomatik guncellenecek.
    showDeleteConfirm.value = false;
  } catch { toast.error("Hata!"); }
  finally { isDeleting.value = false; }
};

const focusCommentInput = () => commentInput.value?.focus();

const resizeTextarea = () => {
  if (commentInput.value) {
    commentInput.value.style.height = 'auto';
    commentInput.value.style.height = `${commentInput.value.scrollHeight}px`;
  }
};

onMounted(fetchThread);
watch(() => route.params.id, fetchThread);
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.scale-fade-enter-active, .scale-fade-leave-active { transition: all 0.3s ease; }
.scale-fade-enter-from, .scale-fade-leave-to { opacity: 0; transform: scale(0.8); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
