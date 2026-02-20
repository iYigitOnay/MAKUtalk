<template>
  <div class="relative">
    <!-- Bell Icon Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition"
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
      class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[32rem] flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-bold text-gray-900">Bildirimler</h3>
        <button
          v-if="notificationsStore.unreadCount > 0"
          @click="handleMarkAllRead"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Tümünü Okundu İşaretle
        </button>
      </div>

      <!-- Notifications List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="notificationsStore.loading" class="p-8 text-center">
          <p class="text-gray-500">Yükleniyor...</p>
        </div>

        <div
          v-else-if="!notificationsStore.notifications.length"
          class="p-8 text-center"
        >
          <svg
            class="w-12 h-12 mx-auto text-gray-400 mb-3"
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
          <p class="text-gray-500">Henüz bildirim yok</p>
        </div>

        <div
          v-for="notification in notificationsStore.notifications"
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          :class="[
            'p-4 hover:bg-gray-50 cursor-pointer transition border-b last:border-b-0',
            !notification.read && 'bg-primary-50',
          ]"
        >
          <div class="flex items-start space-x-3">
            <div
              class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <span class="text-primary-700 font-semibold">
                {{ notification.sender.username.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">
                <span class="font-semibold">
                  {{
                    notification.sender.fullName || notification.sender.username
                  }}
                </span>
                {{ getNotificationText(notification.type) }}
              </p>
              <p
                v-if="notification.post"
                class="text-sm text-gray-500 mt-1 truncate"
              >
                "{{ notification.post.content }}"
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ formatDate(notification.createdAt) }}
              </p>
            </div>
            <div
              v-if="!notification.read"
              class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"
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
