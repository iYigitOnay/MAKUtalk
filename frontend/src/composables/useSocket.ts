import { ref, watch } from "vue";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { useNotificationsStore } from "@/stores/notifications";
import { usePostsStore } from "@/stores/posts";
import { useCategoriesStore } from "@/stores/categories";

// GLOBAL STATE - Fonksiyon dışında tanımlıyoruz ki her yerde AYNI kalsın
let socket: Socket | null = null;
const isConnected = ref(false);
let listenersAttached = false;

export function useSocket() {
  const authStore = useAuthStore();
  const chatStore = useChatStore();
  const notificationsStore = useNotificationsStore();

  const connect = () => {
    if (socket?.connected) return;

    if (!authStore.token) {
      console.warn("⚠️ Soket bağlantısı için token eksik.");
      return;
    }

    const socketUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:3000";

    socket = io(socketUrl, {
      auth: { token: `Bearer ${authStore.token}` },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    setupListeners();
  };

  const setupListeners = () => {
    if (!socket || listenersAttached) return;

    console.log("🔌 Soket dinleyicileri kuruluyor (Sadece 1 kez)...");

    socket.on("connect", () => {
      isConnected.value = true;
      console.log(`✅ Soket bağlandı: ${socket?.id}`);
    });

    socket.on("disconnect", (reason) => {
      isConnected.value = false;
      console.log(`❌ Soket koptu: ${reason}`);
      if (reason === "io server disconnect") {
        socket?.connect();
      }
    });

    socket.on("new_message", (message: any) => {
      console.log("📥 Yeni mesaj socketten geldi:", message);

      // TÜM ID'leri string'e zorla (Snowflake Güvenliği)
      const normalizedMessage = {
        ...message,
        id: String(message.id),
        senderId: String(message.senderId),
        conversationId: String(message.conversationId),
      };


      const activeConvId = chatStore.activeConversation?.id
        ? String(chatStore.activeConversation.id).trim()
        : null;
      const incomingConvId = normalizedMessage.conversationId.trim();

      console.log(
        `🧐 Karşılaştırma: Aktif=${activeConvId} | Gelen=${incomingConvId}`,
      );

      if (activeConvId && activeConvId === incomingConvId) {
        console.log("✅ Aktif sohbete mesaj eklendi.");
        chatStore.addMessage(normalizedMessage);
      } else {
        console.log(
          "ℹ️ Mesaj aktif olmayan bir sohbete geldi veya karşılaştırma başarısız.",
        );
      }

      if (normalizedMessage.senderId !== authStore.userId) {
        notificationsStore.pushLiveNotification({
          liveId: `msg-${message.id}-${Date.now()}`,
          displayType: "MESSAGE",
          type: "MESSAGE",
          sender: message.sender,
          content: message.content,
          conversationId: normalizedMessage.conversationId,
        });
      }

      debounceFetchConversations();
    });

    socket.on("new_notification", (notification: any) => {
      console.log(`🔔 Yeni bildirim: ${notification.type}`);
      const exists = notificationsStore.notifications.some(
        (n) => n.id === notification.id,
      );
      if (exists) return;

      notificationsStore.unreadCount++;
      notificationsStore.notifications.unshift(notification);

      // CANLI KART GÖSTERİMİ
      notificationsStore.pushLiveNotification({
        liveId: `notif-${notification.id}`,
        displayType: "SYSTEM",
        type: notification.type,
        sender: notification.sender,
        postId: notification.postId,
        comment: notification.comment, // Eksik olan bu kısımdı
        content:
          notification.type === "COMMENT"
            ? notification.comment?.content
            : notification.post?.content,
      });
    });

    socket.on("user_typing", (data: any) => {
      if (data.conversationId) {
        chatStore.setTypingStatus(data.conversationId, data.isTyping);
      }
    });

    socket.on("online_users", (userIds: string[]) => {
      console.log("👥 Mevcut çevrim içi kullanıcılar:", userIds);
      chatStore.setOnlineUsers(userIds);
    });

    socket.on("user_status", (data: { userId: string; isOnline: boolean }) => {
      console.log(
        `👤 Kullanıcı durumu değişti: ${data.userId} -> ${data.isOnline ? "ONLINE" : "OFFLINE"}`,
      );
      chatStore.updateUserStatus(data.userId, data.isOnline);
    });

    socket.on(
      "messages_read",
      (data: { conversationId: string; readByUserId: string }) => {
        console.log(`👁️ Okundu sinyali geldi: Conv ${data.conversationId}`);
        chatStore.markMessagesAsRead(data.conversationId);
      },
    );

    socket.on("new_post", (post: any) => {
      console.log("Yeni post socketten geldi:", post.id);

      const categoriesStore = useCategoriesStore();
      categoriesStore.fetchTrendingCategories();

      // KENDİ POSTUMUZ MU? (Kendi postumuzu zaten createPost içinde ekledik)
      // Snowflake ID'ler string olduğu için karşılaştırmayı trimleyerek yapıyoruz.
      const myId = authStore.userId ? String(authStore.userId).trim() : null;
      const authorId = post.authorId ? String(post.authorId).trim() : null;

      if (myId && authorId === myId) {
        console.log("ℹ️ Kendi postumuz, socket eklemesi atlanıyor.");
        return;
      }

      const postsStore = usePostsStore();
      const exists = postsStore.posts.some(
        (p) => String(p.id) === String(post.id),
      );
      if (!exists && !post.parentId) {
        postsStore.posts.unshift(post);
      }
    });

    socket.on("post_updated", (post: any) => {
      console.log("Post güncellendi:", post.id, post.processingStatus);
      const postsStore = usePostsStore();
      postsStore.updatePostLocally(String(post.id), post);

      const categoriesStore = useCategoriesStore();
      categoriesStore.fetchTrendingCategories();
    });

    listenersAttached = true;
    (window as any).socket = socket;
  };

  // 429 hatasını engellemek için istekleri limitleyen (debounce) mekanizma
  let fetchTimeout: any = null;
  const debounceFetchConversations = () => {
    if (fetchTimeout) clearTimeout(fetchTimeout);
    fetchTimeout = setTimeout(() => {
      console.log("🔄 API Tazeleniyor (Debounced fetchConversations)");
      chatStore.fetchConversations();
    }, 1500); // 1.5 saniye debounce (429 riskine karşı)
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      listenersAttached = false;
      isConnected.value = false;
    }
  };

  const sendMessage = (
    conversationId: string,
    content: string,
    receiverId: string,
    postId?: string,
    isForwarded: boolean = false,
    mediaUrl?: string,
    mediaType?: string,
    thumbnailUrl?: string,
  ) => {
    if (!socket?.connected) {
      console.error("❌ Mesaj gönderilemedi: Soket bağlı değil.");
      return;
    }
    socket.emit("send_message", {
      conversationId,
      content,
      receiverId,
      postId,
      isForwarded,
      mediaUrl,
      mediaType,
      thumbnailUrl,
    });
  };

  const sendTyping = (
    conversationId: string,
    receiverId: string,
    isTyping: boolean,
  ) => {
    if (!socket?.connected) return;
    socket.emit("typing", { conversationId, receiverId, isTyping });
  };

  const sendMarkRead = (conversationId: string) => {
    if (!socket?.connected) return;
    socket.emit("mark_read", { conversationId });
  };

  // GLOBAL WATCHER: Auth durumu değiştikçe bağlan/kop
  // Bu watcher useSocket her çağrıldığında değil, uygulama ömrü boyunca sadece 1 kez kurulmalı
  if (!(window as any).__socket_watcher_installed) {
    watch(
      () => authStore.isAuthenticated,
      (val) => {
        val ? connect() : disconnect();
      },
      { immediate: true },
    );
    (window as any).__socket_watcher_installed = true;
  }

  return {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    sendMarkRead,
  };
}
