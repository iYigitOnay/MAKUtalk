<template>
  <div class="max-w-4xl mx-auto">
    <div class="card">
      <!-- Profile Header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center space-x-4">
          <div
            class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center"
          >
            <span class="text-primary-700 font-bold text-3xl">
              {{ userInitials }}
            </span>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ authStore.user?.fullName || authStore.user?.username }}
            </h1>
            <p class="text-gray-500">@{{ authStore.user?.username }}</p>
            <p class="text-sm text-gray-400 mt-1">
              {{ authStore.user?.email }}
            </p>
          </div>
        </div>

        <router-link to="/settings" class="btn-outline text-sm">
          Profili Düzenle
        </router-link>
      </div>

      <!-- Bio -->
      <div v-if="authStore.user?.bio" class="mb-6">
        <p class="text-gray-700">{{ authStore.user.bio }}</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 py-6 border-t border-b">
        <div class="text-center">
          <p class="text-2xl font-bold text-gray-900">
            {{ postsStore.myPosts.length }}
          </p>
          <p class="text-sm text-gray-500">Paylaşım</p>
        </div>
        <button
          @click="showFollowersModal = true"
          class="text-center hover:bg-gray-50 rounded-lg transition"
        >
          <p class="text-2xl font-bold text-gray-900">{{ followersCount }}</p>
          <p class="text-sm text-gray-500">Takipçi</p>
        </button>
        <button
          @click="showFollowingModal = true"
          class="text-center hover:bg-gray-50 rounded-lg transition"
        >
          <p class="text-2xl font-bold text-gray-900">{{ followingCount }}</p>
          <p class="text-sm text-gray-500">Takip</p>
        </button>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex space-x-3">
        <router-link to="/my-posts" class="btn-primary flex-1 text-center">
          Paylaşımlarımı Gör
        </router-link>
        <button @click="handleLogout" class="btn-secondary">Çıkış Yap</button>
      </div>
    </div>

    <!-- Followers Modal -->
    <FollowModal
      :is-open="showFollowersModal"
      :users="followers"
      title="Takipçiler"
      @close="showFollowersModal = false"
    />

    <!-- Following Modal -->
    <FollowModal
      :is-open="showFollowingModal"
      :users="following"
      title="Takip Edilenler"
      @close="showFollowingModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useFollowStore } from "@/stores/follow";
import { useToast } from "vue-toastification";
import FollowModal from "@/components/FollowModal.vue";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const followStore = useFollowStore();
const router = useRouter();
const toast = useToast();

const showFollowersModal = ref(false);
const showFollowingModal = ref(false);
const followers = ref([]);
const following = ref([]);
const followersCount = ref(0);
const followingCount = ref(0);

const userInitials = computed(() => {
  if (!authStore.user) return "";
  const name = authStore.user.fullName || authStore.user.username;
  return name.charAt(0).toUpperCase();
});

const handleLogout = () => {
  authStore.logout();
  toast.success("Çıkış yapıldı");
  router.push("/login");
};

onMounted(async () => {
  postsStore.fetchMyPosts();

  if (authStore.user) {
    try {
      const followersData = await followStore.getFollowers(authStore.user.id);
      followers.value = followersData.map((f: any) => f.follower);
      followersCount.value = followersData.length;

      const followingData = await followStore.getFollowing(authStore.user.id);
      following.value = followingData.map((f: any) => f.following);
      followingCount.value = followingData.length;
    } catch (error) {
      console.error("Follow data fetch error:", error);
    }
  }
});
</script>
