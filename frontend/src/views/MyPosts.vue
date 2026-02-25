<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Paylaşımlarım</h1>
      <span class="text-sm text-gray-500"
        >{{ postsStore.myPosts.length }} paylaşım</span
      >
    </div>

    <!-- Loading -->
    <div
      v-if="postsStore.loading && !postsStore.myPosts.length"
      class="text-center py-8"
    >
      <p class="text-gray-500">Yükleniyor...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!postsStore.myPosts.length" class="card text-center py-12">
      <p class="text-gray-500 mb-4">Henüz hiç paylaşım yapmamışsın.</p>
      <router-link to="/" class="btn-primary inline-block">
        İlk Paylaşımını Yap
      </router-link>
    </div>

    <!-- Posts List -->
    <PostCard
      v-for="post in postsStore.myPosts"
      :key="post.id"
      :post="post"
      @delete="handleDeletePost"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { usePostsStore } from "@/stores/posts";
import { useToast } from "vue-toastification";
import PostCard from "@/components/PostCard.vue";

const postsStore = usePostsStore();
const toast = useToast();

onMounted(() => {
  postsStore.fetchMyPosts();
});

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
</script>
