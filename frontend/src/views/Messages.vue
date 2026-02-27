<template>
  <!-- ANA KONTEYNER: Ekranın kalan tüm yüksekliğini kaplar ve taşmayı engeller -->
  <div class="flex h-screen bg-[#fdfdff] dark:bg-[#0b0f19] overflow-hidden font-sans relative">
    
    <!-- SOL PANEL: SOHBET LİSTESİ -->
    <aside 
      class="w-full md:w-[250px] lg:w-[280px] flex-shrink-0 border-r border-slate-200/60 dark:border-white/5 flex flex-col bg-white dark:bg-[#0f172a]/40 backdrop-blur-xl transition-all duration-300 h-full"
      :class="{ 'hidden md:flex': chatStore.activeConversation }"
    >
      <!-- Liste Header -->
      <div class="p-6 pb-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            Sohbetler
          </h2>
        </div>
        <div class="relative group">
          <input 
            type="text" 
            placeholder="Kişilerde ara..." 
            class="w-full bg-slate-100/50 dark:bg-white/5 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-slate-900 dark:text-white"
          />
          <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Sohbet Listesi -->
      <div class="flex-1 overflow-y-auto px-3 pb-6 space-y-1 custom-scrollbar">
        <div v-if="chatStore.loading && !chatStore.conversations.length" class="space-y-2">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-4 animate-pulse bg-slate-50 dark:bg-white/5 rounded-2xl">
            <div class="w-12 h-12 bg-slate-200 dark:bg-white/10 rounded-full"></div>
            <div class="flex-1 space-y-2"><div class="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/3"></div><div class="h-2 bg-slate-200 dark:bg-white/10 rounded w-2/3"></div></div>
          </div>
        </div>
        <div v-else-if="!chatStore.conversations.length" class="py-20 text-center px-6">
          <div class="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-white/10">
            <svg class="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <p class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Henüz mesaj yok</p>
        </div>
        <button
          v-for="conv in chatStore.conversations"
          :key="conv.id"
          @click="chatStore.selectConversation(conv.otherParticipant?.id)"
          class="w-full p-4 flex items-center gap-4 rounded-2xl transition-all duration-300 relative border border-transparent group"
          :class="chatStore.activeConversation?.id === conv.id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5'"
        >
          <div class="relative flex-shrink-0">
            <img v-if="conv.otherParticipant?.avatarUrl" :src="conv.otherParticipant.avatarUrl" class="w-13 h-13 rounded-2xl object-cover shadow-md transition-transform group-hover:scale-105" />
            <div v-else class="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">{{ conv.otherParticipant?.username?.charAt(0).toUpperCase() }}</div>
          </div>
          <div class="flex-1 min-w-0 text-left">
            <div class="flex justify-between items-center mb-1">
              <h3 class="text-[15px] font-bold text-slate-900 dark:text-white truncate tracking-tight">{{ conv.otherParticipant?.fullName || conv.otherParticipant?.username }}</h3>
              <span v-if="conv.lastMessage" class="text-[10px] font-medium text-slate-400 whitespace-nowrap">{{ formatTime(conv.lastMessage.createdAt) }}</span>
            </div>
            <p class="text-sm truncate text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span v-if="Number(conv.lastMessage?.senderId) === currentUserId" class="text-indigo-500 font-bold text-[11px] uppercase tracking-wider">Sen:</span>
              {{ conv.lastMessage?.content ? decrypt(conv.lastMessage.content) : 'Sohbeti başlat...' }}
            </p>
          </div>
          <div v-if="conv.lastMessage && !conv.lastMessage.isRead && Number(conv.lastMessage.senderId) !== currentUserId" class="w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/50 absolute right-4 bottom-7 animate-pulse"></div>
        </button>
      </div>
    </aside>

    <!-- SAĞ PANEL: MESAJLAŞMA ALANI -->
    <main class="flex-1 flex flex-col bg-white dark:bg-[#0b0f19] relative h-full">
      <div v-if="chatStore.activeConversation" class="flex flex-col h-full overflow-hidden">
        <!-- Header -->
        <header class="h-20 px-8 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl z-20 flex-shrink-0">
          <div class="flex items-center gap-4">
            <button @click="chatStore.activeConversation = null" class="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div class="flex items-center gap-4">
              <div class="relative">
                <img v-if="otherUser?.avatarUrl" :src="otherUser.avatarUrl" class="w-11 h-11 rounded-2xl object-cover shadow-sm" />
                <div v-else class="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">{{ otherUser?.username?.charAt(0).toUpperCase() }}</div>
                <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0b0f19] rounded-full"></div>
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white leading-tight">{{ otherUser?.fullName || otherUser?.username }}</h3>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative">
              <button @click="showMoreMenu = !showMoreMenu" class="p-2 md:p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all" title="Daha Fazla"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg></button>
              <div v-if="showMoreMenu" class="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-xl z-50 py-3 animate-in fade-in zoom-in-95 duration-200">
                <button @click="viewProfile" class="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3"><svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Profili Gör</button>
                <button @click="openReportModal" class="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3"><svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>Şikayet Et</button>
                <button @click="openBlockConfirm" class="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{{ chatStore.activeConversation?.isBlockedByMe ? "Engeli Kaldır" : "Engelle" }}</button>
                <div class="h-px bg-slate-100 dark:bg-white/5 my-2"></div>
                <div class="px-4 py-1"><p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sohbet Rengi</p><div class="grid grid-cols-6 gap-2"><button v-for="theme in themes" :key="theme.color" @click="setTheme(theme.color)" class="w-6 h-6 rounded-full transition-transform hover:scale-125 border-2 border-white dark:border-slate-800 shadow-sm" :style="{ backgroundColor: theme.color }" :title="theme.name"></button></div></div>
              </div>
            </div>
            <button @click="handleDeleteConversation" class="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all" title="Sohbeti Sil"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>
        </header>

        <!-- Mesajlar (Asıl scroll alanı burası) -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-6 py-8 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
          <div v-for="(msg, index) in chatStore.messages" :key="msg.id || index" class="flex flex-col" :class="isMyMessage(msg.senderId) ? 'items-end' : 'items-start'">
            <div v-if="shouldShowDate(index)" class="w-full flex justify-center my-8"><span class="px-4 py-1.5 bg-slate-200/50 dark:bg-white/5 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest backdrop-blur-sm">{{ formatFullDate(msg.createdAt) }}</span></div>
            <div class="group flex flex-col max-w-[85%] md:max-w-[70%]" :class="isMyMessage(msg.senderId) ? 'items-end' : 'items-start'">
              <div :class="['px-5 py-3.5 text-sm font-medium transition-all duration-300 shadow-sm relative', isMyMessage(msg.senderId) ? 'text-white rounded-3xl rounded-tr-none' : 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-slate-100 rounded-3xl rounded-tl-none border border-slate-100 dark:border-white/5']" :style="isMyMessage(msg.senderId) ? { backgroundColor: currentThemeColor } : {}">{{ decrypt(msg.content) }}</div>
              <div class="flex items-center gap-2 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{{ formatFullTime(msg.createdAt) }}</span>
                <div v-if="isMyMessage(msg.senderId)" class="flex items-center">
                  <svg v-if="msg.isRead" class="w-3.5 h-3.5" :style="{ color: currentThemeColor }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline><polyline points="22 10 13.5 21 9 16.5"></polyline></svg>
                  <svg v-else class="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Giriş Alanı (Zemine Tam Sabit) -->
        <footer class="p-4 md:p-6 bg-white dark:bg-[#0b0f19] border-t border-slate-200/60 dark:border-white/5 flex-shrink-0">
          <div v-if="chatStore.activeConversation?.isBlockedByMe || chatStore.activeConversation?.amIBlocked || chatStore.activeConversation?.isPrivateAndNotFollowing" class="max-w-4xl mx-auto flex items-center justify-center py-4 px-6 bg-slate-100 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
            <p class="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-3 italic">
              <svg v-if="chatStore.activeConversation?.isPrivateAndNotFollowing" class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <svg v-else class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <template v-if="chatStore.activeConversation?.isBlockedByMe">Bu kullanıcıyı engellediniz.</template>
              <template v-else-if="chatStore.activeConversation?.amIBlocked">Bu kullanıcı tarafından engellendiniz.</template>
              <template v-else-if="chatStore.activeConversation?.isPrivateAndNotFollowing">Bu hesap gizli. Mesaj göndermek için takip etmelisiniz.</template>
            </p>
          </div>
          <div v-else class="max-w-4xl mx-auto flex items-end gap-2 md:gap-3">
            <div class="flex-1 bg-slate-100/80 dark:bg-white/5 rounded-3xl border border-transparent focus-within:border-indigo-500/20 transition-all duration-300 flex items-end p-1.5 md:p-2 shadow-inner min-w-0">
              <div class="flex-shrink-0"><EmojiPicker :modelValue="messageInput" @update:modelValue="(e) => (messageInput += e)" class="mb-1.5 ml-1" /></div>
              <textarea v-model="messageInput" @input="handleTyping" @keydown.enter.prevent="handleSendMessage" placeholder="Bir mesaj yazın..." rows="1" class="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm md:text-[15px] font-medium py-2.5 px-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none max-h-40 overflow-y-auto"></textarea>
            </div>
            <button @click="handleSendMessage" :disabled="!messageInput.trim()" class="w-11 h-11 md:w-12 md:h-12 rounded-2xl text-white flex items-center justify-center transition-all shadow-lg active:scale-95 flex-shrink-0 mb-0.5 group" :style="{ backgroundColor: currentThemeColor, boxShadow: `0 10px 15px -3px ${currentThemeColor}40` }"><svg class="w-5 h-5 md:w-6 md:h-6 transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
          </div>
        </footer>
      </div>
      <!-- BOŞ EKRAN -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/20 dark:bg-transparent">
        <div class="relative mb-10"><div class="w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full flex items-center justify-center animate-pulse"></div><div class="absolute inset-0 flex items-center justify-center"><div class="w-28 h-28 bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-slate-100 dark:border-white/5"><svg class="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg></div></div></div>
        <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Sohbet Kutusu</h3>
        <p class="text-slate-500 dark:text-slate-400 max-w-sm font-medium leading-relaxed">Arkadaşlarınla konuşmaya başlamak için soldaki listeden birini seç veya profillerinden mesaj at.</p>
      </div>
    </main>

    <!-- MODALLAR (Report, Block, Delete) -->
    <div v-if="showReportModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4"><div class="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl" @click="showReportModal = false"></div><div class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-primary-900/20 relative z-10 animate-in zoom-in-95 duration-200"><div class="mb-6 flex items-center justify-between"><button v-if="reportStep === 2" @click="reportStep = 1" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button><div v-else class="w-9"></div><h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Şikayet Bildirimi</h3><button @click="showReportModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div><div v-if="reportStep === 1" class="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"><button v-for="(cat, name) in reportCategories" :key="name" @click="selectReportCategory(name)" class="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all text-left border border-transparent hover:border-blue-200"><span class="font-bold text-gray-900 dark:text-white text-sm">{{ name }}</span><svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button></div><div v-if="reportStep === 2" class="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">{{ selectedReportCategory }}</p><button v-for="reason in reportCategories[selectedReportCategory]" :key="reason" @click="submitReport(reason)" :disabled="reportLoading" class="w-full p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all text-left border border-transparent hover:border-red-200"><span class="font-bold text-gray-900 dark:text-white text-sm">{{ reason }}</span></button></div></div></div>
    <div v-if="showBlockModal" class="fixed inset-0 z-[110] flex items-center justify-center px-4"><div class="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl" @click="showBlockModal = false"></div><div class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-primary-900/20 relative z-10 animate-in zoom-in-95 duration-200"><div class="text-center mb-8"><div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><h3 class="text-xl font-black text-gray-900 dark:text-white">Emin misin?</h3><p class="text-xs text-gray-500 mt-2 leading-relaxed">{{ chatStore.activeConversation?.isBlockedByMe ? 'Bu kullanıcının engelini kaldırdığınızda size tekrar mesaj gönderebilir.' : 'Bu kullanıcıyı engellediniz. Size mesaj gönderemez ve paylaşımlarınızı göremez.' }}</p></div><div class="flex flex-col gap-3"><button @click="handleBlockToggle" class="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all">{{ chatStore.activeConversation?.isBlockedByMe ? "ENGELİ KALDIR" : "EVET, ENGELLE" }}</button><button @click="showBlockModal = false" class="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">VAZGEÇ</button></div></div></div>
    <div v-if="showDeleteModal" class="fixed inset-0 z-[110] flex items-center justify-center px-4"><div class="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl" @click="showDeleteModal = false"></div><div class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-primary-900/20 relative z-10 animate-in zoom-in-95 duration-200"><div class="text-center mb-8"><div class="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div><h3 class="text-xl font-black text-gray-900 dark:text-white">Sohbeti Sil?</h3><p class="text-xs text-gray-500 mt-2 leading-relaxed">Bu sohbeti sildiğinizde tüm mesaj geçmişi kalıcı olarak yok edilecektir. Bu işlem geri alınamaz.</p></div><div class="flex flex-col gap-3"><button @click="confirmDeleteConversation" class="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all">SOHBETİ KALICI OLARAK SİL</button><button @click="showDeleteModal = false" class="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">VAZGEÇ</button></div></div></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { useSocket } from "@/composables/useSocket";
import { useToast } from "vue-toastification";
import { useRouter, useRoute } from "vue-router";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import CryptoJS from "crypto-js";
import EmojiPicker from "@/components/EmojiPicker.vue";
import apiClient from "@/api/client";

const authStore = useAuthStore();
const chatStore = useChatStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const { sendMessage, sendTyping, isConnected } = useSocket();

const messageInput = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const showMoreMenu = ref(false);
const showBlockModal = ref(false);
const showDeleteModal = ref(false);
const secretKey = "fcb49253e8a693454e8d2309c1cdbdff5ccc1405ffbb5c48e93820d03f9628dc08b8e68b15c35f2186b6202008aac2f4417f025788fbc36772c2a0cfa7570cac";

// Temalar (Canlı Renkler)
const themes = [
  { name: 'Varsayılan', color: '#4f46e5' }, 
  { name: 'Kırmızı', color: '#e11d48' },      
  { name: 'Mavi', color: '#2563eb' },     
  { name: 'Sarı', color: '#eab308' },    
  { name: 'Yeşil', color: '#16a34a' },      
  { name: 'Mor', color: '#9333ea' },
];
const currentThemeColor = ref('#4f46e5');

const loadTheme = () => {
  if (chatStore.activeConversation?.themeColor) {
    currentThemeColor.value = chatStore.activeConversation.themeColor;
  } else {
    currentThemeColor.value = '#4f46e5';
  }
};

const setTheme = async (color: string) => {
  if (!chatStore.activeConversation) return;
  
  try {
    // 1. Backend'e kaydet
    await apiClient.post(`/chat/theme/${chatStore.activeConversation.id}`, { color });
    
    // 2. Yerel state'i güncelle
    currentThemeColor.value = color;
    chatStore.activeConversation.themeColor = color;
    
    // 3. Konuşma listesindeki rengi de güncelle (Opsiyonel ama şık olur)
    const conv = chatStore.conversations.find(c => c.id === chatStore.activeConversation?.id);
    if (conv) conv.themeColor = color;

    showMoreMenu.value = false;
    toast.success("Sohbet teması kalıcı olarak güncellendi ✨");
  } catch (error) {
    toast.error("Tema güncellenemedi.");
  }
};

// Şikayet Kategorileri
const reportCategories: Record<string, string[]> = {
  Nefret: ["Hakaretler", "Irkçı veya cinsiyetçi klişeler", "İnsanlıktan çıkarma", "Korku veya ayrımcılığa teşvik", "Nefret dolu göndermeler", "Nefret dolu semboller ve logolar"],
  "Taciz ve Rahatsızlık": ["Hakaret", "İstenmeyen Cinsel İçerik", "Açıkça Nesneleştirme", "İstenmeyen Yetişkinlere Yönelik İçerik", "Şiddet Olayını İnkar Etme", "Hedefli Taciz"],
  "Şiddet içeren konuşma": ["Şiddet Tehditleri", "Zarar Verme İsteği", "Şiddeti Yüceltme", "Şiddete Teşvik", "Şifreli Şiddete Teşvik"],
  "Çocuk Güvenliği": ["Çocuk cinsel istismarı", "Çocuk istismarına hazırlık", "Fiziksel çocuk istismarı", "Reşit olmayan kullanıcı"],
  Mahremiyet: ["Özel bilgileri paylaşmak", "Özel bilgileri paylaşmakla tehdit etmek", "Rızam olmadan özel görüntü paylaşımı", "İstemediğim görüntülerimin paylaşılması"],
  "Yasadışı Davranışlar": ["İnsan sömürüsü", "Cinsel hizmetler", "Uyuşturucu", "Silah", "Nesli tehlikede türler", "Yasadışı faaliyet aracılığı"],
  "İstenmeyen e-posta": ["Sahte etkileşim", "Dolandırıcılık", "Sahte hesaplar", "Zararlı bağlantılar"],
  "İntihar veya Zarar Verme": ["Kendine zarar vermeyi teşvik", "Destekleme", "Talimat vermek", "Strateji paylaşmak"],
  "Hassas veya Rahatsız Edici Medya": ["Grafik içerik", "Gereksiz kanlı sahneler", "Yetişkin çıplaklığı", "Şiddet içeren cinsel davranışlar", "Ölü birey tasviri"],
  Taklit: ["Başka biri gibi davranmak", "Kurallara uymayan parodi/hayran hesapları"],
  "Şiddet ve Nefret Dolu Varlıklar": ["Şiddet içeren aşırıcılık ve terörizm", "Nefret grupları ve ağları"],
  "Yurttaşlık Bütünlüğü": ["Seçmen katılımını engelleme", "Oy kullanmanın korkutulması", "Yanıltıcı içerik"],
};
const showReportModal = ref(false);
const reportStep = ref(1);
const selectedReportCategory = ref("");
const reportLoading = ref(false);
const openReportModal = () => { showMoreMenu.value = false; showReportModal.value = true; reportStep.value = 1; };
const selectReportCategory = (name: string) => { selectedReportCategory.value = name; reportStep.value = 2; };
const submitReport = async (subReason: string) => {
  if (!otherUser.value) return;
  reportLoading.value = true;
  try {
    await apiClient.post("/users/report", { reportedUsername: otherUser.value.username, reason: selectedReportCategory.value, subReason });
    toast.success("Şikayet iletildi! 🛡️");
    showReportModal.value = false;
  } catch { toast.error("Şikayet gönderilemedi."); } finally { reportLoading.value = false; }
};

const openBlockConfirm = () => { showMoreMenu.value = false; showBlockModal.value = true; };
const handleBlockToggle = async () => {
  if (!otherUser.value) return;
  showBlockModal.value = false;
  try {
    const res = await apiClient.post(`/users/${otherUser.value.id}/block`);
    if (chatStore.activeConversation) chatStore.activeConversation.isBlockedByMe = res.data.blocked;
    res.data.blocked ? toast.warning("Kullanıcı engellendi.") : toast.success("Engel kaldırıldı.");
    chatStore.fetchConversations();
  } catch { toast.error("İşlem başarısız."); }
};

const currentUserId = computed(() => authStore.userId);
const otherUser = computed(() => {
  if (!chatStore.activeConversation) return null;
  return chatStore.activeConversation.otherParticipant || chatStore.activeConversation.participants?.find((p: any) => Number(p.userId || p.id) !== currentUserId.value)?.user;
});
const viewProfile = () => { if (otherUser.value?.username) router.push(`/profile/${otherUser.value.username}`); };
const decrypt = (encryptedText: string) => {
  if (!encryptedText || !encryptedText.startsWith("U2FsdGVkX1")) return encryptedText || "";
  try { return CryptoJS.AES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8) || "🔒 Mesaj şifreli"; } catch { return encryptedText; }
};
const isMyMessage = (senderId: number | string) => Number(senderId) === currentUserId.value;
const handleSendMessage = () => {
  if (!messageInput.value.trim() || !chatStore.activeConversation || !currentUserId.value) return;
  if (chatStore.activeConversation.isBlockedByMe || chatStore.activeConversation.amIBlocked || chatStore.activeConversation.isPrivateAndNotFollowing) { 
    toast.error("Mesaj gönderilemedi."); 
    return; 
  }
  
  const otherId = otherUser.value?.id;
  if (!otherId) { 
    toast.error("Alıcı bulunamadı"); 
    return; 
  }

  // Mesajı şifrele ve gönder
  const encryptedContent = CryptoJS.AES.encrypt(messageInput.value.trim(), secretKey).toString();
  sendMessage(chatStore.activeConversation.id, encryptedContent, Number(otherId));
  
  // Kutuyu temizle
  messageInput.value = "";
  
  // Mesaj eklendiği için otomatik aşağı kayacak (watch chatStore.messages.length)
};
let typingTimeout: any = null;
const handleTyping = () => {
  if (!chatStore.activeConversation || !otherUser.value || chatStore.activeConversation.isBlockedByMe || chatStore.activeConversation.amIBlocked || chatStore.activeConversation.isPrivateAndNotFollowing) return;
  sendTyping(chatStore.activeConversation.id, Number(otherUser.value.id), true);
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => sendTyping(chatStore.activeConversation.id, Number(otherUser.value.id), false), 2000);
};
const scrollToBottom = () => nextTick(() => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; });
const handleDeleteConversation = () => { showMoreMenu.value = false; showDeleteModal.value = true; };
const confirmDeleteConversation = async () => {
  if (!chatStore.activeConversation) return;
  showDeleteModal.value = false;
  try { await chatStore.deleteConversation(chatStore.activeConversation.id); toast.success("Sohbet silindi."); } catch { toast.error("Silme işlemi başarısız."); }
};
const formatTime = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  return isToday(d) ? format(d, "HH:mm") : isYesterday(d) ? "Dün" : format(d, "dd.MM.yyyy");
};
const formatFullTime = (date: string) => format(new Date(date), "HH:mm");
const formatFullDate = (date: string) => {
  const d = new Date(date);
  return isToday(d) ? "Bugün" : isYesterday(d) ? "Dün" : format(d, "d MMMM yyyy", { locale: tr });
};
const shouldShowDate = (index: number) => {
  if (index === 0) return true;
  return !isSameDay(new Date(chatStore.messages[index - 1].createdAt), new Date(chatStore.messages[index].createdAt));
};

onMounted(() => {
  chatStore.fetchConversations();
  if (chatStore.activeConversation) loadTheme();
  if (route.query.userId) chatStore.selectConversation(Number(route.query.userId));
  scrollToBottom();
});
watch(() => route.query.userId, (id) => id && chatStore.selectConversation(Number(id)));
watch(() => chatStore.messages.length, scrollToBottom);
watch(() => chatStore.activeConversation, (val) => { if (val) { loadTheme(); setTimeout(scrollToBottom, 150); } });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.3); }
textarea::-webkit-scrollbar { display: none; }
.w-13 { width: 3.25rem; }
.h-13 { height: 3.25rem; }
</style>
