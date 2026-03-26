<!-- src/views/Messages.vue -->
<template>
  <div class="flex h-[100dvh] bg-[#fdfdff] dark:bg-[#0b0f19] overflow-hidden font-sans relative text-left">
    
    <!-- SOL PANEL: SOHBET LİSTESİ -->
    <aside 
      class="w-full md:w-[250px] lg:w-[300px] flex-shrink-0 border-r border-slate-200/60 dark:border-white/5 flex flex-col bg-white dark:bg-[#0f172a]/40 backdrop-blur-xl transition-all h-full"
      :class="{ 'hidden md:flex': chatStore.activeConversation }"
    >
      <div class="p-6 pb-4 text-left">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-6 tracking-tight uppercase italic">Sohbetler</h2>
        <div class="relative group mb-4">
          <input v-model="searchQuery" type="text" placeholder="Kişilerde ara..." class="w-full bg-slate-100/50 dark:bg-white/5 border-none rounded-2xl py-3 px-11 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-slate-900 dark:text-white shadow-inner" />
          <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div class="flex p-1 bg-slate-100/50 dark:bg-white/5 rounded-2xl mb-2">
          <button @click="activeTab = 'chats'" class="flex-1 py-2 text-xs font-bold rounded-xl transition-all" :class="activeTab === 'chats' ? 'bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">Sohbetler</button>
          <button @click="activeTab = 'requests'" class="flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2" :class="activeTab === 'requests' ? 'bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">İstekler<span v-if="pendingRequestsCount > 0" class="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white animate-pulse">{{ pendingRequestsCount }}</span></button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto px-3 pb-6 space-y-1 custom-scrollbar text-left">
        <button v-for="conv in filteredConversations" :key="conv.id" @click="conv.otherParticipant?.id && chatStore.selectConversation(conv.otherParticipant.id)" class="w-full p-4 flex items-center gap-4 rounded-2xl transition-all border border-transparent group text-left" :class="chatStore.activeConversation?.id === conv.id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5'">
          <div class="relative flex-shrink-0 w-12 h-12">
            <img v-if="conv.otherParticipant?.avatarUrl" :src="getImageUrl(conv.otherParticipant.avatarUrl)" class="w-full h-full rounded-full object-cover shadow-sm" />
            <div v-else class="w-full h-full rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">{{ conv.otherParticipant?.username?.charAt(0).toUpperCase() }}</div>
            <div v-if="chatStore.isUserOnline(conv.otherParticipant?.id)" class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm z-10"></div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">{{ conv.otherParticipant?.fullName || conv.otherParticipant?.username }}</h3>
            <p class="text-[11px] truncate mt-0.5"><span v-if="chatStore.typingUsers[conv.id]" class="text-indigo-500 font-bold animate-pulse italic">yazıyor...</span><span v-else class="text-slate-500 dark:text-slate-400"><template v-if="conv.lastMessage"><template v-if="conv.lastMessage.senderId === currentUserId"><span class="font-bold opacity-50 text-[9px]">SİZ:</span> {{ conv.lastMessage.content ? decrypt(conv.lastMessage.content) : (conv.lastMessage.mediaUrl ? '📎 Medya' : '🖼️ Gönderi') }}</template><template v-else-if="!conv.lastMessage.isRead"><span class="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] font-black animate-pulse uppercase text-[9px]">Yeni mesaj</span></template><template v-else>{{ conv.lastMessage.content ? decrypt(conv.lastMessage.content) : (conv.lastMessage.mediaUrl ? '📎 Medya' : '🖼️ Gönderi') }}</template></template><template v-else>Sohbeti başlat...</template></span></p>
          </div>
          <div v-if="!conv.isAccepted && !conv.isRejected && conv.lastMessage?.senderId !== currentUserId" class="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-lg"></div>
        </button>
      </div>
    </aside>

    <!-- SAĞ PANEL: MESAJLAŞMA -->
    <main class="flex-1 flex flex-col bg-white dark:bg-[#0b0f19] relative h-full transition-all duration-300 overflow-hidden" :class="{ 'fixed inset-0 z-[100] md:relative': chatStore.activeConversation }">
      <div v-if="chatStore.activeConversation" class="flex flex-col h-full overflow-hidden">
        <header class="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl z-20 flex-shrink-0 text-left">
          <div class="flex items-center gap-4">
            <button @click="chatStore.activeConversation = null" class="md:hidden p-2 bg-slate-100 dark:bg-white/5 rounded-xl"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="3" /></svg></button>
            <div class="flex items-center gap-3 cursor-pointer" @click="viewProfile">
              <div class="relative">
                <img v-if="otherUser?.avatarUrl" :src="getImageUrl(otherUser.avatarUrl)" class="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover shadow-sm" />
                <div v-else class="w-10 h-10 md:w-11 md:h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">{{ otherUser?.username?.charAt(0).toUpperCase() }}</div>
                <div v-if="chatStore.isUserOnline(otherUser?.id)" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="flex flex-col">
                <h3 class="text-sm md:text-base font-bold dark:text-white truncate max-w-[120px] md:max-w-none leading-tight">{{ otherUser?.fullName || otherUser?.username }}</h3>
                <div class="flex items-center gap-2 h-3">
                  <p v-if="chatStore.typingUsers[chatStore.activeConversation?.id]" class="text-[9px] text-indigo-500 font-black animate-pulse italic tracking-wider">yazıyor...</p>
                  <p v-else-if="chatStore.isUserOnline(otherUser?.id)" class="text-[9px] text-emerald-500 font-bold flex items-center gap-1"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>Çevrimiçi</p>
                </div>
              </div>
            </div>
          </div>
          <div class="relative text-left">
            <button @click="showMoreMenu = !showMoreMenu" class="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all relative z-30"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg></button>
            <div v-if="showMoreMenu" class="fixed inset-0 z-[90] bg-black/5 dark:bg-black/20 backdrop-blur-[2px]" @click="showMoreMenu = false"></div>
            <div v-if="showMoreMenu" class="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0f172a] border dark:border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] py-4 text-left animate-in fade-in zoom-in-95 duration-300 ring-1 ring-black/5">
              <div class="px-6 py-1 mb-3">
                <p class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Sohbet Atmosferi</p>
                <div class="grid grid-cols-5 gap-2">
                  <button v-for="t in themes" :key="t.color" @click="setTheme(t.color)" class="w-8 h-8 rounded-full transition-all active:scale-90 flex-shrink-0 relative overflow-hidden border-2" :class="currentThemeColor === t.color ? 'border-indigo-500 scale-110 shadow-lg' : 'border-slate-200 dark:border-white/10 opacity-80 hover:opacity-100'" :style="{ background: t.color === 'glass' ? 'linear-gradient(135deg, #fff 0%, #ddd 100%)' : t.color === 'oled' ? '#000' : t.color === 'minimal' ? '#f8fafc' : t.color === 'aurora' ? 'linear-gradient(45deg, #ff9a9e, #a18cd1)' : t.color }">
                    <div v-if="currentThemeColor === t.color" class="absolute inset-0 flex items-center justify-center bg-black/10"><svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                  </button>
                </div>
              </div>
              <div class="h-px bg-slate-100 dark:bg-white/5 mx-6 mb-1"></div>
              <button @click="viewProfile" class="w-full text-left px-6 py-2.5 text-[13px] font-bold dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors group"><svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2.5"/></svg>Profili Gör</button>
              <button @click="openDeleteConfirm" class="w-full text-left px-6 py-2.5 text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors group"><svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2.5"/></svg>Sohbeti Sil</button>
            </div>
          </div>
        </header>

        <div ref="messagesContainer" @scroll="handleScroll" class="flex-1 overflow-y-auto px-4 md:px-6 py-8 space-y-6 custom-scrollbar bg-slate-50/20 dark:bg-transparent overflow-x-hidden text-left contain-paint scrolling-touch relative transform-gpu">
          <template v-for="(msg, index) in chatStore.messages" :key="msg.id || index">
            <!-- DATE DIVIDER: Clean gradient dividers -->
            <div v-if="isNewDay(index)" class="flex items-center justify-center gap-6 my-10 px-4 transform-gpu">
              <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-300/50 dark:via-white/10 to-transparent"></div>
              <span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 whitespace-nowrap bg-white dark:bg-[#0b0f19] px-4 py-1.5 rounded-full border border-slate-100 dark:border-white/5 shadow-sm">{{ formatDateLabel(msg.createdAt) }}</span>
              <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-300/50 dark:via-white/10 to-transparent"></div>
            </div>

            <div class="flex flex-col space-y-1 w-full" :class="isMyMessage(msg.senderId) ? 'items-end' : 'items-start'">
              <!-- SCROLL PERFORMANCE: transform-gpu, will-change-transform, simplified shadows -->
              <div class="max-w-[75%] sm:max-w-[70%] px-3 py-2 transition-all relative group flex flex-col min-w-[100px] break-all sm:break-words overflow-visible transform-gpu will-change-transform" 
                   :class="[
                     isMyMessage(msg.senderId) ? 'text-white rounded-2xl rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl rounded-tl-none border dark:border-white/5',
                     currentThemeColor === 'minimal' && isMyMessage(msg.senderId) ? '!text-slate-900 dark:!text-white' : '',
                     'shadow-sm hover:shadow-md transition-shadow duration-200'
                   ]" 
                   :style="getBubbleStyle(isMyMessage(msg.senderId))">
                
                <!-- MESAJ MENÜSÜ -->
                <div class="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-20" :class="isMyMessage(msg.senderId) ? 'right-full mr-2' : 'left-full ml-2'">
                  <div class="relative">
                    <button @click.stop="toggleMsgMenu(msg.id)" class="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 transition-all cursor-pointer"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg></button>
                    <div v-if="activeMsgMenu === msg.id" class="absolute bottom-full mb-2 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden text-left z-[30]" :class="isMyMessage(msg.senderId) ? 'right-0' : 'left-0'">
                      <button @click="copyMsgText(msg)" class="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2">Kopyala</button>
                      <button @click="forwardMsg(msg)" class="w-full text-left px-4 py-2 text-[11px] font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 flex items-center gap-2">İlet</button>
                      <button @click="reportMsg(msg)" class="w-full text-left px-4 py-2 text-[11px] font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 flex items-center gap-2">Şikayet</button>
                      <button v-if="isMyMessage(msg.senderId)" @click="confirmDeleteMsg(msg)" class="w-full text-left px-4 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2">Sil</button>
                    </div>
                  </div>
                </div>

                <div v-if="msg.sharedPost" class="mb-2"><SharedPostCard :post="msg.sharedPost" /></div>
                
                <!-- MEDYA -->
                <div v-if="msg.mediaUrl" class="mb-2 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-white/10 min-h-[100px] flex items-center justify-center transform-gpu">
                  <img v-if="msg.mediaType === 'IMAGE'" :src="getImageUrl(msg.mediaUrl)" class="w-full h-auto max-h-64 object-cover cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform duration-200" @click="openImage(msg.mediaUrl)" />
                  <video v-else-if="msg.mediaType === 'VIDEO'" :src="getImageUrl(msg.mediaUrl)" controls class="w-full h-auto max-h-64"></video>
                  <a v-else :href="getImageUrl(msg.mediaUrl)" target="_blank" download class="flex items-center gap-3 p-3 text-white">
                    <div class="p-2 bg-white/20 rounded-lg"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2"/></svg></div>
                    <span class="text-xs font-bold truncate">Dosya</span>
                  </a>
                </div>

                <div v-if="msg.isForwarded" class="flex items-center gap-1 mb-1 opacity-50 text-[9px] font-black uppercase"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" stroke-width="2.5"/></svg>İletildi</div>
                <div v-if="msg.content" class="text-[14px] leading-relaxed font-medium tracking-tight whitespace-pre-wrap">{{ decrypt(msg.content) }}</div>
                
                <div class="flex items-center justify-end gap-1.5 mt-1 self-end text-white/90 leading-none min-h-[14px]">
                  <span class="text-[9px] font-bold uppercase tracking-wider opacity-70 inline-block translate-y-[0.5px]">{{ formatTime(msg.createdAt) }}</span>
                  <div v-if="isMyMessage(msg.senderId)" class="flex items-center leading-none">
                    <div v-if="msg.isRead" class="flex -space-x-1.5"><svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
                    <svg v-else class="w-3 h-3 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- ELITE SCROLL BUTTON: Perfect circle, glowing indigo arrow -->
        <Transition name="scroll-pill">
          <button v-if="showScrollButton" @click="scrollToBottom(true)" class="absolute bottom-28 left-1/2 -translate-x-1/2 w-14 h-14 bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center text-white hover:bg-white/20 hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] active:scale-90 transition-all z-[40] group transform-gpu">
            <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.6)] group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 14l-7 7-7-7" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </button>
        </Transition>

        <!-- Preview Area (Media Preview) -->
        <div v-if="selectedFile" class="px-6 py-4 bg-slate-50/50 dark:bg-[#0f172a]/50 backdrop-blur-xl border-t dark:border-white/5 animate-in slide-in-from-bottom-4 duration-300">
          <div class="relative w-24 h-24 group/preview">
            <img v-if="filePreviewUrl && isImage" :src="filePreviewUrl" class="w-full h-full object-cover rounded-2xl border-2 border-indigo-500 shadow-2xl transition-transform group-hover/preview:scale-105" />
            <div v-else class="w-full h-full bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-indigo-500 border-2 border-indigo-500/50 shadow-xl">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke-width="2"/></svg>
            </div>
            <button @click="clearFile" class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:scale-110 active:scale-90 transition-all border-2 border-white dark:border-[#0b0f19]"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="3"/></svg></button>
          </div>
        </div>

        <footer class="p-4 md:p-6 bg-white dark:bg-[#0b0f19] border-t dark:border-white/5 flex-shrink-0 text-left">
          <div v-if="chatStore.activeConversation.isAccepted || chatStore.activeConversation.isFriend" class="max-w-4xl mx-auto flex items-center gap-3">
            <input type="file" ref="fileInput" class="hidden" @change="handleFileSelect" accept="image/*,video/*,.pdf,.doc,.docx,.txt" />
            <button @click="$refs.fileInput.click()" class="p-3 text-slate-400 hover:text-indigo-500 transition-all flex-shrink-0"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke-width="2"/></svg></button>
            <div class="flex-1 bg-slate-100/80 dark:bg-white/5 rounded-3xl p-2 flex items-center shadow-inner border border-transparent transition-all min-w-0 relative">
              <div class="flex-shrink-0 flex items-center"><EmojiPicker :modelValue="messageInput" @update:modelValue="(e) => (messageInput += e)" class="ml-1" /></div>
              <textarea v-model="messageInput" @input="handleTyping" @keydown.enter.prevent="handleSendMessage()" placeholder="Mesaj..." rows="1" maxlength="1000" class="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2.5 px-2 text-slate-900 dark:text-white resize-none max-h-40 overflow-y-auto shadow-none outline-none"></textarea>
            </div>
            <button @click="handleSendMessage()" :disabled="(!messageInput.trim() && !selectedFile) || isUploading" class="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all flex-shrink-0 group relative overflow-hidden" :style="getBubbleStyle(true)">
              <div v-if="isUploading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <svg v-else class="w-5 h-5 transform rotate-[-10deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M3.4 20.4l17.45-8.48a1 1 0 000-1.84L3.4 1.6a1 1 0 00-1.39 1.3l2.32 9.1h9.17a.5.5 0 010 1H4.33l-2.32 9.1a1 1 0 001.39 1.3z"/></svg>
            </button>
          </div>
          <div v-else class="text-center py-4 opacity-50"><p class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic tracking-widest">Sohbet için onay bekleniyor.</p></div>
        </footer>
      </div>
      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
        <div class="w-32 h-32 bg-indigo-50 dark:bg-white/5 rounded-[3rem] flex items-center justify-center mb-6 shadow-inner"><svg class="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-width="2" /></svg></div>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Sohbetlerin</h3>
        <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium max-w-xs text-center leading-relaxed">Buradan iletişime geçebilirsin.</p>
      </div>
    </main>

    <!-- LIGHTBOX: Medya önizleme -->
    <Transition name="lightbox-fade">
      <div v-if="lightBoxImage" class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-12 transform-gpu" @click="lightBoxImage = null">
        <button class="absolute top-8 right-8 text-white/40 hover:text-white transition-all hover:scale-110 z-[2001] bg-white/5 p-3 rounded-full backdrop-blur-md border border-white/10"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="3"/></svg></button>
        <div class="relative max-w-full max-h-full flex items-center justify-center animate-in zoom-in-90 duration-300 ease-out" @click.stop>
           <img :src="getImageUrl(lightBoxImage)" class="max-w-full max-h-[90dvh] object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5" />
        </div>
      </div>
    </Transition>

    <!-- PREMIUM MESSAGE DELETE CONFIRMATION: Identical to Sohbeti Sil -->
    <Transition name="fade">
      <div v-if="msgToDelete" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md" @click="msgToDelete = null">
        <div class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-primary-900/20 relative z-10 text-center animate-in zoom-in-95 duration-200" @click.stop>
          <!-- İkon -->
          <div class="w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 shadow-xl shadow-red-500/10 rotate-12 transition-all duration-500">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <!-- İçerik -->
          <div class="mb-8 px-4">
            <h3 class="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-tight mb-2 italic">Mesajı Sil</h3>
            <p class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] leading-relaxed opacity-60">Bu mesaj kalıcı olarak silinecektir. Devam etmek istiyor musunuz?</p>
          </div>
          <!-- Butonlar -->
          <div class="flex flex-col gap-3">
            <button @click="deleteMsg" class="w-full py-5 text-white font-black rounded-2xl active:scale-95 transition-all text-[10px] tracking-[0.2em] uppercase shadow-2xl bg-red-600 shadow-red-500/30 hover:bg-red-700">SİL</button>
            <button @click="msgToDelete = null" class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] py-3 hover:text-slate-600 dark:hover:text-slate-200 transition-colors italic outline-none">VAZGEÇ</button>
          </div>
        </div>
      </div>
    </Transition>

    <DeleteConfirmModal :is-open="showDeleteModal" :is-deleting="deletingConv" title="SOHBETİ SİL" @confirm="confirmDeleteConversation" @cancel="showDeleteModal = false" />
    <ForwardModal :is-open="showForwardModal" :content="forwardContent" :media-url="forwardMediaUrl" :media-type="forwardMediaType" @close="showForwardModal = false" />
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

// SPEC: Fix Decryption secretKey
const APP_SECRET_KEY = "fcb49253e8a693454e8d2309c1cdbdff5ccc1405ffbb5c48e93820d03f9628dc08b8e68b15c35f2186b6202008aac2f4417f025788fbc36772c2a0cfa7570cac";

const activeTab = ref('chats');
const searchQuery = ref("");
const messageInput = ref("");
const activeMsgMenu = ref<string | null>(null);
const toggleMsgMenu = (id: string) => { activeMsgMenu.value = activeMsgMenu.value === id ? null : id; };

// SPEC: Fix Decryption logic
const decrypt = (text: string) => {
  if (!text) return "";
  // Check if text is actually encrypted (starts with Salted__ prefix in Base64)
  if (!text.startsWith("U2FsdGVkX1")) return text;
  try {
    const bytes = CryptoJS.AES.decrypt(text, APP_SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption succeeds and returns a value, use it. Otherwise return original.
    return decrypted || text;
  } catch (e) {
    console.warn("Decryption failed:", e);
    return text;
  }
};

const copyMsgText = (msg: any) => { 
  const text = decrypt(msg.content);
  navigator.clipboard.writeText(text); 
  toast.success("Mesaj kopyalandı! 📋"); 
  activeMsgMenu.value = null; 
};

const msgToDelete = ref<any>(null);
const confirmDeleteMsg = (msg: any) => { msgToDelete.value = msg; activeMsgMenu.value = null; };
const deleteMsg = async () => { if (!msgToDelete.value) return; const targetId = msgToDelete.value.id; msgToDelete.value = null; try { await apiClient.delete(`/chat/message/${targetId}`); chatStore.messages = chatStore.messages.filter(m => m.id !== targetId); toast.success("Mesaj silindi."); } catch { toast.error("Hata oluştu!"); } };

const reportMsg = async (msg: any) => { try { await apiClient.post("/users/report", { reportedUserId: msg.senderId, reportedMessageId: msg.id, reason: "DM Mesajı" }); toast.warning("Bildirildi! 🛡️"); } catch { toast.error("Hata!"); } activeMsgMenu.value = null; };

const showForwardModal = ref(false);
const forwardContent = ref("");
const forwardMediaUrl = ref("");
const forwardMediaType = ref("");
const forwardMsg = (msg: any) => { 
  forwardContent.value = msg.content; 
  forwardMediaUrl.value = msg.mediaUrl || "";
  forwardMediaType.value = msg.mediaType || "";
  showForwardModal.value = true; 
  activeMsgMenu.value = null; 
};

const isNewDay = (index: number) => {
  if (index === 0) return true;
  const current = chatStore.messages[index];
  const previous = chatStore.messages[index - 1];
  if (!current?.createdAt || !previous?.createdAt) return false;
  return new Date(current.createdAt).toDateString() !== new Date(previous.createdAt).toDateString();
};

const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Bugün";
  if (date.toDateString() === yesterday.toDateString()) return "Dün";
  return format(date, 'd MMMM EEEE', { locale: tr });
};

const formatTime = (dateStr: string) => { if (!dateStr) return ""; try { return format(new Date(dateStr), 'HH:mm', { locale: tr }); } catch { return ""; } };

const filteredConversations = computed(() => chatStore.conversations.filter(conv => {
  const name = (conv.otherParticipant?.fullName || conv.otherParticipant?.username || '').toLowerCase();
  const matchesSearch = name.includes(searchQuery.value.toLowerCase());
  const isIncomingRequest = !conv.isAccepted && !conv.isRejected && conv.lastMessage?.senderId !== currentUserId.value;
  return activeTab.value === 'chats' ? (matchesSearch && (conv.isAccepted || !isIncomingRequest)) : (matchesSearch && isIncomingRequest);
}));

const pendingRequestsCount = computed(() => chatStore.conversations.filter(conv => !conv.isAccepted && !conv.isRejected && conv.lastMessage?.senderId !== currentUserId.value).length);

const showMoreMenu = ref(false);
const showDeleteModal = ref(false);
const deletingConv = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const showScrollButton = ref(false);

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  showScrollButton.value = target.scrollHeight - target.scrollTop - target.clientHeight > 400;
};

const scrollToBottom = (smooth = true) => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({ top: messagesContainer.value.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }
  });
};

const getImageUrl = (path: string | undefined) => { if (!path) return ""; if (path.startsWith("http")) return path; const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api"; const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl; return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`; };
const themes = [
  { name: 'Varsayılan', color: '#4f46e5' }, { name: 'Kırmızı', color: '#e11d48' }, { name: 'Mavi', color: '#2563eb' }, { name: 'Sarı', color: '#eab308' }, { name: 'Yeşil', color: '#16a34a' }, { name: 'Mor', color: '#9333ea' },
  { name: 'Glass', color: 'glass' }, { name: 'OLED', color: 'oled' }, { name: 'Minimal', color: 'minimal' }, { name: 'Aurora', color: 'aurora' }
];

const currentThemeColor = ref('#4f46e5');

const getBubbleStyle = (isMe: boolean) => {
  if (!isMe) return {};
  switch (currentThemeColor.value) {
    case 'glass': return { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff' };
    case 'oled': return { background: '#000', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' };
    case 'minimal': return { background: 'transparent', borderLeft: '3px solid #4f46e5', color: 'inherit', borderRadius: '0', paddingLeft: '12px' };
    case 'aurora': return { background: 'linear-gradient(270deg, #ff9a9e, #fad0c4, #fad0c4, #ffd1ff, #a18cd1)', backgroundSize: '400% 400%', animation: 'aurora-anim 10s ease infinite', color: '#fff' };
    default: return { background: `linear-gradient(135deg, ${currentThemeColor.value}, ${currentThemeColor.value}dd)` };
  }
};

const loadTheme = () => { if (chatStore.activeConversation?.themeColor) currentThemeColor.value = chatStore.activeConversation.themeColor; };
const setTheme = async (color: string) => { if (!chatStore.activeConversation) return; try { await apiClient.post(`/chat/theme/${chatStore.activeConversation.id}`, { color }); currentThemeColor.value = color; chatStore.activeConversation.themeColor = color; showMoreMenu.value = false; toast.success("Tema güncellendi ✨"); } catch { toast.error("Hata!"); } };

const isMyMessage = (senderId: string) => senderId === authStore.userId;
const currentUserId = computed(() => authStore.userId);
const otherUser = computed(() => chatStore.activeConversation?.otherParticipant);

// MEDIA HANDLING
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const filePreviewUrl = ref<string | null>(null);
const isUploading = ref(false);
const isImage = computed(() => selectedFile.value?.type.startsWith('image/'));
const lightBoxImage = ref<string | null>(null);

const openImage = (url: string) => { lightBoxImage.value = url; };

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
      const res = await apiClient.post('/chat/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      mediaUrl = res.data.url;
      mediaType = res.data.type;
    } catch (err: any) { 
      console.error("❌ Medya Yükleme Hatası:", err.response?.data || err); 
      toast.error("Dosya yüklenemedi."); 
      isUploading.value = false; 
      return; 
    }
  }
  
  // Encrypt message content before sending
  const encrypted = text.trim() ? CryptoJS.AES.encrypt(text.trim(), APP_SECRET_KEY).toString() : undefined;
  sendMessage(chatStore.activeConversation.id, encrypted as any, otherUser.value?.id, undefined, false, mediaUrl, mediaType);
  
  if (typeof customText !== 'string') messageInput.value = "";
  clearFile(); 
  isUploading.value = false;
};

let typingTimeout: any = null;
const handleTyping = () => { 
  if (!chatStore.activeConversation || !otherUser.value) return; 
  sendTyping(chatStore.activeConversation.id, otherUser.value.id, true); 
  if (typingTimeout) clearTimeout(typingTimeout); 
  typingTimeout = setTimeout(() => sendTyping(chatStore.activeConversation.id, otherUser.value.id, false), 2000); 
};

const openDeleteConfirm = () => { showMoreMenu.value = false; showDeleteModal.value = true; };
const confirmDeleteConversation = async () => { if (!chatStore.activeConversation) return; deletingConv.value = true; try { await chatStore.deleteConversation(chatStore.activeConversation.id); showDeleteModal.value = false; toast.success("Silindi."); } catch { toast.error("Hata!"); } finally { deletingConv.value = false; } };

const viewProfile = () => { if (otherUser.value?.username) router.push(`/profile/${otherUser.value.username}`); };

onMounted(async () => {
  await chatStore.fetchConversations();
  if (route.query.conversationId) {
    const conv = chatStore.conversations.find(c => c.id === route.query.conversationId);
    if (conv?.otherParticipant) await chatStore.selectConversation(conv.otherParticipant.id);
  } else if (route.query.userId) {
    await chatStore.selectConversation(route.query.userId as string, route.query.fromSpot === 'true', route.query.listingId as string);
  }
  loadTheme(); 
  scrollToBottom(false);
  window.addEventListener('focus', () => chatStore.activeConversation?.id && sendMarkRead(chatStore.activeConversation.id));
});

watch(() => chatStore.messages.length, (newLen, oldLen) => { 
  // Eğer sadece 1 mesaj eklendiyse (yeni mesaj geldiyse) yumuşak kaydır, 
  // ama toplu mesaj yüklendiyse (sohbet açıldıysa) anında en aşağı git.
  const isNewSingleMessage = newLen - oldLen === 1;
  scrollToBottom(isNewSingleMessage); 
  
  const activeId = chatStore.activeConversation?.id; 
  if (activeId) { 
    const lastMsg = chatStore.messages[chatStore.messages.length - 1]; 
    if (lastMsg && lastMsg.senderId !== currentUserId.value) sendMarkRead(activeId); 
  } 
});

watch(() => chatStore.activeConversation?.id, (newId) => { 
  if (newId) { 
    showScrollButton.value = false; // Sohbet değişince butonu gizle
    loadTheme(); 
    scrollToBottom(false); // Anında en aşağı in (kayma animasyonu olmadan)
    sendMarkRead(newId); 
  } 
});
</script>

<style scoped>
@keyframes aurora-anim { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.1); border-radius: 10px; }

/* Transition Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scroll-pill-enter-active, .scroll-pill-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.scroll-pill-enter-from, .scroll-pill-leave-to { opacity: 0; transform: translate(-50%, 20px) scale(0.9); }

.lightbox-fade-enter-active, .lightbox-fade-leave-active { transition: all 0.4s ease-out; }
.lightbox-fade-enter-from, .lightbox-fade-leave-to { opacity: 0; backdrop-filter: blur(0px); }

/* Performance optimization */
.will-change-transform { will-change: transform; }
</style>
