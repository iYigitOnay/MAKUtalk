<template>
  <!-- Sadece Mobil Navbar -->
  <nav class="sm:hidden sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-slate-200 dark:border-primary-900/20 transition-colors duration-300">
    <div class="h-14 px-4 flex items-center justify-between">
      <!-- Sol: Profil Açma -->
      <button 
        v-if="authStore.user"
        @click="showMobileMenu = true"
        class="relative w-9 h-9 rounded-full overflow-hidden border-2 border-slate-100 dark:border-gray-800 active:scale-95 transition-transform"
      >
        <img
          v-if="authStore.user?.avatarUrl"
          :src="authStore.user.avatarUrl"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">
          {{ authStore.user?.username?.charAt(0).toUpperCase() }}
        </div>
      </button>
      <div v-else class="w-9"></div>

      <!-- Orta: Logo (Web ile aynı stil) -->
      <router-link to="/" class="flex items-center gap-1.5 active:scale-95 transition-transform">
        <img src="/makutalklogo.png" alt="MAKU Talk" class="w-8 h-8 object-contain" />
        <span class="font-black text-xl tracking-tighter text-slate-900 dark:text-white">
          MAKU<span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">talk</span>
        </span>
      </router-link>

      <!-- Sağ: Dark Mode Toggle -->
      <button
        @click="toggleDarkMode"
        class="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-gray-400 active:scale-95 transition-transform"
      >
        <svg v-if="isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </nav>

  <!-- Mobil Menü (Drawer) -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showMobileMenu" @click="showMobileMenu = false" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] sm:hidden"></div>
    </Transition>

    <Transition name="slide">
      <div v-if="showMobileMenu" class="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-950 z-[101] shadow-2xl sm:hidden flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 dark:border-gray-900">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-black text-slate-900 dark:text-white italic tracking-tight">Hesap Bilgileri</h2>
            <button @click="showMobileMenu = false" class="text-slate-400 p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="p-0.5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500">
              <img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" class="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-950" />
              <div v-else class="w-14 h-14 rounded-full bg-blue-600 border-2 border-white dark:border-gray-950 flex items-center justify-center text-white font-black text-2xl">
                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-black text-slate-900 dark:text-white truncate text-lg">{{ authStore.user?.fullName || authStore.user?.username }}</p>
              <p class="text-sm text-slate-500 dark:text-gray-400 truncate">@{{ authStore.user?.username }}</p>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto py-4">
          <div class="px-4 space-y-2">
            <button @click="handleNav(`/profile/${authStore.user?.username}`)" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-900 text-slate-700 dark:text-gray-200 transition-colors">
              <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-bold">Profil</span>
            </button>

            <button @click="handleNav('/settings')" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-900 text-slate-700 dark:text-gray-200 transition-colors">
              <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="font-bold">Ayarlar</span>
            </button>
            
            <button @click="handleNav('/campus')" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-900 text-slate-700 dark:text-gray-200 transition-colors group">
              <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-primary-400">
                <svg viewBox="0 0 512 512" class="w-full h-full" fill="currentColor">
                  <path d="M273 459l7.79-20 6.21 20 5.79-23.33-4.25-48c-7.76 7.94-17.54 17.85-29.74 30.27zm38.5-380.86a115.06 115.06 0 0 0-21.13-19.6c-17.315-11.88-35.418-18.913-55.08-22.14-18.751-3.067-37.99-2.743-56.33.12A203.86 203.86 0 0 0 133 49.42a184.2 184.2 0 0 0-29.62 15.36c-12.304 8.597-10.431 6.828.95 1.82a179.6 179.6 0 0 1 30.9-10c50.427-4.832 98.41-7.579 134.17 27.17a80 80 0 0 1 12.28 16c4.714 8.06 7.805 16.877 9.66 25.59l45.69 2.84c-5.032-17.752-15.256-37.574-25.53-50.06zm50.05 26.63c-8.531-13.217-18.495-25.428-29.66-34.88a78.24 78.24 0 0 0-15.79-10.38c2.67 2.68 5.22 5.45 7.61 8.32a138.13 138.13 0 0 1 9.13 12.11l.1.14.09.14c9.772 15.14 17.164 33.862 20.78 49.15l22.19 1.3a253.49 253.49 0 0 0-14.43-25.91zm29.89 43l70 179.4-11.82 28.37-65.77-37.94-8 13.86 67.56 39-4.327 5.754L394.12 372l-65.33-31.47a42.41 42.41 0 0 0-9.29-1.43c-5.71 0-9.52 2.06-12.71 6.62-2.53 3.61-78.5 80.52-147.64 150.28H16V243.73l92.85 3.85 96.61-33.26 10.13-11a214.71 214.71 0 0 1 38 24.27 18.57 18.57 0 0 0 11.61 3.93c13.792-1.574 22.025-9.12 32.83-17.83-3.267-21.244-6.724-43.71-9.56-62.1-6.463-2.155-12.926-4.308-19.39-6.46l4.39-4.78zm-37.25 65.02c-4.024-14.705-20.114-19.427-30.58-18.14-3.073.432-6.167 1.427-8.77 2.68.868 3.09 2.17 7.87 3.79 10.35 6.527 9.211 17.348 13.898 27.64 12.51 3.967-.672 8.94-3.676 7.92-7.4zm61.63 105.47l19 20 11.6-11-19-20zM475 172.99s-40.54-27.8-57-1.2l11.25 28.83zM294 382.05l13.4 22.28-.4-35.64c-3.29 3.45-7.53 7.82-12.95 13.36zm-30.6-167c5.858 1.872 17.61-6.048 17.33-8.01l-6.67-43.33-28-9.31c-17.65-2.861-58.224-4.989-67.27 9.28 39.596 39.732 39.526 16.87 84.61 51.37zm127.08 172.89c-15.313-7.704-30.838-14.996-46.28-22.44 5.153 29.387 10.895 58.672 15.75 88.11l25.26 37.33-2.6-34L400 469.61v-28.67l10.19-41.95 6.67-11.05z"/></svg>
              </div>
              <span class="font-black italic text-lg tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent uppercase pr-2">MAKÜ</span>
            </button>

            <!-- Admin Sections -->
            <div v-if="authStore.user?.role === 'ADMIN'" class="pt-4 mt-4 border-t border-slate-100 dark:border-gray-900">
              <button @click="handleNav('/admin')" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="font-black">Yönetim Paneli</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-slate-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50">
          <button @click="handleLogout" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
</style>
