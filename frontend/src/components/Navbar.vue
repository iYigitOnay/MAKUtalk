<template>
  <!-- Sadece Mobil Navbar -->
  <nav
    class="sm:hidden relative z-50 bg-white dark:bg-gray-950 border-b border-slate-200 dark:border-primary-900/20 transition-colors duration-300"
  >
    <div class="h-14 px-4 flex items-center justify-between">
      <!-- Sol: Profil Açma -->
      <button
        v-if="authStore.user"
        @click="showMobileMenu = true"
        class="relative w-9 h-9 rounded-full overflow-hidden border-2 border-slate-100 dark:border-gray-800 active:scale-95 transition-transform"
      >
        <img
          v-if="authStore.user?.avatarUrl"
          :src="getImageUrl(authStore.user.avatarUrl)"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xs font-black"
        >
          {{ authStore.user?.username?.charAt(0).toUpperCase() }}
        </div>
      </button>
      <div v-else class="w-9"></div>

      <!-- Orta: Logo (Web ile aynı stil) -->
      <router-link
        to="/"
        class="flex items-center gap-1.5 active:scale-95 transition-transform"
      >
        <img
          src="/makutalklogo.png"
          alt="MAKU Talk"
          class="w-8 h-8 object-contain"
        />
        <span
          class="font-black text-xl tracking-tighter text-slate-900 dark:text-white"
        >
          MAKU<span
            class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >talk</span
          >
        </span>
      </router-link>

      <!-- Sağ: Dark Mode Toggle -->
      <button
        @click="toggleDarkMode"
        class="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-gray-400 active:scale-95 transition-transform"
      >
        <svg
          v-if="isDark"
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </nav>

  <!-- Mobil Menü (Drawer) -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showMobileMenu"
        @click="showMobileMenu = false"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] sm:hidden"
      ></div>
    </Transition>

    <Transition name="slide">
      <div
        v-if="showMobileMenu"
        class="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-950 z-[101] shadow-2xl sm:hidden flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 dark:border-gray-900">
          <div class="flex items-center justify-between mb-6">
            <h2
              class="text-xl font-black text-slate-900 dark:text-white italic tracking-tight"
            >
              Hesap Bilgileri
            </h2>
            <button @click="showMobileMenu = false" class="text-slate-400 p-1">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div 
            class="flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
            @click="handleNav(`/profile/${authStore.user?.username}`)"
          >
            <div
              class="p-0.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"
            >
              <img
                v-if="authStore.user?.avatarUrl"
                :src="getImageUrl(authStore.user.avatarUrl)"
                class="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-950"
              />
              <div
                v-else
                class="w-14 h-14 rounded-full bg-blue-600 border-2 border-white dark:border-gray-950 flex items-center justify-center text-white font-black text-2xl"
              >
                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="font-black text-slate-900 dark:text-white truncate text-lg"
              >
                {{ authStore.user?.fullName || authStore.user?.username }}
              </p>
              <p class="text-sm text-slate-500 dark:text-gray-400 truncate">
                @{{ authStore.user?.username }}
              </p>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto py-4">
          <div class="px-4 space-y-2">
            <button
              @click="handleNav(`/profile/${authStore.user?.username}`)"
              class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-900 text-slate-700 dark:text-gray-200 transition-colors"
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span class="font-bold">Profil</span>
            </button>

            <button
              @click="handleNav('/settings')"
              class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-900 text-slate-700 dark:text-gray-200 transition-colors"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span class="font-bold">Ayarlar</span>
            </button>

            <!-- Admin Sections -->
            <div
              v-if="authStore.user?.role === 'ADMIN'"
              class="pt-4 mt-4 border-t border-slate-100 dark:border-gray-900"
            >
              <button
                @click="handleNav('/admin')"
                class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
              >
                <svg
                  class="w-6 h-6"
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
                <span class="text-sm font-bold">Yönetim Paneli</span>
              </button>
            </div>

            <!-- Academic Sections -->
            <div
              v-if="authStore.user?.role === 'ACADEMIC'"
              class="pt-4 mt-4 border-t border-slate-100 dark:border-gray-900"
            >
              <button
                @click="handleNav('/academic')"
                class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
                <span class="text-sm font-bold">Akademisyen Paneli</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="p-6 border-t border-slate-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50"
        >
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span class="font-bold">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useDarkMode } from "@/composables/useDarkMode";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { useToast } from "vue-toastification";

const { isDark, toggleDarkMode } = useDarkMode();
const authStore = useAuthStore();
const chatStore = useChatStore();
const router = useRouter();
const toast = useToast();

const showMobileMenu = ref(false);

// HELPERS
const getImageUrl = (path: string | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const handleNav = (path: string) => {
  showMobileMenu.value = false;
  router.push(path);
};

const handleLogout = () => {
  showMobileMenu.value = false;
  chatStore.resetStore();
  authStore.logout();
  router.push("/auth");
  toast.success("Çıkış yapıldı.");
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
