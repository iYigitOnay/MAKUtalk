<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-primary-900/30"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-primary-900/30"
      >
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          Yorumlar
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
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

      <!-- Comments List -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div
          v-if="commentsStore.loading && !commentsStore.comments.length"
          class="text-center py-8"
        >
          <p class="text-gray-500 dark:text-gray-400">Yükleniyor...</p>
        </div>

        <div
          v-else-if="!commentsStore.comments.length"
          class="text-center py-8"
        >
          <p class="text-gray-500 dark:text-gray-400">
            Henüz yorum yok. İlk yorumu sen yap!
          </p>
        </div>

        <div
          v-for="comment in commentsStore.comments"
          :key="comment.id"
          class="flex space-x-3"
        >
          <div
            class="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <span
              class="text-primary-700 dark:text-primary-400 font-semibold text-sm"
            >
              {{ comment.user.username.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="flex-1">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div class="flex items-center justify-between mb-1">
                <p class="font-medium text-sm text-gray-900 dark:text-white">
                  {{ comment.user.fullName || comment.user.username }}
                </p>
                <button
                  v-if="authStore.user?.id === comment.userId"
                  @click="handleDeleteComment(comment.id)"
                  class="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition"
                  title="Sil"
                >
                  <svg
                    class="w-4 h-4"
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
              <p class="text-gray-700 dark:text-gray-300 text-sm">
                {{ comment.content }}
              </p>
            </div>
            <span class="text-xs text-gray-400 dark:text-gray-500 ml-3 mt-1">{{
              formatDate(comment.createdAt)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Comment Input -->
      <div
        v-if="authStore.isAuthenticated"
        class="p-6 border-t border-gray-200 dark:border-primary-900/30"
      >
        <form @submit.prevent="handleSubmit" class="flex space-x-3">
          <input
            v-model="newComment"
            type="text"
            placeholder="Yorum yaz..."
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors"
            :disabled="commentsStore.loading"
          />
          <button
            type="submit"
            :disabled="!newComment.trim() || commentsStore.loading"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gönder
          </button>
        </form>
      </div>
    </div>
  </div>
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
    toast.success("Yorum eklendi!");
  } catch (error: any) {
    const message = error.message?.[0] || "Yorum eklenemedi.";
    toast.error(message);
  }
};

const handleDeleteComment = async (commentId: number) => {
  if (!confirm("Bu yorumu silmek istediğinden emin misin?")) return;

  try {
    await commentsStore.deleteComment(commentId);
    toast.success("Yorum silindi.");
  } catch (error: any) {
    const message = error.message?.[0] || "Yorum silinemedi.";
    toast.error(message);
  }
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} saat önce`;
  return d.toLocaleDateString("tr-TR");
};
</script>
