<!-- src/components/EditProfileModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl" @click="$emit('close')"></div>
    
    <div class="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-primary-900/20 relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Profili Düzenle</h3>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Cover & Avatar Preview -->
        <div class="relative mb-16">
          <div class="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl overflow-hidden relative group">
            <img v-if="editData.coverUrl" :src="editData.coverUrl" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="text-white text-xs font-black bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">Kapak Fotoğrafı URL Değiştir</span>
            </div>
          </div>
          <div class="absolute -bottom-10 left-6">
            <div class="p-1 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow-xl relative group">
              <img v-if="editData.avatarUrl" :src="editData.avatarUrl" class="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 object-cover" />
              <div v-else class="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 bg-blue-500 flex items-center justify-center text-white text-2xl font-black">
                {{ userInitial }}
              </div>
              <div class="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ad Soyad</label>
            <input v-model="editData.fullName" type="text" class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm font-black" placeholder="Adınız Soyadınız" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kullanıcı Adı</label>
            <input v-model="editData.username" type="text" disabled class="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border-2 border-transparent text-gray-400 outline-none text-sm font-black cursor-not-allowed" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bölüm</label>
            <input v-model="editData.department" type="text" class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm font-black" placeholder="Örn: Bilgisayar Mühendisliği" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sınıf / Yıl</label>
            <input v-model="editData.class" type="text" class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm font-black" placeholder="Örn: 3. Sınıf" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biyografi</label>
          <textarea v-model="editData.bio" rows="3" class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm font-black resize-none" placeholder="Kendinden bahset..."></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profil Fotoğrafı URL</label>
            <input v-model="editData.avatarUrl" type="text" class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm font-black" placeholder="https://..." />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kapak Fotoğrafı URL</label>
            <input v-model="editData.coverUrl" type="text" class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 outline-none transition-all text-sm font-black" placeholder="https://..." />
          </div>
        </div>

        <!-- Privacy Toggle -->
        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <p class="text-sm font-black text-gray-900 dark:text-white">Gizli Hesap</p>
              <p class="text-[10px] text-gray-400 font-black uppercase">Sadece takipçilerin görür</p>
            </div>
          </div>
          <button 
            @click="editData.isPrivate = !editData.isPrivate"
            class="w-12 h-6 rounded-full transition-all relative"
            :class="editData.isPrivate ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'"
          >
            <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" :class="editData.isPrivate ? 'translate-x-6' : 'translate-x-0'"></div>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <button 
          @click="handleSave"
          :disabled="loading"
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  user: any;
}>();

const emit = defineEmits(['close', 'save']);

const loading = ref(false);
const editData = ref({
  fullName: '',
  username: '',
  bio: '',
  department: '',
  class: '',
  avatarUrl: '',
  coverUrl: '',
  isPrivate: false
});

const userInitial = ref('');

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.user) {
    editData.value = {
      fullName: props.user.fullName || '',
      username: props.user.username || '',
      bio: props.user.bio || '',
      department: props.user.department || '',
      class: props.user.class || '',
      avatarUrl: props.user.avatarUrl || '',
      coverUrl: props.user.coverUrl || '',
      isPrivate: props.user.isPrivate || false
    };
    userInitial.value = (props.user.fullName || props.user.username || '?').charAt(0).toUpperCase();
  }
}, { immediate: true });

const handleSave = async () => {
  loading.value = true;
  try {
    emit('save', { ...editData.value });
  } finally {
    loading.value = false;
  }
};
</script>
