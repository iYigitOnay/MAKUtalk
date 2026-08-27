<!-- src/views/Spot.vue -->
<template>
  <div class="max-w-6xl mx-auto p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans text-left transition-colors duration-500">
    
    <!-- HEADER -->
    <header class="mb-12 text-center pt-8">
      <button @click="$router.push('/campus')" class="inline-flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-all font-black uppercase text-[9px] tracking-[0.3em] mb-4 outline-none group">
        <svg class="w-4 h-4 transition-transform group-hover:-translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" /></svg>
        GERİ DÖN
      </button>
      <h1 class="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none select-none">
        MAKÜ <span class="text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.2)]">SPOT</span>
      </h1>
      <p class="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em] mt-3">Dayanışma ve Kampüs Pazaryeri</p>
    </header>

    <!-- NAVIGATION & SEARCH -->
    <section class="max-w-5xl mx-auto mb-16 space-y-10 flex flex-col items-center">
      <div class="relative w-full max-w-lg group">
        <input v-model="searchQuery" type="text" placeholder="İlanlarda ara..." class="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#0d111d] border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-4 focus:ring-amber-500/10 transition-all outline-none text-gray-900 dark:text-white font-bold shadow-sm" />
        <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div class="flex flex-col items-center gap-8 w-full">
        <div class="relative w-full overflow-hidden h-16 flex items-center justify-center">
          <div ref="categoryNavRef" @scroll="handleCarouselScroll" class="flex items-center gap-4 overflow-x-auto px-[40%] scrollbar-hide snap-x snap-mandatory scroll-smooth w-full h-14">
            <div v-for="(cat, index) in spotCategories" :key="cat.id" class="flex-shrink-0 snap-center carousel-item">
              <button @click="selectedCategory = cat.id; centerCarouselItem(index)" :class="['min-w-[110px] h-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 border-2 px-4', selectedCategory === cat.id ? 'bg-amber-500 border-amber-500 text-white shadow-lg scale-105' : 'bg-white dark:bg-[#0d111d] border-gray-50 dark:border-white/5 text-gray-400 opacity-60 hover:opacity-100']">
                <span class="text-[9px] font-black uppercase tracking-widest">{{ cat.name }}</span>
              </button>
            </div>
          </div>
        </div>
        <button @click="showCreateModal = true" class="px-10 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-xl uppercase tracking-[0.3em] hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white transition-all shadow-xl active:scale-95">
          + İLAN OLUŞTUR
        </button>
      </div>
    </section>

    <!-- GRID LIST -->
    <div v-if="loading" class="py-32 text-center flex flex-col items-center">
      <div class="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Veriler Yükleniyor</p>
    </div>
    
    <div v-else-if="filteredListings.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <div v-for="item in filteredListings" :key="item.id" 
        class="group bg-white dark:bg-[#0d111d] border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col relative"
      >
        <!-- ASPECT RATIO CONTROLLED IMAGE -->
        <div class="relative aspect-[16/10] overflow-hidden bg-gray-50 dark:bg-black/20">
          <img v-if="item.imageUrl" :src="item.imageUrl" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="text-3xl font-black uppercase tracking-tighter italic opacity-5 select-none">MAKÜ</span>
          </div>

          <!-- FLOATING TAGS -->
          <div class="absolute top-6 left-6 flex flex-col gap-2">
            <span class="px-3 py-1 bg-white/80 dark:bg-black/40 backdrop-blur-md text-gray-900 dark:text-white text-[8px] font-black rounded-lg border border-white/10 uppercase tracking-widest shadow-sm">
              {{ getCategoryName(item.category) }}
            </span>
            <span v-if="item.price" class="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-tighter italic w-fit">
              ₺{{ item.price }}
            </span>
          </div>

          <!-- FLOATING MANAGEMENT (Owner/Admin) -->
          <div v-if="item.authorId === authStore.user?.id || authStore.user?.role === 'ADMIN'" 
            class="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <button @click.stop="openSoldModal(item.id)" class="w-10 h-10 bg-green-500/90 backdrop-blur-md text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
            </button>
            <button @click.stop="openDeleteModal(item.id)" class="w-10 h-10 bg-red-600/90 backdrop-blur-md text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        <!-- CONTENT AREA -->
        <div class="p-8 flex-1 flex flex-col">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight group-hover:text-amber-500 transition-colors line-clamp-1 italic">
              {{ item.title }}
            </h3>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic line-clamp-2 mb-8 opacity-70">
            "{{ item.description }}"
          </p>

          <!-- CARD FOOTER -->
          <div class="mt-auto pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-xs font-black text-amber-600 uppercase">
                {{ item.author.username.charAt(0) }}
              </div>
              <div class="flex flex-col">
                <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">SATICI</span>
                <span class="text-xs font-black text-gray-900 dark:text-white truncate max-w-[80px]">@{{ item.author.username }}</span>
              </div>
            </div>
            
            <button @click="$router.push(`/campus/spot/${item.id}`)" 
              class="h-11 px-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white transition-all active:scale-95"
            >
              İNCELE
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-48 text-center opacity-20">
      <p class="text-[10px] font-black uppercase tracking-[0.5em]">İlan Bulunamadı</p>
    </div>

    <!-- MODALS -->
    <DeleteConfirmModal
      :is-open="isDeleteModalOpen"
      :loading="submitting"
      variant="danger"
      title="İLANINI KALDIR"
      message="Bu ilanı kalıcı olarak kaldırmak istediğine emin misin?"
      confirm-text="EVET, KALDIR"
      @confirm="handleConfirmDelete"
      @cancel="isDeleteModalOpen = false"
    />

    <DeleteConfirmModal
      :is-open="isSoldModalOpen"
      :loading="submitting"
      variant="success"
      title="İLAN TAMAMLANDI"
      message="Bu ilanı tamamlandı olarak işaretlemek istediğine emin misin?"
      confirm-text="EVET, TAMAMLA"
      @confirm="handleConfirmSold"
      @cancel="isSoldModalOpen = false"
    />

    <!-- CREATE MODAL -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-xl" @click="showCreateModal = false"></div>
      <div class="bg-white dark:bg-[#0d111d] w-full max-w-md rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 relative flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div class="p-8 pb-4 text-center">
          <h3 class="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">Yeni <span class="text-amber-500">İlan</span></h3>
          <p class="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em]">MAKÜ SPOT</p>
        </div>
        <form @submit.prevent="handleCreateListing" class="p-8 pt-4 space-y-6 overflow-y-auto custom-scrollbar">
          <div class="space-y-3">
            <div @click="$refs.fileInput.click()" class="relative h-40 w-full rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex items-center justify-center cursor-pointer hover:border-amber-500/50 transition-all overflow-hidden">
              <input type="file" ref="fileInput" hidden accept="image/*" @change="handleFileChange" />
              <img v-if="previewImage" :src="previewImage" class="w-full h-full object-cover" />
              <div v-else class="text-center opacity-30">
                <p class="text-[9px] font-black uppercase tracking-widest">Görsel Seç</p>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <input v-model="form.title" required type="text" placeholder="Başlık" class="w-full px-5 py-4 bg-gray-50 dark:bg-black/20 rounded-2xl outline-none text-sm font-bold" />
            <div class="grid grid-cols-2 gap-4">
              <button type="button" @click="showCategoryDropdown = !showCategoryDropdown" class="w-full h-12 px-5 bg-gray-50 dark:bg-black/20 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white relative">
                {{ getCategoryName(form.category) }}
                <div v-if="showCategoryDropdown" class="absolute z-[200] left-0 right-0 top-full mt-2 bg-white dark:bg-[#1a1f2e] border border-gray-100 dark:border-white/5 rounded-xl shadow-2xl overflow-hidden">
                  <button v-for="cat in spotCategories.filter(c => c.id !== 'ALL')" :key="cat.id" @click="form.category = cat.id; showCategoryDropdown = false" type="button" class="w-full px-5 py-3 text-left hover:bg-amber-500 hover:text-white transition-colors uppercase tracking-widest text-[9px] font-black">{{ cat.name }}</button>
                </div>
              </button>
              <input v-model="form.price" type="number" step="0.01" placeholder="Fiyat" class="w-full h-12 px-5 bg-gray-50 dark:bg-black/20 rounded-2xl outline-none text-xs font-black" />
            </div>
            <textarea v-model="form.description" required rows="3" placeholder="Açıklama" class="w-full px-5 py-4 bg-gray-50 dark:bg-black/20 rounded-2xl outline-none text-sm font-medium resize-none shadow-inner"></textarea>
          </div>
          <div class="flex gap-4 pt-4">
            <button type="button" @click="showCreateModal = false" class="flex-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Vazgeç</button>
            <button type="submit" :disabled="submitting" class="flex-[2] py-4 bg-amber-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest active:scale-95">YAYINLA</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue';

const toast = useToast();
const authStore = useAuthStore();
const router = useRouter();
const searchQuery = ref("");
const selectedCategory = ref("ALL");
const listings = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showCreateModal = ref(false);
const showCategoryDropdown = ref(false);
const previewImage = ref<string | null>(null);
const categoryNavRef = ref<HTMLElement | null>(null);

const isDeleteModalOpen = ref(false);
const isSoldModalOpen = ref(false);
const selectedItemId = ref<number | null>(null);

const spotCategories = [
  { id: 'AL_SAT', name: 'AL-SAT' }, { id: 'EV_ARKADASI', name: 'EV ARKADAŞI' }, { id: 'KAMPUS_RADARI', name: 'KAMPÜS RADARI' }, { id: 'ALL', name: 'TÜMÜ' }, { id: 'YOL_ARKADASI', name: 'YOL ARKADAŞI' }, { id: 'ODUNC', name: 'ÖDÜNÇ' }, { id: 'YETENEK', name: 'YETENEKLER' }, { id: 'STAJ_IS', name: 'STAJ & İŞ' }
];

const form = ref({ title: "", description: "", price: null, category: "AL_SAT", location: "", contactInfo: "" });

const handleCarouselScroll = () => {
  const el = categoryNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll('.carousel-item');
  const containerRect = el.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;
  items.forEach((item: any) => {
    const itemRect = item.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const factor = Math.min(Math.abs(containerCenterX - itemCenterX) / (el.clientWidth / 2.5), 1);
    const btn = item.querySelector('button');
    if (btn) { btn.style.transform = `scale(${1.1 - (factor * 0.2)})`; btn.style.opacity = (1 - (factor * 0.6)).toString(); }
  });
};

const centerCarouselItem = (index: number) => {
  const el = categoryNavRef.value;
  if (!el) return;
  const target = el.querySelectorAll('.carousel-item')[index] as HTMLElement;
  if (target) el.scrollTo({ left: target.offsetLeft - (el.clientWidth / 2) + (target.clientWidth / 2), behavior: 'smooth' });
};

const handleFileChange = (e: any) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) { toast.error("Görsel 2MB'dan küçük olmalı."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { previewImage.value = ev.target?.result as string; };
    reader.readAsDataURL(file);
    // @ts-ignore
    form.value.imageFile = file;
  }
};

const fetchListings = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get('/spot');
    listings.value = res.data;
  } catch { toast.error("Hata!"); }
  finally { loading.value = false; setTimeout(() => { centerCarouselItem(3); handleCarouselScroll(); }, 300); }
};

const handleCreateListing = async () => {
  submitting.value = true;
  try {
    let imageUrl = null;
    // @ts-ignore
    if (form.value.imageFile) {
      const formData = new FormData();
      // @ts-ignore
      formData.append('file', form.value.imageFile);
      const uploadRes = await apiClient.post('/spot/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      imageUrl = uploadRes.data.url;
    }
    const payload = { title: form.value.title, description: form.value.description, price: form.value.price ? parseFloat(form.value.price.toString()) : null, category: form.value.category, location: form.value.location, imageUrl: imageUrl };
    await apiClient.post('/spot', payload);
    toast.success("İlan yayına alındı! 🚀");
    showCreateModal.value = false;
    form.value = { title: "", description: "", price: null, category: "AL_SAT", location: "", contactInfo: "" };
    previewImage.value = null;
    fetchListings();
  } catch (err: any) { toast.error(err.response?.data?.message || "Hata!"); }
  finally { submitting.value = false; }
};

const openSoldModal = (id: number) => { selectedItemId.value = id; isSoldModalOpen.value = true; };
const openDeleteModal = (id: number) => { selectedItemId.value = id; isDeleteModalOpen.value = true; };

const handleConfirmSold = async () => {
  if (!selectedItemId.value) return;
  submitting.value = true;
  try {
    await apiClient.patch(`/spot/${selectedItemId.value}/status`, { status: 'SOLD' });
    toast.success("İlan durumu güncellendi.");
    isSoldModalOpen.value = false;
    fetchListings();
  } catch (err: any) { toast.error(err.response?.data?.message || "Hata oluştu."); } 
  finally { submitting.value = false; }
};

const handleConfirmDelete = async () => {
  if (!selectedItemId.value) return;
  submitting.value = true;
  try {
    await apiClient.delete(`/spot/${selectedItemId.value}`);
    toast.success("İlan silindi.");
    isDeleteModalOpen.value = false;
    fetchListings();
  } catch (err: any) { toast.error(err.response?.data?.message || "Hata oluştu."); }
  finally { submitting.value = false; }
};

const getCategoryName = (id: string) => spotCategories.find(c => c.id === id)?.name || id;
const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

onMounted(fetchListings);

const filteredListings = computed(() => {
  return listings.value.filter(l => (l.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.value.toLowerCase())) && (selectedCategory.value === 'ALL' || l.category === selectedCategory.value));
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.2); border-radius: 10px; }
.carousel-item { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.no-arrows::-webkit-outer-spin-button, .no-arrows::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.no-arrows { -moz-appearance: textfield; }
</style>
