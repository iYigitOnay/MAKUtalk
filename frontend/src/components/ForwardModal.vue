<!-- src/components/ForwardModal.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[999] flex items-end md:items-center justify-center p-0 md:p-4"
      @click.stop
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        @click="close"
      ></div>

      <!-- Modal Content -->
      <div
        class="relative w-full max-w-lg bg-white dark:bg-[#0b0f19] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl border-t md:border border-slate-200 dark:border-white/5 flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
        @click.stop
      >
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Mesajı İlet</h3>
            <p class="text-xs text-slate-500 font-medium mt-1">Bu mesajı kime göndermek istersiniz?</p>
          </div>
          <button
            @click="close"
            class="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="p-4 border-b border-slate-100 dark:border-white/5">
          <div class="relative group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Kişilerde ara..."
              class="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-3 px-11 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-slate-900 dark:text-white shadow-inner"
            />
            <svg
              class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Conversations List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-h-[300px]">
          <div v-if="filteredConversations.length === 0" class="py-12 text-center opacity-40">
            <p class="text-sm font-bold text-slate-500">Kişi bulunamadı.</p>
          </div>

          <div
            v-for="conv in filteredConversations"
            :key="conv.id"
            class="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm border border-slate-200 dark:border-white/5">
                <img v-if="conv.otherParticipant?.avatarUrl" :src="getImageUrl(conv.otherParticipant.avatarUrl)" class="w-full h-full object-cover" />
                <span v-else class="text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase">{{ conv.otherParticipant?.username?.charAt(0) }}</span>
              </div>
              <div class="text-left">
                <p class="text-sm font-bold text-slate-900 dark:text-white">{{ conv.otherParticipant?.fullName || conv.otherParticipant?.username }}</p>
                <p class="text-[10px] text-slate-500 font-medium">@{{ conv.otherParticipant?.username }}</p>
              </div>
            </div>

            <button
              @click="forwardTo(conv)"
              :disabled="sendingTo === conv.id || sentTo.includes(conv.id)"
              class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
              :class="sentTo.includes(conv.id) 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' 
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'"
            >
              <template v-if="sentTo.includes(conv.id)">GÖNDERİLDİ</template>
              <template v-else-if="sendingTo === conv.id">GÖNDERİLİYOR...</template>
              <template v-else>GÖNDER</template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useChatStore } from "@/stores/chat";
import { useSocket } from "@/composables/useSocket";
import { useToast } from "vue-toastification";

const props = defineProps<{
  isOpen: boolean;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
}>();

const emit = defineEmits(["close"]);

const chatStore = useChatStore();
const { sendMessage, isConnected } = useSocket();
const toast = useToast();

const searchQuery = ref("");
const sendingTo = ref<string | null>(null);
const sentTo = ref<string[]>([]);

const close = () => {
  sentTo.value = [];
  emit("close");
};

const getImageUrl = (path: string | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const filteredConversations = computed(() => {
  return chatStore.conversations.filter(conv => {
    const name = (conv.otherParticipant?.fullName || conv.otherParticipant?.username || '').toLowerCase();
    return name.includes(searchQuery.value.toLowerCase());
  });
});

const forwardTo = async (conv: any) => {
  if (sendingTo.value || sentTo.value.includes(conv.id)) return;

  if (!isConnected.value) {
    toast.error("Bağlantı hatası.");
    return;
  }

  sendingTo.value = conv.id;
  try {
    // Mesaj zaten şifreli geliyor (decrypt edilmemiş hali verilmeli veya burada tekrar şifrelenmeli)
    // Messages.vue'dan bize content olarak decrypt edilmemiş hali geçilmeli.
    
    sendMessage(
      conv.id,
      props.content, // Şifreli içerik
      conv.otherParticipant.id,
      undefined,
      true, // isForwarded
      props.mediaUrl,
      props.mediaType
    );

    sentTo.value.push(conv.id);
    toast.success("İletildi! 🚀");
  } catch (err) {
    toast.error("Hata oluştu.");
  } finally {
    sendingTo.value = null;
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.1); border-radius: 10px; }
</style>
