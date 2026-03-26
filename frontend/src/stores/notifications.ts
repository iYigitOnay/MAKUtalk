import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/client";

export interface Notification {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "MESSAGE" | "MENTION"; // MESSAGE eklendi
  recipientId: string;
  senderId: string;
  postId?: string;
  read: boolean;
  content?: string; // Mesaj önizlemesi için eklendi
  conversationId?: string; // Mesaj yönlendirmesi için eklendi
  createdAt: string;
  sender: {
    id: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
  post?: {
    id: string;
    content: string;
  };
  comment?: {
    id: string;
    content: string;
  };
}

// Canlı bildirim kartı için basit tip
export interface LiveNotification extends Partial<Notification> {
  liveId: string; // Benzersiz geçici ID
  displayType: "MESSAGE" | "SYSTEM";
}

export const useNotificationsStore = defineStore("notifications", () => {
  const notifications = ref<Notification[]>([]);
  const activeNotifications = ref<LiveNotification[]>([]); // Sağ altta aktif görünen kartlar
  const unreadCount = ref(0);
  const loading = ref(false);

  // Yeni canlı bildirim ekle
  const pushLiveNotification = (notif: LiveNotification) => {
    console.log("📣 pushLiveNotification tetiklendi:", notif.type, notif.content);

    // Mükerrer kontrolü (Aynı liveId veya son 2 saniye içinde gelen birebir aynı bildirim)
    const isDuplicate = activeNotifications.value.some(n => 
                        n.type === notif.type && 
                        n.content === notif.content &&
                        n.senderId === notif.senderId &&
                        n.liveId.split('-').pop() === notif.liveId.split('-').pop()); // Zamana dayalı kontrol

    if (isDuplicate) {
      console.warn("⚠️ Mükerrer bildirim engellendi.");
      return;
    }

    // Listeye Ekle (Sistem bildirimi ise ana listeye de ekle)
    if (notif.displayType === "SYSTEM") {
       fetchUnreadCount();
       // Listede yoksa ekle
       if (notif.id && !notifications.value.some(n => n.id === notif.id)) {
          notifications.value.unshift(notif as Notification);
       }
    }

    activeNotifications.value.push(notif);
    // Not: Silme işlemi GlobalNotification.vue içerisindeki timerlar ile yönetiliyor.
  };

  const removeLiveNotification = (liveId: string) => {
    activeNotifications.value = activeNotifications.value.filter(n => n.liveId !== liveId);
  };

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

  const markAsRead = async (notificationId: string) => {
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

  const deleteNotification = async (notificationId: string) => {
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
  const updateUserInNotifications = (userId: string, updates: any) => {
    notifications.value = notifications.value.map(notification => {
      if (notification.senderId === userId && notification.sender) {
        notification.sender = { ...notification.sender, ...updates };
      }
      return notification;
    });
  };

  return {
    notifications,
    activeNotifications,
    unreadCount,
    loading,
    pushLiveNotification,
    removeLiveNotification,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateUserInNotifications,
  };
});

