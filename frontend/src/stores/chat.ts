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
  const typingUsers = ref<Record<number, boolean>>({});

  const setTypingStatus = (conversationId: number, isTyping: boolean) => {
    typingUsers.value[conversationId] = isTyping;
  };

  const unreadCount = computed(() => {
    return conversations.value.filter(conv => {
      const lastMsg = conv.lastMessage;
      if (!lastMsg) return false;
      return !lastMsg.isRead && Number(lastMsg.senderId) !== Number(authStore.userId);
    }).length;
  });

  const resetStore = () => {
    conversations.value = [];
    activeConversation.value = null;
    messages.value = [];
    loading.value = false;
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

  const selectConversation = async (targetUserId: number, fromSpot: boolean = false, listingId?: number) => {
    activeConversation.value = null;
    messages.value = [];

    try {
      loading.value = true;
      // fromSpot ve listingId bilgilerini API'ye gönderiyoruz (Güvenlik doğrulaması için)
      let url = `/chat/conversation/${targetUserId}?fromSpot=${fromSpot}`;
      if (listingId) url += `&listingId=${listingId}`;
      
      const convRes = await apiClient.get(url);
      activeConversation.value = convRes.data;

      // Eğer id 0 gelirse (Gizli hesap engeli), mesajları çekmeye çalışma
      if (activeConversation.value.id === 0) {
        loading.value = false;
        return;
      }

      const msgRes = await apiClient.get(`/chat/messages/${activeConversation.value.id}`);
      messages.value = msgRes.data.map((msg: any) => ({
        ...msg,
        senderId: Number(msg.senderId),
        conversationId: Number(msg.conversationId),
      }));

      await apiClient.post(`/chat/${activeConversation.value.id}/read`);
      
      const conv = conversations.value.find(c => c.id === activeConversation.value.id);
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
    const normalizedMessage = {
      ...message,
      senderId: Number(message.senderId),
      conversationId: Number(message.conversationId),
    };
    const exists = messages.value.some(m => m.id === normalizedMessage.id);
    if (!exists) messages.value.push(normalizedMessage);
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      await apiClient.post(`/chat/delete/${conversationId}`);
      conversations.value = conversations.value.filter(c => c.id !== conversationId);
      if (activeConversation.value?.id === conversationId) {
        activeConversation.value = null;
        messages.value = [];
      }
    } catch (error) { console.error(error); throw error; }
  };

  const updateUserInChat = (userId: number, updates: any) => {
    conversations.value = conversations.value.map(conv => {
      if (conv.participants) {
        conv.participants = conv.participants.map((p: any) => Number(p.id) === userId ? { ...p, ...updates } : p);
      }
      if (conv.lastMessage && Number(conv.lastMessage.senderId) === userId) {
        conv.lastMessage.sender = { ...conv.lastMessage.sender, ...updates };
      }
      return conv;
    });
    if (activeConversation.value && activeConversation.value.participants) {
      activeConversation.value.participants = activeConversation.value.participants.map((p: any) => Number(p.id) === userId ? { ...p, ...updates } : p);
    }
    messages.value = messages.value.map(msg => {
      if (Number(msg.senderId) === userId && msg.sender) msg.sender = { ...msg.sender, ...updates };
      return msg;
    });
  };

  return { conversations, activeConversation, messages, loading, unreadCount, resetStore, fetchConversations, selectConversation, addMessage, deleteConversation, updateUserInChat, typingUsers, setTypingStatus };
});
