<!-- src/components/EventTicket.vue -->
<template>
  <div class="ticket-wrapper group relative animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="flex flex-row h-36 md:h-40 bg-white dark:bg-gray-900 rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-xl shadow-black/5 border border-gray-100 dark:border-white/5 transition-all duration-500 hover:scale-[1.01] hover:shadow-emerald-500/10">
      
      <!-- [1] LEFT STUB (The Date Area) -->
      <div class="w-20 md:w-32 bg-emerald-600 dark:bg-emerald-700 relative flex-shrink-0 overflow-hidden border-r border-dashed border-white/20">
        <!-- Perforation Holes -->
        <div class="absolute -top-2 -right-2 w-4 h-4 bg-[#fafafa] dark:bg-[#0b0f19] rounded-full z-30 shadow-inner"></div>
        <div class="absolute -bottom-2 -right-2 w-4 h-4 bg-[#fafafa] dark:bg-[#0b0f19] rounded-full z-30 shadow-inner"></div>
        
        <!-- LAYER 1: THE SIGNATURE (Stays very far left) -->
        <div class="absolute left-0.5 md:left-1 top-0 bottom-0 w-4 flex items-center justify-center z-10 pointer-events-none">
          <span class="transform -rotate-90 whitespace-nowrap text-[4px] md:text-[6px] font-black uppercase tracking-[0.4em] text-white/20 italic">
            MAKUTALK EVENT PASS
          </span>
        </div>

        <!-- LAYER 2: THE DATE (Centered) -->
        <div class="absolute inset-0 flex flex-col items-center justify-between py-4 md:py-5 text-white z-20">
          <span class="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] opacity-70">{{ month }}</span>
          <span class="text-2xl md:text-4xl font-black tracking-tighter leading-none">{{ day }}</span>
          <div class="px-1.5 py-0.5 bg-black/10 rounded-md backdrop-blur-sm border border-white/5">
            <span class="text-[7px] md:text-[8px] font-black opacity-90 uppercase tracking-widest">{{ time }}</span>
          </div>
        </div>
      </div>

      <!-- [2] MAIN CONTENT AREA -->
      <div class="flex-1 flex flex-row overflow-hidden relative min-w-0">
        <!-- Event Poster (Now visible everywhere) -->
        <div class="w-20 md:w-32 h-full bg-emerald-50 dark:bg-emerald-950/20 flex-shrink-0 relative overflow-hidden border-r border-gray-50 dark:border-white/5">
          <img v-if="event.imageUrl" :src="getImageUrl(event.imageUrl)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          <div v-else class="w-full h-full flex items-center justify-center text-emerald-200 dark:text-emerald-800">
            <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <!-- Type Badge -->
          <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-600/90 backdrop-blur-md text-white text-[6px] font-black rounded uppercase tracking-widest shadow-sm">{{ event.type }}</div>
        </div>

        <!-- Info Column -->
        <div class="flex-1 p-3 md:p-5 flex flex-col justify-between text-left min-w-0">
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[7px] md:text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest truncate">{{ event.campus }}</span>
              <span class="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[80px]">{{ event.location }}</span>
            </div>
            
            <h3 class="text-sm md:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight group-hover:text-emerald-600 transition-colors truncate">
              {{ event.title }}
            </h3>
            
            <p class="text-[9px] md:text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-2 italic opacity-80">
              "{{ event.description }}"
            </p>
          </div>

          <!-- Bottom: Organizer + Social + Button -->
          <div class="flex items-center justify-between pt-2 mt-auto border-t border-gray-50 dark:border-white/5">
            <div class="flex items-center gap-1.5 md:gap-2 truncate mr-2">
              <div class="w-5 h-5 md:w-7 md:h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-white dark:border-gray-700 shadow-sm flex-shrink-0">
                <img v-if="event.creator?.avatarUrl" :src="getImageUrl(event.creator.avatarUrl)" class="w-full h-full object-cover" />
                <span v-else class="text-[8px] md:text-[10px] font-black text-emerald-600">{{ event.creator?.username?.charAt(0).toUpperCase() }}</span>
              </div>
              <span class="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-tight truncate hidden sm:block">{{ event.club?.name || event.creator?.username }}</span>
            </div>

            <div class="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
              <!-- Participants -->
              <div v-if="event._count?.participants > 0" class="flex -space-x-1.5 md:-space-x-2 items-center">
                <div v-for="user in event.displayParticipants" :key="user.username" class="w-5 h-5 md:w-7 md:h-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-sm">
                  <img v-if="user.avatarUrl" :src="getImageUrl(user.avatarUrl)" class="w-full h-full object-cover" />
                  <span v-else class="text-[6px] md:text-[8px] font-black text-gray-400 uppercase">{{ user.username.charAt(0) }}</span>
                </div>
                <div v-if="event._count.participants > 3" class="w-5 h-5 md:w-7 md:h-7 rounded-full bg-emerald-50 dark:bg-emerald-900 flex items-center justify-center text-[7px] md:text-[9px] font-black text-emerald-600 border-2 border-white dark:border-gray-900 shadow-sm">
                  +{{ event._count.participants - 3 }}
                </div>
              </div>

              <!-- Action Button -->
              <button 
                @click.stop="$emit('attend', event.id)"
                class="px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 shadow-sm flex-shrink-0"
                :class="event.isAttending 
                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                  : 'bg-white dark:bg-gray-800 border-emerald-600/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'"
              >
                {{ event.isAttending ? 'VAZGEÇ' : 'BİLET AL' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Validated Stamp (Minimalist) -->
        <transition name="stamp">
          <div v-if="event.isAttending" class="absolute inset-0 bg-emerald-600/[0.02] pointer-events-none flex items-center justify-center overflow-hidden">
            <div class="border-[4px] border-emerald-600/10 rounded-full w-24 h-24 flex items-center justify-center rotate-[25deg] animate-in zoom-in-150 duration-500 opacity-40">
              <span class="text-[10px] font-black text-emerald-600/40 uppercase tracking-[0.4em]">VALID</span>
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
.ticket-card { filter: drop-shadow(0 10px 20px rgba(0,0,0,0.04)); }
.dark .ticket-card { filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2)); }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.stamp-enter-active { animation: stampIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes stampIn { from { opacity: 0; transform: scale(2) rotate(45deg); } to { opacity: 0.2; transform: scale(1) rotate(20deg); } }
</style>
