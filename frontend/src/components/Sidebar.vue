<template>
  <aside
    class="hidden sm:flex flex-col bg-white dark:bg-gray-950 border-r border-slate-200 dark:border-primary-900/30 sticky top-0 h-screen overflow-y-auto transition-all duration-300 z-50"
    :class="isExpanded ? 'w-64 sm:px-4' : 'w-20 sm:px-0 sm:items-center'"
  >
    <!-- Logo Section -->
    <router-link
      to="/"
      class="flex items-center gap-4 pt-4 pb-2 px-4 flex-shrink-0"
      :class="isExpanded ? 'justify-start' : 'justify-center'"
    >
      <img src="/makutalklogo.png" alt="MAKU Talk" class="w-11 h-11 object-contain" />
      <span v-if="isExpanded" class="hidden lg:inline text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        MAKU<span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">talk</span>
      </span>
    </router-link>

    <!-- Main Navigation -->
    <nav class="flex-1 space-y-1 py-2 px-2 sm:px-1">
      <router-link
        v-for="item in filteredNavItems"
        :key="item.path"
        :to="item.path"
        class="group flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-full text-slate-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-primary-900/20 hover:text-blue-600 dark:hover:text-primary-400 transition-all duration-200"
        :class="{ 'bg-blue-50 dark:bg-primary-900/20 text-blue-600 dark:text-primary-400': isActive(item.id) }"
      >
        <div class="relative w-6 h-6 flex-shrink-0">
          <div v-html="item.iconSvg"></div>
          <!-- Badge for small sidebar -->
          <div 
            v-if="!isExpanded && getBadgeCount(item.id) > 0"
            class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-blue-600 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-gray-950"
          >
            {{ getBadgeCount(item.id) > 9 ? '9+' : getBadgeCount(item.id) }}
          </div>
        </div>
        
        <div v-if="isExpanded" class="hidden lg:flex items-center justify-between flex-1">
          <span class="font-semibold text-base">{{ item.name }}</span>
          <!-- Badge for expanded sidebar -->
          <span 
            v-if="getBadgeCount(item.id) > 0"
            class="ml-2 px-2 py-0.5 text-[11px] font-black bg-blue-600 text-white rounded-full min-w-[20px] text-center"
          >
            {{ getBadgeCount(item.id) }}
          </span>
        </div>
      </router-link>

      <!-- MAKÜ Kampüs Rehberi -->
      <router-link
        to="/campus"
        class="group flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-full transition-all duration-500 mt-auto mb-4 relative overflow-hidden hover:bg-blue-50 dark:hover:bg-primary-900/20"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none"></div>
        
        <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-primary-400">
          <svg viewBox="0 0 512 512" class="w-full h-full" fill="currentColor">
            <path d="M273 459l7.79-20 6.21 20 5.79-23.33-4.25-48c-7.76 7.94-17.54 17.85-29.74 30.27zm38.5-380.86a115.06 115.06 0 0 0-21.13-19.6c-17.315-11.88-35.418-18.913-55.08-22.14-18.751-3.067-37.99-2.743-56.33.12A203.86 203.86 0 0 0 133 49.42a184.2 184.2 0 0 0-29.62 15.36c-12.304 8.597-10.431 6.828.95 1.82a179.6 179.6 0 0 1 30.9-10c50.427-4.832 98.41-7.579 134.17 27.17a80 80 0 0 1 12.28 16c4.714 8.06 7.805 16.877 9.66 25.59l45.69 2.84c-5.032-17.752-15.256-37.574-25.53-50.06zm50.05 26.63c-8.531-13.217-18.495-25.428-29.66-34.88a78.24 78.24 0 0 0-15.79-10.38c2.67 2.68 5.22 5.45 7.61 8.32a138.13 138.13 0 0 1 9.13 12.11l.1.14.09.14c9.772 15.14 17.164 33.862 20.78 49.15l22.19 1.3a253.49 253.49 0 0 0-14.43-25.91zm29.89 43l70 179.4-11.82 28.37-65.77-37.94-8 13.86 67.56 39-4.327 5.754L394.12 372l-65.33-31.47a42.41 42.41 0 0 0-9.29-1.43c-5.71 0-9.52 2.06-12.71 6.62-2.53 3.61-78.5 80.52-147.64 150.28H16V243.73l92.85 3.85 96.61-33.26 10.13-11a214.71 214.71 0 0 1 38 24.27 18.57 18.57 0 0 0 11.61 3.93c13.792-1.574 22.025-9.12 32.83-17.83-3.267-21.244-6.724-43.71-9.56-62.1-6.463-2.155-12.926-4.308-19.39-6.46l4.39-4.78zm-37.25 65.02c-4.024-14.705-20.114-19.427-30.58-18.14-3.073.432-6.167 1.427-8.77 2.68.868 3.09 2.17 7.87 3.79 10.35 6.527 9.211 17.348 13.898 27.64 12.51 3.967-.672 8.94-3.676 7.92-7.4zm61.63 105.47l19 20 11.6-11-19-20zM475 172.99s-40.54-27.8-57-1.2l11.25 28.83zM294 382.05l13.4 22.28-.4-35.64c-3.29 3.45-7.53 7.82-12.95 13.36zm-30.6-167c5.858 1.872 17.61-6.048 17.33-8.01l-6.67-43.33-28-9.31c-17.65-2.861-58.224-4.989-67.27 9.28 39.596 39.732 39.526 16.87 84.61 51.37zm127.08 172.89c-15.313-7.704-30.838-14.996-46.28-22.44 5.153 29.387 10.895 58.672 15.75 88.11l25.26 37.33-2.6-34L400 469.61v-28.67l10.19-41.95 6.67-11.05z"/></svg>
        </div>
        
        <div v-if="isExpanded" class="hidden lg:flex items-center justify-between flex-1">
          <span class="font-black italic text-lg tracking-normal bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent whitespace-nowrap pr-2 pb-1">
            MAKÜ
          </span>
        </div>
      </router-link>
    </nav>

    <!-- User Profile Section -->
    <div class="relative px-2 py-4 border-t border-slate-100 dark:border-gray-800">
      <!-- Dropdown Menu -->
      <div 
        v-if="showUserMenu"
        class="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <!-- Admin Paneli (Sadece Adminler) -->
        <button 
          v-if="authStore.user?.role === 'ADMIN' || authStore.user?.email === '2312101063@ogr.mehmetakif.edu.tr'"
          @click="goToAdmin"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-slate-100 dark:border-gray-800"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Yönetim Paneli</span>
        </button>

        <!-- Akademisyen Paneli (Sadece Akademisyenler) -->
        <button 
          v-if="authStore.user?.role === 'ACADEMIC'"
          @click="goToAcademic"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-b border-slate-100 dark:border-gray-800"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Akademisyen Paneli</span>
        </button>

        <button 
          @click="goToProfile"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors border-b border-slate-50 dark:border-gray-800"
        >
          <svg class="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-slate-700 dark:text-gray-200">Profili Gör</span>
        </button>
        <button 
          @click="goToSettings"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors border-b border-slate-50 dark:border-gray-800"
        >
          <svg class="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-slate-700 dark:text-gray-200">Ayarlar</span>
        </button>
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Çıkış Yap</span>
        </button>
      </div>

      <!-- Trigger Button -->
      <button
        @click.stop="showUserMenu = !showUserMenu"
        class="w-full flex items-center gap-3 p-3 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-200 group relative z-[70]"
        :class="{ 'bg-slate-100 dark:bg-gray-800': showUserMenu }"
      >
        <div class="relative flex-shrink-0">
          <div class="p-[2px] rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 shadow-sm group-hover:scale-105 transition-transform">
            <img
              v-if="authStore.user?.avatarUrl"
              :src="authStore.user.avatarUrl"
              class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-950"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white dark:border-gray-950 flex items-center justify-center text-white font-black text-sm"
            >
              {{ authStore.user?.username?.charAt(0).toUpperCase() }}
            </div>
          </div>
        </div>
        <div v-if="isExpanded" class="flex-1 min-w-0 text-left">
          <p class="text-sm font-black text-slate-900 dark:text-white truncate">
            {{ authStore.user?.fullName || authStore.user?.username }}
          </p>
          <p class="text-xs text-slate-500 dark:text-gray-400 truncate">
            @{{ authStore.user?.username }}
          </p>
        </div>
        <svg 
          v-if="isExpanded"
          class="w-4 h-4 text-slate-400 transition-transform duration-200"
          :class="{ 'rotate-180': showUserMenu }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  </aside>

  <!-- Global Overlay to close menu -->
  <div 
    v-if="showUserMenu" 
    @click="showUserMenu = false"
    class="fixed inset-0 z-40 bg-transparent"
  ></div>

  <!-- Mobile Toggle Button -->
  <button
    v-if="!isExpanded"
    @click="toggleSidebar"
    class="sm:hidden fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg z-40"
  >
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { useNotificationsStore } from "@/stores/notifications";
import { useFollowStore } from "@/stores/follow";
import { useToast } from "vue-toastification";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const notificationsStore = useNotificationsStore();
const followStore = useFollowStore();
const toast = useToast();

const isExpanded = ref(true);
const showUserMenu = ref(false);

const navItems = [
  { id: 'home', name: 'Anasayfa', path: '/', iconSvg: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>' },
  { id: 'search', name: 'Keşfet', path: '/search', iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>' },
  { id: 'notifications', name: 'Bildirimler', path: '/notifications', iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>' },
  { id: 'requests', name: 'İstekler', path: '/requests', iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>' },
  { id: 'messages', name: 'Sohbet', iconSvg: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" /></svg>', path: '/messages' },
];

const filteredNavItems = computed(() => {
  return navItems.filter(item => {
    if (item.id === 'requests') {
      return authStore.user?.isPrivate;
    }
    return true;
  });
});

const getBadgeCount = (id: string) => {
  if (id === 'notifications') return notificationsStore.unreadCount;
  if (id === 'requests') return followStore.pendingRequests.length;
  if (id === 'messages') return chatStore.unreadCount;
  return 0;
};

const isActive = (id: string): boolean => {
  if (id === 'home') return route.path === '/';
  return route.path.startsWith('/' + id);
};

const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value;
};

const goToProfile = () => {
  showUserMenu.value = false;
  router.push(`/profile/${authStore.user?.username}`);
};

const goToSettings = () => {
  showUserMenu.value = false;
  router.push('/settings');
};

const goToAdmin = () => {
  showUserMenu.value = false;
  router.push('/admin');
};

const goToAcademic = () => {
  showUserMenu.value = false;
  router.push('/academic');
};

const handleLogout = () => {
  showUserMenu.value = false;
  chatStore.resetStore();
  authStore.logout();
  router.push("/auth");
  toast.success("Çıkış yapıldı.");
};

const fetchUnreadCounts = async () => {
  try {
    await notificationsStore.fetchUnreadCount();
    await chatStore.fetchConversations();
    if (authStore.user?.isPrivate) {
      await followStore.fetchPendingRequests();
    }
  } catch (error) {
    console.error("Error fetching unread counts:", error);
  }
};

onMounted(() => {
  fetchUnreadCounts();
});
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.15s ease-out;
}
.slide-in-from-bottom-2 {
  animation: slideIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(10px); }
  to { transform: translateY(0); }
}

@keyframes shine {
  100% {
    transform: translateX(100%);
  }
}

.animate-shine {
  animation: shine 0.8s ease-in-out;
}
</style>
