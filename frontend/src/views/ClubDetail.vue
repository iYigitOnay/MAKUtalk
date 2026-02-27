<!-- src/views/ClubDetail.vue -->
<template>
  <div class="max-w-4xl mx-auto p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans">
    
    <div v-if="loading" class="py-20 text-center flex flex-col items-center">
      <div class="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Yükleniyor</p>
    </div>

    <div v-else-if="club" class="flex flex-col items-center text-center space-y-12">
      
      <!-- 1. TOPLULUK IKONU -->
      <section class="relative w-full flex flex-col items-center pt-8">
        <button @click="$router.push('/campus/clubs')" class="absolute left-0 top-0 text-gray-400 hover:text-rose-500 transition-colors font-black uppercase text-[10px] tracking-widest outline-none group flex items-center gap-2">
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
          Geri Dön
        </button>

        <div class="w-32 h-32 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-2xl flex items-center justify-center text-6xl mb-6 animate-in zoom-in-95 duration-500">
          {{ club.emoji }}
        </div>

        <!-- 2. TOPLULUK ADI -->
        <h1 class="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none mb-4">
          {{ club.name }}
        </h1>

        <!-- 3. STATS LINE (Üye - Kategori - Kuruluş) -->
        <div class="flex items-center gap-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
          <span>{{ club.memberCount }} Üye</span>
          <span class="text-gray-300 dark:text-gray-800">•</span>
          <span class="text-rose-600 dark:text-rose-500">{{ club.category }}</span>
          <span class="text-gray-300 dark:text-gray-800">•</span>
          <span>{{ formatDate(club.createdAt) }}</span>
        </div>
      </section>

      <!-- 4. TOPLULUK HAKKINDA -->
      <section class="max-w-2xl w-full">
        <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all"></div>
          <p class="text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic text-lg relative z-10">
            "{{ club.description }}"
          </p>
        </div>
      </section>

      <!-- 5. AKADEMİK DANIŞMAN & KURUCU BAŞKAN -->
      <section class="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Danışman -->
        <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
          <div class="relative">
            <img v-if="club.advisorUser?.avatarUrl" :src="club.advisorUser.avatarUrl" class="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/20" />
            <div v-else class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 font-black text-lg shadow-inner border border-emerald-100/50">🎓</div>
            <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-950 flex items-center justify-center shadow-lg"><svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          </div>
          <div class="text-left overflow-hidden">
            <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Akademik Danışman</p>
            <p class="text-sm font-black text-gray-900 dark:text-white truncate uppercase">{{ club.advisorName }}</p>
          </div>
        </div>

        <!-- Kurucu -->
        <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
          <img v-if="club.founder?.avatarUrl" :src="club.founder.avatarUrl" class="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/20" />
          <div v-else class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-black text-lg shadow-inner">@</div>
          <div class="text-left overflow-hidden">
            <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Kurucu Başkan</p>
            <p class="text-sm font-black text-gray-900 dark:text-white truncate">@{{ club.founder?.username }}</p>
          </div>
        </div>
      </section>

      <!-- 6. KAZANILAN ROZETLER -->
      <section class="w-full max-w-2xl text-center space-y-4">
        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Kazanılan Rozetler</h3>
        <div class="flex flex-wrap justify-center gap-4">
          <!-- Henüz topluluk rozetleri yok ama altyapı hazır -->
          <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center grayscale opacity-30 border-2 border-dashed border-gray-300 dark:border-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" stroke-width="2" /></svg>
          </div>
          <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest w-full">Yakında Topluluk Başarıları Burada!</p>
        </div>
      </section>

      <!-- 7. TOPLULUĞA KATIL -->
      <section class="max-w-xs w-full space-y-4 pt-8">
        <button 
          @click="handleToggleJoin"
          :disabled="joining"
          class="w-full py-5 rounded-[2.5rem] text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
          :class="club.isJoined 
            ? 'bg-white dark:bg-gray-800 text-rose-600 border border-rose-100 dark:border-rose-900/30' 
            : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20'
          "
        >
          {{ club.isJoined ? 'TOPLULUKTAN AYRIL' : 'TOPLULUĞA KATIL' }}
        </button>

        <!-- 8. TOPLULUĞU SİL (ADMIN - ELİTE UI) -->
        <button 
          v-if="authStore.user?.role === 'ADMIN'"
          @click="handleDeleteClub"
          class="w-full py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.4em] transition-all bg-transparent text-red-500/60 hover:text-red-500 border border-red-500/10 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] active:scale-95"
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
    toast.error("Topluluk bilgileri alınamadı.");
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
    toast.success("Topluluk başarıyla silindi. 🛡️");
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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.1); border-radius: 10px; }
</style>
