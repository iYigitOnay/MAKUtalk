<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Create Post -->
    <div v-if="authStore.isAuthenticated" class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Yeni Paylaşım</h2>
      <form @submit.prevent="handleCreatePost">
        <textarea
          v-model="newPostContent"
          rows="3"
          class="input-field resize-none"
          placeholder="Ne düşünüyorsun?"
          :disabled="postsStore.loading"
        ></textarea>

        <!-- Category Select -->
        <select
          v-model="selectedCategoryId"
          class="input-field mt-3"
          :disabled="postsStore.loading"
        >
          <option :value="null">Kategori seç (opsiyonel)</option>
          <option
            v-for="category in categoriesStore.categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.icon }} {{ category.name }}
          </option>
        </select>

        <div class="flex justify-end mt-3">
          <button
            type="submit"
            :disabled="!newPostContent.trim() || postsStore.loading"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ postsStore.loading ? "Paylaşılıyor..." : "Paylaş" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Login Prompt -->
    <div v-else class="card text-center">
      <p class="text-gray-600 mb-4">Paylaşım yapmak için giriş yapmalısın.</p>
      <router-link to="/login" class="btn-primary inline-block">
        Giriş Yap
      </router-link>
    </div>

    <!-- Category Filter -->
    <div class="card">
      <h3 class="text-sm font-medium text-gray-700 mb-3">Kategoriler</h3>
      <div class="flex flex-wrap gap-2">
        <button
          @click="handleCategoryFilter(null)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition',
            !activeCategoryId
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          Tümü
        </button>
        <button
          v-for="category in categoriesStore.categories"
          :key="category.id"
          @click="handleCategoryFilter(category.id)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition',
            activeCategoryId === category.id
              ? 'text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
          :style="
            activeCategoryId === category.id
              ? { backgroundColor: category.color }
              : {}
          "
        >
          {{ category.icon }} {{ category.name }}
        </button>
      </div>
    </div>

    <!-- Posts Feed -->
    <div class="space-y-4">
      <h2 class="text-xl font-bold text-gray-900">
        {{ activeCategoryId ? "Filtrelenmiş " : "Tüm " }}Paylaşımlar
      </h2>

      <div
        v-if="postsStore.loading && !postsStore.posts.length"
        class="text-center py-8"
      >
        <p class="text-gray-500">Yükleniyor...</p>
      </div>

      <div v-else-if="!postsStore.posts.length" class="card text-center py-12">
        <p class="text-gray-500">
          Henüz paylaşım yok. İlk paylaşımı sen yap! 🚀
        </p>
      </div>

      <PostCard
        v-for="post in postsStore.posts"
        :key="post.id"
        :post="post"
        @delete="handleDeletePost"
        @showComments="handleShowComments"
      />
    </div>

    <!-- Comments Modal -->
    <CommentsModal
      :is-open="commentsModalOpen"
      :post-id="selectedPostId"
      @close="commentsModalOpen = false"
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

const authStore = useAuthStore();
const postsStore = usePostsStore();
const categoriesStore = useCategoriesStore();
const toast = useToast();

const newPostContent = ref("");
const selectedCategoryId = ref<number | null>(null);
const activeCategoryId = ref<number | null>(null);
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);

onMounted(() => {
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
    toast.success("Paylaşım yapıldı! 🎉");
  } catch (error: any) {
    const message = error.message?.[0] || "Paylaşım yapılamadı.";
    toast.error(message);
  }
};

const handleCategoryFilter = (categoryId: number | null) => {
  activeCategoryId.value = categoryId;
  if (categoryId) {
    postsStore.fetchPostsByCategory(categoryId, authStore.user?.id);
  } else {
    postsStore.fetchPosts(authStore.user?.id);
  }
};

const handleDeletePost = async (postId: number) => {
  if (!confirm("Bu paylaşımı silmek istediğinden emin misin?")) return;

  try {
    await postsStore.deletePost(postId);
    toast.success("Paylaşım silindi.");
  } catch (error: any) {
    const message = error.message?.[0] || "Silme işlemi başarısız.";
    toast.error(message);
  }
};

const handleShowComments = (postId: number) => {
  selectedPostId.value = postId;
  commentsModalOpen.value = true;
};
</script>
