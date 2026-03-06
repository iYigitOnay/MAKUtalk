<!-- src/components/CreateEventModal.vue -->
<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal Card -->
        <div class="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 relative flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="px-8 py-6 text-center border-b border-gray-50 dark:border-white/5 relative">
            <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">
              Etkinlik <span class="text-emerald-600">Planla</span>
            </h3>
            <p class="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Kampüs Ritmi</p>
            <button @click="$emit('close')" class="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Form Content -->
          <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            
            <!-- Afiş Yükleme -->
            <div class="space-y-2">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Görsel (Opsiyonel)</label>
              <div @click="$refs.fileInput.click()" class="relative h-32 rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-gray-800/30 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/30 transition-all overflow-hidden group shadow-sm">
                <img v-if="imagePreview" :src="imagePreview" class="absolute inset-0 w-full h-full object-cover" />
                <div v-else class="text-center space-y-1 group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.414a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Afiş Ekle</p>
                </div>
                <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleImageSelect" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Başlık -->
              <div class="space-y-2 md:col-span-2">
                <label class="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest ml-1">Etkinlik Başlığı</label>
                <input v-model="form.title" required type="text" placeholder="Örn: Bahar Konseri" class="w-full px-5 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:border-emerald-500/50 text-sm font-bold dark:text-white transition-all shadow-sm" />
              </div>

              <!-- Tarih & Saat (CUSTOM PICKER) -->
              <div class="space-y-2 relative">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Zaman</label>
                <button type="button" @click="activeDropdown = activeDropdown === 'date' ? null : 'date'" class="w-full px-5 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl flex items-center justify-between gap-3 text-sm font-bold dark:text-white shadow-sm group">
                  <span :class="form.date ? 'text-gray-900 dark:text-white' : 'text-gray-400'" class="truncate text-left flex-1">{{ formattedDate || 'Tarih Seç' }}</span>
                  <svg class="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                
                <!-- Custom Date Picker Dropdown -->
                <transition name="slide-down">
                  <div v-if="activeDropdown === 'date'" class="absolute z-[160] top-[100%] left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 p-4 space-y-4">
                    <!-- Date Input -->
                    <div class="space-y-2">
                      <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Gün ve Saat Belirle</p>
                      <input 
                        type="datetime-local" 
                        v-model="form.date"
                        class="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold dark:text-white"
                      />
                    </div>
                    <button type="button" @click="activeDropdown = null" class="w-full py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-widest">Tamam</button>
                  </div>
                </transition>
              </div>

              <!-- Mekan -->
              <div class="space-y-2">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Mekan</label>
                <input v-model="form.location" required type="text" placeholder="Konferans Salonu vb." class="w-full px-5 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:border-emerald-500/50 text-sm font-bold dark:text-white transition-all shadow-sm" />
              </div>

              <!-- Etkinlik Tipi -->
              <div class="space-y-2 relative">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tip</label>
                <button type="button" @click="activeDropdown = activeDropdown === 'type' ? null : 'type'" class="w-full px-5 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl flex items-center justify-between text-sm font-bold dark:text-white shadow-sm">
                  <span>{{ form.type || 'Seçiniz' }}</span>
                  <svg class="w-4 h-4 text-emerald-500 transition-transform" :class="{ 'rotate-180': activeDropdown === 'type' }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <transition name="slide-down">
                  <div v-if="activeDropdown === 'type'" class="absolute z-[160] top-[100%] left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden py-1">
                    <button v-for="t in eventTypes" :key="t" @click="form.type = t; activeDropdown = null" type="button" class="w-full px-5 py-2 text-left text-[12px] font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors uppercase">{{ t }}</button>
                  </div>
                </transition>
              </div>

              <!-- Yerleşke -->
              <div class="space-y-2 relative">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Yerleşke</label>
                <button type="button" @click="activeDropdown = activeDropdown === 'campus' ? null : 'campus'" class="w-full px-5 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl flex items-center justify-between text-sm font-bold dark:text-white shadow-sm">
                  <span>{{ form.campus || 'Seçiniz' }}</span>
                  <svg class="w-4 h-4 text-emerald-500 transition-transform" :class="{ 'rotate-180': activeDropdown === 'campus' }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <transition name="slide-down">
                  <div v-if="activeDropdown === 'campus'" class="absolute z-[160] top-[100%] left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden py-1">
                    <button v-for="c in campuses" :key="c" @click="form.campus = c; activeDropdown = null" type="button" class="w-full px-5 py-2 text-left text-[12px] font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors uppercase">{{ c }}</button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Açıklama -->
            <div class="space-y-2">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Açıklama</label>
              <textarea v-model="form.description" required rows="3" placeholder="Etkinlik detayları..." class="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl outline-none focus:border-emerald-500/50 text-sm font-medium dark:text-white transition-all shadow-sm resize-none"></textarea>
            </div>

            <!-- Kulüp Seçimi -->
            <div v-if="myClubs.length > 0" class="space-y-2 relative">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Organize Eden</label>
              <button type="button" @click="activeDropdown = activeDropdown === 'club' ? null : 'club'" class="w-full px-5 py-3.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-center justify-between text-sm font-bold text-emerald-700 dark:text-emerald-400 shadow-sm">
                <span class="truncate">{{ selectedClubName || 'Kişisel / Akademik' }}</span>
                <svg class="w-4 h-4 transition-transform flex-shrink-0" :class="{ 'rotate-180': activeDropdown === 'club' }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <transition name="slide-down">
                <div v-if="activeDropdown === 'club'" class="absolute z-[160] top-[100%] left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden py-1 max-h-40 overflow-y-auto no-scrollbar">
                  <button @click="form.clubId = null; activeDropdown = null" type="button" class="w-full px-5 py-2 text-left text-[12px] font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300">Şahsi / Akademik</button>
                  <button v-for="club in myClubs" :key="club.id" @click="form.clubId = club.id; activeDropdown = null" type="button" class="w-full px-5 py-2 text-left text-[12px] font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 truncate">{{ club.name }}</button>
                </div>
              </transition>
            </div>
          </form>

          <!-- Footer Actions -->
          <div class="p-6 border-t border-gray-50 dark:border-white/5 flex gap-3 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
            <button @click="$emit('close')" class="flex-1 py-3.5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">Vazgeç</button>
            <button @click="handleSubmit" :disabled="loading" class="flex-[2] py-3.5 bg-emerald-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
              <span v-if="!loading">ETKİNLİĞİ PAYLAŞ</span>
              <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/api/client';
import { useToast } from 'vue-toastification';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'created']);
const toast = useToast();

const loading = ref(false);
const activeDropdown = ref<'type' | 'campus' | 'club' | 'date' | null>(null);
const imagePreview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const myClubs = ref<any[]>([]);

const campuses = ['İstiklal', 'Merkez', 'Bucak', 'Gölhisar'];
const eventTypes = ['KONSER', 'KONFERANS', 'SPOR', 'TOPLANTI', 'ATÖLYE', 'GEZİ', 'DİĞER'];

const form = ref({
  title: '',
  description: '',
  date: '',
  location: '',
  campus: 'İstiklal',
  type: 'KONSER',
  clubId: null as number | null
});

const formattedDate = computed(() => {
  if (!form.value.date) return null;
  const d = new Date(form.value.date);
  return d.toLocaleString('tr-TR', { 
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
  });
});

const selectedClubName = computed(() => {
  if (!form.value.clubId) return null;
  return myClubs.value.find(c => c.id === form.value.clubId)?.name;
});

const handleImageSelect = (e: any) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const fetchMyClubs = async () => {
  try {
    const res = await apiClient.get('/clubs/my-founded');
    myClubs.value = res.data;
  } catch { }
};

const handleSubmit = async () => {
  if (!form.value.title || !form.value.date || !form.value.description) {
    toast.error("Lütfen zorunlu alanları doldurun.");
    return;
  }
  loading.value = true;
  try {
    const formData = new FormData();
    Object.entries(form.value).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value.toString());
    });
    
    if (selectedFile.value) {
      formData.append('image', selectedFile.value);
    }

    await apiClient.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    toast.success("Etkinlik Paylaşıldı! 🚀");
    emit('created');
    emit('close');
    resetForm();
  } catch (error: any) {
    toast.error("Hata oluştu.");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = { title: '', description: '', date: '', location: '', campus: 'İstiklal', type: 'KONSER', clubId: null };
  imagePreview.value = null;
  selectedFile.value = null;
  activeDropdown.value = null;
};

onMounted(fetchMyClubs);
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease-out; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-5px); }

/* Standard date input styling inside custom picker */
input[type="datetime-local"] {
  color-scheme: light;
}
.dark input[type="datetime-local"] {
  color-scheme: dark;
}
</style>
