<!-- src/views/Spot.vue -->
<template>
  <div class="max-w-5xl mx-auto p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans text-left">
    
    <header class="mb-12 text-center pt-4">
      <button @click="$router.push('/campus')" class="inline-flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-colors font-black uppercase text-[10px] tracking-widest mb-4 outline-none group">
        <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
        Rehbere Dön
      </button>
      <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
        MAKÜ <span class="text-amber-500">SPOT</span>
      </h1>
    </header>

    <section class="max-w-4xl mx-auto mb-12 space-y-8 text-center flex flex-col items-center">
      <div class="relative w-full max-w-md group">
        <input v-model="searchQuery" type="text" placeholder="İlan ara..." class="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500/20 transition-all outline-none text-gray-900 dark:text-white font-bold shadow-sm" />
        <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div class="flex flex-col items-center gap-6 w-full">
        <div class="relative w-full overflow-hidden ml-4 h-20 flex items-center justify-center">
          <div ref="categoryNavRef" @scroll="handleCarouselScroll" class="flex items-center gap-4 overflow-x-auto px-[35%] scrollbar-hide snap-x snap-mandatory scroll-smooth w-full h-16">
            <div v-for="(cat, index) in spotCategories" :key="cat.id" class="flex-shrink-0 snap-center carousel-item">
              <button @click="selectedCategory = cat.id; centerCarouselItem(index)" :class="['w-28 h-11 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 border-2 px-3', selectedCategory === cat.id ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400 scale-90 opacity-60']">
                <span v-if="cat.id !== 'ALL'" class="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span class="text-[10px] font-black uppercase tracking-tight">{{ cat.name }}</span>
              </button>
            </div>
          </div>
        </div>
        <button @click="showCreateModal = true" class="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95">
          + İLAN VER
        </button>
      </div>
    </section>

    <div v-if="loading" class="py-20 text-center flex flex-col items-center"><div class="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Yükleniyor</p></div>
    
    <div v-else-if="filteredListings.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
      <div v-for="item in filteredListings" :key="item.id" class="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-7 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-1">
        <div>
          <div class="flex justify-between items-start mb-6 text-left">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100 dark:border-white/5 group-hover:rotate-6 transition-transform overflow-hidden relative bg-amber-50 dark:bg-amber-900/10 text-amber-500/20">
              <img v-if="item.imageUrl" :src="item.imageUrl" class="w-full h-full object-cover" />
              <span v-else class="text-xl font-black uppercase tracking-tighter italic">MAKÜ</span>
            </div>
            <div class="flex flex-col items-end gap-2 text-right">
              <span class="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[8px] font-black rounded-full border border-amber-100 dark:border-amber-800 uppercase tracking-widest">{{ getCategoryName(item.category) }}</span>
              <span v-if="item.price" class="text-base font-black text-gray-900 dark:text-white leading-none">₺{{ item.price }}</span>
            </div>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-3 leading-tight truncate text-left">{{ item.title }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 line-clamp-2 italic text-left">"{{ item.description }}"</p>
        </div>
          <div class="mt-auto pt-5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
            <div class="flex flex-col text-left">
              <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">İlan Sahibi</span>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-amber-100 dark:bg-orange-900/30 flex items-center justify-center text-[10px] font-black text-amber-600 uppercase">{{ item.author.username.charAt(0) }}</div>
                <span class="text-xs font-black text-gray-900 dark:text-white truncate max-w-[120px]">@{{ item.author.username }}</span>
              </div>
            </div>
          <button @click="$router.push(`/campus/spot/${item.id}`)" class="px-7 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white transition-all active:scale-95 shadow-sm">İncele</button>
        </div>
      </div>
    </div>

    <div v-else class="py-32 text-center opacity-30"><p class="text-xs font-black uppercase tracking-[0.3em]">Henüz ilan bulunamadı.</p></div>

    <div v-if="showCreateModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4 text-left">
      <div class="absolute inset-0 bg-white/40 dark:bg-gray-950/70 backdrop-blur-xl" @click="showCreateModal = false"></div>
      <div class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 relative flex flex-col overflow-hidden max-h-[95vh] animate-in zoom-in-95 duration-300">
        <div class="p-8 pb-4 text-center w-full">
          <h3 class="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">Yeni <span class="text-amber-500">İlan</span></h3>
          <p class="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Pazaryerine Katıl</p>
        </div>
        <form @submit.prevent="handleCreateListing" class="p-8 pt-4 space-y-5 overflow-y-auto custom-scrollbar relative">
          <div class="space-y-2">
            <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">İlan Fotoğrafı</label>
            <div @click="$refs.fileInput.click()" class="relative h-40 w-full rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:border-amber-500/50 transition-all overflow-hidden shadow-inner">
              <input type="file" ref="fileInput" hidden accept="image/*" @change="handleFileChange" />
              <img v-if="previewImage" :src="previewImage" class="w-full h-full object-cover" />
              <div v-else class="text-center opacity-40"><svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2"/></svg><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Görsel Seç</p></div>
              <button v-if="previewImage" @click.stop="previewImage = null; form.imageFile = null" class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg></button>
            </div>
          </div>
          <div class="space-y-4">
            <div class="space-y-1 text-left">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">İlan Başlığı</label>
              <input v-model="form.title" required type="text" placeholder="Ne sunuyorsun?" class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl outline-none text-sm font-bold shadow-inner" />
            </div>
            <div class="grid grid-cols-2 gap-4 text-left">
              <div class="space-y-1 relative">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori</label>
                <button type="button" @click="showCategoryDropdown = !showCategoryDropdown" class="w-full h-14 px-5 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-gray-700 transition-all shadow-inner border-2 border-transparent" :class="{'border-amber-500/20': showCategoryDropdown}">
                  <span class="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">{{ getCategoryName(form.category) }}</span>
                  <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{'rotate-180': showCategoryDropdown}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <transition name="fade">
                  <div v-if="showCategoryDropdown" class="absolute z-[180] left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <button v-for="cat in spotCategories.filter(c => c.id !== 'ALL')" :key="cat.id" @click="form.category = cat.id; showCategoryDropdown = false" type="button" class="w-full px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-gray-50 dark:border-white/5 last:border-0">{{ cat.name }}</button>
                  </div>
                </transition>
              </div>
              <div class="space-y-1 relative">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Fiyat (Opsiyonel)</label>
                <div class="relative">
                  <span class="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-amber-600">₺</span>
                  <input v-model="form.price" type="number" step="0.01" placeholder="0.00" class="w-full h-14 pl-10 pr-5 bg-slate-50 dark:bg-gray-800 rounded-2xl outline-none text-xs font-black shadow-inner no-arrows" />
                </div>
              </div>
            </div>
            <div class="space-y-1 text-left">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Konum / Buluşma Noktası</label>
              <input v-model="form.location" type="text" placeholder="Örn: İstiklal Yerleşkesi" class="w-full h-14 px-5 bg-slate-50 dark:bg-gray-800 rounded-2xl outline-none text-[10px] font-bold shadow-inner" />
            </div>
            <div class="space-y-1 text-left">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block">İlan Açıklaması</label>
              <textarea v-model="form.description" required rows="3" placeholder="Ürün durumu, detaylar..." class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl outline-none text-sm font-medium resize-none shadow-inner"></textarea>
            </div>
          </div>
          <div class="flex gap-4 pt-4">
            <button type="button" @click="showCreateModal = false" class="flex-1 py-4 text-gray-400 text-[10px] font-black uppercase outline-none">Vazgeç</button>
            <button type="submit" :disabled="submitting" class="flex-[2] py-4 bg-amber-500 text-white text-[10px] font-black rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/30 uppercase tracking-widest active:scale-95 transition-all">İLANLARA EKLE</button>
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
    if (btn) { btn.style.transform = `scale(${1.15 - (factor * 0.3)})`; btn.style.opacity = (1 - (factor * 0.7)).toString(); }
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
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.1); border-radius: 10px; }
.carousel-item { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.no-arrows::-webkit-outer-spin-button, .no-arrows::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.no-arrows { -moz-appearance: textfield; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
