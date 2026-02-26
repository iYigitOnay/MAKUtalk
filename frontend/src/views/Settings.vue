<!-- src/views/Settings.vue -->
<template>
  <div class="max-w-2xl mx-auto border-x border-gray-200 dark:border-primary-900/30 min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300 relative">
    
    <!-- Header -->
    <div class="sticky top-0 z-10 backdrop-blur bg-white/90 dark:bg-gray-950/90 border-b border-gray-100 dark:border-primary-900/20 px-4 py-4 flex items-center gap-4">
      <button v-if="activeSection" @click="activeSection = (activeSection === 'blocked' ? 'privacy' : null)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">{{ sectionTitle }}</h2>
        <p v-if="!activeSection" class="text-xs font-medium text-gray-500 italic">Senin alanın, senin kuralların.</p>
      </div>
    </div>

    <!-- Main Navigation -->
    <div v-if="!activeSection" class="divide-y divide-gray-50 dark:divide-primary-900/10">
      <button @click="activeSection = 'account'" class="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all group text-left">
        <div class="flex items-center gap-5">
          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <div><p class="text-[15px] font-bold text-gray-900 dark:text-white">Hesabım</p><p class="text-xs text-gray-500 mt-0.5">Güvenlik, şifre ve gece modu ayarları.</p></div>
        </div>
        <svg class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </button>

      <button @click="activeSection = 'privacy'" class="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all group text-left">
        <div class="flex items-center gap-5">
          <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <div><p class="text-[15px] font-bold text-gray-900 dark:text-white">Gizlilik & Güvenlik</p><p class="text-xs text-gray-500 mt-0.5">Hesap görünürlüğü ve veri kontrolü.</p></div>
        </div>
        <svg class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </button>

      <button @click="activeSection = 'help'" class="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all group text-left">
        <div class="flex items-center gap-5"><svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><div><p class="text-[15px] font-bold text-gray-900 dark:text-white">Yardım Merkezi</p></div></div>
        <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </button>

      <button @click="logout" class="w-full p-5 flex items-center gap-5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group text-left">
        <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        <p class="text-[15px] font-bold text-red-500">Oturumu Kapat</p>
      </button>
    </div>

    <!-- Detaylar -->
    <div v-else class="flex-1 p-6 animate-in fade-in slide-in-from-right-3 duration-200">
      
      <!-- Hesabım İçeriği -->
      <div v-if="activeSection === 'account'" class="space-y-8">
        <!-- ... (Profil verileri ve şifre kısımları) ... -->
        <div class="p-6 bg-gray-50/50 dark:bg-gray-900/40 rounded-[2rem] border border-gray-100 dark:border-primary-900/10"><p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Profil Verileri</p><div class="space-y-5"><div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-500 uppercase tracking-tighter">Kullanıcı Adı</span><span class="text-sm font-bold text-gray-900 dark:text-gray-200">@{{ authStore.user?.username }}</span></div><div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-500 uppercase tracking-tighter">E-posta</span><span class="text-sm font-bold text-gray-900 dark:text-gray-200">{{ authStore.user?.email }}</span></div><div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-500 uppercase tracking-tighter">Şifre</span><div class="flex items-center gap-3"><span class="text-sm font-bold transition-all duration-300" :class="isPasswordVisible ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 font-black tracking-[0.3em]'">{{ isPasswordVisible ? revealedPassword : '••••••••' }}</span><button @click="showVerifyModal = true" class="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 rounded-xl transition-all active:scale-90 shadow-sm bg-white dark:bg-gray-800"><svg v-if="!isPasswordVisible" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg><svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg></button></div></div></div></div>
        <div class="p-5 bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-primary-900/10 flex items-center justify-between"><div class="flex items-center gap-4"><svg v-if="!isDarkMode" class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 000 14 7 7 0 000-14z" /></svg><svg v-else class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg><span class="text-[15px] font-bold text-gray-900 dark:text-white">Gece Modu</span></div><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" :checked="isDarkMode" @change="toggleDarkMode" class="sr-only peer"><div class="w-11 h-6 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-transparent rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600 after:shadow-sm"></div></label></div>
        <div class="space-y-4 pt-4"><button @click="showUpdatePasswordModal = true" class="w-full py-4 relative group overflow-hidden rounded-2xl transition-all active:scale-95 border-2 border-blue-600/10"><div class="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all"></div><span class="relative z-10 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>Şifreyi Güncelle</span></button><button @click="handleDeleteAccount" class="w-full py-4 text-red-600 hover:text-red-700 font-black text-[10px] tracking-[0.3em] transition-all group flex items-center justify-center gap-3"><svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>HESABI KALICI OLARAK SİL</button></div>
      </div>

      <!-- Gizlilik & Güvenlik İçeriği -->
      <div v-if="activeSection === 'privacy'" class="space-y-6">
        <!-- Hesap Görünürlüğü -->
        <div class="p-6 bg-gray-50/50 dark:bg-gray-900/40 rounded-[2.5rem] border border-gray-100 dark:border-primary-900/10 shadow-sm relative overflow-hidden">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Hesap Görünürlüğü</p>
          <div class="flex items-center justify-between p-5 bg-white dark:bg-gray-950 border border-purple-500/10 rounded-2xl shadow-sm">
            <div class="flex items-center gap-4">
              <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <div class="flex flex-col"><span class="text-[15px] font-bold text-gray-900 dark:text-white">Gizli Hesap</span><span class="text-[10px] text-gray-500">Sadece takipçilerin paylaşımlarını görebilir.</span></div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" :checked="authStore.user?.isPrivate" @change="toggleAccountPrivacy" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-transparent rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-indigo-600 after:shadow-sm"></div>
            </label>
          </div>
        </div>

        <button @click="openBlockedList" class="w-full p-5 flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/10 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group">
          <div class="flex items-center gap-4">
            <div class="text-red-500 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-[15px] font-bold text-gray-900 dark:text-white">Engellenen Hesaplar</span>
          </div>
          <svg class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div v-if="activeSection === 'blocked'" class="space-y-6">
        <div v-if="blockedUsers.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-900/20 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-primary-900/10">
          <div class="text-4xl mb-4 text-gray-300">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-bold text-gray-500">Henüz kimseyi engellemedin.</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="block in blockedUsers" :key="block.id" class="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/10 rounded-2xl flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-gray-500">{{ block.blocked.username.charAt(0).toUpperCase() }}</div>
              <div>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ block.blocked.fullName || block.blocked.username }}</p>
                <p class="text-[10px] text-gray-500">@{{ block.blocked.username }}</p>
              </div>
            </div>
            <button @click="handleUnblock(block.blocked.id)" class="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-500 hover:text-white text-gray-600 dark:text-gray-400 text-[10px] font-black rounded-full transition-all">ENGELİ KALDIR</button>
          </div>
        </div>
      </div>

      <!-- Yardım Merkezi -->
      <div v-if="activeSection === 'help'" class="space-y-6">
        <div class="p-8 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 rounded-[32px] text-white relative overflow-hidden shadow-2xl">
          <h4 class="text-2xl font-black mb-2 italic tracking-tight">Destek Hattı</h4>
          <p class="text-blue-100 text-sm mb-8 leading-relaxed font-medium">Bize her zaman ulaşabilirsin.</p>
          <a href="mailto:makutalk.iletisim@gmail.com" class="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 text-sm font-black rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-xl uppercase">E-posta Gönder</a>
        </div>
      </div>
    </div>

    <!-- Modallar aynı kalacak... -->
    <div v-if="showVerifyModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4"><div class="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl" @click="showVerifyModal = false"></div><div class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-primary-900/20 relative z-10 animate-in zoom-in-95 duration-300"><div class="text-center mb-8"><div class="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5 rounded-3xl mx-auto mb-6"><div class="bg-white dark:bg-gray-900 w-full h-full rounded-[1.4rem] flex items-center justify-center text-blue-600"><svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div></div><h3 class="text-xl font-black text-gray-900 dark:text-white">Kimlik Doğrulama</h3><p class="text-xs text-gray-500 mt-2">Hassas verileri görmek için parolanızı girin.</p></div><input v-model="verifyPassword" type="password" placeholder="••••••••" class="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500/30 transition-all outline-none text-center font-black tracking-widest dark:text-white mb-6"><div class="flex flex-col gap-3"><button @click="handleVerify" class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase">Doğrula</button><button @click="showVerifyModal = false" class="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Vazgeç</button></div></div></div>
    <div v-if="showUpdatePasswordModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4"><div class="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl" @click="closeUpdatePasswordModal"></div><div class="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-primary-900/20 relative z-10 animate-in zoom-in-95 duration-300"><div v-if="updateStep === 1" class="space-y-6"><div class="text-center"><h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Şifre Yenileme</h3><p class="text-xs text-gray-500 mt-2">Kayıtlı e-posta adresinizi girin.</p></div><input v-model="updateEmail" type="email" placeholder="E-posta Adresiniz" class="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500/30 transition-all outline-none font-bold dark:text-white shadow-inner text-center"><button @click="sendResetCode" :disabled="loading" class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all">{{ loading ? 'GÖNDERİLİYOR...' : 'ONAY KODU GÖNDER' }}</button></div><div v-if="updateStep === 2" class="space-y-6"><div class="text-center"><h3 class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Kodu Onayla</h3><p class="text-xs text-gray-500 mt-2">Mailinize gelen 6 haneli kodu ve yeni şifrenizi girin.</p></div><div class="space-y-3"><input v-model="verificationCode" type="text" placeholder="000000" maxlength="6" class="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500/30 transition-all outline-none text-center font-black tracking-[0.5em] dark:text-white text-xl"><input v-model="newPassword" type="password" placeholder="Yeni Şifre" class="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500/30 transition-all outline-none font-bold dark:text-white text-center"></div><button @click="handleResetPassword" :disabled="loading" class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all">{{ loading ? 'GÜNCELLENİYOR...' : 'ŞİFREYİ GÜNCELLE' }}</button></div><button @click="closeUpdatePasswordModal" class="w-full mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-gray-600 transition-colors">KAPAT</button></div></div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useDarkMode } from "@/composables/useDarkMode";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const { toggleDarkMode: toggle } = useDarkMode();
const isDarkMode = ref(document.documentElement.classList.contains("dark"));

const activeSection = ref<string | null>(null);
const loading = ref(false);

// Kimlik Doğrulama
const showVerifyModal = ref(false);
const verifyPassword = ref("");
const isPasswordVisible = ref(false);
const revealedPassword = ref("");

// Şifre Güncelleme
const showUpdatePasswordModal = ref(false);
const updateStep = ref(1);
const updateEmail = ref("");
const verificationCode = ref("");
const newPassword = ref("");

// Engellenenler
const blockedUsers = ref<any[]>([]);

const handleVerify = async () => {
  if (!verifyPassword.value) return toast.error("Lütfen şifrenizi girin.");
  try {
    const response = await apiClient.post("/auth/verify-password", { password: verifyPassword.value });
    if (response.data.valid) {
      revealedPassword.value = verifyPassword.value;
      isPasswordVisible.value = true;
      showVerifyModal.value = false;
      verifyPassword.value = "";
      toast.success("Kimlik doğrulandı! ✨");
      setTimeout(() => { isPasswordVisible.value = false; revealedPassword.value = ""; }, 10000);
    } else {
      toast.error("Hatalı şifre!");
    }
  } catch { toast.error("Doğrulama hatası."); }
};

const sendResetCode = async () => {
  if (!updateEmail.value) return toast.error("E-posta gerekli!");
  if (updateEmail.value !== authStore.user?.email) return toast.error("Bu e-posta kayıtlı adresinizle uyuşmuyor!");
  loading.value = true;
  try {
    await apiClient.post("/auth/forgot-password", { email: updateEmail.value });
    toast.success("Onay kodu gönderildi! ✨");
    updateStep.value = 2;
  } catch { toast.error("Kod gönderilemedi."); }
  finally { loading.value = false; }
};

const handleResetPassword = async () => {
  if (verificationCode.value.length !== 6) return toast.error("6 haneli kodu girin!");
  if (newPassword.value.length < 6) return toast.error("Yeni şifre en az 6 karakter olmalı!");
  loading.value = true;
  try {
    await apiClient.post("/auth/reset-password", {
      email: updateEmail.value,
      code: verificationCode.value,
      newPassword: newPassword.value
    });
    toast.success("Şifreniz başarıyla güncellendi! ✨");
    closeUpdatePasswordModal();
  } catch { toast.error("İşlem başarısız."); }
  finally { loading.value = false; }
};

const closeUpdatePasswordModal = () => {
  showUpdatePasswordModal.value = false;
  updateStep.value = 1;
  updateEmail.value = "";
  verificationCode.value = "";
  newPassword.value = "";
};

const toggleAccountPrivacy = async () => {
  if (!authStore.user) return;
  const targetValue = !authStore.user.isPrivate;
  try {
    const response = await apiClient.patch(`/users/${authStore.user.id}`, { isPrivate: targetValue });
    authStore.user = response.data;
    if (authStore.user.isPrivate) toast.success("Hesabınız artık gizli! 🔐");
    else toast.info("Hesabınız artık herkese açık. 🌍");
  } catch { toast.error("Ayarlar güncellenemedi."); }
};

const openBlockedList = async () => {
  activeSection.value = 'blocked';
  try {
    const response = await apiClient.get('/users/me/blocked');
    blockedUsers.value = response.data;
  } catch {
    toast.error("Engellenenler listesi alınamadı.");
  }
};

const handleUnblock = async (userId: number) => {
  try {
    await apiClient.post(`/users/${userId}/block`);
    blockedUsers.value = blockedUsers.value.filter(b => b.blocked.id !== userId);
    toast.success("Engel kaldırıldı.");
  } catch {
    toast.error("İşlem başarısız.");
  }
};

const toggleDarkMode = () => { toggle(); isDarkMode.value = !isDarkMode.value; };

const sectionTitle = computed(() => {
  const titles: any = { account: 'Hesabım', privacy: 'Gizlilik & Güvenlik', help: 'Yardım Merkezi', blocked: 'Engellenen Hesaplar' };
  return titles[activeSection.value || ''] || 'Ayarlar';
});

const logout = async () => { await authStore.logout(); router.push("/login"); };
const handleDeleteAccount = () => { toast.warning("Hesap silme şu an pasif."); };
</script>
