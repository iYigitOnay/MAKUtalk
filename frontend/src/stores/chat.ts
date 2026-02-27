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

  // Okunmamış sohbet sayısı
  const unreadCount = computed(() => {
    return conversations.value.filter(conv => {
      const lastMsg = conv.lastMessage;
      if (!lastMsg) return false;
      return !lastMsg.isRead && Number(lastMsg.senderId) !== Number(authStore.userId);
    }).length;
  });

  // KRITIK: Reset fonksiyonu - Logout'ta çağrılacak
  const resetStore = () => {
    console.log("🧹 Resetting chat store...");
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

  const selectConversation = async (targetUserId: number) => {
    // KRITIK: State temizle ÖNCE
    activeConversation.value = null;
    messages.value = [];

    try {
      loading.value = true;

      // 1. Konuşmayı getir/oluştur
      const convRes = await apiClient.get(`/chat/conversation/${targetUserId}`);
      activeConversation.value = convRes.data;

      // 2. Mesajları getir
      const msgRes = await apiClient.get(`/chat/messages/${activeConversation.value.id}`);
      
      // KRITIK: ID'leri number'a çevir
      messages.value = msgRes.data.map((msg: any) => ({
        ...msg,
        senderId: Number(msg.senderId),
        conversationId: Number(msg.conversationId),
      }));

    } catch (error) {
      console.error("Select conversation error:", error);
    } finally {
      loading.value = false;
    }
  };

  const addMessage = (message: any) => {
    // ID ve ConversationID'leri normalize et
    const normalizedMessage = {
      ...message,
      id: message.id, // Backend'den gelen asıl ID
      senderId: Number(message.senderId),
      conversationId: Number(message.conversationId),
    };

    console.log("📍 Adding message to store:", normalizedMessage.content.substring(0, 20));

    // Duplicate kontrolü (Asıl ID varsa ona göre, yoksa geçici bir kontrol)
    const exists = messages.value.some(m => m.id === normalizedMessage.id);
    
    if (!exists) {
      messages.value.push(normalizedMessage);
    }
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      await apiClient.post(`/chat/delete/${conversationId}`);
      
      // State'ten kaldır
      conversations.value = conversations.value.filter(c => c.id !== conversationId);
      
      // Aktif konuşma siliniyorsa temizle
      if (activeConversation.value?.id === conversationId) {
        activeConversation.value = null;
        messages.value = [];
      }
    } catch (error) {
      console.error("Delete conversation error:", error);
      throw error;
    }
  };

  // Canlı profil güncellemesi için chat bilgilerini tazele
  const updateUserInChat = (userId: number, updates: any) => {
    // 1. Konuşmalar listesini güncelle
    conversations.value = conversations.value.map(conv => {
      if (conv.participants) {
        conv.participants = conv.participants.map((p: any) => 
          Number(p.id) === userId ? { ...p, ...updates } : p
        );
      }
      // Son mesajın göndericisi güncellenen kullanıcı ise
      if (conv.lastMessage && Number(conv.lastMessage.senderId) === userId) {
        conv.lastMessage.sender = { ...conv.lastMessage.sender, ...updates };
      }
      return conv;
    });

    // 2. Aktif konuşmayı güncelle
    if (activeConversation.value && activeConversation.value.participants) {
      activeConversation.value.participants = activeConversation.value.participants.map((p: any) => 
        Number(p.id) === userId ? { ...p, ...updates } : p
      );
    }

    // 3. Mesajları güncelle
    messages.value = messages.value.map(msg => {
      if (Number(msg.senderId) === userId && msg.sender) {
        msg.sender = { ...msg.sender, ...updates };
      }
      return msg;
    });
  };

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    unreadCount,
    resetStore, // Export et
    fetchConversations,
    selectConversation,
    addMessage,
    deleteConversation,
    updateUserInChat,
  };
});
