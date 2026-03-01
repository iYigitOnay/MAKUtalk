<!-- src/components/MobileBottomNav.vue -->
<template>
  <nav class="sm:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-primary-900/20 z-50 px-2 pb-safe">
    <div class="flex items-center justify-around h-16">
      <button
        v-for="item in navItems"
        :key="item.path"
        @click="handleNavClick(item)"
        class="relative flex flex-col items-center justify-center w-full h-full text-slate-500 dark:text-gray-400 transition-colors outline-none"
        :class="{ 'text-blue-600 dark:text-primary-400': isActive(item.id) }"
      >
        <div class="relative flex flex-col items-center">
          <!-- Standart İkonlar -->
          <div v-if="item.id !== 'campus'" v-html="item.iconSvg" class="w-7 h-7"></div>
          
          <!-- MAKÜ Özel Tasarım -->
          <div v-else class="h-7 flex items-center justify-center">
            <span class="font-black text-base tracking-tight bg-gradient-to-tr from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent transform scale-110 pr-0.5">MAKÜ</span>
          </div>
          
          <!-- Badge -->
          <div 
            v-if="getBadgeCount(item.id) > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-blue-600 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-gray-950"
          >
            {{ getBadgeCount(item.id) > 9 ? '9+' : getBadgeCount(item.id) }}
          </div>
        </div>
        <span v-if="item.id !== 'campus'" class="text-[10px] font-medium mt-1">{{ item.name }}</span>
        <span v-else class="text-[8px] font-black uppercase tracking-[0.2em] mt-0.5 text-blue-600/40 dark:text-primary-400/40">Kampüs</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useChatStore } from "@/stores/chat";
import { useNotificationsStore } from "@/stores/notifications";
import { usePostsStore } from "@/stores/posts";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const notificationsStore = useNotificationsStore();
const postsStore = usePostsStore();
const authStore = useAuthStore();

const navItems = [
  { id: 'home', name: 'Anasayfa', path: '/', iconSvg: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>' },
  { id: 'search', name: 'Keşfet', path: '/search', iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2.1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>' },
  { id: 'campus', name: 'MAKÜ', path: '/campus', iconSvg: '' },
  { id: 'notifications', name: 'Bildirimler', path: '/notifications', iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2.1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>' },
  { id: 'messages', name: 'Sohbet', path: '/messages', iconSvg: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" /></svg>' },
];

const getBadgeCount = (id: string) => {
  if (id === 'notifications') return notificationsStore.unreadCount;
  if (id === 'messages') return chatStore.unreadCount;
  return 0;
};

const isActive = (id: string): boolean => {
  if (id === 'home') return route.path === '/';
  return route.path.startsWith('/' + id);
};

const handleNavClick = async (item: any) => {
  if (item.id === 'home' && route.path === '/') {
    // Zaten anasayfadaysak: En üste çık ve yenile
    const mainArea = document.querySelector('main');
    if (mainArea) {
      mainArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Verileri yeniden çek
    await postsStore.fetchPosts(authStore.user?.id);
  } else {
    router.push(item.path);
  }
};
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
