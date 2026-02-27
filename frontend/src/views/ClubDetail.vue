<!-- src/views/ClubDetail.vue -->
<template>
  <div class="max-w-4xl mx-auto p-6 pb-20 bg-white dark:bg-[#0b0f19] min-h-screen font-sans text-center">
    
    <!-- Loading -->
    <div v-if="loading" class="py-40 flex flex-col items-center">
      <div class="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Yükleniyor...</p>
    </div>

    <!-- Content -->
    <template v-else-if="club">
      <!-- Üst Gezinti (Sol Üstte Normal Akışta) -->
      <nav class="mb-6 flex justify-start">
        <button 
          @click="$router.push('/campus/clubs')" 
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-xl text-gray-400 hover:text-rose-500 transition-all font-black uppercase text-[9px] tracking-widest shadow-sm outline-none group"
        >
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
          TOPLULUK LİSTESİ
        </button>
      </nav>

      <!-- MERKEZİ HEADER -->
      <header class="pt-4 mb-12 space-y-6 flex flex-col items-center">
        <!-- Logo/Emoji -->
        <div class="w-32 h-32 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] flex items-center justify-center text-7xl shadow-2xl border border-gray-100 dark:border-white/5 transition-transform hover:scale-105 duration-500">
          {{ club.emoji }}
        </div>

        <!-- İsim ve Üst Bilgi -->
        <div class="space-y-6 w-full max-w-lg mx-auto">
          <h1 class="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
            {{ club.name }}
          </h1>
          
          <!-- Üçlü Bilgi Şeridi -->
          <div class="grid grid-cols-3 items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-y border-gray-100 dark:border-white/5 py-4">
            <div class="text-left flex flex-col gap-1">
              <span class="text-gray-300 dark:text-gray-600 text-[8px]">ÜYE SAYISI</span>
              <span class="text-gray-900 dark:text-white text-sm">{{ club.memberCount }}</span>
            </div>
            <div class="text-center flex flex-col gap-1">
              <span class="text-gray-300 dark:text-gray-600 text-[8px]">KATEGORİ</span>
              <span class="text-rose-600 dark:text-rose-400 text-sm">{{ club.category }}</span>
            </div>
            <div class="text-right flex flex-col gap-1">
              <span class="text-gray-300 dark:text-gray-600 text-[8px]">KURULUŞ</span>
              <span class="text-gray-900 dark:text-white text-sm">{{ new Date(club.createdAt).getFullYear() }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- ANA İÇERİK AKIŞI -->
      <main class="space-y-10 max-w-2xl mx-auto">
        
        <!-- 1. KULÜP AÇIKLAMASI (ÜSTTE) -->
        <div class="px-8 py-10 bg-gray-50/50 dark:bg-black/20 rounded-[2.5rem] border border-gray-100 dark:border-white/5 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V5C14.017 3.89543 14.9124 3 16.017 3H19.017C21.2261 3 23.017 4.79086 23.017 7V15C23.017 18.866 19.883 22 16.017 22H14.017V21ZM1 15V7C1 4.79086 2.79086 3 5 3H8C9.10457 3 10 3.89543 10 5V6C10 7.10457 9.10457 8 8 8H5C4.44772 8 4 8.44772 4 9V15C4 15.5523 4.44772 16 5 16H8C9.10457 16 10 16.8954 10 18V21H8C4.13401 22 1 18.866 1 15Z"/></svg>
          </div>
          <h3 class="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.4em] mb-4">Topluluk Hakkında</h3>
          <p class="text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic">
            "{{ club.description }}"
          </p>
        </div>

        <!-- 2. YÖNETİM EKİBİ (ALTTA) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Danışman -->
          <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl flex items-center gap-4 text-left">
            <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-blue-100 dark:border-blue-800">🛡️</div>
            <div>
              <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Akademik Danışman</p>
              <p class="text-sm font-black text-gray-900 dark:text-white uppercase leading-tight">{{ club.advisorName }}</p>
            </div>
          </div>

          <!-- Kurucu -->
          <div v-if="club.founder" class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl flex items-center gap-4 text-left">
            <img v-if="club.founder.avatarUrl" :src="club.founder.avatarUrl" class="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-100 dark:border-white/5" />
            <div v-else class="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-sm font-black text-indigo-600 shadow-inner">
              {{ club.founder.username.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Kurucu Başkan</p>
              <p class="text-sm font-black text-gray-900 dark:text-white uppercase leading-tight">{{ club.founder.fullName || club.founder.username }}</p>
            </div>
          </div>
        </div>

        <!-- 3. KATIL BUTONU -->
        <div class="pt-4">
          <button 
            @click="handleToggleJoin"
            :disabled="joinLoading"
            class="px-14 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl active:scale-95 disabled:opacity-50"
            :class="club.isJoined ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-white/5' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/30'"
          >
            <span v-if="joinLoading">...</span>
            <span v-else-if="club.isJoined" class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              ÜYESİSİN
            </span>
            <span v-else>TOPLULUĞA KATIL</span>
          </button>
          <p v-if="club.isJoined" class="mt-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-red-500 transition-colors" @click="handleToggleJoin">Ayrılmak mı istiyorsun?</p>
        </div>
      </main>

      <!-- Rozetler Placeholder -->
      <div class="mt-24 border-t border-gray-100 dark:border-white/5 pt-12">
        <h3 class="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8">Kazanılan Başarılar</h3>
        <div class="flex justify-center gap-6 opacity-20 grayscale">
          <div v-for="i in 3" :key="i" class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-xl shadow-inner">🔒</div>
        </div>
      </div>

    </template>
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
const joinLoading = ref(false);

const fetchClubDetail = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get(`/clubs/${route.params.slug}`, {
      params: { currentUserId: authStore.user?.id }
    });
    club.value = res.data;
  } catch (error) {
    toast.error("Hizmet şu an ulaşılamıyor.");
  } finally {
    loading.value = false;
  }
};

const handleToggleJoin = async () => {
  if (!club.value) return;
  joinLoading.value = true;
  try {
    const res = await apiClient.post(`/clubs/${club.value.id}/toggle-join`);
    club.value.isJoined = res.data.joined;
    club.value.memberCount += res.data.joined ? 1 : -1;
    toast.success(res.data.joined ? "Topluluğa katıldın! 🎭" : "Topluluktan ayrıldın.");
  } catch (error) {
    toast.error("İşlem başarısız.");
  } finally {
    joinLoading.value = false;
  }
};

onMounted(fetchClubDetail);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.1); border-radius: 10px; }
</style>
