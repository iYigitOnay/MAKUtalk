<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[999] flex items-end md:items-center justify-center p-0 md:p-4"
      @click.stop
    >
      <!-- Backdrop (Twitter Style Blur) -->
      <div
        class="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity"
        @click="close"
      ></div>

      <!-- Modal Content -->
      <div
        class="bg-white dark:bg-[#0f172a] w-full md:max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 overflow-hidden border border-white/10"
        @click.stop
      >
        <!-- Header -->
        <div class="p-6 pb-0 flex items-center justify-between">
          <h3
            class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic"
          >
            Paylaş
          </h3>
          <button
            @click="close"
            class="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- ÜST AKSİYONLAR -->
        <div class="p-6 grid grid-cols-2 gap-4">
          <button
            @click="copyLink"
            class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 hover:bg-indigo-500/10 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all group"
          >
            <div
              class="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span
              class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest"
              >Kopyala</span
            >
          </button>

          <button
            @click="shareExternal"
            class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 hover:bg-emerald-500/10 rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all group"
          >
            <div
              class="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <span
              class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest"
              >Dışarıda</span
            >
          </button>
        </div>

        <!-- ARA & LİSTELE -->
        <div class="px-6 pb-8 space-y-4">
          <!-- MESAJ EKLEME ALANI -->
          <div class="relative group">
            <textarea
              v-model="shareComment"
              placeholder="Bir mesaj ekle... (Opsiyonel)"
              rows="2"
              class="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-slate-900 dark:text-white resize-none shadow-inner"
            ></textarea>
          </div>

          <div class="h-[1px] bg-slate-100 dark:bg-white/5 mx-2"></div>

          <div class="relative group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Arkadaşlarını ara..."
              class="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-12 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-slate-900 dark:text-white"
            />
            <svg
              class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Sohbet Listesi -->
          <div
            class="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2"
          >
            <div
              v-for="conv in filteredConversations"
              :key="conv.id"
              class="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-slate-100 dark:hover:border-white/5"
            >
              <div class="flex items-center gap-3">
                <div class="relative">
                  <img
                    v-if="conv.otherParticipant?.avatarUrl"
                    :src="getImageUrl(conv.otherParticipant.avatarUrl)"
                    class="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-white/5"
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white"
                  >
                    {{
                      conv.otherParticipant?.username?.charAt(0).toUpperCase()
                    }}
                  </div>
                </div>
                <div class="text-left min-w-0">
                  <p
                    class="text-sm font-bold text-slate-900 dark:text-white truncate"
                  >
                    @{{ conv.otherParticipant?.username }}
                  </p>
                  <p
                    class="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate"
                  >
                    {{ conv.otherParticipant?.fullName || "Öğrenci" }}
                  </p>
                </div>
              </div>

              <button
                @click="sendToConversation(conv)"
                :disabled="sendingTo === conv.id || sentTo.includes(conv.id)"
                class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-100 disabled:scale-100"
                :class="
                  sentTo.includes(conv.id)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/20'
                "
              >
                <span
                  v-if="sentTo.includes(conv.id)"
                  class="flex items-center gap-1"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Gitti
                </span>
                <span v-else>{{
                  sendingTo === conv.id ? "..." : "Gönder"
                }}</span>
              </button>
            </div>

            <!-- Boş Durum -->
            <div
              v-if="filteredConversations.length === 0 && !chatStore.loading"
              class="py-12 text-center opacity-40 italic text-sm"
            >
              Arkadaş bulunamadı.
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useChatStore } from "@/stores/chat";
import { useSocket } from "@/composables/useSocket";
import { useToast } from "vue-toastification";
import CryptoJS from "crypto-js";

const props = defineProps<{
  isOpen: boolean;
  post: any;
}>();

const emit = defineEmits(["close"]);

const chatStore = useChatStore();
const { sendMessage } = useSocket();
const toast = useToast();

const searchQuery = ref("");
const shareComment = ref("");
const sendingTo = ref<number | null>(null);
const sentTo = ref<number[]>([]);
const secretKey =
  "fcb49253e8a693454e8d2309c1cdbdff5ccc1405ffbb5c48e93820d03f9628dc08b8e68b15c35f2186b6202008aac2f4417f025788fbc36772c2a0cfa7570cac";

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return chatStore.conversations
      .filter((conv) => conv.isAccepted)
      .slice(0, 15);
  }

  const query = searchQuery.value.toLowerCase().trim();

  return chatStore.conversations
    .filter((conv) => {
      if (!conv.isAccepted || !conv.otherParticipant) return false;

      const username = (conv.otherParticipant.username || "").toLowerCase();
      const fullName = (conv.otherParticipant.fullName || "").toLowerCase();

      return username.includes(query) || fullName.includes(query);
    })
    .slice(0, 15);
});

const close = () => {
  emit("close");
  searchQuery.value = "";
  shareComment.value = "";
  sentTo.value = [];
};

const getImageUrl = (path: string | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const copyLink = async () => {
  const link = `${window.location.origin}/post/${props.post.id}`;
  try {
    await navigator.clipboard.writeText(link);
    toast.success("Bağlantı kopyalandı! 🔗");
  } catch {
    toast.error("Hata!");
  }
};

const shareExternal = async () => {
  const shareData = {
    title: "MAKUtalk Gönderisi",
    text: props.post.content?.substring(0, 100),
    url: `${window.location.origin}/post/${props.post.id}`,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      copyLink();
    }
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      toast.error("Paylaşılamadı.");
    }
  }
};

const sendToConversation = (conv: any) => {
  if (sendingTo.value || sentTo.value.includes(conv.id)) return;

  sendingTo.value = conv.id;

  try {
    const text = shareComment.value.trim();
    const encryptedContent = CryptoJS.AES.encrypt(text, secretKey).toString();

    // socket.emit('send_message', { conversationId, content, receiverId, postId })
    sendMessage(
      conv.id,
      encryptedContent,
      conv.otherParticipant.id,
      props.post.id,
    );

    sentTo.value.push(conv.id);
  } catch (err) {
    toast.error("Gönderilemedi.");
  } finally {
    sendingTo.value = null;
  }
};

onMounted(async () => {
  if (chatStore.conversations.length === 0) {
    await chatStore.fetchConversations();
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.1);
  border-radius: 10px;
}
</style>
