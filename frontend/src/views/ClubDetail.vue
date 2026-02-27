<!-- src/views/ClubDetail.vue -->
<template>
  <div class="max-w-4xl mx-auto p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans">
    
    <div v-if="loading" class="py-20 text-center flex flex-col items-center">
      <div class="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Yükleniyor</p>
    </div>

    <div v-else-if="club" class="space-y-12 text-center">
      <!-- Header -->
      <section class="relative pt-8 flex flex-col items-center">
        <button @click="$router.push('/campus/clubs')" class="absolute left-0 top-0 text-gray-400 hover:text-rose-500 transition-colors font-black uppercase text-[10px] tracking-widest outline-none group flex items-center gap-2">
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
          Geri Dön
        </button>

        <div class="w-32 h-32 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-2xl flex items-center justify-center text-6xl mb-8">
          {{ club.emoji }}
        </div>

        <div class="space-y-3">
          <span class="px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-full border border-rose-100 dark:border-rose-800 uppercase tracking-widest">
            {{ club.category }}
          </span>
          <h1 class="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
            {{ club.name }}
          </h1>
        </div>
      </section>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div class="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Üye Sayısı</p>
          <p class="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{{ club.memberCount }}</p>
        </div>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-center items-center">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Kurucu</p>
          <p class="text-sm font-black text-gray-900 dark:text-white uppercase truncate w-full">@{{ club.founder?.username }}</p>
        </div>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-center items-center">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Danışman</p>
          <p class="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase truncate w-full">{{ club.advisorName }}</p>
        </div>
      </div>

      <!-- Description -->
      <section class="max-w-2xl mx-auto">
        <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl">
          <p class="text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic text-lg">"{{ club.description }}"</p>
        </div>
      </section>

      <!-- Actions -->
      <section class="max-w-xs mx-auto space-y-4">
        <button 
          @click="handleToggleJoin"
          :disabled="joining"
          class="w-full py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
          :class="club.isJoined ? 'bg-white dark:bg-gray-800 text-rose-600 border border-rose-100 dark:border-rose-900/30' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20'"
        >
          {{ club.isJoined ? 'TOPLULUKTAN AYRIL' : 'TOPLULUĞA KATIL' }}
        </button>

        <!-- ADMIN SİLME BUTONU (TAM İSTEDİĞİN YERDE) -->
        <button 
          v-if="authStore.user?.role === 'ADMIN'"
          @click="handleDeleteClub"
          class="w-full py-4 text-red-500 hover:text-white hover:bg-red-500 border border-red-100 dark:border-red-900/30 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.3em] transition-all active:scale-95"
        >
          Topluluğu Kalıcı Olarak Sil
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const club = ref<any>(null);
const loading = ref(true);
const joining = ref(false);

const fetchClub = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get(`/clubs/${route.params.slug}`, {
      params: { currentUserId: authStore.user?.id }
    });
    club.value = res.data;
  } catch {
    toast.error("Topluluk bulunamadı.");
    router.push('/campus/clubs');
  } finally {
    loading.value = false;
  }
};

const handleToggleJoin = async () => {
  if (!authStore.isAuthenticated) {
    toast.info("Önce giriş yapmalısın.");
    router.push('/auth');
    return;
  }
  joining.value = true;
  try {
    const res = await apiClient.post(`/clubs/${club.value.id}/toggle-join`);
    club.value.isJoined = res.data.joined;
    club.value.memberCount += res.data.joined ? 1 : -1;
    toast.success(res.data.joined ? "Topluluğa katıldınız! ✨" : "Topluluktan ayrıldınız.");
  } catch {
    toast.error("İşlem başarısız.");
  } finally {
    joining.value = false;
  }
};

const handleDeleteClub = async () => {
  if (!confirm(`"${club.value.name}" topluluğunu silmek istediğine emin misin? Bu işlem geri alınamaz!`)) return;
  
  try {
    await apiClient.delete(`/clubs/${club.value.id}`);
    toast.success("Topluluk silindi.");
    router.push('/campus/clubs');
  } catch {
    toast.error("Silme işlemi başarısız.");
  }
};

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
};

onMounted(fetchClub);
</script>
