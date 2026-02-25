<template>
  <div class="max-w-4xl mx-auto">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <div
        class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
      ></div>
      <p class="mt-4 text-slate-500 dark:text-gray-400">Yükleniyor...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="text-6xl mb-4">😕</div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {{ error }}
      </h2>
      <router-link to="/" class="btn-primary inline-block">
        Ana Sayfaya Dön
      </router-link>
    </div>

    <template v-else-if="displayedUser">
      <!-- Cover Photo -->
      <div class="relative">
        <div
          class="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-primary-700 dark:to-primary-800 rounded-t-xl overflow-hidden shadow-lg"
        >
          <img
            v-if="displayedUser.coverUrl"
            :src="displayedUser.coverUrl"
            alt="Cover"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Edit Button (Only if it's my profile) -->
        <button
          v-if="isMyProfile"
          @click="showEditModal = true"
          class="absolute top-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-full text-sm font-medium backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
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
          <div class="relative group">
            <div class="p-1 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow-xl transition-transform group-hover:scale-105">
              <img
                v-if="displayedUser.avatarUrl"
                :src="displayedUser.avatarUrl"
                alt="Avatar"
                class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 object-cover"
              />
              <div
                v-else
                class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
              >
                <span class="text-white font-bold text-4xl">
                  {{ userInitials }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Info -->
      <div
        class="bg-white dark:bg-gray-900/40 rounded-b-xl border-x border-b border-slate-200 dark:border-primary-900/30 pt-20 px-6 pb-6 shadow-sm"
      >
        <!-- Header Row: Name & Follow Button -->
        <div
          class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4"
        >
          <div>
            <h1
              class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
            >
              {{ displayedUser.fullName || displayedUser.username }}
              <svg
                v-if="displayedUser.id === 1"
                class="w-5 h-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </h1>
            <p class="text-slate-500 dark:text-gray-400">
              @{{ displayedUser.username }}
            </p>
          </div>

          <!-- Follow Button (Only if it's NOT my profile) -->
          <div
            v-if="!isMyProfile && authStore.isAuthenticated"
            class="flex gap-2"
          >
            <button
              @click="handleFollowToggle"
              :disabled="followLoading"
              class="px-6 py-2 rounded-full font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              :class="
                isFollowing
                  ? 'bg-slate-200 dark:bg-gray-800 text-slate-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-800'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
              "
            >
              <template v-if="followLoading">
                <span
                  class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                ></span>
              </template>
              <template v-else>
                {{ isFollowing ? "Takipten Çık" : "Takip Et" }}
              </template>
            </button>

            <button
              class="p-2 rounded-full border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800 transition"
            >
              <svg
                class="w-5 h-5 text-slate-600 dark:text-gray-400"
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
            </button>
          </div>
        </div>

        <!-- Bio -->
        <div v-if="displayedUser.bio" class="mb-4">
          <p
            class="text-slate-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed"
          >
            {{ displayedUser.bio }}
          </p>
        </div>
        <div v-else-if="isMyProfile" class="mb-4">
          <button
            @click="showEditModal = true"
            class="text-blue-500 hover:underline text-sm"
          >
            + Biografi ekleyerek kendinden bahset
          </button>
        </div>

        <!-- Join Date, Email, Department, Class -->
        <div
          class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-gray-400 mb-6"
        >
          <!-- Email always visible -->
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
            </svg>
            {{ displayedUser.email }}
          </div>

          <!-- Department (Optional) -->
          <div v-if="displayedUser.department" class="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/10 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/30">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="font-medium text-blue-700 dark:text-blue-400">{{ displayedUser.department }}</span>
          </div>

          <!-- Class (Optional) -->
          <div v-if="displayedUser.class" class="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/10 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-900/30">
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span class="font-medium text-purple-700 dark:text-purple-400">{{ displayedUser.class }}{{ displayedUser.class !== 'Mezun' && displayedUser.class !== 'Hazırlık' ? '. Sınıf' : '' }}</span>
          </div>

          <!-- Join Date -->
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formatJoinDate(displayedUser.createdAt) }} tarihinde katıldı
          </div>
        </div>

        <!-- Stats -->
        <div
          class="flex items-center gap-8 mb-8 pb-6 border-b border-slate-100 dark:border-gray-800"
        >
          <div>
            <span class="font-bold text-slate-900 dark:text-white text-lg">{{
              userPosts.length
            }}</span>
            <span class="text-slate-500 dark:text-gray-400 ml-1">Paylaşım</span>
          </div>
          <button @click="openFollowers" class="hover:underline">
            <span class="font-bold text-slate-900 dark:text-white text-lg">{{
              displayedUser._count?.followers || 0
            }}</span>
            <span class="text-slate-500 dark:text-gray-400 ml-1">Takipçi</span>
          </button>
          <button @click="openFollowing" class="hover:underline">
            <span class="font-bold text-slate-900 dark:text-white text-lg">{{
              displayedUser._count?.following || 0
            }}</span>
            <span class="text-slate-500 dark:text-gray-400 ml-1">Takip</span>
          </button>
        </div>

        <!-- Tab Controls -->
        <div class="flex border-b border-slate-100 dark:border-gray-800 mb-6">
          <button
            @click="activeTab = 'posts'"
            :class="[
              'px-6 py-3 text-sm font-bold border-b-2 transition-colors',
              activeTab === 'posts'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-gray-300',
            ]"
          >
            Paylaşımlar
          </button>
          <button
            @click="activeTab = 'reposts'"
            :class="[
              'px-6 py-3 text-sm font-bold border-b-2 transition-colors',
              activeTab === 'reposts'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-gray-300',
            ]"
          >
            Remakü
          </button>
          <button
            @click="activeTab = 'likes'"
            :class="[
              'px-6 py-3 text-sm font-bold border-b-2 transition-colors',
              activeTab === 'likes'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-gray-300',
            ]"
          >
            Beğeniler
          </button>
        </div>

        <!-- Posts List -->
        <div class="space-y-4">
          <div v-if="postsLoading" class="text-center py-8">
            <div
              class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
            ></div>
          </div>
          <template v-else-if="currentTabPosts.length > 0">
            <PostCard
              v-for="post in currentTabPosts"
              :key="post.id"
              :post="post"
              @delete="handleDeletePost"
              @showComments="handleShowComments"
              @interaction="handleInteraction"
            />
          </template>
          <div
            v-else
            class="text-center py-20 bg-slate-50 dark:bg-gray-800/20 rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-800"
          >
            <div class="text-4xl mb-3">📭</div>
            <p class="text-slate-500 dark:text-gray-400">
              {{
                activeTab === "posts"
                  ? "Henüz bir paylaşım bulunmuyor."
                  : activeTab === "reposts"
                    ? "Henüz hiçbir şeyi remakülemedin."
                    : "Henüz hiçbir şeyi beğenmedin."
              }}
            </p>
          </div>
        </div>

        <!-- Actions for My Profile -->
        <div
          v-if="isMyProfile"
          class="mt-8 pt-6 border-t border-slate-100 dark:border-gray-800 flex justify-end"
        >
          <button
            @click="handleLogout"
            class="px-6 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </template>

    <!-- Edit Profile Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="showEditModal = false"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <!-- Modal Header -->
        <div
          class="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between"
        >
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Profili Düzenle
          </h2>
          <button
            @click="showEditModal = false"
            class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <svg
              class="w-6 h-6 text-slate-400"
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
        <form
          @submit.prevent="handleUpdateProfile"
          class="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <!-- Cover Photo -->
          <div>
            <label
              class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2"
            >
              Kapak Fotoğrafı URL
            </label>
            <div class="flex gap-2">
              <input
                v-model="editForm.coverUrl"
                type="url"
                placeholder="https://example.com/cover.jpg"
                class="input-field flex-1"
              />
              <button
                type="button"
                @click="editForm.coverUrl = ''"
                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Avatar Photo -->
          <div>
            <label
              class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2"
            >
              Profil Fotoğrafı URL
            </label>
            <div class="flex gap-2">
              <input
                v-model="editForm.avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                class="input-field flex-1"
              />
              <button
                type="button"
                @click="editForm.avatarUrl = ''"
                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Full Name -->
          <div>
            <label
              class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2"
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

          <!-- Department and Class -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                Bölüm
              </label>
              <input
                v-model="editForm.department"
                type="text"
                maxlength="100"
                placeholder="Bilgisayar Mühendisliği"
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                Sınıf
              </label>
              <select v-model="editForm.class" class="input-field">
                <option value="">Seçiniz</option>
                <option value="Hazırlık">Hazırlık</option>
                <option value="1">1. Sınıf</option>
                <option value="2">2. Sınıf</option>
                <option value="3">3. Sınıf</option>
                <option value="4">4. Sınıf</option>
                <option value="Mezun">Mezun</option>
              </select>
            </div>
          </div>

          <!-- Bio -->
          <div>
            <label
              class="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2"
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
            <p class="text-xs text-slate-400 dark:text-gray-500 mt-1 text-right">
              {{ editForm.bio?.length || 0 }} / 500
            </p>
          </div>

          <!-- Error Message -->
          <div
            v-if="editError"
            class="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium"
          >
            {{ editError }}
          </div>
        </form>

        <!-- Modal Footer -->
        <div
          class="p-6 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 flex gap-3"
        >
          <button
            type="button"
            @click="showEditModal = false"
            class="flex-1 px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 transition"
          >
            İptal
          </button>
          <button
            @click="handleUpdateProfile"
            :disabled="updateLoading"
            class="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {{ updateLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <FollowModal
      :is-open="showFollowersModal"
      :users="followers"
      title="Takipçiler"
      @close="showFollowersModal = false"
    />

    <FollowModal
      :is-open="showFollowingModal"
      :users="following"
      title="Takip Edilenler"
      @close="showFollowingModal = false"
    />

    <CommentsModal
      :is-open="commentsModalOpen"
      :post-id="selectedPostId"
      @close="commentsModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useFollowStore } from "@/stores/follow";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import FollowModal from "@/components/FollowModal.vue";
import PostCard from "@/components/PostCard.vue";
import CommentsModal from "@/components/CommentsModal.vue";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const followStore = useFollowStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

// State
const displayedUser = ref<any>(null);
const userPosts = ref<any[]>([]);
const reposts = ref<any[]>([]);
const activeTab = ref<"posts" | "reposts" | "likes">("posts");
const followers = ref([]);
const following = ref([]);
const loading = ref(true);
const postsLoading = ref(true);
const followLoading = ref(false);
const error = ref("");

const showFollowersModal = ref(false);
const showFollowingModal = ref(false);
const showEditModal = ref(false);
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);

const editForm = ref({
  fullName: "",
  bio: "",
  avatarUrl: "",
  coverUrl: "",
  department: "",
  class: "",
});

const updateLoading = ref(false);
const editError = ref("");

// Computed
const currentTabPosts = computed(() => {
  if (activeTab.value === "reposts") return reposts.value;
  if (activeTab.value === "likes") return [];
  return userPosts.value;
});

const isMyProfile = computed(() => {
  if (!authStore.user || !displayedUser.value) return false;
  return authStore.user.id === displayedUser.value.id;
});

const isFollowing = computed(() => {
  if (!displayedUser.value || !authStore.user) return false;
  return displayedUser.value.isFollowing;
});

const userInitials = computed(() => {
  if (!displayedUser.value) return "";
  const name = displayedUser.value.fullName || displayedUser.value.username;
  return name.charAt(0).toUpperCase();
});

// Methods
const formatJoinDate = (date: string | undefined) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
  });
};

const fetchProfile = async () => {
  loading.value = true;
  error.value = "";
  const paramId = route.params.id as string;

  try {
    let response;
    const currentUserId = authStore.user?.id;

    if (!paramId || (authStore.user && paramId === authStore.user.username)) {
      response = await apiClient.get(
        `/users/username/${authStore.user?.username}`,
        {
          params: { currentUserId },
        },
      );
    } else {
      response = await apiClient.get(`/users/username/${paramId}`, {
        params: { currentUserId },
      });
    }

    displayedUser.value = response.data;
    await Promise.all([
      fetchUserPosts(displayedUser.value.id),
      fetchUserReposts(displayedUser.value.id),
      fetchFollowData(displayedUser.value.id),
    ]);

    if (isMyProfile.value) {
      authStore.user = { ...authStore.user, ...response.data };
      localStorage.setItem("user", JSON.stringify(authStore.user));

      editForm.value = {
        fullName: displayedUser.value.fullName || "",
        bio: displayedUser.value.bio || "",
        avatarUrl: displayedUser.value.avatarUrl || "",
        coverUrl: displayedUser.value.coverUrl || "",
        department: displayedUser.value.department || "",
        class: displayedUser.value.class || "",
      };
    }
  } catch (err: any) {
    console.error("Fetch profile error:", err);
    error.value = "Kullanıcı bulunamadı veya bir hata oluştu.";
  } finally {
    loading.value = false;
  }
};

const fetchUserPosts = async (userId: number) => {
  postsLoading.value = true;
  try {
    const response = await apiClient.get(`/users/${userId}/posts`, {
      params: { currentUserId: authStore.user?.id },
    });
    userPosts.value = response.data;
  } catch (err) {
    console.error("Fetch posts error:", err);
  } finally {
    postsLoading.value = false;
  }
};

const fetchUserReposts = async (userId: number) => {
  try {
    const data = await postsStore.fetchUserReposts(userId, authStore.user?.id);
    reposts.value = data;
  } catch (err) {
    console.error("Fetch reposts error:", err);
  }
};

const fetchFollowData = async (userId: number) => {
  try {
    const followersData = await followStore.getFollowers(userId);
    followers.value = followersData.map((f: any) => f.follower);

    const followingData = await followStore.getFollowing(userId);
    following.value = followingData.map((f: any) => f.following);
  } catch (err) {
    console.error("Fetch follow data error:", err);
  }
};

const handleFollowToggle = async () => {
  if (!authStore.user) return;
  followLoading.value = true;
  try {
    const result = await followStore.toggleFollow(displayedUser.value.id);
    displayedUser.value.isFollowing = result.following;

    if (result.following) {
      displayedUser.value._count.followers++;
    } else {
      displayedUser.value._count.followers--;
    }

    toast.success(result.message);
    fetchFollowData(displayedUser.value.id);
  } catch (err: any) {
    toast.error("İşlem başarısız.");
  } finally {
    followLoading.value = false;
  }
};

const handleUpdateProfile = async () => {
  if (!isMyProfile.value) return;

  updateLoading.value = true;
  editError.value = "";

  try {
    const response = await apiClient.patch(
      `/users/${authStore.user!.id}`,
      editForm.value,
    );

    displayedUser.value = { ...displayedUser.value, ...response.data };
    authStore.user = { ...authStore.user, ...response.data };
    localStorage.setItem("user", JSON.stringify(authStore.user));

    toast.success("Profil güncellendi! ✨");
    showEditModal.value = false;
  } catch (error: any) {
    editError.value =
      error.response?.data?.message?.[0] || "Profil güncellenemedi.";
  } finally {
    updateLoading.value = false;
  }
};

const handleInteraction = (data: { type: string, postId: number, status: boolean, post?: any }) => {
  // Store zaten merkezi state'i (Home/MyPosts) güncelledi. 
  // Biz sadece profil sayfasındaki yerel dizileri (userPosts, reposts) güncelleyelim.
  
  const updateArr = (arr: any[]) => {
    if (!arr) return;
    for (let i = 0; i < arr.length; i++) {
      const p = arr[i];
      // Eğer bu postun kendisi ise VEYA orijinali bu ise
      if (p.id === data.postId || p.repostId === data.postId) {
        if (data.type === 'like') {
          p.isLiked = data.status;
          if (p._count) p._count.likes = data.status ? (p._count.likes + 1) : Math.max(0, p._count.likes - 1);
          if (p.repostOf) {
            p.repostOf.isLiked = data.status;
            if (p.repostOf._count) p.repostOf._count.likes = data.status ? (p.repostOf._count.likes + 1) : Math.max(0, p.repostOf._count.likes - 1);
          }
        } else if (data.type === 'repost') {
          p.isReposted = data.status;
          if (p._count) p._count.reposts = data.status ? (p._count.reposts + 1) : Math.max(0, p._count.reposts - 1);
          if (p.repostOf) {
            p.repostOf.isReposted = data.status;
            if (p.repostOf._count) p.repostOf._count.reposts = data.status ? (p.repostOf._count.reposts + 1) : Math.max(0, p.repostOf._count.reposts - 1);
          }
        }
      }
    }
  };
  
  updateArr(userPosts.value);
  updateArr(reposts.value);

  // Remakü sekmesi için anlık ekleme/çıkarma
  if (isMyProfile.value && data.type === 'repost') {
    if (data.status && data.post) {
      if (!reposts.value.find(r => r.id === data.post.id)) {
        reposts.value.unshift(data.post);
      }
    } else {
      reposts.value = reposts.value.filter(r => r.repostId !== data.postId);
    }
  }
};

const handleDeletePost = async (postId: number) => {
  if (!confirm("Silmek istediğine emin misin?")) return;
  try {
    await postsStore.deletePost(postId);
    userPosts.value = userPosts.value.filter((p) => p.id !== postId);
    reposts.value = reposts.value.filter((p) => p.id !== postId);
    if (displayedUser.value._count) displayedUser.value._count.posts--;
    toast.success("Paylaşım silindi.");
  } catch {
    toast.error("Silinemedi.");
  }
};

const handleShowComments = (postId: number) => {
  selectedPostId.value = postId;
  commentsModalOpen.value = true;
};

const openFollowers = () => {
  showFollowersModal.value = true;
};

const openFollowing = () => {
  showFollowingModal.value = true;
};

const handleLogout = () => {
  authStore.logout();
  router.push("/auth");
  toast.success("Çıkış yapıldı.");
};

onMounted(() => {
  fetchProfile();
});

watch(
  () => route.params.id,
  () => {
    fetchProfile();
  },
);
</script>

<style scoped>
.input-field {
  @apply w-full px-4 py-3 border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all duration-200;
}
.btn-primary {
  @apply px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95;
}
</style>
