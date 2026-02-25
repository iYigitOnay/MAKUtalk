<template>
  <div class="max-w-4xl mx-auto">
    <!-- Cover Photo -->
    <div class="relative">
      <div
        class="h-48 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-700 dark:to-primary-800 rounded-t-xl overflow-hidden"
      >
        <img
          v-if="authStore.user?.coverUrl"
          :src="authStore.user.coverUrl"
          alt="Cover"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Edit Button (Floating) -->
      <button
        @click="showEditModal = true"
        class="absolute top-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-full text-sm font-medium backdrop-blur-sm transition"
      >
        <svg
          class="w-4 h-4 inline mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Profili Düzenle
      </button>

      <!-- Avatar (Overlapping) -->
      <div class="absolute -bottom-16 left-6">
        <div class="relative">
          <img
            v-if="authStore.user?.avatarUrl"
            :src="authStore.user.avatarUrl"
            alt="Avatar"
            class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 object-cover"
          />
          <div
            v-else
            class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center"
          >
            <span class="text-white font-bold text-4xl">
              {{ userInitials }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Info -->
    <div
      class="bg-white dark:bg-gray-900/40 rounded-b-xl border-x border-b border-gray-200 dark:border-primary-900/30 pt-20 px-6 pb-6"
    >
      <!-- Name & Username -->
      <div class="mb-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ authStore.user?.fullName || authStore.user?.username }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          @{{ authStore.user?.username }}
        </p>
      </div>

      <!-- Bio -->
      <div v-if="authStore.user?.bio" class="mb-4">
        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {{ authStore.user.bio }}
        </p>
      </div>
      <div v-else class="mb-4 text-gray-400 dark:text-gray-500 text-sm italic">
        Henüz bir biografi eklenmedi
      </div>

      <!-- Join Date & Email -->
      <div
        class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6"
      >
        <div class="flex items-center gap-1">
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {{ authStore.user?.email }}
        </div>
        <div class="flex items-center gap-1">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {{ formatJoinDate(authStore.user?.createdAt) }} tarihinde katıldı
        </div>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-6 mb-6">
        <div>
          <span class="font-bold text-gray-900 dark:text-white">{{
            postsStore.myPosts.length
          }}</span>
          <span class="text-gray-500 dark:text-gray-400 ml-1">Paylaşım</span>
        </div>
        <button @click="showFollowersModal = true" class="hover:underline">
          <span class="font-bold text-gray-900 dark:text-white">{{
            followersCount
          }}</span>
          <span class="text-gray-500 dark:text-gray-400 ml-1">Takipçi</span>
        </button>
        <button @click="showFollowingModal = true" class="hover:underline">
          <span class="font-bold text-gray-900 dark:text-white">{{
            followingCount
          }}</span>
          <span class="text-gray-500 dark:text-gray-400 ml-1">Takip</span>
        </button>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <router-link to="/my-posts" class="btn-primary flex-1 text-center">
          Paylaşımlarım
        </router-link>
        <button @click="handleLogout" class="btn-secondary">Çıkış Yap</button>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showEditModal = false"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <!-- Modal Header -->
        <div
          class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between"
        >
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            Profili Düzenle
          </h2>
          <button
            @click="showEditModal = false"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <svg
              class="w-5 h-5 text-gray-500"
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

        <!-- Modal Content -->
        <form @submit.prevent="handleUpdateProfile" class="p-6 space-y-6">
          <!-- Cover Photo -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Kapak Fotoğrafı URL
            </label>
            <input
              v-model="editForm.coverUrl"
              type="url"
              placeholder="https://example.com/cover.jpg"
              class="input-field"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Kapak fotoğrafı için bir URL girin (1500x500 önerilen)
            </p>
          </div>

          <!-- Avatar Photo -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Profil Fotoğrafı URL
            </label>
            <input
              v-model="editForm.avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              class="input-field"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Profil fotoğrafı için bir URL girin (400x400 önerilen)
            </p>
          </div>

          <!-- Full Name -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Ad Soyad
            </label>
            <input
              v-model="editForm.fullName"
              type="text"
              maxlength="100"
              placeholder="Ahmet Yılmaz"
              class="input-field"
            />
          </div>

          <!-- Bio -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Biografi
            </label>
            <textarea
              v-model="editForm.bio"
              rows="4"
              maxlength="500"
              placeholder="Kendinizden bahsedin..."
              class="input-field resize-none"
            ></textarea>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {{ editForm.bio?.length || 0 }} / 500
            </p>
          </div>

          <!-- Error Message -->
          <div
            v-if="editError"
            class="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
          >
            {{ editError }}
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              type="button"
              @click="showEditModal = false"
              class="flex-1 btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              :disabled="updateLoading"
              class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ updateLoading ? "Kaydediliyor..." : "Kaydet" }}
            </button>
          </div>
        </form>
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
import apiClient from "@/api/client";
import FollowModal from "@/components/FollowModal.vue";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const followStore = useFollowStore();
const router = useRouter();
const toast = useToast();

const showFollowersModal = ref(false);
const showFollowingModal = ref(false);
const showEditModal = ref(false);
const followers = ref([]);
const following = ref([]);
const followersCount = ref(0);
const followingCount = ref(0);
const updateLoading = ref(false);
const editError = ref("");

const editForm = ref({
  fullName: "",
  bio: "",
  avatarUrl: "",
  coverUrl: "",
});

const userInitials = computed(() => {
  if (!authStore.user) return "";
  const name = authStore.user.fullName || authStore.user.username;
  return name.charAt(0).toUpperCase();
});

const formatJoinDate = (date: string | undefined) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
  });
};

const handleUpdateProfile = async () => {
  if (!authStore.user) return;

  updateLoading.value = true;
  editError.value = "";

  try {
    const response = await apiClient.patch(
      `/users/${authStore.user.id}`,
      editForm.value,
    );

    // Update local auth store
    authStore.user = { ...authStore.user, ...response.data };
    localStorage.setItem("user", JSON.stringify(authStore.user));

    toast.success("Profil güncellendi! ✨");
    showEditModal.value = false;
  } catch (error: any) {
    console.error("Update profile error:", error);
    editError.value =
      error.response?.data?.message?.[0] || "Profil güncellenemedi.";
  } finally {
    updateLoading.value = false;
  }
};

const handleLogout = () => {
  authStore.logout();
  toast.success("Çıkış yapıldı");
  router.push("/auth");
};

onMounted(async () => {
  postsStore.fetchMyPosts();

  // Initialize edit form with current user data
  if (authStore.user) {
    editForm.value = {
      fullName: authStore.user.fullName || "",
      bio: authStore.user.bio || "",
      avatarUrl: authStore.user.avatarUrl || "",
      coverUrl: authStore.user.coverUrl || "",
    };

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
