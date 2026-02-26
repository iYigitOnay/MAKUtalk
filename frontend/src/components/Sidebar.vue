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
      <span v-if="isExpanded" class="hidden lg:inline text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
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
            class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-gray-950"
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

      <!-- MAKÜ Style Signature (Clickable Campus Guide) -->
      <!-- MAKÜ Kampüs Rehberi (Milimetrik Hizalı & Premium) -->
      <router-link
        to="/campus"
        class="group flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-full transition-all duration-500 mt-auto mb-4 relative overflow-hidden hover:bg-blue-50 dark:hover:bg-primary-900/20"
      >
        <!-- Shine Effect Overlay -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none"></div>
        
        <!-- Icon (Same as Nav Items) -->
        <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-primary-400">
          <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <!-- Text Wrapper (Same as Nav Items) -->
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
        <!-- Admin/Kurucu Özel Paneli -->
        <button 
          v-if="authStore.user?.role === 'ADMIN' || authStore.user?.email === '2312101063@ogr.mehmetakif.edu.tr'"
          @click="goToAdmin"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-slate-100 dark:border-gray-800"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Yönetim Paneli</span>
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
              class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white dark:border-gray-950 flex items-center justify-center text-white font-bold text-sm"
            >
              {{ authStore.user?.username?.charAt(0).toUpperCase() }}
            </div>
          </div>
        </div>
        <div v-if="isExpanded" class="flex-1 min-w-0 text-left">
          <p class="text-sm font-bold text-slate-900 dark:text-white truncate">
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
import { useNotificationsStore } from "@/stores/notifications";
import { useFollowStore } from "@/stores/follow";
import { useToast } from "vue-toastification";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
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
    // Sadece hesabı gizli olanlar "İstekler" menüsünü görebilir
    if (item.id === 'requests') {
      return authStore.user?.isPrivate;
    }
    return true;
  });
});

const getBadgeCount = (id: string) => {
  if (id === 'notifications') return notificationsStore.unreadCount;
  if (id === 'requests') return followStore.pendingRequests.length;
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

const handleLogout = () => {
  showUserMenu.value = false;
  authStore.logout();
  router.push("/auth");
  toast.success("Çıkış yapıldı.");
};

const fetchUnreadCounts = async () => {
  try {
    await notificationsStore.fetchUnreadCount();
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
