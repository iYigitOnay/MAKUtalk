<!-- src/views/Clubs.vue -->
<template>
  <div class="max-w-5xl mx-auto p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans">
    
    <!-- HEADER -->
    <header class="mb-12 text-center pt-4">
      <button @click="$router.push('/campus')" class="inline-flex items-center gap-2 text-gray-400 hover:text-rose-500 transition-colors font-black uppercase text-[10px] tracking-widest mb-4 outline-none group">
        <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
        Rehbere Dön
      </button>
      <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
        Dijital <span class="text-rose-600">Topluluk</span>
      </h1>
    </header>

    <!-- KONTROL PANELİ -->
    <section class="max-w-4xl mx-auto mb-12 space-y-8 text-center">
      <div class="relative max-w-md mx-auto group">
        <input v-model="searchQuery" type="text" placeholder="Topluluk ara..." class="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 transition-all outline-none text-gray-900 dark:text-white font-bold shadow-sm" />
        <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div class="flex flex-col items-center gap-6">
        <div class="relative w-full overflow-hidden ml-4 h-20 flex items-center">
          <div ref="categoryNavRef" @scroll="handleCarouselScroll" class="flex items-center gap-4 overflow-x-auto px-[35%] scrollbar-hide snap-x snap-mandatory scroll-smooth w-full h-16">
            <div v-for="(cat, index) in clubCategories" :key="cat" class="flex-shrink-0 snap-center carousel-item">
              <button @click="selectedCategory = cat; centerCarouselItem(index)" :class="['w-28 h-11 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 border-2 px-3', selectedCategory === cat ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400 scale-90 opacity-60']">
                <span v-if="cat !== 'TÜMÜ'" class="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span class="text-[10px] font-black uppercase tracking-tight">{{ cat }}</span>
              </button>
            </div>
          </div>
        </div>
        <button @click="showCreateModal = true" class="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white transition-all shadow-lg active:scale-95">+ TOPLULUK KUR</button>
      </div>
    </section>

    <!-- CLUBS GRID -->
    <div v-if="loading" class="py-20 text-center flex flex-col items-center"><div class="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Yükleniyor</p></div>
    <div v-else-if="filteredClubs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
      <div v-for="club in filteredClubs" :key="club.id" class="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-7 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-1">
        <div>
          <div class="flex justify-between items-start mb-6 text-left">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100 dark:border-white/5 group-hover:rotate-6 transition-transform overflow-hidden" :style="{ backgroundColor: club.color + '15', color: club.color }">
              <span v-if="isEmoji(club.emoji)" class="text-4xl">{{ club.emoji }}</span>
              <span v-else class="text-xl font-black uppercase tracking-tighter">{{ club.emoji }}</span>
            </div>
            <span class="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[8px] font-black rounded-full border border-rose-100 dark:border-rose-800 uppercase tracking-widest">{{ club.category }}</span>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-3 leading-tight truncate text-left">{{ club.name }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 line-clamp-3 overflow-hidden break-words italic text-left h-12">"{{ club.description }}"</p>
        </div>
        <div class="flex items-center justify-between pt-5 border-t border-gray-50 dark:border-white/5">
          <div class="flex flex-col"><span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Üye</span><span class="text-base font-black text-gray-900 dark:text-white">{{ club.memberCount }}</span></div>
          <button @click="$router.push(`/campus/clubs/${club.slug}`)" class="px-7 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-sm">İncele</button>
        </div>
      </div>
    </div>

    <!-- CREATE MODAL -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-white/40 dark:bg-gray-950/70 backdrop-blur-xl" @click="showCreateModal = false"></div>
      <div class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 relative flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div class="p-8 pb-4 text-center w-full"><h3 class="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">Topluluk <span class="text-rose-600">Başvurusu</span></h3><p class="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Resmi Onay Süreci</p></div>
        
        <form @submit.prevent="handleCreateClub" class="p-8 pt-4 space-y-5 overflow-y-auto custom-scrollbar relative">
          <div class="space-y-4">
            <!-- TOPLULUK ADI -->
            <div class="space-y-1"><label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Topluluk Adı</label><input v-model="form.name" required type="text" placeholder="Topluluğun tam adı..." class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-rose-500/30 outline-none text-sm font-bold shadow-inner transition-all" /></div>
            
            <div class="grid grid-cols-2 gap-4">
              <!-- KATEGORİ (PREMIUM DROP DOWN) -->
              <div class="space-y-1 text-left relative">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori</label>
                <button type="button" @click="showCategoryDropdown = !showCategoryDropdown" class="w-full h-14 px-5 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-gray-700 transition-all shadow-inner border-2 border-transparent overflow-hidden" :class="{'border-rose-500/20': showCategoryDropdown}">
                  <span class="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">{{ form.category }}</span>
                  <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{'rotate-180': showCategoryDropdown}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <transition name="fade">
                  <div v-if="showCategoryDropdown" class="absolute z-[180] left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden">
                    <button v-for="cat in clubCategories.filter(c => c !== 'TÜMÜ')" :key="cat" @click="form.category = cat; showCategoryDropdown = false" type="button" class="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0">{{ cat }}</button>
                  </div>
                </transition>
              </div>

              <!-- İKON & RENK (KOMBO) -->
              <div class="space-y-1 text-left relative">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo Stili & Renk</label>
                <div class="flex gap-3">
                  <button type="button" @click="showEmojiGrid = !showEmojiGrid; showColorPicker = false" class="flex-1 h-14 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-700 transition-all shadow-inner border-2 border-transparent" :class="{'border-rose-500/40': showEmojiGrid}">
                    <span v-if="form.emoji" :class="isEmoji(form.emoji) ? 'text-2xl' : 'text-xs font-black uppercase tracking-tighter'" :style="{ color: isEmoji(form.emoji) ? '' : form.color }">{{ form.emoji }}</span>
                    <span v-else class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logo</span>
                  </button>
                  <div class="relative">
                    <button type="button" @click="showColorPicker = !showColorPicker; showEmojiGrid = false" class="w-14 h-14 rounded-2xl shadow-lg border-4 border-white dark:border-gray-800 transition-transform hover:scale-105" :style="{ backgroundColor: form.color }"></button>
                    <transition name="fade">
                      <div v-if="showColorPicker" class="absolute right-0 top-full mt-3 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-3xl shadow-2xl z-[200] grid grid-cols-3 gap-3 w-40">
                        <button v-for="color in chatThemes" :key="color" @click="form.color = color; showColorPicker = false" type="button" class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm transition-transform hover:scale-125" :style="{ backgroundColor: color }"></button>
                      </div>
                    </transition>
                  </div>
                </div>
                <transition name="fade">
                  <div v-if="showEmojiGrid" class="absolute z-[190] right-0 top-full mt-3 w-72 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-[2.5rem] shadow-2xl p-6 space-y-4">
                    <div class="space-y-2"><p class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Kısa İsim (Max 3 Harf)</p><input v-model="customIconText" maxlength="3" @input="form.emoji = customIconText.toUpperCase()" type="text" placeholder="Örn: MTU" class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest shadow-inner" :style="{ color: form.color }" /></div>
                    <div class="h-px bg-gray-50 dark:bg-white/5 w-full"></div>
                    <div class="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1"><button v-for="e in clubEmojis" :key="e" @click="form.emoji = e; customIconText = ''; showEmojiGrid = false" type="button" class="text-xl hover:scale-125 transition-transform p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">{{ e }}</button></div>
                  </div>
                </transition>
              </div>
            </div>
            
            <!-- DANIŞMAN SEÇİMİ -->
            <div class="space-y-1 relative text-left">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Akademik Danışman</label>
              <div class="relative group">
                <input v-model="advisorSearchQuery" @input="handleAdvisorSearch" type="text" placeholder="@hoca_adi ile ara..." class="w-full px-11 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500/30 outline-none text-sm font-bold shadow-inner transition-all" />
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-lg">@</span>
              </div>
              <transition name="fade">
                <div v-if="showAdvisorSuggestions" class="absolute z-[160] left-0 right-0 top-full mt-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden">
                  <div v-for="u in advisorSuggestions" :key="u.id" @click="selectAdvisor(u)" class="w-full flex items-center gap-4 px-5 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0 text-left">
                    <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 font-black shadow-sm text-sm">{{ u.username.charAt(0).toUpperCase() }}</div>
                    <div class="flex-1"><p class="text-xs font-black text-gray-900 dark:text-white leading-none mb-1">@{{ u.username }}</p><p class="text-[9px] text-gray-500 dark:text-gray-400 truncate">{{ u.fullName || u.email }}</p></div>
                  </div>
                </div>
              </transition>
              <!-- Seçili Hoca Rozeti -->
              <div v-if="selectedAdvisor" class="mt-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-between shadow-sm animate-in slide-in-from-left-2 duration-300 text-left">
                <div class="flex items-center gap-4 min-w-0">
                  <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                  <div class="min-w-0"><p class="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Danışman Kilitlendi</p><p class="text-xs font-black text-gray-900 dark:text-white uppercase truncate">{{ selectedAdvisor.fullName || selectedAdvisor.username }}</p></div>
                </div>
                <button type="button" @click="selectedAdvisor = null; form.advisorEmail = ''; advisorSearchQuery = ''" class="p-2 text-gray-400 hover:text-red-500 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            </div>

            <!-- AÇIKLAMA -->
            <div class="space-y-1 text-left"><label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Topluluk Açıklaması</label><textarea v-model="form.description" required rows="4" placeholder="Topluluğunuzu birkaç cümleyle anlatın..." class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-rose-500/30 outline-none text-sm font-medium resize-none shadow-inner"></textarea></div>
          </div>
          <div class="flex gap-4 pt-4"><button type="button" @click="showCreateModal = false" class="flex-1 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 outline-none">Vazgeç</button><button type="submit" :disabled="submitting" class="flex-[2] py-4 bg-rose-600 text-white text-[10px] font-black rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-500/30 uppercase tracking-widest active:scale-95 transition-all">BAŞVURUYU GÖNDER</button></div>
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

const toast = useToast();
const authStore = useAuthStore();
const searchQuery = ref("");
const selectedCategory = ref("TÜMÜ");
const clubs = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showCreateModal = ref(false);
const categoryNavRef = ref<HTMLElement | null>(null);

// Form UI State
const showEmojiGrid = ref(false);
const showColorPicker = ref(false);
const showCategoryDropdown = ref(false);
const customIconText = ref("");
const clubEmojis = ['🎭', '💻', '🏔️', '📸', '🏥', '🎸', '⚽', '🎨', '🚀', '🧠', '♟️', '🌍', '📐', '🥘', '🎥', '🌱', '🛡️', '⚔️', '⚖️', '🚲', '👟', '🧵', '🎼', '🧩'];
const chatThemes = ['#4f46e5', '#e11d48', '#2563eb', '#eab308', '#16a34a', '#9333ea'];

const isEmoji = (str: string) => {
  if (!str) return true;
  return /\p{Emoji}/u.test(str) && str.length <= 2;
};

// Advisor State
const advisorSearchQuery = ref("");
const advisorSuggestions = ref<any[]>([]);
const showAdvisorSuggestions = ref(false);
const selectedAdvisor = ref<any | null>(null);

const clubCategories = ["KÜLTÜR", "SPOR", "BİLİM", "TÜMÜ", "SANAT", "SOSYAL"];
const form = ref({ name: "", category: "KÜLTÜR", emoji: "", color: "#e11d48", advisorName: "", advisorEmail: "", description: "" });

const handleAdvisorSearch = async (e: any) => {
  const q = e.target.value.replace('@', '').trim();
  if (q.length >= 2) {
    try {
      const res = await apiClient.get(`/users/search-mentions?q=${q}`);
      advisorSuggestions.value = res.data;
      showAdvisorSuggestions.value = advisorSuggestions.value.length > 0;
    } catch { showAdvisorSuggestions.value = false; }
  } else { showAdvisorSuggestions.value = false; }
};

const selectAdvisor = (u: any) => {
  selectedAdvisor.value = u;
  form.value.advisorName = u.fullName || u.username;
  form.value.advisorEmail = u.email;
  advisorSearchQuery.value = `@${u.username}`;
  showAdvisorSuggestions.value = false;
};

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

const fetchClubs = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get('/clubs', { params: { currentUserId: authStore.user?.id } });
    clubs.value = res.data;
    if (clubs.value.length === 0) { await apiClient.post('/clubs/seed'); const r = await apiClient.get('/clubs', { params: { currentUserId: authStore.user?.id } }); clubs.value = r.data; }
  } catch { toast.error("Hata!"); }
  finally { loading.value = false; setTimeout(() => { centerCarouselItem(3); handleCarouselScroll(); }, 300); }
};

const handleCreateClub = async () => {
  if (!form.value.advisorEmail) { toast.error("Lütfen bir hoca seçin."); return; }
  if (!form.value.emoji) { toast.error("Lütfen bir ikon seçin."); return; }
  
  submitting.value = true;
  try {
    await apiClient.post('/clubs', form.value);
    toast.success("Başvuru iletildi! 🛡️");
    showCreateModal.value = false;
    form.value = { name: "", category: "KÜLTÜR", emoji: "", advisorName: "", advisorEmail: "", description: "" };
    selectedAdvisor.value = null; advisorSearchQuery.value = "";
  } catch (err: any) { toast.error(err.response?.data?.message || "Hata!"); }
  finally { submitting.value = false; }
};

onMounted(fetchClubs);

const filteredClubs = computed(() => {
  return clubs.value.filter(c => (c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.value.toLowerCase())) && (selectedCategory.value === "TÜMÜ" || c.category === selectedCategory.value));
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.1); border-radius: 10px; }
.carousel-item { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
