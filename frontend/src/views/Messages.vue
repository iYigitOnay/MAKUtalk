<!-- src/views/Messages.vue -->
<template>
  <div class="flex h-[100dvh] bg-[#fdfdff] dark:bg-[#0b0f19] overflow-hidden font-sans relative text-left">
    
    <!-- SOL PANEL: SOHBET LİSTESİ -->
    <aside 
      class="w-full md:w-[250px] lg:w-[300px] flex-shrink-0 border-r border-slate-200/60 dark:border-white/5 flex flex-col bg-white dark:bg-[#0f172a]/40 backdrop-blur-xl transition-all h-full"
      :class="{ 'hidden md:flex': chatStore.activeConversation }"
    >
      <div class="p-6 pb-4">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-6">Sohbetler</h2>
        <div class="relative group mb-4">
          <input v-model="searchQuery" type="text" placeholder="Kişilerde ara..." class="w-full bg-slate-100/50 dark:bg-white/5 border-none rounded-2xl py-3 px-11 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-slate-900 dark:text-white shadow-inner" />
          <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div class="flex p-1 bg-slate-100/50 dark:bg-white/5 rounded-2xl mb-2">
          <button @click="activeTab = 'chats'" class="flex-1 py-2 text-xs font-bold rounded-xl transition-all" :class="activeTab === 'chats' ? 'bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">Sohbetler</button>
          <button @click="activeTab = 'requests'" class="flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2" :class="activeTab === 'requests' ? 'bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">İstekler<span v-if="pendingRequestsCount > 0" class="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white animate-pulse">{{ pendingRequestsCount }}</span></button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto px-3 pb-6 space-y-1 custom-scrollbar">
        <button v-for="conv in filteredConversations" :key="conv.id" @click="conv.otherParticipant?.id && chatStore.selectConversation(conv.otherParticipant.id)" class="w-full p-4 flex items-center gap-4 rounded-2xl transition-all border border-transparent group text-left" :class="chatStore.activeConversation?.id === conv.id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5'">
          <div class="relative flex-shrink-0 w-12 h-12">
            <img v-if="conv.otherParticipant?.avatarUrl" :src="getImageUrl(conv.otherParticipant.avatarUrl)" class="w-full h-full rounded-full object-cover shadow-sm" />
            <div v-else class="w-full h-full rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">{{ conv.otherParticipant?.username?.charAt(0).toUpperCase() }}</div>
            <div v-if="chatStore.isUserOnline(conv.otherParticipant?.id)" class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm z-10"></div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">{{ conv.otherParticipant?.fullName || conv.otherParticipant?.username }}</h3>
            <p class="text-[11px] truncate mt-0.5"><span v-if="chatStore.typingUsers[conv.id]" class="text-indigo-500 font-bold animate-pulse italic">yazıyor...</span><span v-else class="text-slate-500 dark:text-slate-400"><template v-if="conv.lastMessage"><template v-if="Number(conv.lastMessage.senderId) === currentUserId"><span class="font-bold opacity-50 text-[9px]">SİZ:</span> {{ conv.lastMessage.content ? decrypt(conv.lastMessage.content) : (conv.lastMessage.mediaUrl ? '📎 Medya' : '🖼️ Gönderi') }}</template><template v-else-if="!conv.lastMessage.isRead"><span class="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] font-black animate-pulse">Yeni mesaj</span></template><template v-else>{{ conv.lastMessage.content ? decrypt(conv.lastMessage.content) : (conv.lastMessage.mediaUrl ? '📎 Medya' : '🖼️ Gönderi') }}</template></template><template v-else>Sohbeti başlat...</template></span></p>
          </div>
          <div v-if="!conv.isAccepted && !conv.isRejected && Number(conv.lastMessage?.senderId) !== currentUserId" class="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-lg"></div>
        </button>
      </div>
    </aside>

    <!-- SAĞ PANEL: MESAJLAŞMA -->
    <main class="flex-1 flex flex-col bg-white dark:bg-[#0b0f19] relative h-full transition-all duration-300 overflow-hidden" :class="{ 'fixed inset-0 z-[100] md:relative': chatStore.activeConversation }">
      <div v-if="chatStore.activeConversation" class="flex flex-col h-full overflow-hidden">
        <header class="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl z-20 flex-shrink-0 text-left">
          <div class="flex items-center gap-4">
            <button @click="chatStore.activeConversation = null" class="md:hidden p-2 bg-slate-100 dark:bg-white/5 rounded-xl"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="3" /></svg></button>
            <div class="flex items-center gap-3">
              <div class="relative">
                <img v-if="otherUser?.avatarUrl" :src="getImageUrl(otherUser.avatarUrl)" class="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover shadow-sm" />
                <div v-else class="w-10 h-10 md:w-11 md:h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">{{ otherUser?.username?.charAt(0).toUpperCase() }}</div>
                <div v-if="chatStore.isUserOnline(otherUser?.id)" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div><h3 class="text-sm md:text-base font-bold dark:text-white truncate max-w-[120px] md:max-w-none">{{ otherUser?.fullName || otherUser?.username }}</h3><p v-if="chatStore.isUserOnline(otherUser?.id)" class="text-[9px] text-emerald-500 font-bold flex items-center gap-1"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>Çevrimiçi</p></div>
            </div>
          </div>
          <div class="relative">
            <button @click="showMoreMenu = !showMoreMenu" class="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg></button>
            <div v-if="showMoreMenu" class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border dark:border-white/10 rounded-[1.5rem] shadow-2xl z-50 py-2 text-left animate-in fade-in zoom-in-95 duration-200">
              <button @click="viewProfile" class="w-full text-left px-4 py-2.5 text-sm font-bold dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3"><svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2.5"/></svg>Profili Gör</button>
              <button @click="openDeleteConfirm" class="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3"><svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2.5"/></svg>Sohbeti Sil</button>
            </div>
          </div>
        </header>

        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 md:px-6 py-8 space-y-4 custom-scrollbar bg-slate-50/20 dark:bg-transparent overflow-x-hidden">
          <div v-for="(msg, index) in chatStore.messages" :key="msg.id || index" class="flex flex-col space-y-1 w-full" :class="isMyMessage(msg.senderId) ? 'items-end' : 'items-start'">
            <div 
              class="max-w-[75%] sm:max-w-[70%] px-3 py-2 shadow-sm transition-all relative group flex flex-col min-w-[100px] break-all sm:break-words overflow-visible" 
              :class="isMyMessage(msg.senderId) ? 'text-white rounded-2xl rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl rounded-tl-none border dark:border-white/5 shadow-slate-200/50'" 
              :style="isMyMessage(msg.senderId) ? { background: `linear-gradient(135deg, ${currentThemeColor}, ${currentThemeColor}dd)` } : {}"
            >
              <!-- MESAJ MENÜSÜ (3 Nokta) -->
              <div class="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-20" :class="isMyMessage(msg.senderId) ? 'right-full mr-2' : 'left-full ml-2'">
                <div class="relative">
                  <button @click.stop="toggleMsgMenu(msg.id)" class="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 transition-colors bg-white dark:bg-slate-900 shadow-sm border dark:border-white/10"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg></button>
                  <div v-if="activeMsgMenu === msg.id" class="absolute bottom-full mb-2 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden text-left z-[30]" :class="isMyMessage(msg.senderId) ? 'right-0' : 'left-0'">
                    <button @click="copyMsgText(msg)" class="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">Kopyala</button>
                    <button @click="forwardMsg(msg)" class="w-full text-left px-4 py-2 text-[11px] font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 flex items-center gap-2">İlet</button>
                    <button @click="reportMsg(msg)" class="w-full text-left px-4 py-2 text-[11px] font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 flex items-center gap-2">Şikayet</button>
                    <button v-if="isMyMessage(msg.senderId)" @click="deleteMsg(msg)" class="w-full text-left px-4 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2">Sil</button>
                  </div>
                </div>
              </div>

              <div v-if="msg.sharedPost" class="mb-2"><SharedPostCard :post="msg.sharedPost" /></div>
              
              <!-- Media Content -->
              <div v-if="msg.mediaUrl" class="mb-2 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-white/10 min-h-[100px] flex items-center justify-center">
                <img v-if="msg.mediaType === 'IMAGE'" :src="getImageUrl(msg.mediaUrl)" class="w-full h-auto max-h-64 object-cover cursor-pointer hover:scale-[1.02] transition-transform" @click="openImage(msg.mediaUrl)" />
                <video v-else-if="msg.mediaType === 'VIDEO'" :src="getImageUrl(msg.mediaUrl)" controls class="w-full h-auto max-h-64"></video>
                <a v-else :href="getImageUrl(msg.mediaUrl)" target="_blank" download class="flex items-center gap-3 p-3">
                  <div class="p-2 bg-white/20 rounded-lg"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2"/></svg></div>
                  <span class="text-xs font-bold truncate">Dosya</span>
                </a>
              </div>

              <div v-if="msg.isForwarded" class="flex items-center gap-1 mb-1 opacity-50 text-[9px] font-black uppercase"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" stroke-width="2.5"/></svg>İletildi</div>
              <div v-if="msg.content" class="text-[14px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{{ decrypt(msg.content) }}</div>
              
              <div class="flex items-center justify-end gap-1 mt-1.5 opacity-100 self-end h-3 text-white">
                <span class="text-[8px] font-bold uppercase tracking-wider opacity-40 group-hover:opacity-100 transition-opacity duration-300">{{ formatTime(msg.createdAt) }}</span>
                <div v-if="isMyMessage(msg.senderId)" class="flex items-center">
                  <div v-if="msg.isRead" class="flex -space-x-1.5"><svg class="w-2.5 h-2.5 text-white drop-shadow-[0_0_5px_white]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="6"><path d="M20 6L9 17l-5-5"/></svg><svg class="w-2.5 h-2.5 text-white drop-shadow-[0_0_5px_white]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="6"><path d="M20 6L9 17l-5-5"/></svg></div>
                  <svg v-else class="w-2.5 h-2.5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="5"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Area -->
        <div v-if="selectedFile" class="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t dark:border-white/5 animate-in slide-in-from-bottom duration-300">
          <div class="relative w-20 h-20"><img v-if="filePreviewUrl && isImage" :src="filePreviewUrl" class="w-full h-full object-cover rounded-xl border-2 border-indigo-500 shadow-lg" /><div v-else class="w-full h-full bg-slate-200 dark:bg-white/10 rounded-xl flex items-center justify-center text-indigo-500 border-2 border-indigo-500"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2"/></svg></div><button @click="clearFile" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="3"/></svg></button></div>
        </div>

        <footer class="p-4 md:p-6 bg-white dark:bg-[#0b0f19] border-t dark:border-white/5 flex-shrink-0">
          <div v-if="chatStore.activeConversation.isAccepted || chatStore.activeConversation.isFriend" class="max-w-4xl mx-auto flex items-center gap-3">
            <input type="file" ref="fileInput" class="hidden" @change="handleFileSelect" accept="image/*,video/*,.pdf,.doc,.docx,.txt" />
            <button @click="$refs.fileInput.click()" class="p-3 text-slate-400 hover:text-indigo-500 transition-all"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke-width="2"/></svg></button>
            <div class="flex-1 bg-slate-100/80 dark:bg-white/5 rounded-3xl p-2 flex items-center shadow-inner border border-transparent transition-all min-w-0 relative">
              <div class="flex-shrink-0 flex items-center"><EmojiPicker :modelValue="messageInput" @update:modelValue="(e) => (messageInput += e)" class="ml-1" /></div>
              <textarea v-model="messageInput" @input="handleTyping" @keydown.enter.prevent="handleSendMessage()" placeholder="Mesaj..." rows="1" maxlength="1000" class="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2.5 px-2 text-slate-900 dark:text-white resize-none max-h-40 overflow-y-auto shadow-none outline-none"></textarea>
            </div>
            <button @click="handleSendMessage()" :disabled="(!messageInput.trim() && !selectedFile) || isUploading" class="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all flex-shrink-0 group relative overflow-hidden" :style="{ background: `linear-gradient(135deg, ${currentThemeColor}, ${currentThemeColor}dd)` }">
              <div v-if="isUploading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <svg v-else class="w-5 h-5 transform rotate-[-10deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M3.4 20.4l17.45-8.48a1 1 0 000-1.84L3.4 1.6a1 1 0 00-1.39 1.3l2.32 9.1h9.17a.5.5 0 010 1H4.33l-2.32 9.1a1 1 0 001.39 1.3z"/></svg>
            </button>
          </div>
          <div v-else class="text-center py-4 opacity-50"><p class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Sohbet için onay bekleniyor.</p></div>
        </footer>
      </div>
      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10 dark:bg-transparent overflow-hidden">
        <div class="w-32 h-32 bg-indigo-50 dark:bg-white/5 rounded-[3rem] flex items-center justify-center mb-6 shadow-inner"><svg class="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-width="2" /></svg></div>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic text-center">Sohbetlerin</h3>
        <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium max-w-xs text-center leading-relaxed">Buradan arkadaşlarınla veya ilan sahipleriyle iletişime geçebilirsin.</p>
      </div>
    </main>

    <!-- PREMIUM IMAGE LIGHTBOX (GÖRSEL ÖNİZLEME) -->
    <Transition name="fade">
      <div v-if="lightBoxImage" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-12" @click="lightBoxImage = null">
        <button class="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="3"/></svg></button>
        <img :src="getImageUrl(lightBoxImage)" class="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" @click.stop />
      </div>
    </Transition>

    <DeleteConfirmModal :is-open="showDeleteModal" :is-deleting="deletingConv" title="SOHBETİ SİL" message="Bu sohbeti sildiğinizde tüm mesaj geçmişi kalıcı olarak yok edilecektir." confirm-text="EVET, SİSTEMDEN SİL" @confirm="confirmDeleteConversation" @cancel="showDeleteModal = false" />
    <ForwardModal :is-open="showForwardModal" :content="forwardContent" @close="showForwardModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { useSocket } from "@/composables/useSocket";
import { useToast } from "vue-toastification";
import { useRoute, useRouter } from "vue-router";
import CryptoJS from "crypto-js";
import apiClient from "@/api/client";
import EmojiPicker from "@/components/EmojiPicker.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import SharedPostCard from "@/components/SharedPostCard.vue";
import ForwardModal from "@/components/ForwardModal.vue";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const authStore = useAuthStore();
const chatStore = useChatStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const { sendMessage, sendTyping, sendMarkRead } = useSocket();

const activeTab = ref('chats');
const searchQuery = ref("");
const messageInput = ref("");
const activeMsgMenu = ref<number | null>(null);
const toggleMsgMenu = (id: number) => { activeMsgMenu.value = activeMsgMenu.value === id ? null : id; };

const copyMsgText = (msg: any) => { navigator.clipboard.writeText(decrypt(msg.content)); toast.success("Mesaj kopyalandı! 📋"); activeMsgMenu.value = null; };
const deleteMsg = async (msg: any) => { try { await apiClient.delete(`/chat/message/${msg.id}`); chatStore.messages = chatStore.messages.filter(m => m.id !== msg.id); toast.success("Mesaj silindi."); } catch { toast.error("Hata!"); } activeMsgMenu.value = null; };
const reportMsg = async (msg: any) => { try { await apiClient.post("/users/report", { reportedUserId: msg.senderId, reportedMessageId: msg.id, reason: "DM Mesajı", subReason: "Özel mesaj şikayeti." }); toast.warning("Mesaj moderasyona bildirildi! 🛡️"); } catch { toast.error("Hata!"); } activeMsgMenu.value = null; };

const showForwardModal = ref(false);
const forwardContent = ref("");
const forwardMsg = (msg: any) => { forwardContent.value = msg.content; showForwardModal.value = true; activeMsgMenu.value = null; };

const formatTime = (dateStr: string) => { if (!dateStr) return ""; try { return format(new Date(dateStr), 'HH:mm', { locale: tr }); } catch { return ""; } };

const filteredConversations = computed(() => chatStore.conversations.filter(conv => {
  const name = (conv.otherParticipant?.fullName || conv.otherParticipant?.username || '').toLowerCase();
  const matchesSearch = name.includes(searchQuery.value.toLowerCase());
  const isIncomingRequest = !conv.isAccepted && !conv.isRejected && Number(conv.lastMessage?.senderId) !== currentUserId.value;
  return activeTab.value === 'chats' ? (matchesSearch && (conv.isAccepted || !isIncomingRequest)) : (matchesSearch && isIncomingRequest);
}));

const pendingRequestsCount = computed(() => chatStore.conversations.filter(conv => !conv.isAccepted && !conv.isRejected && Number(conv.lastMessage?.senderId) !== currentUserId.value).length);

const showMoreMenu = ref(false);
const showDeleteModal = ref(false);
const deletingConv = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const secretKey = "fcb49253e8a693454e8d2309c1cdbdff5ccc1405ffbb5c48e93820d03f9628dc08b8e68b15c35f2186b6202008aac2f4417f025788fbc36772c2a0cfa7570cac";

const getImageUrl = (path: string | undefined) => { if (!path) return ""; if (path.startsWith("http")) return path; const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api"; const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl; return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`; };
const themes = [{ name: 'Varsayılan', color: '#4f46e5' }, { name: 'Kırmızı', color: '#e11d48' }, { name: 'Mavi', color: '#2563eb' }, { name: 'Sarı', color: '#eab308' }, { name: 'Yeşil', color: '#16a34a' }, { name: 'Mor', color: '#9333ea' }];
const currentThemeColor = ref('#4f46e5');

const loadTheme = () => { if (chatStore.activeConversation?.themeColor) currentThemeColor.value = chatStore.activeConversation.themeColor; };
const setTheme = async (color: string) => { if (!chatStore.activeConversation) return; try { await apiClient.post(`/chat/theme/${chatStore.activeConversation.id}`, { color }); currentThemeColor.value = color; chatStore.activeConversation.themeColor = color; showMoreMenu.value = false; toast.success("Tema güncellendi ✨"); } catch { toast.error("Hata!"); } };

const decrypt = (encryptedText: string) => { if (!encryptedText || !encryptedText.startsWith("U2FsdGVkX1")) return encryptedText || ""; try { return CryptoJS.AES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8); } catch { return "🔒 Mesaj şifreli"; } };
const isMyMessage = (senderId: number | string) => Number(senderId) === authStore.userId;
const currentUserId = computed(() => authStore.userId);
const otherUser = computed(() => chatStore.activeConversation?.otherParticipant);

// --- MEDIA HANDLING ---
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const filePreviewUrl = ref<string | null>(null);
const isUploading = ref(false);
const isImage = computed(() => selectedFile.value?.type.startsWith('image/'));
const lightBoxImage = ref<string | null>(null);

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    if (isImage.value) filePreviewUrl.value = URL.createObjectURL(selectedFile.value);
  }
};

const clearFile = () => {
  selectedFile.value = null;
  if (filePreviewUrl.value) URL.revokeObjectURL(filePreviewUrl.value);
  filePreviewUrl.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const openImage = (url: string) => { lightBoxImage.value = url; };

const handleSendMessage = async (customText?: string) => {
  if (!chatStore.activeConversation) return;
  const text = typeof customText === 'string' ? customText : messageInput.value;
  if (!text.trim() && !selectedFile.value) return;

  let mediaUrl = undefined;
  let mediaType = undefined;

  if (selectedFile.value) {
    isUploading.value = true;
    try {
      const formData = new FormData();
      formData.append('file', selectedFile.value);
      const res = await apiClient.post('/chat/media/upload', formData);
      mediaUrl = res.data.url;
      mediaType = res.data.type;
    } catch (err: any) {
      console.error("Yükleme Hatası:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Dosya yüklenemedi.");
      isUploading.value = false;
      return;
    }
  }

  const encrypted = text.trim() ? CryptoJS.AES.encrypt(text.trim(), secretKey).toString() : undefined;
  sendMessage(chatStore.activeConversation.id, encrypted as any, Number(otherUser.value?.id), undefined, false, mediaUrl, mediaType);
  if (typeof customText !== 'string') messageInput.value = "";
  clearFile(); isUploading.value = false;
};

let typingTimeout: any = null;
const handleTyping = () => { if (!chatStore.activeConversation || !otherUser.value) return; sendTyping(chatStore.activeConversation.id, Number(otherUser.value.id), true); if (typingTimeout) clearTimeout(typingTimeout); typingTimeout = setTimeout(() => sendTyping(chatStore.activeConversation.id, Number(otherUser.value.id), false), 2000); };

const openDeleteConfirm = () => { showMoreMenu.value = false; showDeleteModal.value = true; };
const confirmDeleteConversation = async () => { if (!chatStore.activeConversation) return; deletingConv.value = true; try { await chatStore.deleteConversation(chatStore.activeConversation.id); showDeleteModal.value = false; toast.success("Silindi."); } catch { toast.error("Hata!"); } finally { deletingConv.value = false; } };

const viewProfile = () => { if (otherUser.value?.username) router.push(`/profile/${otherUser.value.username}`); };
const scrollToBottom = () => nextTick(() => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; });

onMounted(async () => {
  await chatStore.fetchConversations();
  if (route.query.conversationId) {
    const conv = chatStore.conversations.find(c => c.id === Number(route.query.conversationId));
    if (conv?.otherParticipant) await chatStore.selectConversation(conv.otherParticipant.id);
  } else if (route.query.userId) {
    await chatStore.selectConversation(Number(route.query.userId), route.query.fromSpot === 'true', Number(route.query.listingId));
  }
  loadTheme(); scrollToBottom();
  window.addEventListener('focus', () => chatStore.activeConversation?.id && sendMarkRead(chatStore.activeConversation.id));
});

watch(() => chatStore.messages.length, () => { scrollToBottom(); const activeId = chatStore.activeConversation?.id; if (activeId) { const lastMsg = chatStore.messages[chatStore.messages.length - 1]; if (lastMsg && Number(lastMsg.senderId) !== currentUserId.value) sendMarkRead(activeId); } });
watch(() => chatStore.activeConversation?.id, (newId) => { if (newId) { loadTheme(); setTimeout(scrollToBottom, 150); sendMarkRead(newId); } });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.1); border-radius: 10px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
