<!-- src/components/CommentsModal.vue -->
<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md"
        @click.self="closeMainModal"
      >
        <div
          class="bg-white dark:bg-gray-950 w-full max-w-2xl sm:rounded-[2.5rem] shadow-2xl flex flex-col border-t sm:border border-gray-100 dark:border-white/5 max-h-[90vh] sm:max-h-[80vh] overflow-hidden animate-slide-up relative"
        >
          <!-- MODERATION OVERLAYS -->
          <!-- 1. CUSTOM DELETE CONFIRMATION -->
          <transition name="fade">
            <div
              v-if="showDeleteConfirm"
              class="absolute inset-0 z-[110] bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl flex items-center justify-center p-8"
            >
              <div
                class="text-center max-w-xs animate-in zoom-in-95 duration-200"
              >
                <div
                  class="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg
                    class="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <h3
                  class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter"
                >
                  Yorumu Sil?
                </h3>
                <p class="text-gray-500 text-sm mt-2 mb-8">
                  Bu işlem geri alınamaz. Yorum tamamen kaldırılacaktır.
                </p>
                <div class="flex flex-col gap-3">
                  <button
                    @click="confirmDelete"
                    class="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                  >
                    SİL
                  </button>
                  <button
                    @click="showDeleteConfirm = false"
                    class="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                  >
                    VAZGEÇ
                  </button>
                </div>
              </div>
            </div>
          </transition>

          <!-- 2. CATEGORIZED REPORT MODAL -->
          <transition name="fade">
            <div
              v-if="showReportModal"
              class="absolute inset-0 z-[110] bg-white/80 dark:bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div
                class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
              >
                <div
                  class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5"
                >
                  <button
                    v-if="reportStep === 2"
                    @click="reportStep = 1"
                    class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div v-else class="w-9"></div>
                  <h3
                    class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter"
                  >
                    Şikayet Bildirimi
                  </h3>
                  <button
                    @click="closeReport"
                    class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  class="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar max-h-[60vh]"
                >
                  <div v-if="reportStep === 1">
                    <button
                      v-for="(cat, name) in reportCategories"
                      :key="name"
                      @click="selectReportCategory(name as string)"
                      class="w-full text-left p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all flex items-center justify-between group"
                    >
                      <span
                        class="text-sm font-bold text-gray-700 dark:text-gray-300"
                        >{{ name }}</span
                      >
                      <svg
                        class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="space-y-1.5">
                    <div
                      class="px-4 py-2 text-[10px] font-black text-blue-500 uppercase tracking-widest"
                    >
                      {{ selectedCategory }}
                    </div>
                    <button
                      v-for="sub in reportCategories[selectedCategory]"
                      :key="sub"
                      @click="submitReport(sub)"
                      class="w-full text-left p-3.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all"
                    >
                      <span
                        class="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600"
                        >{{ sub }}</span
                      >
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- MAIN MODAL CONTENT -->
          <div
            class="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-3 mb-1 sm:hidden"
          ></div>

          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 sm:p-8 border-b border-gray-100 dark:border-white/5"
          >
            <div>
              <h2
                class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic"
              >
                Yorumlar
              </h2>
              <p
                class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5"
              >
                {{ commentsStore.comments.length }} Geri Bildirim
              </p>
            </div>
            <button
              @click="$emit('close')"
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90 text-gray-400"
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

          <!-- Comments List -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 no-scrollbar">
            <div
              v-if="commentsStore.loading && !commentsStore.comments.length"
              class="py-20 text-center"
            >
              <div
                class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
              ></div>
            </div>
            <div
              v-else-if="!commentsStore.comments.length"
              class="py-20 text-center opacity-40 italic font-bold text-gray-500 uppercase text-xs tracking-widest"
            >
              Henüz yorum yapılmamış. İlk yorumu sen yap!
            </div>

            <div
              v-for="comment in commentsStore.comments"
              :key="comment.id"
              class="flex gap-4 group animate-fade-in"
            >
              <router-link
                v-if="comment.author"
                :to="`/profile/${comment.author.username}`"
                @click="$emit('close')"
                class="flex-shrink-0"
              >
                <div
                  class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-black text-blue-600 uppercase shadow-inner overflow-hidden border border-gray-100 dark:border-white/5"
                >
                  <img
                    v-if="comment.author.avatarUrl"
                    :src="getImageUrl(comment.author.avatarUrl)"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ comment.author.username?.charAt(0) }}</span>
                </div>
              </router-link>

              <div v-if="comment.author" class="flex-1 min-w-0">
                <div
                  class="bg-slate-50 dark:bg-gray-900/50 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5 relative"
                >
                  <div class="flex items-center justify-between mb-1 gap-2">
                    <router-link
                      :to="`/profile/${comment.author.username}`"
                      @click="$emit('close')"
                      class="font-black text-xs text-gray-900 dark:text-white hover:underline truncate"
                      >@{{ comment.author.username }}</router-link
                    >

                    <div class="flex items-center gap-2">
                      <span
                        class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter"
                        >{{ formatDate(comment.createdAt) }}</span
                      >

                      <!-- ACTIONS -->
                      <button
                        v-if="authStore.user?.id === comment.userId || isAdmin"
                        @click="openDelete(comment.id)"
                        class="text-gray-400 hover:text-red-500 transition-colors"
                        :title="isAdmin ? 'Yönetici Olarak Sil' : 'Yorumu Sil'"
                      >
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>

                      <button
                        v-if="authStore.user?.id !== comment.userId"
                        @click="openReport(comment.id)"
                        class="text-gray-400 hover:text-orange-500 transition-colors"
                        title="Rapor Et"
                      >
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p
                    class="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed break-words"
                  >
                    <HashtagText :text="comment.content" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div
            v-if="authStore.isAuthenticated"
            class="p-4 sm:p-8 bg-slate-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-white/5"
          >
            <!-- DYNAMIC MENTION TOOLTIP (CURSOR TRACKING) -->
            <div
              v-if="showMentions"
              :style="{ bottom: '50px', left: mentionPos.x + 'px' }"
              class="absolute z-[60] w-60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
            >
              <div class="max-h-48 overflow-y-auto no-scrollbar">
                <button
                  v-for="user in mentionUsers"
                  :key="user.id"
                  @click="selectMention(user.username)"
                  class="w-full flex items-center gap-3 p-2.5 hover:bg-blue-600 hover:text-white transition-colors group text-left"
                >
                  <img
                    v-if="user.avatarUrl"
                    :src="getImageUrl(user.avatarUrl)"
                    class="w-7 h-7 rounded-full object-cover border border-white/20"
                  />
                  <div
                    v-else
                    class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-[10px] font-black group-hover:bg-white group-hover:text-blue-600 transition-colors"
                  >
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-xs font-bold truncate">{{
                      user.fullName || user.username
                    }}</span>
                    <span class="text-[10px] opacity-70 truncate"
                      >@{{ user.username }}</span
                    >
                  </div>
                </button>
              </div>
            </div>

            <form
              @submit.prevent="handleSubmit"
              class="flex items-center gap-3"
            >
              <input
                v-model="newComment"
                @input="handleInput"
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
                <div
                  v-else
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useCommentsStore } from "@/stores/comments";
import { usePostsStore } from "@/stores/posts";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import HashtagText from "./HashtagText.vue";

interface Props {
  isOpen: boolean;
  postId: number | null;
}
const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const authStore = useAuthStore();
const commentsStore = useCommentsStore();
const postsStore = usePostsStore();
const toast = useToast();
const newComment = ref("");

// MENTION STATES
const mentionUsers = ref<any[]>([]);
const showMentions = ref(false);
const mentionPos = ref({ x: 0, y: 0 });

const getCursorXY = (el: HTMLInputElement, cursorIndex: number) => {
  const style = window.getComputedStyle(el);
  const mirror = document.createElement("div");
  const copyStyle = [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "padding",
    "boxSizing",
  ];
  copyStyle.forEach((prop) => {
    (mirror.style as any)[prop] = (style as any)[prop];
  });
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre";
  mirror.textContent = el.value.substring(0, cursorIndex);
  document.body.appendChild(mirror);
  const x = mirror.clientWidth;
  document.body.removeChild(mirror);
  return { x: Math.min(x + 20, el.clientWidth - 200), y: 0 };
};

const handleInput = async (e: any) => {
  const val = e.target.value;
  const cursor = e.target.selectionStart;
  const lastWord = val.substring(0, cursor).split(/\s/).pop();

  if (lastWord && lastWord.startsWith("@")) {
    const q = lastWord.substring(1);
    mentionPos.value = getCursorXY(e.target, cursor - q.length - 1);
    if (q.length >= 2) {
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
  } else {
    showMentions.value = false;
  }
};

const selectMention = (username: string) => {
  const val = newComment.value;
  const cursor =
    (
      document.querySelector(
        'input[placeholder="Sen ne düşünüyorsun?"]',
      ) as HTMLInputElement
    )?.selectionStart || val.length;
  const beforeCursor = val.substring(0, cursor);
  const afterCursor = val.substring(cursor);
  const lastAt = beforeCursor.lastIndexOf("@");

  newComment.value =
    beforeCursor.substring(0, lastAt) + `@${username} ` + afterCursor;
  showMentions.value = false;
};

// MODERATION STATES
const isAdmin = computed(
  () =>
    authStore.user?.role === "ADMIN" ||
    authStore.user?.email === "2312101063@ogr.mehmetakif.edu.tr",
);
const showDeleteConfirm = ref(false);
const commentToDelete = ref<number | null>(null);

const showReportModal = ref(false);
const reportStep = ref(1);
const selectedCategory = ref("");
const commentToReport = ref<number | null>(null);

const reportCategories: Record<string, string[]> = {
  Nefret: [
    "Hakaretler",
    "Irkçı veya cinsiyetçi klişeler",
    "İnsanlıktan çıkarma",
    "Korku veya ayrımcılığa teşvik",
  ],
  "Taciz ve Rahatsızlık": [
    "Hakaret",
    "İstenmeyen Cinsel İçerik",
    "Hedefli Taciz",
  ],
  "Şiddet içeren konuşma": [
    "Şiddet Tehditleri",
    "Zarar Verme İsteği",
    "Şiddeti Yüceltme",
  ],
  Mahremiyet: [
    "Özel bilgileri paylaşmak",
    "Rızam olmadan özel görüntü paylaşımı",
  ],
  "Yasadışı Davranışlar": [
    "İnsan sömürüsü",
    "Cinsel şiddet",
    "Yasadışı ürün satışı",
  ],
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.postId) commentsStore.fetchComments(props.postId);
  },
);

const handleSubmit = async () => {
  if (!props.postId || !newComment.value.trim()) return;
  try {
    const res = await commentsStore.createComment(props.postId, newComment.value);
    
    // Anlık sayaç güncelleme (Store üzerinden)
    const currentPost = postsStore.posts.find(p => p.id === props.postId) || 
                        postsStore.myPosts.find(p => p.id === props.postId);
    
    if (currentPost) {
      const newCount = (currentPost._count?.comments || 0) + 1;
      postsStore.updatePostLocally(props.postId, {
        _count: { ...currentPost._count, comments: newCount }
      });
    }

    newComment.value = "";
    toast.success("Yorumun eklendi! 💬");
  } catch (error: any) {
    toast.error(error.message || "Yorum eklenemedi.");
  }
};

// DELETE ACTIONS
const openDelete = (id: number) => {
  commentToDelete.value = id;
  showDeleteConfirm.value = true;
};
const confirmDelete = async () => {
  if (!commentToDelete.value || !props.postId) return;
  try {
    await commentsStore.deleteComment(commentToDelete.value);
    
    // Anlık sayaç güncelleme (Store üzerinden)
    const currentPost = postsStore.posts.find(p => p.id === props.postId) || 
                        postsStore.myPosts.find(p => p.id === props.postId);
    
    if (currentPost) {
      const newCount = Math.max(0, (currentPost._count?.comments || 0) - 1);
      postsStore.updatePostLocally(props.postId, {
        _count: { ...currentPost._count, comments: newCount }
      });
    }

    toast.success("Yorum silindi.");
  } catch {
    toast.error("Silme işlemi başarısız.");
  } finally {
    showDeleteConfirm.value = false;
    commentToDelete.value = null;
  }
};

// REPORT ACTIONS
const openReport = (id: number) => {
  commentToReport.value = id;
  showReportModal.value = true;
  reportStep.value = 1;
};
const selectReportCategory = (name: string) => {
  selectedCategory.value = name;
  reportStep.value = 2;
};
const submitReport = async (subReason: string) => {
  try {
    await apiClient.post("/users/report", {
      reportedCommentId: commentToReport.value,
      reason: selectedCategory.value,
      subReason,
    });
    toast.warning("Yorum şikayet edildi. İncelenecektir.");
  } catch {
    toast.error("Şikayet iletilemedi.");
  } finally {
    closeReport();
  }
};
const closeReport = () => {
  showReportModal.value = false;
  commentToReport.value = null;
  reportStep.value = 1;
};

const closeMainModal = () => {
  if (!showDeleteConfirm.value && !showReportModal.value) emit("close");
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
  const diff = Math.floor((new Date().getTime() - d.getTime()) / 60000);
  if (diff < 1) return "Az önce";
  if (diff < 60) return `${diff}d`;
  if (diff < 1440) return `${Math.floor(diff / 60)}s`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
