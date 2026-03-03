<!-- src/views/Campus.vue -->
<template>
  <div class="max-w-4xl mx-auto p-6 pb-20 bg-white dark:bg-gray-950 min-h-screen font-sans">
    <!-- Header -->
    <header class="mb-12">
      <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-2 text-center sm:text-left">
        MAKÜ <span class="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent pr-2">Rehberi</span>
      </h1>
      <p class="text-gray-500 font-black uppercase tracking-widest text-[10px] opacity-70 text-center sm:text-left">Kampüs hayatına dair her şey burada.</p>
    </header>

    <!-- Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 1. Haftalık Analiz (Mavi - Veri) -->
      <div @click="activeSubPage = 'analytics'" class="group relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden text-center sm:text-left">
        <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
        <div class="relative z-10 text-blue-600">
          <div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:rotate-12 transition-transform duration-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Haftalık Analiz</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Kampüsün nabzı burada atıyor. Trendleri keşfet.</p>
        </div>
      </div>

      <!-- 2. Eduroam (Mor - Teknoloji) -->
      <div @click="activeSubPage = 'eduroam'" class="group relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer overflow-hidden text-center sm:text-left">
        <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all"></div>
        <div class="relative z-10 text-purple-600">
          <div class="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform duration-500 text-purple-600">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.05 9.05 0 0112.728 0M1 7.071a14.121 14.121 0 0120 0" /></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Eduroam</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Kesintisiz internet için tüm cihazlarda hızlı kurulum rehberi.</p>
        </div>
      </div>

      <!-- 3. Yemekhane (Turuncu - İhtiyaç) -->
      <div @click="$router.push('/campus/cafeteria')" class="group relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-xl hover:shadow-orange-500/10 transition-all cursor-pointer overflow-hidden text-center sm:text-left">
        <div class="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all"></div>
        <div class="relative z-10 text-orange-600">
          <div class="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform duration-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 2v7c0 1.1.9 2 2 2h4v10a1 1 0 002 0V11h4c1.1 0 2-.9 2-2V2M7 2v4M12 2v4M17 2v4" /></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Yemekhane</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Haftalık yemek listesini gör, bugün ne yiyeceğine karar ver.</p>
        </div>
      </div>

      <!-- 4. MAKÜ-Spot (Sarı - Ticaret) -->
      <div @click="$router.push('/campus/spot')" class="group relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-xl hover:shadow-amber-500/10 transition-all cursor-pointer overflow-hidden text-center sm:text-left">
        <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>
        <div class="relative z-10 text-amber-600">
          <div class="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform duration-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">MAKÜ-Spot</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Öğrenciden öğrenciye pazar yeri. Kitap, eşya ve daha fazlası.</p>
        </div>
      </div>

      <!-- 5. Kulüpler (Kırmızı - Sosyal) -->
      <div @click="$router.push('/campus/clubs')" class="group relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-xl hover:shadow-rose-500/10 transition-all cursor-pointer overflow-hidden text-center sm:text-left">
        <div class="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all"></div>
        <div class="relative z-10 text-rose-600">
          <div class="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform duration-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Öğrenci Toplulukları</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Üniversite bünyesindeki tüm kulüpler ve katılım formları.</p>
        </div>
      </div>

      <!-- 6. Etkinlik Takvimi (Yeşil - Hareket) -->
      <div @click="$router.push('/campus/events')" class="group relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer overflow-hidden text-center sm:text-left">
        <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
        <div class="relative z-10 text-emerald-600">
          <div class="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform duration-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Etkinlik Takvimi</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Kampüsteki konser, seminer ve tüm etkinlikleri takip et.</p>
        </div>
      </div>
    </div>

    <!-- Modal for SubPages -->
    <div v-if="activeSubPage" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl animate-in fade-in duration-300">
      <div class="bg-white dark:bg-gray-900 w-full max-w-2xl h-[85vh] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-primary-900/20 relative flex flex-col overflow-hidden">
        <button @click="activeSubPage = null" class="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-50">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div class="p-8 flex-1 overflow-y-auto">
          <!-- Analytics Content -->
          <div v-if="activeSubPage === 'analytics'" class="space-y-10 pb-10">
            <div class="text-center space-y-4">
              <div class="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto animate-bounce shadow-xl shadow-blue-500/10">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h2 class="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Kampüs <span class="text-blue-600">Analizi</span></h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-black max-w-sm mx-auto leading-relaxed">MAKUtalk topluluğu büyüdükçe, kampüsün nabzını tutan algoritmalarımız burayı dolduracak.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="feature in [{i:'🔥', t:'Popüler Kategoriler', d:'Haftanın en çok paylaşım yapılan konuları.'}, {i:'📈', t:'Etkileşim Zirvesi', d:'Kampüsün en çok konuşulan Remaküleri.'}, {i:'⏱️', t:'Aktif Saatler', d:'Öğrencilerin en aktif olduğu zaman dilimleri.'}, {i:'🧠', t:'Duygu Analizi', d:'Topluluğun genel modu (Mutlu, heyecanlı vb.)'}]" :key="feature.t" class="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-2">
                <div class="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center text-lg shadow-sm border border-gray-100 dark:border-gray-800">{{ feature.i }}</div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{{ feature.t }}</p>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{{ feature.d }}</p>
              </div>
            </div>
          </div>

          <!-- Eduroam Content -->
          <div v-else-if="activeSubPage === 'eduroam'" class="space-y-8 pb-10">
            <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-3"><svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.05 9.05 0 0112.728 0M1 7.071a14.121 14.121 0 0120 0" /></svg>Eduroam Hızlı Kurulum</h2>
            <div class="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-3xl border border-purple-100 dark:border-purple-800 flex items-center gap-4"><div class="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-lg">!</div><p class="text-xs text-purple-900 dark:text-purple-200 font-black leading-tight">Giriş yaparken kullanıcı adınızın sonuna mutlaka <span class="underline decoration-2 underline-offset-2 text-purple-600">@ogr.mehmetakif.edu.tr</span> eklemelisiniz.</p></div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><button v-for="device in [{id:'android', n:'Android'}, {id:'ios', n:'iPhone/iPad'}, {id:'windows', n:'Windows'}, {id:'macos', n:'macOS'}]" :key="device.id" @click="activeDevice = device.id" class="p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 font-black" :class="activeDevice === device.id ? 'border-purple-500 bg-purple-500/5 text-purple-600' : 'border-gray-50 dark:border-gray-800 text-gray-400 hover:border-purple-200'"><span class="text-[10px] uppercase tracking-widest text-center">{{ device.n }}</span></button></div>
            <div class="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div v-if="activeDevice === 'android'" class="space-y-3"><div v-for="(step, i) in [{t:'Wi-Fi Ayarları', d:'Wi-Fi listesinden eduroam ağını seçin.'},{t:'EAP / Faz 2', d:'EAP: TTLS | Faz 2: PAP (veya GTC) seçin.'},{t:'Sertifika', d:'CA Sertifikası: Doğrulama veya Sertifika Belirtilmedi.'},{t:'Kimlik Bilgileri', d:'Kullanıcı Adı: numaranız@ogr.mehmetakif.edu.tr | Şifre: OBS Şifreniz'}]" :key="i" class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex gap-4 items-center"><span class="w-8 h-8 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center text-xs font-black text-purple-600 border border-purple-100">{{ i+1 }}</span><div><p class="text-[10px] font-black uppercase tracking-widest text-gray-400">{{ step.t }}</p><p class="text-sm font-black text-gray-700 dark:text-gray-200">{{ step.d }}</p></div></div></div>
              <div v-if="activeDevice === 'ios'" class="space-y-4"><div class="p-6 bg-purple-600 text-white rounded-[2rem] shadow-lg flex flex-col items-center gap-4"><p class="text-xs font-black uppercase tracking-[0.2em]">Hızlı Profil Kurulumu</p><a href="https://bidb.mehmetakif.edu.tr/tr/content/17628/ios-cihazlar-icin-kablosuz-internet-ayarlari" target="_blank" class="w-full py-3 bg-white text-purple-600 text-xs font-black rounded-xl uppercase tracking-widest text-center shadow-md hover:scale-[1.02] transition-transform">PROFiLi iNDiR</a></div></div>
              <div v-if="activeDevice === 'windows'" class="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4 font-black"><p class="text-[10px] font-black text-purple-600 uppercase tracking-widest">Windows 10/11 için:</p><p class="text-sm">Wi-Fi listesinden eduroam'ı seçip @ogr uzantılı mailiniz ve OBS şifrenizle giriş yapın.</p></div>
              <div v-if="activeDevice === 'macos'" class="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 font-black text-sm leading-relaxed">İndirilen dosyayı açın, "Sürdür" deyin ve numaranız@ogr kullanıcı adınızla kurulumu tamamlayın.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/api/client';
import { useToast } from 'vue-toastification';

const toast = useToast();
const activeSubPage = ref<string | null>(null);
const activeWeek = ref<'this' | 'next'>('this');
const activeDevice = ref('android');
const menuData = ref({ thisWeek: [], nextWeek: [] });
const loading = ref(false);

const fetchMenu = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get('/campus/cafeteria');
    menuData.value = res.data;
  } catch (error) {
    console.error("Fetch menu error:", error);
    toast.error("Yemek listesi şu an alınamıyor.");
  } finally {
    loading.value = false;
  }
};

const currentWeekMenu = computed(() => {
  return activeWeek.value === 'this' ? menuData.value.thisWeek : menuData.value.nextWeek;
});

const todayMenu = computed(() => {
  if (!menuData.value.thisWeek || menuData.value.thisWeek.length === 0) return null;
  const daysMap: Record<string, string> = { 'Monday': 'Pazartesi', 'Tuesday': 'Salı', 'Wednesday': 'Çarşamba', 'Thursday': 'Perşembe', 'Friday': 'Cuma' };
  const engDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  return menuData.value.thisWeek.find((m: any) => m.day === daysMap[engDay]);
});

onMounted(() => {
  fetchMenu();
});
</script>
