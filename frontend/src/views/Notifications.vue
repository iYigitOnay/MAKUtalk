<!-- src/views/Notifications.vue -->
<template>
  <div
    class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen"
  >
    <!-- Header -->
    <div
      class="sticky top-0 z-10 backdrop-blur bg-gradient-to-b from-white/90 to-white/80 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-primary-950/50 border-b border-gray-200 dark:border-primary-900/30 p-4"
    >
      <div class="flex items-center justify-between">
        <div>
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            Bildirimler
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Senin için en son haberler
          </p>
        </div>

        <!-- Mark All as Read -->
        <button
          v-if="hasUnreadNotifications"
          @click="markAllAsRead"
          class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          Tümünü Okundu İşaretle
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
      ></div>
    </div>

    <!-- Notifications List -->
    <div
      v-else-if="notifications.length > 0"
      class="divide-y divide-gray-200 dark:divide-primary-900/20"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        @click="handleNotificationClick(notification)"
        class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-l-4 border-transparent hover:border-primary-500"
        :class="{
          'bg-primary-50 dark:bg-primary-900/10 border-primary-500':
            !notification.read,
        }"
      >
        <div class="flex gap-3">
          <!-- Avatar -->
          <img
            v-if="notification.sender?.avatarUrl"
            :src="notification.sender.avatarUrl"
            :alt="notification.sender.username"
            class="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div
            v-else
            class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
          >
            {{ notification.sender?.username?.charAt(0).toUpperCase() || "?" }}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-900 dark:text-white">
              <span class="font-bold">
                {{
                  notification.sender?.fullName || notification.sender?.username
                }}
              </span>
              <span
                v-if="notification.type === 'FOLLOW'"
                class="text-gray-600 dark:text-gray-400"
              >
                seni takip etmeye başladı
              </span>
              <span
                v-else-if="notification.type === 'LIKE'"
                class="text-gray-600 dark:text-gray-400"
              >
                gönderini beğendi
                <svg
                  class="w-4 h-4 text-red-500 inline"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </span>
              <span
                v-else-if="notification.type === 'COMMENT'"
                class="text-gray-600 dark:text-gray-400"
              >
                gönderine yorum yaptı
                <svg
                  class="w-4 h-4 text-primary-500 inline"
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
              </span>
            </p>

            <!-- Post Preview (if exists) -->
            <p
              v-if="notification.post"
              class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate"
            >
              "{{ notification.post.content }}"
            </p>

            <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {{ formatTime(notification.createdAt) }}
            </p>
          </div>

          <!-- Unread Indicator -->
          <div
            v-if="!notification.read"
            class="ml-2 w-3 h-3 rounded-full bg-primary-600 flex-shrink-0 mt-1"
            title="Okunmadı"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center h-64 text-center"
    >
      <svg
        class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 1118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <p class="text-gray-500 dark:text-gray-400">Henüz bildirim yok</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
        Başkalarının etkinlikleri burada görülecek
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useNotificationsStore } from "@/stores/notifications";

const router = useRouter();
const notificationsStore = useNotificationsStore();
const loading = ref(true);

const notifications = computed(() => notificationsStore.notifications);

const hasUnreadNotifications = computed(() =>
  notifications.value.some((n) => !n.read),
);

const formatTime = (date: string) => {
  const now = new Date();
  const created = new Date(date);
  const diff = now.getTime() - created.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "şu anda";
  if (minutes < 60) return `${minutes}d önce`;
  if (hours < 24) return `${hours}s önce`;
  if (days < 7) return `${days}g önce`;
  return created.toLocaleDateString("tr-TR");
};

const handleNotificationClick = async (notification: any) => {
  // Mark as read if unread
  if (!notification.read) {
    try {
      await notificationsStore.markAsRead(notification.id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  // Navigate based on notification type
  if (notification.postId) {
    router.push(`/post/${notification.postId}`);
  } else if (notification.type === "FOLLOW" && notification.sender) {
    router.push(`/profile/${notification.sender.id}`);
  }
};

const markAllAsRead = async () => {
  try {
    await notificationsStore.markAllAsRead();
  } catch (error) {
    console.error("Error marking all as read:", error);
  }
};

onMounted(async () => {
  try {
    await notificationsStore.fetchNotifications();
    await notificationsStore.fetchUnreadCount();
  } catch (error) {
    console.error("Error fetching notifications:", error);
  } finally {
    loading.value = false;
  }
});
</script>
