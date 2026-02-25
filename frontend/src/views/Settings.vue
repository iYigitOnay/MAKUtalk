<!-- src/views/Settings.vue -->
<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen"
  >
    <!-- Header -->
    <div
      class="sticky top-0 z-10 backdrop-blur bg-gradient-to-b from-white/90 to-white/80 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-primary-950/50 border-b border-gray-200 dark:border-primary-900/30 px-4 py-3"
    >
      <h2
        class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
      >
        <svg
          class="w-6 h-6 text-primary-600 dark:text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Ayarlar
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Hesap ve tercihlerinizi yönetin
      </p>
    </div>

    <!-- Settings Sections -->
    <div class="divide-y divide-gray-200 dark:divide-primary-900/20">
      <!-- Account Settings -->
      <div class="p-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Hesap Ayarları
        </h3>
        <div class="space-y-3">
          <button
            class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span class="text-gray-900 dark:text-white font-medium"
              >Şifremi değiştir</span
            >
            <svg
              class="w-5 h-5 text-gray-400"
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
          <button
            class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span class="text-gray-900 dark:text-white font-medium"
              >E-posta tercihlerini yönet</span
            >
            <svg
              class="w-5 h-5 text-gray-400"
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
          <button
            class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span class="text-gray-900 dark:text-white font-medium"
              >Hesabı devre dışı bırak</span
            >
            <svg
              class="w-5 h-5 text-gray-400"
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
      </div>

      <!-- Privacy & Safety -->
      <div class="p-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Gizlilik & Güvenlik
        </h3>
        <div class="space-y-3">
          <div
            class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span class="text-gray-900 dark:text-white font-medium"
              >Hesabı özel yap</span
            >
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                :checked="isPrivate"
                @change="togglePrivacy"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
              ></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Preferences -->
      <div class="p-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Tercihler
        </h3>
        <div class="space-y-3">
          <div
            class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span class="text-gray-900 dark:text-white font-medium"
              >Gece modu</span
            >
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                :checked="isDarkMode"
                @change="toggleDarkMode"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
              ></div>
            </label>
          </div>
          <button
            class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span class="text-gray-900 dark:text-white font-medium"
              >Dil Seç</span
            >
            <svg
              class="w-5 h-5 text-gray-400"
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
      </div>

      <!-- Danger Zone -->
      <div class="p-4">
        <h3 class="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
          Tehlikeli Alan
        </h3>
        <button
          @click="logout"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useDarkMode } from "@/composables/useDarkMode";

const router = useRouter();
const authStore = useAuthStore();
const isPrivate = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains("dark"));
const { toggleDarkMode: toggle } = useDarkMode();

const togglePrivacy = () => {
  isPrivate.value = !isPrivate.value;
  // TODO: API'ye gönder
};

const toggleDarkMode = () => {
  toggle();
  isDarkMode.value = !isDarkMode.value;
};

const logout = async () => {
  await authStore.logout();
  router.push("/login");
};
</script>
