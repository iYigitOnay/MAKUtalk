<template>
  <div class="fixed bottom-4 right-0 left-0 sm:left-auto sm:right-6 z-[9999] pointer-events-none px-4 sm:px-0">
    <TransitionGroup
      tag="div"
      class="flex flex-col-reverse gap-3 items-center sm:items-end"
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="translate-y-10 sm:translate-x-full opacity-0 scale-90"
      enter-to-class="translate-y-0 sm:translate-x-0 opacity-100 scale-100"
      leave-active-class="transition-all duration-300 ease-in absolute"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75 blur-sm"
      move-class="transition-all duration-500 ease-in-out"
    >
      <div
        v-for="notif in activeNotifications"
        :key="notif.liveId"
        class="pointer-events-auto relative w-full max-w-[400px] sm:w-96 group"
        @mouseenter="pauseTimer(notif.liveId)"
        @mouseleave="resumeTimer(notif.liveId)"
      >
        <!-- Glow Layer -->
        <div 
          class="absolute -inset-0.5 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"
          :class="getGlowColor(notif)"
        ></div>

        <!-- Main Card -->
        <div
          @click="handleClick(notif)"
          class="relative flex items-center p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl rounded-2xl border border-white/20 dark:border-slate-800/50 cursor-pointer overflow-hidden transition-all duration-300 hover:translate-y-[-2px] active:scale-95"
        >
          <!-- Left: Avatar -->
          <div class="relative flex-shrink-0">
            <img
              :src="getAvatarUrl(notif)"
              alt="Avatar"
              class="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl object-cover shadow-lg ring-2 ring-white/50 dark:ring-slate-700/50"
            />
            <div 
              class="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm"
              :class="getIconBgColor(notif)"
            >
              <component :is="getIcon(notif)" class="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white" />
            </div>
          </div>

          <!-- Middle: Content -->
          <div class="ml-3 sm:ml-4 flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest opacity-50 dark:text-slate-400">
                {{ getLabel(notif) }}
              </span>
              <span class="text-[9px] sm:text-[10px] opacity-40">Şimdi</span>
            </div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {{ getSenderName(notif) }}
            </h4>
            <p class="text-[12px] sm:text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-snug">
              {{ getDisplayContent(notif) }}
            </p>
          </div>

          <!-- Right: Close -->
          <button 
            @click.stop="removeNotification(notif.liveId)"
            class="ml-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors hidden sm:block"
          >
            <XIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNotificationsStore } from '@/stores/notifications';
import { storeToRefs } from 'pinia';
import CryptoJS from "crypto-js";
import { 
  MessageCircle as MessageIcon, 
  Heart as HeartIcon, 
  MessageSquare as CommentIcon, 
  UserPlus as FollowIcon, 
  AtSign as MentionIcon,
  Repeat as RepostIcon,
  X as XIcon
} from 'lucide-vue-next';

const secretKey = "fcb49253e8a693454e8d2309c1cdbdff5ccc1405ffbb5c48e93820d03f9628dc08b8e68b15c35f2186b6202008aac2f4417f025788fbc36772c2a0cfa7570cac";

const decrypt = (encryptedText: string) => {
  if (!encryptedText || !encryptedText.startsWith("U2FsdGVkX1")) return encryptedText || "";
  try { 
    return CryptoJS.AES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8); 
  } catch { 
    return "🔒 Mesaj şifreli"; 
  }
};

const router = useRouter();
const route = useRoute();
const notificationsStore = useNotificationsStore();
const { activeNotifications } = storeToRefs(notificationsStore);

const timers = new Map<string, { timeout: any, remaining: number, startTime: number }>();

const getGlowColor = (notif: any) => {
  if (notif.displayType === 'MESSAGE') return 'bg-blue-500';
  switch (notif.type) {
    case 'LIKE': return 'bg-rose-500';
    case 'COMMENT': return 'bg-amber-500';
    case 'FOLLOW': return 'bg-emerald-500';
    case 'MENTION': return 'bg-purple-500';
    case 'REPOST': return 'bg-emerald-500';
    default: return 'bg-primary-500';
  }
};

const getIconBgColor = (notif: any) => {
  if (notif.displayType === 'MESSAGE') return 'bg-blue-500';
  switch (notif.type) {
    case 'LIKE': return 'bg-rose-500';
    case 'COMMENT': return 'bg-amber-500';
    case 'FOLLOW': return 'bg-emerald-500';
    case 'MENTION': return 'bg-purple-500';
    case 'REPOST': return 'bg-emerald-500';
    default: return 'bg-primary-500';
  }
};

const getIcon = (notif: any) => {
  if (notif.displayType === 'MESSAGE') return MessageIcon;
  switch (notif.type) {
    case 'LIKE': return HeartIcon;
    case 'COMMENT': return CommentIcon;
    case 'FOLLOW': return FollowIcon;
    case 'MENTION': return MentionIcon;
    case 'REPOST': return RepostIcon;
    default: return MessageIcon;
  }
};

const getLabel = (notif: any) => {
  if (notif.displayType === 'MESSAGE') return 'Yeni Mesaj';
  switch (notif.type) {
    case 'LIKE': return 'Beğeni';
    case 'COMMENT': return 'Yorum';
    case 'FOLLOW': return 'Yeni Takipçi';
    case 'MENTION': return 'Etiketleme';
    case 'REPOST': return 'Remakü';
    default: return 'Bildirim';
  }
};

const getSenderName = (notif: any) => {
  return notif.sender?.fullName || notif.sender?.username || 'Biri';
};

const getDisplayContent = (notif: any) => {
  if (notif.displayType === 'MESSAGE') {
    const rawContent = notif.content || 'Yeni bir mesajın var.';
    const content = decrypt(rawContent);
    if (content.length > 150 && !content.includes(' ')) return 'Yeni bir mesaj gönderildi.';
    return content;
  }
  
  switch (notif.type) {
    case 'LIKE': return 'bir gönderini beğendi.';
    case 'COMMENT': 
      if (notif.comment?.content) {
        return notif.comment.content.length > 100 
          ? notif.comment.content.substring(0, 97) + '...' 
          : notif.comment.content;
      }
      return 'gönderine yorum yaptı.';
    case 'FOLLOW': return 'seni takip etmeye başladı.';
    case 'MENTION': return 'bir gönderide senden bahsetti.';
    case 'REPOST': return 'senin bir gönderini remaküledi.';
    default: return 'sana bir etkileşim gönderdi.';
  }
};

const getAvatarUrl = (notif: any) => {
  if (notif.sender?.avatarUrl) {
    return (import.meta.env.VITE_API_URL?.replace('/api', '') || '') + notif.sender.avatarUrl;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(getSenderName(notif))}&background=random&size=128`;
};

const handleClick = (notif: any) => {
  removeNotification(notif.liveId);
  if (notif.displayType === 'MESSAGE') {
    router.push({ path: '/messages', query: { conversationId: notif.conversationId } });
  } else {
    if (notif.postId) router.push(`/post/${notif.postId}`);
    else if (notif.senderId) router.push(`/profile/${notif.sender?.username}`);
    else router.push('/notifications');
  }
};

const removeNotification = (liveId: string) => {
  notificationsStore.removeLiveNotification(liveId);
  timers.delete(liveId);
};

const startTimer = (liveId: string, duration: number) => {
  if (timers.has(liveId)) return;
  const timeout = setTimeout(() => {
    removeNotification(liveId);
  }, duration);
  timers.set(liveId, { timeout, remaining: duration, startTime: Date.now() });
};

const pauseTimer = (liveId: string) => {
  const timer = timers.get(liveId);
  if (timer) {
    clearTimeout(timer.timeout);
    timer.remaining -= Date.now() - timer.startTime;
  }
};

const resumeTimer = (liveId: string) => {
  const timer = timers.get(liveId);
  if (timer && timer.remaining > 0) {
    startTimer(liveId, timer.remaining);
  }
};

// Reaktif İzleme
watch(() => activeNotifications.value.length, (newLen, oldLen) => {
  if (newLen > oldLen) {
    const latestNotif = activeNotifications.value[activeNotifications.value.length - 1];
    if (latestNotif && !timers.has(latestNotif.liveId)) {
      if (latestNotif.displayType === 'MESSAGE' && route.path === '/messages') {
        notificationsStore.removeLiveNotification(latestNotif.liveId);
        return;
      }
      startTimer(latestNotif.liveId, 6000);
    }
  }
}, { deep: true });

onUnmounted(() => {
  timers.forEach(t => clearTimeout(t.timeout));
});
</script>

<style scoped>
.w-13 { width: 3.25rem; }
.h-13 { height: 3.25rem; }
</style>
