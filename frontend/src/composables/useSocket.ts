import { ref, onMounted, onUnmounted, watch } from "vue";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";

let socket: Socket | null = null;

export function useSocket() {
  const authStore = useAuthStore();
  const chatStore = useChatStore();
  const isConnected = ref(false);

  const connect = () => {
    // Zaten bağlı mı?
    if (socket && socket.connected) {
      console.log("✅ Socket already connected, resetting listeners");
      setupListeners();
      return;
    }

    // Token var mı?
    if (!authStore.token) {
      console.warn("⚠️ No token, skipping socket connection");
      return;
    }

    console.log("🔌 Connecting socket...");

    // VITE_API_URL yerine localhost:3000 fallback'i de ekliyoruz
    const socketUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

    socket = io(socketUrl, {
      auth: {
        token: `Bearer ${authStore.token}`,
      },
      transports: ["websocket", "polling"],
    });

    setupListeners();
  };

  const setupListeners = () => {
    if (!socket) return;

    // Eskileri temizle (Duplicate engellemek için)
    socket.off("connect");
    socket.off("disconnect");
    socket.off("connect_error");
    socket.off("new_message");
    socket.off("user_typing");

    socket.on("connect", () => {
      isConnected.value = true;
      console.log(`✅ Socket connected: ${socket?.id}`);
    });

    socket.on("disconnect", (reason) => {
      isConnected.value = false;
      console.log(`❌ Socket disconnected: ${reason}`);
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:", error);
    });

    // Yeni mesaj geldiğinde
    socket.on("new_message", (message: any) => {
      console.log("📩 New message received via socket:", message.content.substring(0, 20));
      
      const normalizedMessage = {
        ...message,
        senderId: Number(message.senderId),
        conversationId: Number(message.conversationId),
      };

      const activeConvId = chatStore.activeConversation?.id;
      if (activeConvId && Number(activeConvId) === Number(normalizedMessage.conversationId)) {
        chatStore.addMessage(normalizedMessage);
      }

      chatStore.fetchConversations();
    });

    socket.on("user_typing", (data: any) => {
      console.log("⌨️ User typing received:", data);
      if (data.conversationId) {
        chatStore.setTypingStatus(Number(data.conversationId), data.isTyping);
      }
    });

    (window as any).socket = socket;
  };

  const disconnect = () => {
    if (socket) {
      console.log("🔌 Disconnecting socket...");
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
      (window as any).socket = null;
      isConnected.value = false;
    }
  };

  const sendMessage = (conversationId: number, content: string, receiverId: number) => {
    if (!socket || !socket.connected) {
      console.error("❌ Socket not connected");
      return;
    }

    console.log("📤 Sending message:", { conversationId, content: content.substring(0, 20), receiverId });

    socket.emit("send_message", {
      conversationId,
      content,
      receiverId,
    });
  };

  const sendTyping = (conversationId: number, receiverId: number, isTyping: boolean) => {
    if (!socket || !socket.connected) return;

    socket.emit("typing", {
      conversationId,
      receiverId,
      isTyping,
    });
  };

  // Auth state değiştiğinde socket'i yeniden bağla
  watch(() => authStore.isAuthenticated, (newValue) => {
    if (newValue) {
      connect();
    } else {
      disconnect();
    }
  });

  onMounted(() => {
    if (authStore.isAuthenticated) {
      connect();
    }
  });

  onUnmounted(() => {
    // Component unmount olduğunda listener'ları temizle
    socket?.removeAllListeners();
  });

  return {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
  };
}

// Global type definition
declare global {
  interface Window {
    socket: Socket | null;
  }
}
