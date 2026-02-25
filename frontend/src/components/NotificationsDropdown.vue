<template>
  <div class="relative">
    <!-- Bell Icon Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
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
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Unread Badge -->
      <span
        v-if="notificationsStore.unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
      >
        {{
          notificationsStore.unreadCount > 9
            ? "9+"
            : notificationsStore.unreadCount
        }}
      </span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-primary-900/30 z-50 max-h-[32rem] flex flex-col"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-primary-900/30"
      >
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          Bildirimler
        </h3>
        <button
          v-if="notificationsStore.unreadCount > 0"
          @click="handleMarkAllRead"
          class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          Tümünü Okundu İşaretle
        </button>
      </div>

      <!-- Notifications List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="notificationsStore.loading" class="p-8 text-center">
          <p class="text-gray-500 dark:text-gray-400">Yükleniyor...</p>
        </div>

        <div
          v-else-if="!notificationsStore.notifications.length"
          class="p-8 text-center"
        >
          <svg
            class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3"
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
          <p class="text-gray-500 dark:text-gray-400">Henüz bildirim yok</p>
        </div>

        <div
          v-for="notification in notificationsStore.notifications"
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          :class="[
            'p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition border-b border-gray-100 dark:border-gray-800 last:border-b-0',
            !notification.read && 'bg-primary-50 dark:bg-primary-900/10',
          ]"
        >
          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <span
                class="text-primary-700 dark:text-primary-400 font-semibold text-sm"
              >
                {{ notification.sender.username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span
                  class="text-sm font-semibold text-gray-900 dark:text-white"
                >
                  {{
                    notification.sender.fullName || notification.sender.username
                  }}
                </span>
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="getNotificationBadgeClass(notification.type)"
                >
                  {{ getNotificationBadge(notification.type) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {{ getNotificationText(notification.type) }}
              </p>
              <p
                v-if="notification.post"
                class="text-sm text-gray-500 dark:text-gray-500 mt-1 truncate"
              >
                "{{ notification.post.content }}"
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {{ formatDate(notification.createdAt) }}
              </p>
            </div>
            <div
              v-if="!notification.read"
              class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useNotificationsStore } from "@/stores/notifications";
import type { Notification } from "@/stores/notifications";

const notificationsStore = useNotificationsStore();
const router = useRouter();
const isOpen = ref(false);

let intervalId: NodeJS.Timeout;

onMounted(() => {
  notificationsStore.fetchNotifications();
  notificationsStore.fetchUnreadCount();

  // Her 30 saniyede bir unread count güncelle
  intervalId = setInterval(() => {
    notificationsStore.fetchUnreadCount();
  }, 30000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    notificationsStore.fetchNotifications();
  }
};

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.read) {
    await notificationsStore.markAsRead(notification.id);
  }

  isOpen.value = false;

  // Bildirim tipine göre yönlendirme
  if (notification.postId) {
    // Post detay sayfasına git (henüz yok, home'a git)
    router.push("/");
  } else if (notification.type === "FOLLOW") {
    // Takip eden kullanıcının profiline git
    router.push(`/user/${notification.sender.id}`);
  }
};

const handleMarkAllRead = async () => {
  await notificationsStore.markAllAsRead();
};

const getNotificationText = (type: string) => {
  switch (type) {
    case "LIKE":
      return "paylaşımını beğendi";
    case "COMMENT":
      return "paylaşımına yorum yaptı";
    case "FOLLOW":
      return "seni takip etti";
    default:
      return "";
  }
};

const getNotificationBadge = (type: string) => {
  switch (type) {
    case "LIKE":
      return "Beğeni";
    case "COMMENT":
      return "Yorum";
    case "FOLLOW":
      return "Takip";
    default:
      return "";
  }
};

const getNotificationBadgeClass = (type: string) => {
  switch (type) {
    case "LIKE":
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
    case "COMMENT":
      return "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400";
    case "FOLLOW":
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
  }
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return d.toLocaleDateString("tr-TR");
};

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".relative")) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
