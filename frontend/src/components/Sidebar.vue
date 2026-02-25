<template>
  <aside
    class="hidden sm:flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-primary-900/30 sticky top-0 h-screen overflow-y-auto transition-all duration-300"
    :class="isExpanded ? 'w-64 sm:px-4' : 'w-20 sm:px-0 sm:items-center'"
  >
    <router-link
      to="/"
      class="flex items-center justify-center sm:justify-start gap-3 py-6 px-4 sm:px-0 flex-shrink-0"
    >
      <img
        src="/makutalklogo.png"
        alt="MAKU Talk"
        class="w-10 h-10 sm:w-9 sm:h-9 object-contain"
      />
      <span
        v-if="isExpanded"
        class="hidden lg:inline text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
      >
        MAKU<span
          class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >talk</span
        >
      </span>
    </router-link>

    <!-- Navigation Items -->
    <nav class="flex-1 space-y-2 py-4 px-2 sm:px-1">
      <!-- Anasayfa -->
      <router-link
        to="/"
        class="flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
        :class="{
          'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400':
            isActive('home'),
        }"
      >
        <svg
          class="w-6 h-6 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span v-if="isExpanded" class="hidden lg:inline font-semibold text-base"
          >Anasayfa</span
        >
      </router-link>

      <router-link
        to="/search"
        class="flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
        :class="{
          'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400':
            isActive('search'),
        }"
      >
        <svg
          class="w-6 h-6 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span v-if="isExpanded" class="hidden lg:inline font-semibold text-base"
          >Keşfet</span
        >
      </router-link>

      <router-link
        to="/notifications"
        class="relative flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
        :class="{
          'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400':
            isActive('notifications'),
        }"
      >
        <div class="relative flex-shrink-0">
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span
            v-if="unreadNotifications > 0"
            class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
          ></span>
        </div>
        <span v-if="isExpanded" class="hidden lg:inline font-semibold text-base"
          >Bildirimler</span
        >
      </router-link>

      <router-link
        to="/messages"
        class="relative flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
        :class="{
          'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400':
            isActive('messages'),
        }"
      >
        <div class="relative flex-shrink-0">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"
            />
          </svg>
          <span
            v-if="unreadMessages > 0"
            class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
          ></span>
        </div>
        <span v-if="isExpanded" class="hidden lg:inline font-semibold text-base"
          >Sohbet</span
        >
      </router-link>

      <router-link
        :to="`/profile/${userId}`"
        class="flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
        :class="{
          'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400':
            isActive('profile'),
        }"
      >
        <svg
          class="w-6 h-6 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </svg>
        <span v-if="isExpanded" class="hidden lg:inline font-semibold text-base"
          >Profil</span
        >
      </router-link>

      <router-link
        to="/settings"
        class="flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
        :class="{
          'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400':
            isActive('settings'),
        }"
      >
        <svg
          class="w-6 h-6 flex-shrink-0"
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
        <span v-if="isExpanded" class="hidden lg:inline font-semibold text-base"
          >Ayarlar</span
        >
      </router-link>
    </nav>

    <div
      class="px-2 sm:px-1 py-4 border-t border-gray-200 dark:border-gray-700"
    >
      <button
        @click="createPost"
        class="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-200 transform hover:scale-105"
      >
        <span class="hidden lg:inline text-lg">MAKULE</span>
        <svg class="w-5 h-5 lg:hidden" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 5v14m7-7H5" />
        </svg>
      </button>
    </div>
  </aside>

  <!-- Mobile Toggle Button -->
  <button
    v-if="!isExpanded"
    @click="toggleSidebar"
    class="sm:hidden fixed bottom-8 right-8 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg z-40"
  >
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotificationsStore } from "@/stores/notifications";

const route = useRoute();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();

const isExpanded = ref(true);
const unreadNotifications = ref(0);
const unreadMessages = ref(0);

const userId = computed(() => authStore.user?.id || "current-user-id");

const isActive = (page: string): boolean => {
  switch (page) {
    case "home":
      return route.path === "/";
    case "explore":
      return route.path === "/explore";
    case "notifications":
      return route.path === "/notifications";
    case "messages":
      return route.path === "/messages";
    case "settings":
      return route.path === "/settings";
    case "profile":
      return route.path.startsWith("/profile");
    default:
      return false;
  }
};

const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value;
};

const createPost = () => {
  console.log("Post oluştur modal açılacak");
  // TODO: Emit event or open modal
};

const fetchUnreadCounts = async () => {
  try {
    // Bildirim sayısını çek (API'den)
    await notificationsStore.fetchUnreadCount();
    unreadNotifications.value = notificationsStore.unreadCount;

    // TODO: Mesaj sayısını çek
    // await messagesStore.fetchUnreadCount();
    // unreadMessages.value = messagesStore.unreadCount;
  } catch (error) {
    console.error("Error fetching unread counts:", error);
  }
};

onMounted(() => {
  fetchUnreadCounts();
});
</script>

<style scoped>
aside {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

aside::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.8);
}

aside.dark::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

aside.dark::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7);
}
</style>
