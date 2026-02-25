<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen"
  >
    <!-- Post Composer Section -->
    <div
      v-if="authStore.isAuthenticated"
      class="sticky top-0 z-10 backdrop-blur bg-gradient-to-b from-white/95 via-white/90 to-white/85 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-primary-950/50 border-b border-gray-200 dark:border-primary-900/30 p-4"
    >
      <div class="flex gap-4">
        <!-- Avatar -->
        <img
          v-if="authStore.user?.avatarUrl"
          :src="authStore.user.avatarUrl"
          :alt="authStore.user.username"
          class="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-primary-500/50 dark:ring-primary-500/40 shadow-md"
        />
        <div
          v-else
          class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-primary-500/50 dark:ring-primary-500/40 shadow-md"
        >
          {{ authStore.user?.username?.charAt(0).toUpperCase() }}
        </div>

        <!-- Composer -->
        <div class="flex-1">
          <textarea
            v-model="newPostContent"
            placeholder="Ne düşünüyorsun?"
            class="w-full text-lg bg-transparent text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none font-medium"
            rows="3"
            :disabled="postsStore.loading"
          />

          <!-- Category Select & Actions -->
          <div
            v-if="newPostContent.trim()"
            class="mt-4 pt-4 border-t border-gray-200 dark:border-primary-900/30 space-y-4"
          >
            <!-- Category Selector Chips -->
            <div class="space-y-2">
              <label
                class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
              >
                Kategori Seç (Opsiyonel)
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  @click="selectedCategoryId = null"
                  :class="[
                    'px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2',
                    !selectedCategoryId
                      ? 'bg-primary-600 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                  ]"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Tümü
                </button>
                <button
                  v-for="category in categoriesStore.categories"
                  :key="category.id"
                  type="button"
                  @click="selectedCategoryId = category.id"
                  :class="[
                    'px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2',
                    selectedCategoryId === category.id
                      ? 'text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                  ]"
                  :style="
                    selectedCategoryId === category.id
                      ? { backgroundColor: category.color }
                      : {}
                  "
                >
                  <span v-if="category.icon" class="text-lg">{{
                    category.icon
                  }}</span>
                  {{ category.name }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2">
              <!-- Image upload -->
              <button
                type="button"
                class="p-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-lg transition-all duration-200 group hover:scale-110"
                title="Resim Ekle"
              >
                <svg
                  class="w-5 h-5 group-hover:scale-125 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <!-- Link -->
              <button
                type="button"
                class="p-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-lg transition-all duration-200 group hover:scale-110"
                title="Link Ekle"
              >
                <svg
                  class="w-5 h-5 group-hover:scale-125 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </button>
              <!-- Emoji Picker -->
              <EmojiPicker
                :modelValue="newPostContent"
                @update:modelValue="(emoji) => (newPostContent += emoji)"
              />
              <div class="flex-1"></div>

              <!-- Post button -->
              <button
                @click="handleCreatePost"
                :disabled="!newPostContent.trim() || postsStore.loading"
                class="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 dark:from-primary-600 dark:to-primary-700 dark:hover:from-primary-500 dark:hover:to-primary-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 disabled:shadow-none disabled:scale-100 flex items-center gap-2 justify-center"
              >
                <span
                  v-if="postsStore.loading"
                  class="animate-spin inline-block"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      stroke-width="4"
                      fill="none"
                      class="opacity-25"
                    ></circle>
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      class="opacity-75"
                    ></path>
                  </svg>
                </span>
                {{ postsStore.loading ? "Paylaşılıyor..." : "Paylaş" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Posts Feed -->
    <div>
      <!-- Loading State -->
      <div
        v-if="postsStore.loading && !postsStore.posts.length"
        class="flex justify-center items-center h-64"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
        ></div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!postsStore.posts.length"
        class="flex flex-col items-center justify-center h-64 text-center border-b border-gray-200 dark:border-primary-900/30"
      >
        <svg
          class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">Henüz paylaşım yok</p>
      </div>

      <!-- Posts List -->
      <div v-else class="divide-y divide-gray-200 dark:divide-primary-900/20">
        <PostCard
          v-for="post in postsStore.posts"
          :key="post.id"
          :post="post"
          @delete="handleDeletePost"
          @showComments="handleShowComments"
        />
      </div>
    </div>

    <!-- Comments Modal -->
    <CommentsModal
      :is-open="commentsModalOpen"
      :post-id="selectedPostId"
      @close="commentsModalOpen = false"
    />
    <DeleteConfirmModal
      :is-open="showDeleteModal"
      :is-deleting="isDeleting"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useCategoriesStore } from "@/stores/categories";
import { useToast } from "vue-toastification";
import PostCard from "@/components/PostCard.vue";
import CommentsModal from "@/components/CommentsModal.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import EmojiPicker from "@/components/EmojiPicker.vue";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const categoriesStore = useCategoriesStore();
const toast = useToast();

const newPostContent = ref("");
const selectedCategoryId = ref<number | null>(null);
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);
const showDeleteModal = ref(false);
const postIdToDelete = ref<number | null>(null);
const isDeleting = ref(false);

onMounted(() => {
  postsStore.resetCategory();
  postsStore.fetchPosts(authStore.user?.id);
  categoriesStore.fetchCategories();
});

const handleCreatePost = async () => {
  if (!newPostContent.value.trim()) return;

  try {
    await postsStore.createPost(
      newPostContent.value,
      true,
      selectedCategoryId.value || undefined,
    );
    newPostContent.value = "";
    selectedCategoryId.value = null;
    toast.success("Paylaşım yapıldı!");
  } catch (error: any) {
    const message = error.message?.[0] || "Paylaşım yapılamadı.";
    toast.error(message);
  }
};

const handleDeletePost = (postId: number) => {
  postIdToDelete.value = postId;
  showDeleteModal.value = true;
};

const handleConfirmDelete = async () => {
  if (postIdToDelete.value === null) return;

  isDeleting.value = true;
  try {
    await postsStore.deletePost(postIdToDelete.value);
    toast.success("Paylaşım silindi.");
    showDeleteModal.value = false;
    postIdToDelete.value = null;
  } catch (error: any) {
    const message = error.message?.[0] || "Silme işlemi başarısız.";
    toast.error(message);
  } finally {
    isDeleting.value = false;
  }
};

const handleCancelDelete = () => {
  showDeleteModal.value = false;
  postIdToDelete.value = null;
};

const handleShowComments = (postId: number) => {
  selectedPostId.value = postId;
  commentsModalOpen.value = true;
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
