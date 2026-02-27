import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";

export interface Notification {
  id: number;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  recipientId: number;
  senderId: number;
  postId?: number;
  read: boolean;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
  post?: {
    id: number;
    content: string;
  };
}

export const useNotificationsStore = defineStore("notifications", () => {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const loading = ref(false);

  const fetchNotifications = async () => {
    loading.value = true;
    try {
      const response = await apiClient.get<Notification[]>("/notifications");
      notifications.value = response.data;
    } catch (error) {
      console.error("Notifications fetch error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get<number>(
        "/notifications/unread-count",
      );
      unreadCount.value = response.data;
    } catch (error) {
      console.error("Unread count fetch error:", error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      const notification = notifications.value.find(
        (n) => n.id === notificationId,
      );
      if (notification) {
        notification.read = true;
      }
      if (unreadCount.value > 0) {
        unreadCount.value--;
      }
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/notifications/mark-all-read");
      notifications.value.forEach((n) => (n.read = true));
      unreadCount.value = 0;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      notifications.value = notifications.value.filter(
        (n) => n.id !== notificationId,
      );
    } catch (error: any) {
      throw error.response?.data || error;
    }
  };

  // Bildirimlerdeki kullanıcı bilgilerini tazele (Canlı profil güncellemesi için)
  const updateUserInNotifications = (userId: number, updates: any) => {
    notifications.value = notifications.value.map(notification => {
      if (Number(notification.senderId) === userId && notification.sender) {
        notification.sender = { ...notification.sender, ...updates };
      }
      return notification;
    });
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateUserInNotifications,
  };
});
