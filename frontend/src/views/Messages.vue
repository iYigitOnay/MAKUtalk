<!-- src/views/Messages.vue -->
<template>
  <div class="flex h-screen bg-[#fdfdff] dark:bg-[#0b0f19] overflow-hidden font-sans relative text-left">
    
    <!-- SOL PANEL: SOHBET LİSTESİ -->
    <aside 
      class="w-full md:w-[250px] lg:w-[300px] flex-shrink-0 border-r border-slate-200/60 dark:border-white/5 flex flex-col bg-white dark:bg-[#0f172a]/40 backdrop-blur-xl transition-all h-full"
      :class="{ 'hidden md:flex': chatStore.activeConversation }"
    >
      <div class="p-6 pb-4">
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          Sohbetler
        </h2>
        <div class="relative group mb-4">
          <input v-model="searchQuery" type="text" placeholder="Kişilerde ara..." class="w-full bg-slate-100/50 dark:bg-white/5 border-none rounded-2xl py-3 px-11 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-slate-900 dark:text-white shadow-inner" />
          <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <!-- SEKMELER -->
        <div class="flex p-1 bg-slate-100/50 dark:bg-white/5 rounded-2xl mb-2">
          <button 
            @click="activeTab = 'chats'"
            class="flex-1 py-2 text-xs font-bold rounded-xl transition-all"
            :class="activeTab === 'chats' ? 'bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            Sohbetler
          </button>
          <button 
            @click="activeTab = 'requests'"
            class="flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            :class="activeTab === 'requests' ? 'bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            İstekler
            <span v-if="pendingRequestsCount > 0" class="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white animate-pulse">
              {{ pendingRequestsCount }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-3 pb-6 space-y-1 custom-scrollbar">
        <div v-if="chatStore.loading && !chatStore.conversations.length" class="space-y-2"><div v-for="i in 5" :key="i" class="flex items-center gap-4 p-4 animate-pulse bg-slate-50 dark:bg-white/5 rounded-2xl"><div class="w-12 h-12 bg-slate-200 dark:bg-white/10 rounded-xl"></div><div class="flex-1 space-y-2"><div class="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/3"></div><div class="h-2 bg-slate-200 dark:bg-white/10 rounded w-2/3"></div></div></div></div>
        
        <!-- BOŞ DURUM -->
        <div v-if="filteredConversations.length === 0 && !chatStore.loading" class="py-12 text-center opacity-40">
          <div class="text-4xl mb-3">💬</div>
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">
            {{ activeTab === 'chats' ? 'Sohbet bulunamadı' : 'Bekleyen istek yok' }}
          </p>
        </div>

        <button
          v-for="conv in filteredConversations"
          :key="conv.id"
          @click="chatStore.selectConversation(conv.otherParticipant?.id)"
          class="w-full p-4 flex items-center gap-4 rounded-2xl transition-all border border-transparent group text-left"
          :class="chatStore.activeConversation?.id === conv.id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5'"
        >
          <div class="relative flex-shrink-0 w-12 h-12">
            <img v-if="conv.otherParticipant?.avatarUrl" :src="conv.otherParticipant.avatarUrl" class="w-full h-full rounded-xl object-cover shadow-sm" />
            <div v-else class="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">{{ conv.otherParticipant?.username?.charAt(0).toUpperCase() }}</div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">{{ conv.otherParticipant?.fullName || conv.otherParticipant?.username }}</h3>
            <p class="text-xs truncate">
              <span v-if="chatStore.typingUsers[conv.id]" class="text-indigo-500 font-bold animate-pulse italic">yazıyor...</span>
              <span v-else class="text-slate-500 dark:text-slate-400">{{ conv.lastMessage?.content ? decrypt(conv.lastMessage.content) : 'Sohbeti başlat...' }}</span>
            </p>
          </div>
          <div v-if="!conv.isAccepted && !conv.isRejected && Number(conv.lastMessage?.senderId) !== currentUserId" class="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-lg"></div>
        </button>
      </div>
    </aside>

    <!-- SAĞ PANEL: MESAJLAŞMA -->
    <main class="flex-1 flex flex-col bg-white dark:bg-[#0b0f19] relative h-full">
      <div v-if="chatStore.activeConversation" class="flex flex-col h-full overflow-hidden">
        
        <!-- Header -->
        <header class="h-20 px-8 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl z-20 flex-shrink-0 text-left">
          <div class="flex items-center gap-4">
            <button @click="chatStore.activeConversation = null" class="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div class="flex items-center gap-4">
              <div class="relative">
                <img v-if="otherUser?.avatarUrl" :src="otherUser.avatarUrl" class="w-11 h-11 rounded-2xl object-cover shadow-sm border border-slate-100 dark:border-white/5" />
                <div v-else class="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">{{ otherUser?.username?.charAt(0).toUpperCase() }}</div>
                <div v-if="chatStore.activeConversation.canChat" class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0b0f19] rounded-full shadow-sm"></div>
              </div>
              <div class="text-left">
                <h3 class="text-base font-black text-slate-900 dark:text-white leading-tight">{{ otherUser?.fullName || otherUser?.username }}</h3>
                <transition name="fade">
                  <p v-if="chatStore.typingUsers[chatStore.activeConversation.id]" class="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5 mt-0.5 animate-pulse">yazıyor...</p>
                  <p v-else-if="chatStore.activeConversation.canChat" class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Sohbet Aktif</p>
                </transition>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="relative">
              <button @click="showMoreMenu = !showMoreMenu" class="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
              </button>
              <div v-if="showMoreMenu" class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/10 rounded-[2rem] shadow-2xl z-50 py-4 animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-left">
                <button @click="viewProfile" class="w-full text-left px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"><svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2.5" /></svg>Profili Gör</button>
                <button @click="openReportModal" class="w-full text-left px-6 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 flex items-center gap-3 transition-colors"><svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-width="2.5" /></svg>Şikayet Et</button>
                <button @click="openDeleteConfirm" class="w-full text-left px-6 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors"><svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2.5" /></svg>Sohbeti Sil</button>
                <div class="h-px bg-slate-100 dark:bg-white/5 my-3 mx-4"></div>
                <div class="px-6 pb-2"><p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 text-left">Renk Teması</p>
                  <div class="grid grid-cols-6 gap-2"><button v-for="t in themes" :key="t.color" @click="setTheme(t.color)" class="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 transition-transform hover:scale-125 shadow-sm" :style="{ backgroundColor: t.color }"></button></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Mesaj Alanı -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-6 py-8 space-y-4 custom-scrollbar bg-slate-50/20 dark:bg-transparent">
          
          <!-- KISITLAMA EKRANI (Gizli Hesap) -->
          <div v-if="!chatStore.activeConversation.canChat" class="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-500">
            <div class="w-20 h-20 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-inner">🔒</div>
            <h4 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3 italic">Gizli Profil</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs leading-relaxed">Bu kullanıcıya mesaj göndermek için önce onu takip etmelisiniz.</p>
            <button @click="viewProfile" class="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Profili Gör</button>
          </div>

          <!-- MESAJ İSTEĞİ PANELİ -->
          <div v-else-if="!chatStore.activeConversation.isAccepted && !chatStore.activeConversation.isRejected" class="flex flex-col items-center justify-center py-10 px-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-[3rem] border border-amber-100 dark:border-amber-900/30 mb-8 animate-in zoom-in-95 duration-500 text-center">
            <div class="w-16 h-16 bg-amber-500 text-white rounded-[1.5rem] flex items-center justify-center text-3xl mb-4 shadow-lg shadow-amber-500/30">✉️</div>
            <h4 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Mesaj İsteği</h4>
            
            <template v-if="Number(chatStore.messages[0]?.senderId) === currentUserId">
              <p class="text-xs text-slate-500 font-medium italic leading-relaxed">Onay bekleniyor. Mesajınız henüz ana kutuya düşmedi.</p>
            </template>
            
            <template v-else>
              <p class="text-xs text-slate-500 font-medium mb-6 leading-relaxed">Bu kullanıcı sizinle iletişime geçmek istiyor. Sohbeti başlatmak ister misiniz?</p>
              <div class="flex gap-3 w-full max-w-xs mx-auto">
                <button @click="handleRejectRequest" class="flex-1 py-3.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase text-red-500 active:scale-95 transition-all">Reddet</button>
                <button @click="handleAcceptRequest" class="flex-1 py-3.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20 active:scale-95">Kabul Et</button>
              </div>
            </template>
          </div>

          <!-- Reddedilmiş İstek -->
          <div v-if="chatStore.activeConversation.isRejected" class="flex flex-col items-center justify-center py-12 px-6 opacity-60 text-center">
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">🚫</div>
            <p class="text-xs font-black text-red-500 uppercase tracking-widest">{{ Number(chatStore.messages[0]?.senderId) === currentUserId ? 'İsteğiniz reddedildi.' : 'Bu isteği reddettiniz.' }}</p>
          </div>

          <!-- Mesaj Balonları -->
          <div v-for="(msg, index) in chatStore.messages" :key="msg.id || index" class="flex flex-col" :class="isMyMessage(msg.senderId) ? 'items-end' : 'items-start'">
            <div class="max-w-[85%] md:max-w-[70%] px-5 py-3.5 text-sm font-medium rounded-3xl shadow-sm transition-all" :class="isMyMessage(msg.senderId) ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-white/5'" :style="isMyMessage(msg.senderId) ? { backgroundColor: currentThemeColor } : {}">
              {{ decrypt(msg.content) }}
            </div>
          </div>
        </div>

        <!-- Giriş Altlığı -->
        <footer class="p-4 md:p-6 bg-white dark:bg-[#0b0f19] border-t border-slate-200/60 dark:border-white/5 flex-shrink-0">
          <div v-if="chatStore.activeConversation.isAccepted || chatStore.activeConversation.isFriend" class="max-w-4xl mx-auto flex items-end gap-3">
            <div class="flex-1 bg-slate-100/80 dark:bg-white/5 rounded-3xl p-2 flex items-end shadow-inner border border-transparent focus-within:border-indigo-500/20 transition-all min-w-0">
              <div class="flex-shrink-0"><EmojiPicker :modelValue="messageInput" @update:modelValue="(e) => (messageInput += e)" class="mb-1.5 ml-1" /></div>
              <textarea v-model="messageInput" @input="handleTyping" @keydown.enter.prevent="handleSendMessage()" placeholder="Bir mesaj yazın..." rows="1" class="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2.5 px-2 text-slate-900 dark:text-white resize-none max-h-40"></textarea>
            </div>
            <button @click="handleSendMessage()" :disabled="!messageInput.trim()" class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all flex-shrink-0 mb-0.5" :style="{ backgroundColor: currentThemeColor }"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
          </div>
          <div v-else class="text-center py-4 opacity-50"><p class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Sohbet için onay bekleniyor.</p></div>
        </footer>
      </div>
      <!-- Boş Ekran -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10 dark:bg-transparent">
        <div class="w-32 h-32 bg-indigo-50 dark:bg-white/5 rounded-[3rem] flex items-center justify-center mb-6 shadow-inner animate-in zoom-in-95 duration-700 text-left"><svg class="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-width="2" /></svg></div>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic italic">Sohbetlerin</h3>
        <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium max-w-xs text-center leading-relaxed">Buradan arkadaşlarınla veya ilan sahipleriyle iletişime geçebilirsin.</p>
      </div>
    </main>

    <!-- ŞİKAYET MODALI (TAM ORİJİNAL) -->
    <div v-if="showReportModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl" @click="closeReportModal"></div>
      <div class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-primary-900/20 relative z-10 animate-in zoom-in-95 duration-200 text-left">
        <div class="mb-6 flex items-center justify-between">
          <button v-if="reportStep === 2" @click="reportStep = 1" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
          <div v-else class="w-9"></div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Şikayet Bildirimi</h3>
          <button @click="closeReportModal" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
        </div>
        <div v-if="reportStep === 1" class="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <button v-for="(cat, name) in reportCategories" :key="name" @click="selectReportCategory(name)" class="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all border border-transparent hover:border-blue-200 font-bold text-sm text-gray-900 dark:text-white text-left">{{ name }}<svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
        <div v-if="reportStep === 2" class="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2 italic text-left">{{ selectedReportCategory }}</p>
          <button v-for="reason in reportCategories[selectedReportCategory]" :key="reason" @click="submitReport(reason)" :disabled="reportLoading" class="w-full p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all border border-transparent hover:border-red-200 font-bold text-sm text-gray-900 dark:text-white text-left">{{ reason }}</button>
        </div>
      </div>
    </div>

    <!-- SOHBET SİL MODALI -->
    <DeleteConfirmModal :is-open="showDeleteModal" :is-deleting="deletingConv" title="SOHBETİ SİL" message="Bu sohbeti sildiğinizde tüm mesaj geçmişi kalıcı olarak yok edilecektir. Bu işlem geri alınamaz." confirm-text="EVET, SİSTEMDEN SİL" @confirm="confirmDeleteConversation" @cancel="showDeleteModal = false" />

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

const authStore = useAuthStore();
const chatStore = useChatStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const { sendMessage, sendTyping } = useSocket();

const activeTab = ref('chats'); // 'chats' | 'requests'
const searchQuery = ref("");
const messageInput = ref("");

const filteredConversations = computed(() => {
  return chatStore.conversations.filter(conv => {
    const other = conv.otherParticipant;
    const name = (other?.fullName || other?.username || '').toLowerCase();
    const matchesSearch = name.includes(searchQuery.value.toLowerCase());
    
    // KURAL: Eğer mesajı İLK atan kişi ben değilsem VE henüz onaylanmamışsa bu bir 'GELEN İSTEK'tir.
    const isIncomingRequest = !conv.isAccepted && !conv.isRejected && Number(conv.lastMessage?.senderId) !== currentUserId.value;

    if (activeTab.value === 'chats') {
      // Sohbetler: Onaylı olanlar + Benim başlattığım (Gelen istek olmayan) bekleyenler
      return matchesSearch && (conv.isAccepted || !isIncomingRequest);
    } else {
      // İstekler: Sadece bana gelen ve henüz onaylamadığım istekler
      return matchesSearch && isIncomingRequest;
    }
  });
});

const pendingRequestsCount = computed(() => {
  return chatStore.conversations.filter(conv => 
    !conv.isAccepted && !conv.isRejected && Number(conv.lastMessage?.senderId) !== currentUserId.value
  ).length;
});

const showMoreMenu = ref(false);
const showReportModal = ref(false);
const showDeleteModal = ref(false);
const deletingConv = ref(false);
const reportStep = ref(1);
const selectedReportCategory = ref("");
const reportLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const secretKey = "fcb49253e8a693454e8d2309c1cdbdff5ccc1405ffbb5c48e93820d03f9628dc08b8e68b15c35f2186b6202008aac2f4417f025788fbc36772c2a0cfa7570cac";

const themes = [{ name: 'Varsayılan', color: '#4f46e5' }, { name: 'Kırmızı', color: '#e11d48' }, { name: 'Mavi', color: '#2563eb' }, { name: 'Sarı', color: '#eab308' }, { name: 'Yeşil', color: '#16a34a' }, { name: 'Mor', color: '#9333ea' }];
const currentThemeColor = ref('#4f46e5');

const reportCategories: Record<string, string[]> = {
  Nefret: ["Hakaretler", "Irkçı veya cinsiyetçi klişeler", "İnsanlıktan çıkarma", "Korku veya ayrımcılığa teşvik"],
  "Taciz ve Rahatsızlık": ["Hakaret", "İstenmeyen Cinsel İçerik", "Açıkça Nesneleştirme", "Hedefli Taciz"],
  "Şiddet içeren konuşma": ["Şiddet Tehditleri", "Zarar Verme İsteği", "Şiddeti Yüceltme", "Şiddete Teşvik"],
  Mahremiyet: ["Özel bilgileri paylaşmak", "Rızam olmadan özel görüntü paylaşımı", "İstemediğim görüntülerimin paylaşılması"],
  "Yasadışı Davranışlar": ["İnsan sömürüsü", "Cinsel hizmetler", "Uyuşturucu", "Silah"],
  "İstenmeyen e-posta": ["Sahte etkileşim", "Dolandırıcılık", "Sahte hesaplar", "Zararlı bağlantılar"],
};

const loadTheme = () => { if (chatStore.activeConversation?.themeColor) currentThemeColor.value = chatStore.activeConversation.themeColor; };
const setTheme = async (color: string) => {
  if (!chatStore.activeConversation) return;
  try { await apiClient.post(`/chat/theme/${chatStore.activeConversation.id}`, { color }); currentThemeColor.value = color; chatStore.activeConversation.themeColor = color; showMoreMenu.value = false; toast.success("Tema güncellendi ✨"); } catch { toast.error("Hata!"); }
};

const openReportModal = () => { showMoreMenu.value = false; showReportModal.value = true; reportStep.value = 1; };
const closeReportModal = () => { showReportModal.value = false; };
const selectReportCategory = (name: string) => { selectedReportCategory.value = name; reportStep.value = 2; };
const submitReport = async (subReason: string) => {
  if (!otherUser.value) return;
  reportLoading.value = true;
  try { await apiClient.post("/users/report", { reportedUsername: otherUser.value.username, reason: selectedReportCategory.value, subReason }); toast.success("Şikayet iletildi! 🛡️"); closeReportModal(); } catch { toast.error("Hata!"); } finally { reportLoading.value = false; }
};

const decrypt = (encryptedText: string) => {
  if (!encryptedText || !encryptedText.startsWith("U2FsdGVkX1")) return encryptedText || "";
  try { return CryptoJS.AES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8); } catch { return "🔒 Mesaj şifreli"; }
};

const isMyMessage = (senderId: number | string) => Number(senderId) === authStore.userId;
const currentUserId = computed(() => authStore.userId);
const otherUser = computed(() => chatStore.activeConversation?.otherParticipant);

const handleSendMessage = (customText?: string) => {
  const text = typeof customText === 'string' ? customText : messageInput.value;
  if (!text.trim() || !chatStore.activeConversation) return;
  const encryptedContent = CryptoJS.AES.encrypt(text.trim(), secretKey).toString();
  sendMessage(chatStore.activeConversation.id, encryptedContent, Number(otherUser.value?.id));
  if (typeof customText !== 'string') messageInput.value = "";
};

let typingTimeout: any = null;
const handleTyping = () => {
  if (!chatStore.activeConversation || !otherUser.value) return;
  sendTyping(chatStore.activeConversation.id, Number(otherUser.value.id), true);
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => sendTyping(chatStore.activeConversation.id, Number(otherUser.value.id), false), 2000);
};

const handleAcceptRequest = async () => {
  if (!chatStore.activeConversation) return;
  try { await apiClient.post(`/chat/accept/${chatStore.activeConversation.id}`); chatStore.activeConversation.isAccepted = true; chatStore.activeConversation.canChat = true; toast.success("Mesaj isteği kabul edildi! ✨"); } catch { toast.error("İşlem başarısız."); }
};

const handleRejectRequest = async () => {
  if (!chatStore.activeConversation) return;
  try { await apiClient.post(`/chat/reject/${chatStore.activeConversation.id}`); chatStore.activeConversation.isRejected = true; toast.warning("Mesaj isteği reddedildi."); } catch { toast.error("İşlem başarısız."); }
};

const openDeleteConfirm = () => { showMoreMenu.value = false; showDeleteModal.value = true; };
const confirmDeleteConversation = async () => {
  if (!chatStore.activeConversation) return;
  deletingConv.value = true;
  try { await chatStore.deleteConversation(chatStore.activeConversation.id); showDeleteModal.value = false; toast.success("Sohbet silindi."); } catch { toast.error("Hata!"); } finally { deletingConv.value = false; }
};

const viewProfile = () => { if (otherUser.value?.username) router.push(`/profile/${otherUser.value.username}`); };
const scrollToBottom = () => nextTick(() => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; });

onMounted(async () => {
  await chatStore.fetchConversations();
  if (route.query.userId) {
    // listingId varsa onu da gönderiyoruz
    await chatStore.selectConversation(Number(route.query.userId), route.query.fromSpot === 'true', Number(route.query.listingId));
    if (route.query.initialMessage && chatStore.messages.length === 0) {
      setTimeout(() => handleSendMessage(route.query.initialMessage as string), 500);
    }
  }
  loadTheme();
  scrollToBottom();
});

watch(() => chatStore.messages.length, scrollToBottom);
watch(() => chatStore.activeConversation, (val) => { if (val) { loadTheme(); setTimeout(scrollToBottom, 150); } });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.1); border-radius: 10px; }
</style>
