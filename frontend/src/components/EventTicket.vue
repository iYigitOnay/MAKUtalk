<!-- src/components/EventTicket.vue -->
<template>
  <div class="ticket-wrapper group relative animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex flex-row h-44 md:h-52 bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100 dark:border-white/5 transition-all duration-500 hover:scale-[1.01] hover:shadow-emerald-500/10">
      
      <!-- [1] LEFT STUB (The Date Area) -->
      <div class="w-28 md:w-40 bg-emerald-600 dark:bg-emerald-700 relative flex-shrink-0 overflow-hidden border-r border-dashed border-white/20">
        <!-- Perforation Holes -->
        <div class="absolute -top-3 -right-3 w-6 h-6 bg-[#fafafa] dark:bg-[#0b0f19] rounded-full z-30 shadow-inner"></div>
        <div class="absolute -bottom-3 -right-3 w-6 h-6 bg-[#fafafa] dark:bg-[#0b0f19] rounded-full z-30 shadow-inner"></div>
        
        <!-- LAYER 1: THE SIGNATURE (Stuck to far left border) -->
        <div class="absolute left-1 md:left-2 top-0 bottom-0 w-6 flex items-center justify-center z-10 pointer-events-none">
          <span class="transform -rotate-90 whitespace-nowrap text-[5px] md:text-[7px] font-black uppercase tracking-[0.6em] text-white/20 italic">
            MAKUTALK EVENT PASS
          </span>
        </div>

        <!-- LAYER 2: THE DATE (Perfectly centered across the ENTIRE STUB width) -->
        <div class="absolute inset-0 flex flex-col items-center justify-between py-6 md:py-8 text-white z-20">
          <span class="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] opacity-70">{{ month }}</span>
          <span class="text-4xl md:text-6xl font-black tracking-tighter leading-none">{{ day }}</span>
          <div class="px-2 py-0.5 bg-black/10 rounded-lg backdrop-blur-sm border border-white/5">
            <span class="text-[8px] md:text-[10px] font-black opacity-90 uppercase tracking-widest">{{ time }}</span>
          </div>
        </div>
      </div>

      <!-- [2] DIVIDER -->
      <div class="w-px h-full border-l-2 border-dashed border-gray-100 dark:border-white/10 relative z-10"></div>

      <!-- [3] MAIN CONTENT -->
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div class="w-28 md:w-48 h-full bg-emerald-50 dark:bg-emerald-950/20 flex-shrink-0 relative overflow-hidden hidden xs:block">
          <img v-if="event.imageUrl" :src="getImageUrl(event.imageUrl)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          <div v-else class="w-full h-full flex items-center justify-center text-emerald-200 dark:text-emerald-800">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div class="absolute top-3 left-3 px-2.5 py-1 bg-emerald-600 text-white text-[7px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-500/20">{{ event.type }}</div>
        </div>

        <div class="flex-1 p-5 md:p-8 flex flex-col justify-between text-left min-w-0">
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-[8px] md:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{{ event.campus }} Kampüsü</span>
              </div>
              <span class="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[120px]">{{ event.location }}</span>
            </div>
            <h3 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight group-hover:text-emerald-600 transition-colors truncate">
              {{ event.title }}
            </h3>
            <p class="text-[10px] md:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-2 italic opacity-80 border-l-2 border-emerald-100 dark:border-emerald-900/30 pl-3 mt-2">
              "{{ event.description }}"
            </p>
          </div>

          <div class="flex items-center justify-between pt-4 mt-auto border-t border-gray-50 dark:border-white/5">
            <div class="flex items-center gap-2 md:gap-3 mr-2 truncate">
              <div class="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm flex-shrink-0">
                <img v-if="event.creator?.avatarUrl" :src="getImageUrl(event.creator.avatarUrl)" class="w-full h-full object-cover" />
                <span v-else class="text-[10px] font-black text-emerald-600">{{ event.creator?.username?.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex flex-col truncate">
                <span class="text-[7px] font-black text-gray-400 uppercase tracking-tighter">Organizatör</span>
                <span class="text-[10px] md:text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight truncate">{{ event.club?.name || event.creator?.fullName || event.creator?.username }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <div v-if="event._count?.participants > 0" class="flex -space-x-1.5 items-center">
                <div v-for="user in event.displayParticipants" :key="user.username" class="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-sm">
                  <img v-if="user.avatarUrl" :src="getImageUrl(user.avatarUrl)" class="w-full h-full object-cover" />
                  <span v-else class="text-[6px] md:text-[7px] font-black text-gray-400 uppercase">{{ user.username.charAt(0) }}</span>
                </div>
                <div v-if="event._count.participants > 3" class="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-[8px] md:text-[10px] font-black text-emerald-600 border-2 border-white dark:border-gray-900 shadow-sm">
                  +{{ event._count.participants - 3 }}
                </div>
              </div>

              <button @click.stop="$emit('attend', event.id)" class="px-4 md:px-8 py-2 md:py-3 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 border-2 shadow-lg shadow-black/5" :class="event.isAttending ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/20' : 'bg-white dark:bg-gray-800 border-emerald-600/20 text-emerald-600 hover:border-emerald-600 transition-colors'">
                {{ event.isAttending ? 'OK' : 'BİLET AL' }}
              </button>
            </div>
          </div>
        </div>

        <transition name="stamp">
          <div v-if="event.isAttending" class="absolute inset-0 bg-emerald-600/[0.02] pointer-events-none flex items-center justify-center">
            <div class="border-[8px] border-emerald-600/5 rounded-full w-40 h-40 flex items-center justify-center rotate-[20deg] opacity-20">
              <span class="text-[14px] font-black text-emerald-600/30 uppercase tracking-[0.5em]">APPROVED</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ event: any }>();
defineEmits(['attend']);
const day = computed(() => new Date(props.event.date).getDate());
const month = computed(() => new Date(props.event.date).toLocaleString('tr-TR', { month: 'short' }).toUpperCase());
const time = computed(() => new Date(props.event.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
</script>

<style scoped>
.ticket-card { filter: drop-shadow(0 15px 35px rgba(0,0,0,0.05)); }
.dark .ticket-card { filter: drop-shadow(0 15px 35px rgba(0,0,0,0.2)); }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.stamp-enter-active { animation: stampIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes stampIn { from { opacity: 0; transform: scale(2) rotate(45deg); } to { opacity: 0.2; transform: scale(1) rotate(20deg); } }
@media (max-width: 480px) { .xs\:block { display: block; } .xs\:hidden { display: none; } }
</style>
