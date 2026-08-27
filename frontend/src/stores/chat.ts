import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "@/api/client";
import { useAuthStore } from "./auth";

export const useChatStore = defineStore("chat", () => {
  const authStore = useAuthStore();
  const conversations = ref<any[]>([]);
  const activeConversation = ref<any | null>(null);
  const messages = ref<any[]>([]);
  const loading = ref(false);
  const typingUsers = ref<Record<string, boolean>>({});
  const onlineUsers = ref<Set<string>>(new Set());
  const latestIncomingMessage = ref<any | null>(null);

  const setOnlineUsers = (userIds: string[]) => {
    onlineUsers.value = new Set(userIds);
  };

  const updateUserStatus = (userId: string, isOnline: boolean) => {
    if (isOnline) {
      onlineUsers.value.add(userId);
    } else {
      onlineUsers.value.delete(userId);
    }
  };

  const isUserOnline = (userId: string) => onlineUsers.value.has(userId);

  const setTypingStatus = (conversationId: string, isTyping: boolean) => {
    typingUsers.value[conversationId] = isTyping;
  };

  const unreadCount = computed(() => {
    return conversations.value.filter((conv) => {
      const lastMsg = conv.lastMessage;
      if (!lastMsg) return false;
      return !lastMsg.isRead && lastMsg.senderId !== authStore.userId;
    }).length;
  });

  const resetStore = () => {
    conversations.value = [];
    activeConversation.value = null;
    messages.value = [];
    loading.value = false;
    latestIncomingMessage.value = null;
  };

  const fetchConversations = async () => {
    try {
      loading.value = true;
      const response = await apiClient.get("/chat/conversations");
      conversations.value = response.data;
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      loading.value = false;
    }
  };

  const selectConversation = async (
    targetUserId: string,
    fromSpot: boolean = false,
    listingId?: string,
  ) => {
    if (!targetUserId) {
      console.warn("⚠️ Geçersiz targetUserId ile selectConversation çağrıldı.");
      return;
    }
    activeConversation.value = null;
    messages.value = [];

    try {
      loading.value = true;
      // fromSpot ve listingId bilgilerini API'ye gönderiyoruz (Güvenlik doğrulaması için)
      let url = `/chat/conversation/${targetUserId}?fromSpot=${fromSpot}`;
      if (listingId) url += `&listingId=${listingId}`;

      const convRes = await apiClient.get(url);
      activeConversation.value = convRes.data;

      // Eğer id "0" gelirse (Gizli hesap engeli), mesajları çekmeye çalışma
      if (
        activeConversation.value.id === "0" ||
        activeConversation.value.id === 0
      ) {
        loading.value = false;
        return;
      }

      const msgRes = await apiClient.get(
        `/chat/messages/${activeConversation.value.id}`,
      );
      messages.value = msgRes.data;

      await apiClient.post(`/chat/${activeConversation.value.id}/read`);

      const conv = conversations.value.find(
        (c) => c.id === activeConversation.value.id,
      );
      if (conv && conv.lastMessage) {
        conv.lastMessage.isRead = true;
      }
    } catch (error) {
      console.error("Select conversation error:", error);
    } finally {
      loading.value = false;
    }
  };

  const addMessage = (message: any) => {
    // Snowflake ID Güvenliği: Karşılaştırmayı her zaman string olarak yap
    const exists = messages.value.some(
      (m) => String(m.id) === String(message.id),
    );
    if (!exists) {
      messages.value.push(message);

      // ✅ KONUŞMA LİSTESİNİ ANLIK GÜNCELLE (State Management)
      const convIndex = conversations.value.findIndex(
        (c) => String(c.id) === String(message.conversationId),
      );
      if (convIndex !== -1) {
        conversations.value[convIndex].lastMessage = message;
        // Konuşmayı listenin en üstüne taşı
        const [updatedConv] = conversations.value.splice(convIndex, 1);
        conversations.value.unshift(updatedConv);
      }
    }
  };

  const markMessagesAsRead = (conversationId: string) => {
    // Aktif sohbetin mesajlarını güncelle
    messages.value = messages.value.map((msg) => {
      if (msg.conversationId === conversationId) {
        return { ...msg, isRead: true };
      }
      return msg;
    });

    // Konuşma listesindeki lastMessage'ı da güncelle
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (conv?.lastMessage) {
      conv.lastMessage.isRead = true;
    }
  };

  const acceptConversation = async (conversationId: string) => {
    await apiClient.post(`/chat/accept/${conversationId}`);
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (conv) conv.isAccepted = true;
    if (activeConversation.value?.id === conversationId) {
      activeConversation.value.isAccepted = true;
    }
  };

  const rejectConversation = async (conversationId: string) => {
    await apiClient.post(`/chat/reject/${conversationId}`);
    const conv = conversations.value.find((c) => c.id === conversationId);
    if (conv) { conv.isRejected = true; conv.isAccepted = false; }
    if (activeConversation.value?.id === conversationId) {
      activeConversation.value.isRejected = true;
      activeConversation.value.isAccepted = false;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await apiClient.post(`/chat/delete/${conversationId}`);
      conversations.value = conversations.value.filter(
        (c) => c.id !== conversationId,
      );
      if (activeConversation.value?.id === conversationId) {
        activeConversation.value = null;
        messages.value = [];
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateUserInChat = (userId: string, updates: any) => {
    conversations.value = conversations.value.map((conv) => {
      if (conv.participants) {
        conv.participants = conv.participants.map((p: any) =>
          p.id === userId ? { ...p, ...updates } : p,
        );
      }
      if (conv.lastMessage && conv.lastMessage.senderId === userId) {
        conv.lastMessage.sender = { ...conv.lastMessage.sender, ...updates };
      }
      return conv;
    });
    if (activeConversation.value && activeConversation.value.participants) {
      activeConversation.value.participants =
        activeConversation.value.participants.map((p: any) =>
          p.id === userId ? { ...p, ...updates } : p,
        );
    }
    messages.value = messages.value.map((msg) => {
      if (msg.senderId === userId && msg.sender)
        msg.sender = { ...msg.sender, ...updates };
      return msg;
    });
  };

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    unreadCount,
    latestIncomingMessage,
    resetStore,
    fetchConversations,
    selectConversation,
    addMessage,
    deleteConversation,
    updateUserInChat,
    typingUsers,
    setTypingStatus,
    markMessagesAsRead,
    acceptConversation,
    rejectConversation,
    onlineUsers,
    setOnlineUsers,
    updateUserStatus,
    isUserOnline,
  };
});
