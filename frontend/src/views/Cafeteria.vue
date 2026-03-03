<!-- src/views/Cafeteria.vue -->
<template>
  <div class="max-w-5xl mx-auto p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans transition-colors duration-500">
    
    <!-- HEADER -->
    <header class="mb-12 text-center pt-4">
      <button
        @click="$router.push('/campus')"
        class="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors font-black uppercase text-[10px] tracking-widest mb-4 outline-none group"
      >
        <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
        Rehbere Dön
      </button>
      <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
        Yemekhane <span class="text-orange-600">Menüsü</span>
      </h1>
    </header>

    <!-- KONTROL PANELİ (Filtreler) -->
    <section class="max-w-4xl mx-auto mb-12 space-y-10 text-center">
      
      <!-- 1. Hafta Filtresi (Pill Style) -->
      <div class="flex justify-center">
        <div class="flex p-1.5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 w-full max-w-xs font-black">
          <button 
            @click="activeWeek = 'this'" 
            class="flex-1 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
            :class="activeWeek === 'this' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'"
          >Bu Hafta</button>
          <button 
            @click="activeWeek = 'next'" 
            class="flex-1 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
            :class="activeWeek === 'next' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'"
          >Gelecek Hafta</button>
        </div>
      </div>

      <!-- 2. Yerleşke Filtresi (Carousel Style) -->
      <div class="flex flex-col items-center gap-6">
        <div class="relative w-full overflow-hidden h-24 flex items-center">
          <div
            ref="locationNavRef"
            @scroll="handleCarouselScroll"
            class="flex items-center gap-4 overflow-x-auto px-[30%] scrollbar-hide snap-x snap-mandatory scroll-smooth w-full h-20"
          >
            <div
              v-for="(loc, index) in locations"
              :key="loc.id"
              class="flex-shrink-0 snap-center carousel-item"
            >
              <button
                @click="selectedLocation = loc.id; centerCarouselItem(index);"
                :class="[
                  'w-40 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-500 border-2 px-4',
                  selectedLocation === loc.id
                    ? 'bg-orange-600 border-orange-600 text-white shadow-xl scale-110'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400 scale-90 opacity-60',
                ]"
              >
                <span class="text-[10px] font-black uppercase tracking-widest">{{ loc.name }}</span>
                <span v-if="selectedLocation === loc.id" class="text-[8px] font-bold opacity-80 uppercase tracking-tighter">{{ loc.desc }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTENT -->
    <div v-if="currentMenuData.length > 0" class="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- BUGÜNÜN MENÜSÜ -->
      <div v-if="activeWeek === 'this' && todayMenu" class="group relative p-8 md:p-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-[3rem] text-white shadow-2xl overflow-hidden hover:scale-[1.01] transition-all duration-500">
        <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div class="space-y-8 flex-1 text-left">
            <div class="inline-flex items-center gap-3 px-5 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/10">
              <span class="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
              <span class="text-[11px] font-black uppercase tracking-widest">Günün Menüsü • {{ todayMenu.day }}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              <div v-for="(item, i) in todayMenu.items" :key="i" class="flex items-center gap-4 group/item h-12">
                <div class="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center font-black text-xs group-hover/item:bg-white group-hover/item:text-orange-600 transition-all duration-300 flex-shrink-0">
                  {{ i + 1 }}
                </div>
                <p class="text-lg font-black tracking-tight leading-tight line-clamp-2 group-hover/item:translate-x-1 transition-transform">
                  {{ item }}
                </p>
              </div>
            </div>
          </div>
          <div v-if="todayMenu.calorie" class="flex flex-col items-center md:items-end gap-1 bg-black/10 p-6 rounded-[2.5rem] backdrop-blur-sm border border-white/5">
            <span class="text-5xl font-black tracking-tighter">{{ todayMenu.calorie.split(' ')[0] }}</span>
            <span class="text-[9px] font-black uppercase tracking-[0.4em] opacity-70">KALORİ / KCAL</span>
          </div>
        </div>
      </div>

      <!-- HAFTALIK LİSTE (GRID) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="day in currentMenuData" 
          :key="day.day" 
          class="group p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 flex flex-col justify-between"
          :class="{ 'ring-4 ring-orange-500/10 border-orange-500/20': isToday(day.day) && activeWeek === 'this' }"
        >
          <div class="space-y-6 text-left">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.2em]">{{ day.day }}</span>
              <div v-if="isToday(day.day) && activeWeek === 'this'" class="px-3 py-1 bg-orange-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest shadow-sm">BUGÜN</div>
            </div>
            <div class="space-y-3">
              <p v-for="item in day.items" :key="item" class="text-[14px] font-bold text-gray-700 dark:text-gray-300 leading-tight group-hover:text-orange-600 transition-colors flex items-start gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-200 dark:bg-orange-900 mt-1.5 flex-shrink-0"></span>
                {{ item }}
              </p>
            </div>
          </div>
          <div v-if="day.calorie" class="mt-8 pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{{ day.calorie }}</span>
            <svg class="w-5 h-5 text-gray-100 dark:text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
          </div>
        </div>
      </div>

      <!-- FOOTER INFO -->
      <div class="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20 flex flex-col md:flex-row items-center gap-6">
        <div class="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div class="text-center md:text-left">
          <h4 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">SKS Daire Başkanlığı</h4>
          <p class="text-[11px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed mt-1 italic">"Yemek rezervasyonlarınızı OBS üzerinden yapmayı unutmayınız."</p>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else class="py-32 text-center bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5 max-w-4xl mx-auto">
      <p class="text-gray-400 font-black uppercase tracking-widest text-xs italic">Menü şu an güncelleniyor.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const activeWeek = ref<'this' | 'next'>('this');
const selectedLocation = ref<'central' | 'district'>('central');
const loading = ref(false);
const locationNavRef = ref<HTMLElement | null>(null);

const locations = [
  { id: 'central', name: 'Merkez Yerleşkeler', desc: 'Avşar, Merkez, İlahiyat' },
  { id: 'district', name: 'İlçe Yemekhaneleri', desc: 'Bucak, Gölhisar ve Diğer' }
];

// GERÇEK VERİLER (Senin gönderdiklerin)
const realData = {
  central: {
    thisWeek: [
      { day: 'Pazartesi', items: ['Mahluta Çorba', 'Et Döner', 'Pirinç Pilavı', 'Ayran'], calorie: '950 Kalori' },
      { day: 'Salı', items: ['Tavuk Çorba', 'Mantı / Yoğurt', 'Zeytinyağlı Barbunya', 'Tatlı'], calorie: '1280 Kalori' },
      { day: 'Çarşamba', items: ['Yayla Çorba', 'Beşamel Soslu Tavuk', 'Domatesli Bulgur Pilavı', 'Mevsim Salata'], calorie: '980 Kalori' },
      { day: 'Perşembe', items: ['Mercimek Çorba', 'Zeytinyağlı Pırasa', 'Kıymalı Kol Böreği', 'Hoşaf'], calorie: '1175 Kalori' },
      { day: 'Cuma', items: ['Tarhana Çorba', 'Püreli Rulo Köfte', 'Cevizli Erişte', 'Tatlı'], calorie: '1200 Kalori' }
    ],
    nextWeek: [
      { day: 'Pazartesi', items: ['Tarhana Çorba', 'Etli Bezelye', 'Safranlı Pilav', 'Haydari'], calorie: '940 Kalori' },
      { day: 'Salı', items: ['Ezogelin Çorba', 'Orman Kebabı', 'Dereotlu Bulgur Pilavı', 'Tatlı'], calorie: '1150 Kalori' },
      { day: 'Çarşamba', items: ['Mantar Çorba', 'Kuru Fasulye', 'Özbek Pilavı', 'Turşu'], calorie: '940 Kalori' },
      { day: 'Perşembe', items: ['Şehriye Çorba', 'Kaşarlı Köfte', 'Sade Makarna', 'Ayran'], calorie: '950 Kalori' },
      { day: 'Cuma', items: ['Köy Çorba', 'Fırın Tavuk But', 'Arpa Şehriye Pilavı', 'Havuç Tarator'], calorie: '1000 Kalori' }
    ]
  },
  district: {
    thisWeek: [
      { day: 'Pazartesi', items: ['Tarhana Çorbası', 'Patates Oturtma', 'Pirinç Pilavı', 'Şam Tatlısı'], calorie: '' },
      { day: 'Salı', items: ['Domates Çorbası', 'Rosto Köfte+Patates Püresi', 'Bulgur Pilavı', 'Mevsim Meyvesi'], calorie: '' },
      { day: 'Çarşamba', items: ['Mercimek Çorbası', 'Şehzade Kebabı', 'Şehriyeli Pilav', 'Mevsim Salatası'], calorie: '' },
      { day: 'Perşembe', items: ['Ezogelin Çorbası', 'Etli Kuru Fasulye', 'Bulgur Pilavı', 'Cacık'], calorie: '' },
      { day: 'Cuma', items: ['Yayla Çorbası', 'Mantarlı Tavuk Sote', 'Soslu Makarna', 'Mor Lahana Salatası'], calorie: '' }
    ],
    nextWeek: [
      { day: 'Pazartesi', items: ['Tandır Çorba', 'Patlıcan Musakka', 'Soslu Makarna', 'Yoğurt'], calorie: '' },
      { day: 'Salı', items: ['Tarhana Çorbası', 'Tavuk Döner', 'Pirinç Pilavı', 'Ayran'], calorie: '' },
      { day: 'Çarşamba', items: ['Yayla Çorbası', 'Etli Nohut', 'Meyane Pilavı', 'Treliçe'], calorie: '' },
      { day: 'Perşembe', items: ['Mercimek Çorbası', 'Tas Kebabı', 'Arpa Şehriyeli Pirinç Pilavı', 'Mevsim Salatası'], calorie: '' },
      { day: 'Cuma', items: ['Ezogelin Çorbası', 'Köfte Şiş', 'Soslu Makarna', 'Kakaolu Puding'], calorie: '' }
    ]
  }
};

const handleCarouselScroll = () => {
  const el = locationNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll(".carousel-item");
  const containerRect = el.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;
  items.forEach((item: any) => {
    const itemRect = item.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const factor = Math.min(Math.abs(containerCenterX - itemCenterX) / (el.clientWidth / 2.5), 1);
    const btn = item.querySelector("button");
    if (btn) {
      btn.style.transform = `scale(${1.1 - factor * 0.2})`;
      btn.style.opacity = (1 - factor * 0.5).toString();
    }
  });
};

const centerCarouselItem = (index: number) => {
  const el = locationNavRef.value;
  if (!el) return;
  const target = el.querySelectorAll(".carousel-item")[index] as HTMLElement;
  if (target) el.scrollTo({ left: target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2, behavior: "smooth" });
};

const currentMenuData = computed(() => {
  const group = selectedLocation.value === 'central' ? realData.central : realData.district;
  return activeWeek.value === 'this' ? group.thisWeek : group.nextWeek;
});

const todayMenu = computed(() => {
  const menu = currentMenuData.value;
  if (!menu || menu.length === 0) return null;
  const daysMap: Record<string, string> = { 'Monday': 'Pazartesi', 'Tuesday': 'Salı', 'Wednesday': 'Çarşamba', 'Thursday': 'Perşembe', 'Friday': 'Cuma' };
  const engDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  return menu.find((m: any) => m.day === (daysMap[engDay] || 'Pazartesi'));
});

const isToday = (dayName: string) => {
  const daysMap: Record<string, string> = { 'Monday': 'Pazartesi', 'Tuesday': 'Salı', 'Wednesday': 'Çarşamba', 'Thursday': 'Perşembe', 'Friday': 'Cuma' };
  const engDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  return (daysMap[engDay] || 'Pazartesi') === dayName;
};

onMounted(() => {
  setTimeout(() => { centerCarouselItem(0); handleCarouselScroll(); }, 300);
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.carousel-item { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.animate-in { animation-duration: 0.6s; }
</style>
