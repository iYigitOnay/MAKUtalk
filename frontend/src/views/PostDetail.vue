<!-- src/views/PostDetail.vue -->
<template>
  <div>
    <!-- Üst Bar -->
    <div
      class="sticky top-0 z-30 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4"
    >
      <button
        @click="$router.back()"
        class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400"
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
      <h1 class="font-bold text-[17px] text-gray-900 dark:text-white">
        Paylaşım
      </h1>
    </div>

    <!-- Yükleniyor -->
    <div v-if="loading" class="flex justify-center py-20">
      <div
        class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
      />
    </div>

    <!-- Bulunamadı -->
    <div v-else-if="!post" class="text-center py-20 px-8">
      <div class="text-4xl mb-3">🔍</div>
      <h3 class="font-bold text-gray-900 dark:text-white mb-1">
        Paylaşım bulunamadı
      </h3>
      <p class="text-sm text-gray-400">Silinmiş veya gizlenmiş olabilir.</p>
    </div>

    <template v-else>
      <!-- POST DETAYI -->
      <div class="px-4 py-5 border-b border-gray-100 dark:border-gray-800">
        <!-- Yazar Profil Kartı -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <router-link :to="`/profile/${post.author?.username}`">
              <div
                class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0"
              >
                <img
                  v-if="post.author?.avatarUrl"
                  :src="post.author.avatarUrl"
                  :alt="post.author.username"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-white font-bold">
                  {{ post.author?.username?.charAt(0).toUpperCase() }}
                </span>
              </div>
            </router-link>
            <div>
              <router-link
                :to="`/profile/${post.author?.username}`"
                class="hover:underline"
              >
                <p class="font-bold text-gray-900 dark:text-white text-[15px]">
                  {{ post.author?.fullName || post.author?.username }}
                </p>
              </router-link>
              <p class="text-gray-400 text-sm">@{{ post.author?.username }}</p>
            </div>
          </div>

          <!-- Takip Et butonu (kendi profilin değilse) -->
          <button
            v-if="
              authStore.isAuthenticated &&
              authStore.user?.id !== post.author?.id
            "
            @click="handleFollow"
            class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
            :class="
              isFollowing
                ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-400 hover:text-red-500'
                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80'
            "
          >
            {{ isFollowing ? "Takip Ediliyor" : "Takip Et" }}
          </button>
        </div>

        <!-- Kategori -->
        <div v-if="post.category" class="mb-3">
          <span
            class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium text-white"
            :style="{ backgroundColor: post.category.color || '#3b82f6' }"
          >
            {{ post.category.name }}
          </span>
        </div>

        <!-- İçerik -->
        <p
          class="text-[17px] text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap break-words mb-4"
        >
          <HashtagText :text="post.content" />
        </p>

        <!-- Duygu Analizi -->
        <div v-if="post.sentiment" class="mb-4">
          <span
            class="text-xs px-2.5 py-1 rounded-full font-medium"
            :class="sentimentClass(post.sentiment)"
          >
            {{ sentimentLabel(post.sentiment) }}
          </span>
        </div>

        <!-- Tarih -->
        <p class="text-sm text-gray-400 mb-4">
          {{ formatFullDate(post.createdAt) }}
        </p>

        <!-- İstatistikler -->
        <div
          class="flex items-center gap-5 py-3 border-t border-gray-100 dark:border-gray-800 text-sm"
        >
          <span class="text-gray-900 dark:text-white">
            <strong>{{ post._count?.likes || 0 }}</strong>
            <span class="text-gray-400 ml-1">Beğeni</span>
          </span>
          <span class="text-gray-900 dark:text-white">
            <strong>{{ post._count?.comments || 0 }}</strong>
            <span class="text-gray-400 ml-1">Yorum</span>
          </span>
        </div>

        <!-- Aksiyon Bar -->
        <div
          class="flex items-center gap-2 py-2 border-t border-gray-100 dark:border-gray-800"
          @click.stop
        >
          <!-- Beğen -->
          <button
            v-if="authStore.isAuthenticated"
            @click="handleLike"
            :disabled="likeLoading"
            class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all group"
            :class="
              post.isLiked
                ? 'text-red-500 bg-red-50 dark:bg-red-500/10'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
            "
          >
            <svg
              class="w-5 h-5"
              :fill="post.isLiked ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span class="text-sm font-medium">{{
              post.isLiked ? "Beğenildi" : "Beğen"
            }}</span>
          </button>

          <!-- Yorum yap (sayfada aşağı scroll) -->
          <button
            @click="focusCommentInput"
            class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span class="text-sm font-medium">Yorum Yap</span>
          </button>
        </div>
      </div>

      <!-- YORUM YAZMA ALANI -->
      <div
        v-if="authStore.isAuthenticated"
        class="px-4 py-4 border-b border-gray-100 dark:border-gray-800"
      >
        <div class="flex gap-3">
          <div
            class="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden"
          >
            <img
              v-if="authStore.user?.avatarUrl"
              :src="authStore.user.avatarUrl"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-white font-bold text-xs">
              {{ authStore.user?.username?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="flex-1">
            <textarea
              ref="commentInput"
              v-model="newComment"
              rows="2"
              placeholder="Yorumunu yaz..."
              class="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-[15px] resize-none outline-none border-none leading-relaxed"
            />
            <div class="flex justify-end mt-2">
              <button
                @click="handleAddComment"
                :disabled="!newComment.trim() || commentLoading"
                class="px-5 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full transition-all"
              >
                {{ commentLoading ? "Gönderiliyor..." : "Yorum Yap" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- YORUMLAR LİSTESİ -->
      <div>
        <div v-if="commentsLoading" class="py-8 text-center">
          <div
            class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
          />
        </div>

        <div v-else-if="comments.length === 0" class="py-12 text-center">
          <p class="text-gray-400 text-sm">
            Henüz yorum yok. İlk yorumu sen yap!
          </p>
        </div>

        <div v-else>
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="px-4 py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div class="flex gap-3">
              <!-- Avatar -->
              <router-link
                :to="`/profile/${comment.author?.username}`"
                class="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="comment.author?.avatarUrl"
                  :src="comment.author.avatarUrl"
                  class="w-full h-full object-cover rounded-full"
                />
                <span v-else class="text-white font-bold text-xs">
                  {{ comment.author?.username?.charAt(0).toUpperCase() }}
                </span>
              </router-link>

              <div class="flex-1 min-w-0">
                <!-- Üst satır -->
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <router-link
                    :to="`/profile/${comment.author?.username}`"
                    class="font-bold text-sm text-gray-900 dark:text-white hover:underline"
                  >
                    {{ comment.author?.fullName || comment.author?.username }}
                  </router-link>
                  <router-link
                    :to="`/profile/${comment.author?.username}`"
                    class="text-gray-400 text-xs"
                  >
                    @{{ comment.author?.username }}
                  </router-link>
                  <span class="text-gray-300 dark:text-gray-600 text-xs"
                    >·</span
                  >
                  <span class="text-gray-400 text-xs">{{
                    formatDate(comment.createdAt)
                  }}</span>

                  <!-- Sil (sahip) -->
                  <button
                    v-if="authStore.user?.id === comment.author?.id"
                    @click="handleDeleteComment(comment.id)"
                    class="ml-auto p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
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
                </div>

                <!-- Yorum içeriği -->
                <p
                  class="text-[14px] text-gray-800 dark:text-gray-200 leading-relaxed"
                >
                  {{ comment.content }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useLikesStore } from "@/stores/likes";
import { usePostsStore } from "@/stores/posts";
import { useToast } from "vue-toastification";
import HashtagText from "@/components/HashtagText.vue";
import api from "@/api/client";

const route = useRoute();
const authStore = useAuthStore();
const likesStore = useLikesStore();
const toast = useToast();

const post = ref<any>(null);
const comments = ref<any[]>([]);
const loading = ref(true);
const commentsLoading = ref(true);
const likeLoading = ref(false);
const commentLoading = ref(false);
const isFollowing = ref(false);
const newComment = ref("");
const commentInput = ref<HTMLTextAreaElement | null>(null);

const postId = computed(() => Number(route.params.id));

onMounted(async () => {
  await Promise.all([fetchPost(), fetchComments()]);
});

async function fetchPost() {
  try {
    const res = await api.get(
      `/posts/${postId.value}?currentUserId=${authStore.user?.id || ""}`,
    );
    post.value = res.data;
    // Takip durumu kontrol (ileride follow store'dan gelebilir)
    if (
      authStore.isAuthenticated &&
      authStore.user?.id !== post.value?.author?.id
    ) {
      try {
        const followRes = await api.get(
          `/follow/check/${post.value.author.id}?currentUserId=${authStore.user?.id}`,
        );
        isFollowing.value = followRes.data.isFollowing;
      } catch {}
    }
  } catch {
    post.value = null;
  } finally {
    loading.value = false;
  }
}

async function fetchComments() {
  try {
    const res = await api.get(
      `/comments/post/${route.params.id}?currentUserId=${authStore.user?.id || ""}`,
    );
    comments.value = res.data;
  } catch {
    comments.value = [];
  } finally {
    commentsLoading.value = false;
  }
}

async function handleLike() {
  if (!post.value) return;
  likeLoading.value = true;
  try {
    const result = await likesStore.toggleLike(post.value.id);
    const current = post.value._count?.likes || 0;
    post.value = {
      ...post.value,
      isLiked: result.liked,
      _count: {
        ...post.value._count,
        likes: result.liked ? current + 1 : current - 1,
      },
    };
  } catch {
    toast.error("Beğeni işlemi başarısız.");
  } finally {
    likeLoading.value = false;
  }
}

async function handleAddComment() {
  if (!newComment.value.trim()) return;
  commentLoading.value = true;
  try {
    const res = await api.post(`/comments/post/${postId.value}`, {
      content: newComment.value.trim(),
    });
    comments.value.unshift(res.data);
    if (post.value?._count) post.value._count.comments++;
    newComment.value = "";
    toast.success("Yorum eklendi!");
  } catch {
    toast.error("Yorum eklenemedi.");
  } finally {
    commentLoading.value = false;
  }
}

async function handleDeleteComment(commentId: number) {
  if (!confirm("Yorumu silmek istiyor musun?")) return;
  try {
    await api.delete(`/comments/${commentId}`);
    comments.value = comments.value.filter((c) => c.id !== commentId);
    if (post.value?._count) post.value._count.comments--;
    toast.success("Yorum silindi.");
  } catch {
    toast.error("Yorum silinemedi.");
  }
}

async function handleFollow() {
  try {
    await api.post(`/follow/${post.value.author.id}`);
    isFollowing.value = !isFollowing.value;
    toast.success(isFollowing.value ? "Takip edildi!" : "Takipten çıkıldı.");
  } catch {
    toast.error("İşlem başarısız.");
  }
}

function focusCommentInput() {
  commentInput.value?.focus();
  commentInput.value?.scrollIntoView({ behavior: "smooth", block: "center" });
}

const sentimentClass = (s: string) =>
  ({
    POSITIVE:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    NEGATIVE: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    NEUTRAL: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  })[s] || "bg-gray-100 dark:bg-gray-800 text-gray-500";

const sentimentLabel = (s: string) =>
  ({
    POSITIVE: "Pozitif",
    NEGATIVE: "Negatif",
    NEUTRAL: "Nötr",
  })[s] || s;

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins}d`;
  if (hours < 24) return `${hours}s`;
  if (days < 7) return `${days}g`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};

const formatFullDate = (date: string) => {
  return new Date(date).toLocaleDateString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

import { computed } from "vue";
</script>
