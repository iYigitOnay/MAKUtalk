<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="card">
      <div class="flex items-center space-x-3 mb-4">
        <div
          class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center"
        >
          <span class="text-primary-600 text-2xl font-bold">#</span>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">#{{ hashtag }}</h1>
          <p class="text-gray-500">{{ posts.length }} paylaşım</p>
        </div>
      </div>
    </div>

    <!-- Posts -->
    <div class="space-y-4">
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Yükleniyor...</p>
      </div>

      <div v-else-if="!posts.length" class="card text-center py-12">
        <p class="text-gray-500">Bu hashtag ile ilgili paylaşım bulunamadı.</p>
      </div>

      <PostCard
        v-for="post in posts"
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
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import PostCard from "@/components/PostCard.vue";
import CommentsModal from "@/components/CommentsModal.vue";
import type { Post } from "@/types";

const route = useRoute();
const authStore = useAuthStore();
const postsStore = usePostsStore();
const toast = useToast();

const hashtag = computed(() => route.params.tag as string);
const posts = ref<Post[]>([]);
const loading = ref(true);
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);

const fetchHashtagPosts = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (authStore.user) {
      params.userId = authStore.user.id;
    }

    const response = await apiClient.get(`/hashtags/${hashtag.value}/posts`, {
      params,
    });
    posts.value = response.data;
  } catch (error) {
    console.error("Failed to fetch hashtag posts:", error);
    toast.error("Paylaşımlar yüklenemedi.");
  } finally {
    loading.value = false;
  }
};

const handleDeletePost = async (postId: number) => {
  if (!confirm("Bu paylaşımı silmek istediğinden emin misin?")) return;

  try {
    await postsStore.deletePost(postId);
    posts.value = posts.value.filter((p) => p.id !== postId);
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

onMounted(() => {
  fetchHashtagPosts();
});
</script>
