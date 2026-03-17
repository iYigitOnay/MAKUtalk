import { ref, watch } from "vue";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { useNotificationsStore } from "@/stores/notifications";

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

    const socketUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";
    
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
      console.log("📥 Yeni mesaj geldi, liste güncelleniyor...");
      const normalizedMessage = {
        ...message,
        senderId: Number(message.senderId),
        conversationId: Number(message.conversationId),
      };

      // 1. Eğer mesajlaştığımız kişi ise mesaj listesine ekle
      const activeConvId = chatStore.activeConversation?.id;
      if (activeConvId && Number(activeConvId) === Number(normalizedMessage.conversationId)) {
        chatStore.addMessage(normalizedMessage);
      }

      // 2. Bildirim kartını göster (Benim göndermediğim mesajlar için)
      if (Number(normalizedMessage.senderId) !== Number(authStore.userId)) {
        notificationsStore.pushLiveNotification({
          liveId: `msg-${message.id}-${Date.now()}`, // ID bazlı tekillik
          displayType: "MESSAGE",
          type: "MESSAGE",
          sender: message.sender,
          content: message.content,
          conversationId: normalizedMessage.conversationId,
        });
      }

      // 3. Konuşma listesini güncelle (Sadece 1 kez çağrılmasını garanti et)
      debounceFetchConversations();
    });

    socket.on("new_notification", (notification: any) => {
      console.log(`🔔 Yeni bildirim: ${notification.type}`);
      // Çiftleme Kontrolü (Store içindeki listeye göre)
      const exists = notificationsStore.notifications.some(n => n.id === notification.id);
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
        content: notification.type === 'COMMENT' ? notification.comment?.content : notification.post?.content,
      });
    });

    socket.on("user_typing", (data: any) => {
      if (data.conversationId) {
        chatStore.setTypingStatus(Number(data.conversationId), data.isTyping);
      }
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

  const sendMessage = (conversationId: number, content: string, receiverId: number) => {
    if (!socket?.connected) {
      console.error("❌ Mesaj gönderilemedi: Soket bağlı değil.");
      return;
    }
    socket.emit("send_message", { conversationId, content, receiverId });
  };

  const sendTyping = (conversationId: number, receiverId: number, isTyping: boolean) => {
    if (!socket?.connected) return;
    socket.emit("typing", { conversationId, receiverId, isTyping });
  };

  // GLOBAL WATCHER: Auth durumu değiştikçe bağlan/kop
  // Bu watcher useSocket her çağrıldığında değil, uygulama ömrü boyunca sadece 1 kez kurulmalı
  if (!(window as any).__socket_watcher_installed) {
    watch(() => authStore.isAuthenticated, (val) => {
      val ? connect() : disconnect();
    }, { immediate: true });
    (window as any).__socket_watcher_installed = true;
  }

  return { isConnected, connect, disconnect, sendMessage, sendTyping };
}
