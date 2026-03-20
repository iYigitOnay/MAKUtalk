<!-- src/components/CommentsModal.vue -->
<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md"
        @click.self="emit('close')"
      >
        <div
          class="bg-white dark:bg-gray-950 w-full max-w-2xl sm:rounded-[2.5rem] shadow-2xl flex flex-col border-t sm:border border-gray-100 dark:border-white/5 max-h-[90vh] sm:max-h-[80vh] overflow-hidden animate-slide-up relative"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 sm:p-8 border-b border-gray-100 dark:border-white/5">
            <div>
              <h2 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Yanıtlar</h2>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                {{ replies.length }} Etkileşim
              </p>
            </div>
            <button @click="emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90 text-gray-400">
              <component :is="getIcon('x')" class="w-6 h-6" />
            </button>
          </div>

          <!-- Thread List -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
            <div v-if="loading" class="py-20 text-center">
              <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            
            <div v-else-if="!replies.length" class="py-20 text-center opacity-40 italic font-bold text-gray-500 uppercase text-xs tracking-widest">
              Henüz yanıt verilmemiş. İlk yanıtı sen gönder!
            </div>

            <!-- Kullanılan PostCard bileşeni ile her yanıt bir post görünümünde -->
            <div v-else class="space-y-2">
               <PostCard 
                 v-for="reply in replies" 
                 :key="reply.id" 
                 :post="reply" 
                 @delete="handleDeleteReply"
               />
            </div>
          </div>

          <!-- Input Area -->
          <div v-if="authStore.isAuthenticated" class="p-4 sm:p-6 bg-slate-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-white/5">
            <div class="flex gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex-shrink-0 overflow-hidden border border-gray-100 dark:border-white/5">
                <img v-if="authStore.user?.avatarUrl" :src="getImageUrl(authStore.user.avatarUrl)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center font-black text-blue-600 uppercase">{{ authStore.user?.username?.charAt(0) }}</div>
              </div>
              <div class="flex-1 relative">
                <textarea 
                  v-model="replyContent" 
                  rows="2" 
                  maxlength="750"
                  placeholder="Yanıtını gönder..." 
                  class="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all dark:text-white"
                ></textarea>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                    {{ replyContent.length }} / 750
                  </span>
                  <button 
                    @click="submitReply" 
                    :disabled="!replyContent.trim() || sending || replyContent.length > 750" 
                    class="px-6 py-2 bg-blue-600 text-white text-xs font-black rounded-xl uppercase hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                  >
                    <span v-if="!sending">Yanıtla</span>
                    <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useToast } from "vue-toastification";
import PostCard from "./PostCard.vue";
import type { Post } from "@/types";
import * as LucideIcons from "lucide-vue-next";

const props = defineProps<{
  isOpen: boolean;
  postId: number | null;
}>();

const emit = defineEmits<{ close: [] }>();

const authStore = useAuthStore();
const postsStore = usePostsStore();
const toast = useToast();

const replies = ref<Post[]>([]);
const loading = ref(false);
const sending = ref(false);
const replyContent = ref("");

const fetchReplies = async () => {
  if (!props.postId) return;
  loading.value = true;
  try {
    const thread = await postsStore.fetchThread(props.postId, authStore.user?.id);
    replies.value = thread.replies;
  } catch (error) {
    console.error("Fetch replies error:", error);
  } finally {
    loading.value = false;
  }
};

watch(() => props.isOpen, (val) => {
  if (val && props.postId) {
    fetchReplies();
  } else {
    replies.value = [];
  }
});

const submitReply = async () => {
  if (!props.postId || !replyContent.value.trim() || sending.value) return;
  sending.value = true;
  try {
    const newReply = await postsStore.createPost(
      replyContent.value,
      true, // published
      undefined, // categoryId
      undefined, // image
      props.postId // parentId (TWITTER MANTIĞI)
    );
    
    replies.value.unshift(newReply);
    replyContent.value = "";
    
    // Küresel sayaç güncellemesi
    postsStore.updatePostLocally(props.postId, {
      _count: { 
        replies: (replies.value.length) 
      }
    });
    
    toast.success("Yanıtın gönderildi! ✨");
  } catch (error) {
    toast.error("Yanıt gönderilemedi.");
  } finally {
    sending.value = false;
  }
};

const handleDeleteReply = async (replyId: number) => {
  if (!confirm("Bu yanıtı silmek istediğinizden emin misiniz?")) return;
  try {
    // GERÇEK SİLME EMRE (Veritabanı + Global Store)
    await postsStore.deletePost(replyId);
    
    // Modaldaki yerel listeyi güncelle
    replies.value = replies.value.filter(r => r.id !== replyId);
    
    toast.success("Yanıt silindi.");
  } catch (error) {
    toast.error("Silme işlemi başarısız.");
  }
};

const getIcon = (name: string) => {
  if (name === 'x') return LucideIcons.X;
  return LucideIcons.HelpCircle;
};

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
