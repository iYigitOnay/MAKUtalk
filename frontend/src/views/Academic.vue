<!-- src/views/Academic.vue -->
<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8 pb-24 bg-white dark:bg-gray-950 min-h-screen transition-colors duration-500">
    <!-- Modern Header (Akademik Denetim Merkezi) -->
    <header class="relative mb-12 py-10 px-8 rounded-[3rem] overflow-hidden bg-[#064e3b] shadow-2xl shadow-emerald-900/20 group">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-teal-600/20"></div>
      <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg shadow-emerald-500/40">Akademik Danışman</span>
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
          </div>
          <h1 class="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
            Akademik <span class="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Denetim</span>
          </h1>
          <p class="text-emerald-200/60 text-sm font-bold mt-2 uppercase tracking-widest opacity-70 italic">MAKUtalk • Danışman Yönetim Portalı</p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="h-12 w-[1px] bg-white/10 hidden md:block"></div>
          <div class="text-right hidden sm:block">
            <p class="text-white font-black text-sm uppercase tracking-tighter">{{ pendingClubs.length }} Onay Bekliyor</p>
            <p class="text-emerald-400/50 text-[10px] font-bold uppercase tracking-widest italic">İşlem Gerekli</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Stats Summary (Minimalist) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl flex items-center gap-4 relative overflow-hidden group">
        <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div><p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Bekleyen Başvuru</p><p class="text-xl font-black text-gray-900 dark:text-white italic tracking-tighter">{{ pendingClubs.length }}</p></div>
      </div>
    </div>

    <!-- Requests List -->
    <div v-if="loading" class="py-20 text-center"><div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
    
    <div v-else-if="pendingClubs.length > 0" class="space-y-6">
      <h2 class="text-xs font-black text-gray-400 uppercase tracking-[0.4em] ml-4 mb-6">Onayınızı Bekleyen Topluluklar</h2>
      
      <div v-for="club in pendingClubs" :key="club.id" class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col md:flex-row items-center gap-8 group hover:-translate-y-1 transition-all overflow-hidden">
        <!-- LOGO KUTUSU (Renkli Destek) -->
        <div class="w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner flex-shrink-0 border border-gray-100 dark:border-white/5 overflow-hidden" :style="{ backgroundColor: club.color + '15', color: club.color }">
          <span v-if="isEmoji(club.emoji)">{{ club.emoji }}</span>
          <span v-else class="text-xl font-black uppercase tracking-tighter">{{ club.emoji }}</span>
        </div>
        
        <div class="flex-1 text-center md:text-left space-y-2 min-w-0">
          <div class="flex flex-col md:flex-row md:items-center gap-2">
            <span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">{{ club.category }}</span>
            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kurucu: @{{ club.founder?.username }}</span>
          </div>
          <h3 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">{{ club.name }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium italic line-clamp-3 overflow-hidden break-words">"{{ club.description }}"</p>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-3">
          <button @click="handleReject(club.id)" class="px-6 py-3 text-red-500 text-[10px] font-black uppercase rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100">Reddet</button>
          <button @click="handleApprove(club.id)" class="px-8 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-xl uppercase hover:bg-emerald-700 shadow-lg active:scale-95 transition-all">Uygundur Onayla</button>
        </div>
      </div>
    </div>

    <div v-else class="py-32 text-center bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl"><p class="text-gray-400 font-black uppercase text-xs tracking-widest italic">Onaylanacak başvuru bulunamadı.</p></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/api/client';
import { useToast } from 'vue-toastification';

const toast = useToast();
const loading = ref(true);
const pendingClubs = ref<any[]>([]);

const fetchPendingClubs = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get('/clubs/pending');
    pendingClubs.value = res.data;
  } catch { toast.error("Veriler alınamadı."); }
  finally { loading.value = false; }
};

const handleApprove = async (id: number) => {
  try { await apiClient.post(`/clubs/${id}/approve-academic`); toast.success("Topluluk için akademik onay verildi! 🛡️"); fetchPendingClubs(); }
  catch { toast.error("İşlem başarısız."); }
};

const handleReject = async (id: number) => {
  try { await apiClient.post(`/clubs/${id}/reject`); toast.warning("Başvuru reddedildi."); fetchPendingClubs(); }
  catch { toast.error("İşlem başarısız."); }
};

const isEmoji = (str: string) => {
  if (!str) return true;
  return /\p{Emoji}/u.test(str) && str.length <= 2;
};

onMounted(fetchPendingClubs);
</script>
