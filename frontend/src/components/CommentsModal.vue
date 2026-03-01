<!-- src/components/CommentsModal.vue -->
<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md" @click.self="$emit('close')">
        <div class="bg-white dark:bg-gray-950 w-full max-w-2xl sm:rounded-[2.5rem] shadow-2xl flex flex-col border-t sm:border border-gray-100 dark:border-white/5 max-h-[90vh] sm:max-h-[80vh] overflow-hidden animate-slide-up">
          
          <!-- Indicator for mobile -->
          <div class="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 sm:p-8 border-b border-gray-100 dark:border-white/5">
            <div>
              <h2 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Yorumlar</h2>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{{ commentsStore.comments.length }} Geri Bildirim</p>
            </div>
            <button @click="$emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90 text-gray-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Comments List -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 no-scrollbar">
            <div v-if="commentsStore.loading && !commentsStore.comments.length" class="py-20 text-center">
              <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>

            <div v-else-if="!commentsStore.comments.length" class="py-20 text-center opacity-40 italic font-bold text-gray-500 uppercase text-xs tracking-widest">
              Henüz yorum yapılmamış. İlk yorumu sen yap! ✨
            </div>

            <div v-for="comment in commentsStore.comments" :key="comment.id" class="flex gap-4 group animate-fade-in">
              <!-- Author Avatar -->
              <router-link v-if="comment.author" :to="`/profile/${comment.author.username}`" @click="$emit('close')" class="flex-shrink-0">
                <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-black text-blue-600 uppercase shadow-inner overflow-hidden border border-gray-100 dark:border-white/5">
                  <img v-if="comment.author.avatarUrl" :src="getImageUrl(comment.author.avatarUrl)" class="w-full h-full object-cover" />
                  <span v-else>{{ comment.author.username?.charAt(0) }}</span>
                </div>
              </router-link>

              <!-- Comment Body -->
              <div v-if="comment.author" class="flex-1 min-w-0">
                <div class="bg-slate-50 dark:bg-gray-900/50 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5 relative">
                  <div class="flex items-center justify-between mb-1 gap-2">
                    <router-link :to="`/profile/${comment.author.username}`" @click="$emit('close')" class="font-black text-xs text-gray-900 dark:text-white hover:underline truncate">@{{ comment.author.username }}</router-link>
                    <div class="flex items-center gap-2">
                      <span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{{ formatDate(comment.createdAt) }}</span>
                      <button v-if="authStore.user?.id === comment.userId" @click="handleDeleteComment(comment.id)" class="text-gray-400 hover:text-red-500 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  <p class="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed break-words">{{ comment.content }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Comment Input -->
          <div v-if="authStore.isAuthenticated" class="p-4 sm:p-8 bg-slate-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-white/5">
            <form @submit.prevent="handleSubmit" class="flex items-center gap-3">
              <div class="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hidden sm:block">
                <img v-if="authStore.user?.avatarUrl" :src="getImageUrl(authStore.user.avatarUrl)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center bg-blue-600 text-white font-black uppercase text-xs">{{ authStore.user?.username?.charAt(0) }}</div>
              </div>
              <input
                v-model="newComment"
                type="text"
                placeholder="Sen ne düşünüyorsun?"
                class="flex-1 h-12 px-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-2xl border border-gray-200 dark:border-white/5 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                :disabled="commentsStore.loading"
              />
              <button
                type="submit"
                :disabled="!newComment.trim() || commentsStore.loading"
                class="h-12 px-6 bg-blue-600 text-white text-xs font-black rounded-2xl uppercase hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <span v-if="!commentsStore.loading">Gönder</span>
                <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useCommentsStore } from "@/stores/comments";
import { useToast } from "vue-toastification";

interface Props {
  isOpen: boolean;
  postId: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const authStore = useAuthStore();
const commentsStore = useCommentsStore();
const toast = useToast();

const newComment = ref("");

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.postId) {
      commentsStore.fetchComments(props.postId);
    }
  },
);

const handleSubmit = async () => {
  if (!props.postId || !newComment.value.trim()) return;

  try {
    await commentsStore.createComment(props.postId, newComment.value);
    newComment.value = "";
    toast.success("Yorumun eklendi! 💬");
  } catch (error: any) {
    const message = error.message || "Yorum eklenemedi.";
    toast.error(message);
  }
};

const handleDeleteComment = async (commentId: number) => {
  if (!confirm("Bu yorumu silmek istediğinden emin misin?")) return;

  try {
    await commentsStore.deleteComment(commentId);
    toast.success("Yorum silindi.");
  } catch (error: any) {
    toast.error("Silme işlemi başarısız.");
  }
};

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return "Az önce";
  if (diff < 60) return `${diff}d`;
  if (diff < 1440) return `${Math.floor(diff/60)}s`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
