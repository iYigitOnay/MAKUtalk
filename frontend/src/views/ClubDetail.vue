<!-- src/views/ClubDetail.vue -->
<template>
  <div class="max-w-4xl mx-auto p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans">
    
    <div v-if="loading" class="py-20 text-center flex flex-col items-center">
      <div class="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-xs font-black uppercase tracking-widest text-gray-400">Yükleniyor</p>
    </div>

    <div v-else-if="club" class="flex flex-col items-center text-center space-y-10 animate-in fade-in duration-700">
      
      <!-- 1. ÜST NAVİGASYON & LOGO -->
      <section class="relative w-full flex flex-col items-center pt-8">
        <button @click="$router.push('/campus/clubs')" class="absolute left-0 top-0 text-gray-400 hover:text-rose-500 transition-colors font-black uppercase text-xs tracking-widest outline-none group flex items-center gap-2">
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
          Geri Dön
        </button>

        <!-- Dengeli Logo -->
        <div class="w-28 h-28 rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-6 overflow-hidden border border-white dark:border-white/5" 
          :style="{ 
            backgroundColor: isEmoji(club.emoji) ? '#e11d4810' : club.color + '10', 
            color: isEmoji(club.emoji) ? '#e11d48' : club.color 
          }"
        >
          <span v-if="isEmoji(club.emoji)" class="text-6xl">{{ club.emoji }}</span>
          <span v-else class="text-3xl font-black uppercase tracking-tighter">{{ club.emoji }}</span>
        </div>

        <!-- İdeal Boyutlu Başlık -->
        <h1 class="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight mb-4 max-w-2xl">
          {{ club.name }}
        </h1>

        <!-- Detay Bilgileri -->
        <div class="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-white/5 px-4 py-2 rounded-full shadow-sm">
          <span>{{ club.memberCount }} Üye</span>
          <span class="opacity-30">•</span>
          <span :style="{ color: isEmoji(club.emoji) ? '#e11d48' : club.color }">{{ club.category }}</span>
          <span class="opacity-30">•</span>
          <span>Kuruluş: {{ formatDate(club.createdAt) }}</span>
        </div>
      </section>

      <!-- 2. HAKKINDA -->
      <section class="w-full max-w-2xl">
        <div class="bg-white dark:bg-gray-900/50 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
          <p class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic text-lg relative z-10 break-words whitespace-pre-wrap text-center">
            "{{ club.description }}"
          </p>
        </div>
      </section>

      <!-- 3. EKİP KARTLARI -->
      <section class="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Danışman -->
        <div class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-sm group hover:border-emerald-500/20 transition-all">
          <img v-if="club.advisorUser?.avatarUrl" :src="club.advisorUser.avatarUrl" class="w-12 h-12 rounded-2xl object-cover border border-emerald-500/10" />
          <div v-else class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 font-black text-xl shadow-inner">🎓</div>
          <div class="text-left overflow-hidden">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Akademik Danışman</p>
            <p class="text-sm font-black text-slate-800 dark:text-slate-200 truncate uppercase">{{ club.advisorUser?.fullName || club.advisorName || 'Hoca' }}</p>
          </div>
        </div>

        <!-- Kurucu -->
        <div class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-sm group hover:border-blue-500/20 transition-all">
          <img v-if="club.founder?.avatarUrl" :src="club.founder.avatarUrl" class="w-12 h-12 rounded-2xl object-cover border border-blue-500/10" />
          <div v-else class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-black text-xl shadow-inner">@</div>
          <div class="text-left overflow-hidden">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Kurucu Başkan</p>
            <p class="text-sm font-black text-slate-800 dark:text-slate-200 truncate">@{{ club.founder?.username }}</p>
          </div>
        </div>
      </section>

      <!-- 4. ONUR TABLOSU -->
      <section class="w-full max-w-2xl space-y-6 pt-4">
        <h3 class="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.5em]">Başarı Rozetleri</h3>
        
        <div v-if="club.earnedBadges && club.earnedBadges.length > 0" class="flex flex-wrap justify-center gap-6">
          <div v-for="badge in club.earnedBadges" :key="badge.id" class="group/badge relative">
            <div class="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-gray-800 border border-slate-100 dark:border-white/5 shadow-xl flex items-center justify-center text-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 cursor-help" :style="{ color: badge.color, boxShadow: `0 10px 20px -5px ${badge.color}25` }">
              {{ badge.icon }}
            </div>
            <!-- Tooltip -->
            <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover/badge:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap shadow-2xl scale-90 group-hover/badge:scale-100">
              {{ badge.name }}
            </div>
          </div>
        </div>
        <div v-else class="py-4 text-center opacity-30 italic"><p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Henüz Rozet Takdim Edilmedi</p></div>

        <!-- Rozet Ver Butonu -->
        <div v-if="canAwardBadge" class="pt-4 animate-in slide-in-from-bottom-4 duration-500">
          <button @click="showBadgeModal = true" class="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white transition-all shadow-lg active:scale-95">
            + ROZET TAKDİM ET
          </button>
        </div>
      </section>

      <!-- 5. ANA AKSİYONLAR -->
      <section class="max-w-xs w-full space-y-4 pt-8">
        <button 
          @click="handleToggleJoin"
          :disabled="joining"
          class="w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl"
          :class="club.isJoined ? 'bg-white dark:bg-gray-800 border-2 border-slate-100 dark:border-white/5 shadow-none' : 'text-white'"
          :style="!club.isJoined 
            ? { backgroundColor: isEmoji(club.emoji) ? '#e11d48' : club.color, boxShadow: `0 15px 25px -5px ${isEmoji(club.emoji) ? '#e11d48' : club.color}40` } 
            : { color: isEmoji(club.emoji) ? '#e11d48' : club.color, borderColor: (isEmoji(club.emoji) ? '#e11d48' : club.color) + '30' }"
        >
          {{ club.isJoined ? 'TOPLULUKTAN AYRIL' : 'TOPLULUĞA KATIL' }}
        </button>

        <button v-if="authStore.user?.role === 'ADMIN'" @click="isDeleteModalOpen = true" class="w-full py-4 text-[10px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-[0.3em] transition-colors outline-none">Topluluğu Kalıcı Olarak Sil</button>
      </section>

      <!-- MODALLAR -->
      <DeleteConfirmModal :is-open="isDeleteModalOpen" :is-deleting="deleting" title="TOPLULUĞU SİL" message="Bu topluluk ve tüm üyelikleri kalıcı olarak silinecektir." confirm-text="EVET, SİL" @confirm="confirmDelete" @cancel="isDeleteModalOpen = false" />

      <!-- ROZET SEÇME MODALI -->
      <div v-if="showBadgeModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-white/60 dark:bg-gray-950/80 backdrop-blur-md" @click="showBadgeModal = false"></div>
        <div class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-white/10 relative z-10 animate-in zoom-in-95 duration-200">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2">Başarıyı <span class="text-rose-600">Ödüllendir</span></h3>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Topluluk Rozeti Seç</p>
          </div>
          <div class="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
            <button v-for="badge in allBadges" :key="badge.id" @click="handleAwardBadge(badge.id)" :disabled="isBadgeEarned(badge.id)" class="p-6 rounded-[2rem] border border-slate-50 dark:border-white/5 flex flex-col items-center gap-3 transition-all hover:border-rose-500/30 hover:shadow-xl group disabled:opacity-20 active:scale-95">
              <span class="text-4xl group-hover:scale-110 transition-transform">{{ badge.icon }}</span>
              <span class="text-[10px] font-black uppercase tracking-tight text-center leading-tight">{{ badge.name }}</span>
            </button>
          </div>
          <button @click="showBadgeModal = false" class="w-full mt-10 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200">VAZGEÇ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const club = ref<any>(null);
const allBadges = ref<any[]>([]);
const loading = ref(true);
const joining = ref(false);
const deleting = ref(false);
const isDeleteModalOpen = ref(false);
const showBadgeModal = ref(false);

const isEmoji = (str: string) => str && /\p{Emoji}/u.test(str) && str.length <= 2;
const isBadgeEarned = (badgeId: number) => club.value?.earnedBadges?.some((b: any) => b.id === badgeId);
const canAwardBadge = computed(() => {
  if (!authStore.user || !club.value) return false;
  return authStore.user.role === 'ADMIN' || authStore.user.email === club.value.advisorEmail;
});

const fetchClub = async () => {
  loading.value = true;
  try {
    const [resClub, resBadges] = await Promise.all([
      apiClient.get(`/clubs/${route.params.slug}`, { params: { currentUserId: authStore.user?.id } }),
      apiClient.get('/clubs/badges/all')
    ]);
    club.value = resClub.data;
    allBadges.value = resBadges.data;
  } catch {
    toast.error("Hata!");
    router.push('/campus/clubs');
  } finally { loading.value = false; }
};

const handleAwardBadge = async (badgeId: number) => {
  try {
    await apiClient.post(`/clubs/${club.value.id}/badges`, { badgeId });
    toast.success("Rozet takdim edildi! 🏆");
    showBadgeModal.value = false;
    fetchClub();
  } catch (err: any) { toast.error(err.response?.data?.message || "Hata!"); }
};

const handleToggleJoin = async () => {
  if (!authStore.isAuthenticated) { router.push('/auth'); return; }
  joining.value = true;
  try {
    const res = await apiClient.post(`/clubs/${club.value.id}/toggle-join`);
    club.value.isJoined = res.data.joined;
    club.value.memberCount += res.data.joined ? 1 : -1;
    toast.success(res.data.joined ? "Topluluğa katıldınız! ✨" : "Ayrıldınız.");
  } catch { toast.error("Hata!"); } finally { joining.value = false; }
};

const confirmDelete = async () => {
  deleting.value = true;
  try { await apiClient.delete(`/clubs/${club.value.id}`); router.push('/campus/clubs'); }
  catch { toast.error("Hata!"); } finally { deleting.value = false; }
};

const formatDate = (d: string) => new Date(d).getFullYear().toString();
onMounted(fetchClub);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
.break-words { overflow-wrap: break-word; word-break: break-word; }
</style>
