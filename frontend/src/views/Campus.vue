<!-- src/views/Campus.vue -->
<template>
  <div class="max-w-4xl mx-auto p-6 pb-20 bg-white dark:bg-gray-950 min-h-screen font-sans">
    <!-- Header -->
    <header class="mb-12">
      <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-2 text-center sm:text-left">
        MAKÜ <span class="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent pr-2">Rehberi</span>
      </h1>
      <p class="text-gray-500 font-bold uppercase tracking-widest text-[10px] opacity-70 text-center sm:text-left">Kampüs hayatına dair her şey burada.</p>
    </header>

    <!-- Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 1. Yemekhane (Turuncu) -->
      <div @click="activeSubPage = 'cafeteria'" class="group relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-xl hover:shadow-orange-500/10 transition-all cursor-pointer overflow-hidden text-center sm:text-left">
        <div class="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all"></div>
        <div class="relative z-10 text-orange-600">
          <div class="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform duration-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 2v7c0 1.1.9 2 2 2h4v10a1 1 0 002 0V11h4c1.1 0 2-.9 2-2V2M7 2v4M12 2v4M17 2v4" /></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Yemekhane</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Haftalık yemek listesini gör, bugün ne yiyeceğine karar ver.</p>
        </div>
      </div>

      <!-- 2. Eduroam (Mor) -->
      <div @click="activeSubPage = 'eduroam'" class="group relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer overflow-hidden text-center sm:text-left">
        <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all"></div>
        <div class="relative z-10">
          <div class="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform duration-500 text-purple-600">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.05 9.05 0 0112.728 0M1 7.071a14.121 14.121 0 0120 0" /></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Eduroam</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Kesintisiz internet için tüm cihazlarda hızlı kurulum rehberi.</p>
        </div>
      </div>

      <!-- 3. Analizler (Yeşil) -->
      <div @click="activeSubPage = 'analytics'" class="group relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer overflow-hidden md:col-span-2 text-center sm:text-left">
        <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
          <div class="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 group-hover:rotate-12 transition-transform duration-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Haftalık Kampüs Analizi</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Topluluğun nabzını tutuyoruz. En çok konuşulan konular, artış gösteren kategoriler ve kampüs trendleri.</p>
          </div>
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
          <!-- 1. Yemekhane Subpage -->
          <div v-if="activeSubPage === 'cafeteria'" class="space-y-8 pb-10">
            <div class="flex flex-col gap-6">
              <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-3">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 2v7c0 1.1.9 2 2 2h4v10a1 1 0 002 0V11h4c1.1 0 2-.9 2-2V2M7 2v4M12 2v4M17 2v4" /></svg>
                Yemek Listesi
              </h2>
              <div class="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full sm:w-max font-bold">
                <button @click="activeWeek = 'this'" class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="activeWeek === 'this' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'">Bu Hafta</button>
                <button @click="activeWeek = 'next'" class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="activeWeek === 'next' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'">Gelecek Hafta</button>
              </div>
            </div>

            <div v-if="loading" class="py-20 text-center text-orange-500">
              <div class="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-sm font-black uppercase tracking-widest opacity-70">Liste Çekiliyor...</p>
            </div>

            <template v-else-if="currentWeekMenu.length > 0">
              <div v-if="activeWeek === 'this' && todayMenu" class="p-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden mb-8 font-bold">
                <div class="absolute top-0 right-0 p-6 opacity-10"><svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4v10a1 1 0 002 0V11h4c1.1 0 2-.9 2-2V2M7 2v4M12 2v4M17 2v4"/></svg></div>
                <div class="relative z-10">
                  <p class="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Bugünün Menüsü • {{ todayMenu.day }} ({{ getFormattedDate(todayMenu.day, 'this') }})</p>
                  <div class="space-y-2 mb-6 text-center sm:text-left">
                    <p v-for="item in todayMenu.items" :key="item" class="text-xl font-black tracking-tight leading-tight">{{ item }}</p>
                  </div>
                  <div class="flex justify-center sm:justify-start">
                    <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/10"><span class="text-xs font-black uppercase tracking-widest">{{ todayMenu.calorie }}</span></div>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="day in currentWeekMenu" :key="day.day" class="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700/50 group/day hover:border-orange-200 transition-colors">
                  <div class="flex justify-between items-start mb-3 font-bold text-center sm:text-left">
                    <p class="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">{{ day.day }}</p>
                    <p class="text-[9px] text-gray-400">{{ getFormattedDate(day.day, activeWeek) }}</p>
                  </div>
                  <div class="space-y-1 font-bold text-center sm:text-left"><p v-for="item in day.items" :key="item" class="text-xs text-gray-700 dark:text-gray-300 leading-tight">{{ item }}</p></div>
                  <p class="text-[9px] font-black text-gray-400 uppercase mt-4 text-center sm:text-left">{{ day.calorie }}</p>
                </div>
              </div>
            </template>
          </div>

          <!-- 2. Eduroam Subpage -->
          <div v-if="activeSubPage === 'eduroam'" class="space-y-8 pb-10">
            <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter flex items-center gap-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.05 9.05 0 0112.728 0M1 7.071a14.121 14.121 0 0120 0" /></svg>
              Eduroam Kurulumu
            </h2>
            <div class="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-[2.5rem] border border-purple-100 dark:border-purple-800 space-y-3 font-medium italic">
              <p class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">“eduroam” Üniversitemiz kablosuz internet erişim hizmeti yayınının adıdır. Bağlanmak için üniversitemize ait e-posta hesabına (@ogr.mehmetakif.edu.tr) sahip olmanız gerekir.</p>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button v-for="device in [{id:'android', n:'Android'}, {id:'ios', n:'iOS'}, {id:'windows', n:'Windows'}, {id:'macos', n:'macOS'}]" :key="device.id" @click="activeDevice = device.id" class="p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 font-black" :class="activeDevice === device.id ? 'border-purple-500 bg-purple-500/5 text-purple-600' : 'border-gray-50 dark:border-gray-800 text-gray-400 hover:border-purple-200'">
                <span class="text-[10px] uppercase tracking-widest">{{ device.n }}</span>
              </button>
            </div>
            <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div v-if="activeDevice === 'android'" class="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                <p class="text-xs font-black text-purple-600 uppercase tracking-widest mb-6">Android Ayarları</p>
                <ul class="space-y-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                  <li class="flex gap-3"><span>1.</span><span>Ayarlar > Bağlantılar > <strong>Wi-Fi</strong>'yi açın ve <strong>eduroam</strong> seçin.</span></li>
                  <li class="flex gap-3"><span>2.</span>
                    <div class="flex-1"><p class="mb-2 uppercase text-[9px] opacity-60">Teknik Detaylar:</p>
                      <div class="p-4 bg-white dark:bg-gray-950 rounded-2xl border border-purple-100 text-xs space-y-2">
                        <div class="flex justify-between"><span>EAP Yöntemi:</span><span class="font-black text-purple-600">TTLS</span></div>
                        <div class="flex justify-between border-t border-gray-50 pt-2"><span>Faz 2 Yetkisi:</span><span class="font-black text-purple-600">PAP</span></div>
                        <div class="flex justify-between border-t border-gray-50 pt-2"><span>CA Sertifika:</span><span class="font-black text-purple-600">Doğrulama</span></div>
                      </div>
                    </div>
                  </li>
                  <li class="flex gap-3"><span>3.</span>
                    <div class="flex-1"><p class="mb-2 uppercase text-[9px] opacity-60">Kimlik:</p>
                      <div class="p-4 bg-white dark:bg-gray-950 rounded-2xl border border-purple-100 text-xs font-bold leading-relaxed">
                        <p><strong>Kullanıcı Adı:</strong> numaran@ogr.mehmetakif.edu.tr</p>
                        <p><strong>İsimsiz Kimlik:</strong> numaran@ogr.mehmetakif.edu.tr</p>
                        <p><strong>Parola:</strong> OBS Şifreniz</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div v-if="activeDevice === 'ios'" class="space-y-6">
                <div class="p-6 bg-purple-600 text-white rounded-[2.5rem] shadow-xl text-center space-y-4">
                  <p class="text-xs font-black uppercase tracking-widest opacity-80">1. Aşama: Profil İndirme</p>
                  <a href="https://bidb.mehmetakif.edu.tr/tr/content/17628/ios-cihazlar-icin-kablosuz-internet-ayarlari" target="_blank" class="inline-flex px-8 py-3 bg-white text-purple-600 text-xs font-black rounded-xl uppercase tracking-widest shadow-lg">İndirme Sayfasına Git</a>
                </div>
                <div class="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                  <p class="text-xs font-black text-purple-600 uppercase tracking-widest mb-6 font-black">2. Aşama: Kurulum</p>
                  <ul class="space-y-4 text-sm text-gray-600 dark:text-gray-300 font-bold leading-relaxed">
                    <li class="flex gap-3"><span>1.</span><span>İndirilen profile tıklayın, <strong>YÜKLE</strong> deyin ve cihaz şifrenizi girin.</span></li>
                    <li class="flex gap-3"><span>2.</span><span>Kullanıcı adını <strong>numaran@ogr.mehmetakif.edu.tr</strong> olarak yazın.</span></li>
                    <li class="flex gap-3"><span>3.</span><span>Sertifika ekranında <strong>GÜVEN</strong> düğmesine basın.</span></li>
                  </ul>
                </div>
              </div>
              <div v-if="activeDevice === 'windows'" class="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                <p class="text-xs font-black text-purple-600 uppercase tracking-widest mb-4 font-black">Windows 8, 10 ve 11</p>
                <p class="text-sm font-medium text-gray-600 leading-relaxed mb-6 italic">Ağ listesinden eduroam seçip bağlan deyin ve @ogr uzantılı mailinizle giriş yapın.</p>
                <div class="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed border border-blue-100">
                  <strong>Misafir:</strong> Rektörlük B-Blok 2. Kat Bilgi İşlem'e başvurun.
                </div>
              </div>
              <div v-if="activeDevice === 'macos'" class="space-y-6">
                <div class="p-6 bg-purple-600 text-white rounded-[2.5rem] shadow-xl text-center space-y-4">
                  <p class="text-xs font-black uppercase tracking-widest opacity-80">Profil İndir</p>
                  <a href="https://bidb.mehmetakif.edu.tr/tr/content/17664/macos-cihazlar-icin-kablosuz-internet-ayarlari" target="_blank" class="inline-flex px-8 py-3 bg-white text-purple-600 text-xs font-black rounded-xl uppercase tracking-widest">Resmi Sayfaya Git</a>
                </div>
                <div class="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 text-sm font-bold leading-relaxed">
                  İndirilen dosyayı açıp 2 kez <strong>Sürdür</strong> deyin. Kullanıcı adı: <strong>numaran@ogr</strong> ve cihaz şifrenizle onaylayın.
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Analytics Subpage -->
          <div v-if="activeSubPage === 'analytics'" class="space-y-10 pb-10">
            <div class="text-center space-y-4">
              <div class="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto animate-bounce">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h2 class="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Veriler <span class="text-emerald-600">İşleniyor</span></h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">MAKUtalk topluluğu büyüdükçe, kampüsün nabzını tutan algoritmalarımız burayı dolduracak.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="feature in [{i:'🔥', t:'Popüler Kategoriler', d:'Haftanın en çok paylaşım yapılan konuları.'}, {i:'📊', t:'Etkileşim Zirvesi', d:'Kampüsün en çok konuşulan Remaküleri.'}, {i:'⏰', t:'Aktif Saatler', d:'Öğrencilerin en aktif olduğu zaman dilimleri.'}, {i:'🧠', t:'Duygu Analizi', d:'Topluluğun genel modu (Mutlu, heyecanlı vb.)'}]" :key="feature.t" class="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-2">
                <div class="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center text-lg shadow-sm border border-gray-100 dark:border-gray-800">{{ feature.i }}</div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{{ feature.t }}</p>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{{ feature.d }}</p>
              </div>
            </div>
            <div class="p-6 bg-emerald-600 text-white rounded-[2rem] shadow-xl text-center"><p class="text-xs font-black uppercase tracking-[0.2em] mb-1">Çok Yakında</p><p class="text-sm font-bold opacity-90 italic">"Algoritmalarımız kampüsü tanıyor..."</p></div>
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
  const daysMap: Record<string, string> = {
    'Monday': 'Pazartesi', 'Tuesday': 'Salı', 'Wednesday': 'Çarşamba', 'Thursday': 'Perşembe', 'Friday': 'Cuma'
  };
  const engDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todayName = daysMap[engDay];
  return menuData.value.thisWeek.find((m: any) => m.day === todayName);
});

const getFormattedDate = (dayName: string, week: 'this' | 'next') => {
  const daysMap: any = { 'Pazartesi': 1, 'Salı': 2, 'Çarşamba': 3, 'Perşembe': 4, 'Cuma': 5 };
  const targetDayNum = daysMap[dayName];
  if (!targetDayNum) return "";
  const now = new Date();
  const currentDay = now.getDay() || 7; 
  const diff = targetDayNum - currentDay + (week === 'next' ? 7 : 0);
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + diff);
  return targetDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
};

onMounted(() => {
  fetchMenu();
});
</script>
