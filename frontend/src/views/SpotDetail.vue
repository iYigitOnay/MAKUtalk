<!-- src/views/SpotDetail.vue -->
<template>
  <div class="max-w-4xl mx-auto p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans">
    
    <div v-if="loading" class="py-20 text-center flex flex-col items-center">
      <div class="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">Yükleniyor</p>
    </div>

    <div v-else-if="listing" class="flex flex-col items-center text-center space-y-10 animate-in fade-in duration-700">
      
      <section class="relative w-full flex flex-col items-center pt-8">
        <button @click="$router.push('/campus/spot')" class="absolute left-0 top-0 text-gray-400 hover:text-amber-500 transition-colors font-black uppercase text-xs tracking-widest outline-none group flex items-center gap-2">
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
          Geri Dön
        </button>

        <div class="w-28 h-28 rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-6 overflow-hidden border border-white dark:border-white/5 bg-white dark:bg-gray-900">
          <img v-if="listing.imageUrl" :src="listing.imageUrl" class="w-full h-full object-cover" />
          <span v-else class="text-3xl font-black uppercase tracking-tighter italic text-amber-500/20">MAKÜ</span>
        </div>

        <h1 class="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight mb-4 max-w-2xl">
          {{ listing.title }}
        </h1>

        <div class="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-white/5 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-white/5">
          <span v-if="listing.price" class="text-amber-600 font-black">₺{{ listing.price }}</span>
          <span v-if="listing.price" class="opacity-30">•</span>
          <span class="text-amber-500">{{ getCategoryName(listing.category) }}</span>
          <span class="opacity-30">•</span>
          <span>{{ formatDate(listing.createdAt) }}</span>
        </div>
      </section>

      <section class="w-full max-w-2xl text-center">
        <div class="bg-white dark:bg-gray-900/50 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
          <p class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic text-lg relative z-10 break-words whitespace-pre-wrap">
            "{{ listing.description }}"
          </p>
        </div>
      </section>

      <section class="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div @click="viewProfile" class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-sm group hover:border-amber-500/20 transition-all cursor-pointer">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 font-black text-xl shadow-inner border border-amber-100 dark:border-amber-900/30">@</div>
          <div class="text-left overflow-hidden">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">İlan Sahibi</p>
            <p class="text-sm font-black text-slate-800 dark:text-slate-200 truncate uppercase">@{{ listing.author.username }}</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-sm group hover:border-amber-500/20 transition-all">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 font-black text-xl shadow-inner border border-amber-100 dark:border-amber-900/30">📍</div>
          <div class="text-left overflow-hidden">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Konum / Buluşma</p>
            <p class="text-sm font-black text-slate-800 dark:text-slate-200 truncate uppercase">{{ listing.location || 'İstiklal Yerleşkesi' }}</p>
          </div>
        </div>
      </section>

      <section class="max-w-xs w-full space-y-4 pt-8">
        <button 
          v-if="!isOwner"
          @click="contactSeller"
          :disabled="isProcessing"
          class="w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {{ isProcessing ? 'Sohbet Başlatılıyor...' : 'İLAN SAHİBİNE YAZ' }}
        </button>

        <button v-if="isOwner || authStore.user?.role === 'ADMIN'" @click="isDeleteModalOpen = true" class="w-full py-4 text-[10px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-[0.3em] transition-colors outline-none">İlanı Kaldır</button>
      </section>

      <DeleteConfirmModal
        :is-open="isDeleteModalOpen"
        :is-deleting="deleting"
        title="İLANINI KALDIR"
        message="Bu ilanı kalıcı olarak kaldırmak istediğine emin misin?"
        confirm-text="EVET, KALDIR"
        @confirm="confirmDelete"
        @cancel="isDeleteModalOpen = false"
      />

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

const listing = ref<any>(null);
const loading = ref(true);
const deleting = ref(false);
const isProcessing = ref(false);
const isDeleteModalOpen = ref(false);

const isOwner = computed(() => authStore.user?.id === listing.value?.authorId);

const spotCategories = [
  { id: 'AL_SAT', name: 'AL-SAT' }, { id: 'EV_ARKADASI', name: 'EV ARKADAŞI' }, { id: 'KAMPUS_RADARI', name: 'KAMPÜS RADARI' }, { id: 'YOL_ARKADASI', name: 'YOL ARKADAŞI' }, { id: 'ODUNC', name: 'ÖDÜNÇ' }, { id: 'YETENEK', name: 'YETENEKLER' }, { id: 'STAJ_IS', name: 'STAJ & İŞ' }
];

const getCategoryName = (id: string) => spotCategories.find(c => c.id === id)?.name || id;
const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

const fetchListing = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get(`/spot/${route.params.id}`);
    listing.value = res.data;
  } catch {
    toast.error("İlan bulunamadı.");
    router.push('/campus/spot');
  } finally {
    loading.value = false;
  }
};

const contactSeller = async () => {
  if (!listing.value) return;
  const autoMessage = `Merhaba, "${listing.value.title}" ilanınız için yazıyorum.`;
  
  // Mesajlar sayfasına userId ve ilan referansıyla yönlendir
  router.push({ 
    path: '/messages',
    query: { 
      userId: listing.value.authorId,
      fromSpot: 'true',
      initialMessage: autoMessage 
    } 
  });
};

const viewProfile = () => {
  if (listing.value) router.push(`/profile/${listing.value.author.username}`);
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await apiClient.delete(`/spot/${listing.value.id}`);
    toast.success("İlan kaldırıldı.");
    router.push('/campus/spot');
  } catch {
    toast.error("Hata!");
  } finally {
    deleting.value = false;
    isDeleteModalOpen.value = false;
  }
};

onMounted(fetchListing);
</script>

<style scoped>
.break-words { overflow-wrap: break-word; word-break: break-word; }
</style>
