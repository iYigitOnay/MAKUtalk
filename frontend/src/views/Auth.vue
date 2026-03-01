<!-- src/views/Auth.vue -->
<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-[#0f1117] dark:to-[#161b27] md:px-4 overflow-x-hidden transition-colors duration-500"
  >
    <!-- Decorative background elements for mobile richness -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px]"></div>
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[100px]"></div>
    </div>

    <div
      class="relative w-full max-w-4xl bg-white dark:bg-[#161b27] md:rounded-[32px] shadow-2xl border-y md:border border-slate-200/60 dark:border-white/[0.06] min-h-screen md:min-h-[600px] overflow-hidden transition-colors duration-500 flex flex-col md:block z-10"
    >
      <!-- Brand Panel (Moving Side on Desktop, Rich Header on Mobile) -->
      <div
        class="relative md:absolute top-0 left-0 w-full md:w-1/2 h-auto md:h-full z-20 transition-transform duration-700 ease-in-out md:pointer-events-none"
        :class="activeTab === 'register' ? 'md:translate-x-full' : 'md:translate-x-0'"
      >
        <div
          class="relative md:absolute inset-0 m-0 md:m-2 md:rounded-[26px] flex flex-col items-center justify-center text-center p-8 md:p-12 md:pointer-events-auto transition-all duration-500 bg-slate-50 dark:bg-gradient-to-br dark:from-[#0f1117] dark:to-[#1a1f2e] border-b md:border border-slate-100 dark:border-white/[0.05]"
        >
          <div class="relative z-10">
            <div class="mb-4 md:mb-6 flex justify-center">
              <img
                src="/makutalklogo.png"
                alt="MAKUtalk"
                class="w-24 h-24 md:w-36 md:h-36 object-contain transition-all duration-700 ease-in-out"
                :class="activeTab === 'register' ? '-scale-x-100 rotate-y-180' : 'scale-x-100'"
              />
            </div>
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 md:mb-4">
              MAKU<span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">talk</span>
            </h1>
            <p class="text-slate-500 dark:text-white/60 text-sm md:text-sm leading-relaxed max-w-[250px] font-medium mx-auto">
              {{
                activeTab === "login"
                  ? "Dijital Kampüs buluşma noktasına hoş geldin!"
                  : "MAKÜ topluluğunun bir parçası olmaya hazır mısın?"
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Forms Container -->
      <div class="relative flex-1 md:w-full min-h-[450px] md:min-h-[600px] flex overflow-hidden">
        
        <!-- Verification Step (Overlay) -->
        <div 
          v-if="showVerification"
          class="absolute inset-0 z-30 bg-white/98 dark:bg-[#161b27]/98 backdrop-blur-md flex items-center justify-center p-6 transition-all duration-500"
        >
          <div class="w-full max-w-[340px] text-center pb-20 md:pb-0">
            <div class="mb-6 inline-flex p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">E-postanı Doğrula</h2>
            <p class="text-slate-500 dark:text-gray-400 text-sm mb-8">
              <span class="font-black text-blue-600">{{ registerForm.email }}</span> adresine 6 haneli bir kod gönderdik.
            </p>
            <form @submit.prevent="handleVerify" class="space-y-6">
              <input v-model="verificationCode" type="text" maxlength="6" placeholder="000000" class="w-full text-center text-3xl tracking-[8px] md:tracking-[12px] font-mono py-4 rounded-2xl bg-slate-50 dark:bg-[#1a1f2e] border border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              <button type="submit" :disabled="verifyLoading" class="auth-btn">{{ verifyLoading ? 'Doğrulanıyor...' : 'Kodu Onayla' }}</button>
              <button type="button" @click="showVerification = false" class="text-slate-400 text-sm hover:underline font-bold transition-colors">Geri Dön</button>
            </form>
          </div>
        </div>

        <!-- Forgot Password Step (Overlay) -->
        <div 
          v-if="showForgotModal"
          class="absolute inset-0 z-40 bg-white/98 dark:bg-[#161b27]/98 backdrop-blur-md flex items-center justify-center p-6 transition-all duration-500"
        >
          <div class="w-full max-w-[340px] text-center pb-20 md:pb-0">
            <div class="mb-6 inline-flex p-4 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Şifre Sıfırlama</h2>
            <p class="text-slate-500 dark:text-gray-400 text-sm mb-8">
              {{ forgotStep === 1 ? 'Hesabına bağlı e-posta adresini gir.' : 'E-postana gelen kodu ve yeni şifreni gir.' }}
            </p>
            <form v-if="forgotStep === 1" @submit.prevent="handleSendResetCode" class="space-y-4">
              <input v-model="forgotForm.email" type="email" placeholder="E-posta" class="auth-input" />
              <button type="submit" :disabled="forgotLoading" class="auth-btn">{{ forgotLoading ? 'Gönderiliyor...' : 'Kod Gönder' }}</button>
              <button type="button" @click="showForgotModal = false" class="text-slate-400 text-sm hover:underline font-bold block w-full">Geri Dön</button>
            </form>
            <form v-else @submit.prevent="handleResetPassword" class="space-y-4">
              <input v-model="forgotForm.code" type="text" maxlength="6" placeholder="Kod" class="w-full text-center text-2xl tracking-[8px] font-mono py-3 rounded-xl bg-slate-50 dark:bg-[#1a1f2e] border border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white outline-none" />
              <input v-model="forgotForm.newPassword" type="password" placeholder="Yeni Şifre" class="auth-input" />
              <button type="submit" :disabled="forgotLoading" class="auth-btn">Şifreyi Güncelle</button>
              <button type="button" @click="forgotStep = 1" class="text-slate-400 text-sm hover:underline font-bold block w-full">E-posta Değiştir</button>
            </form>
          </div>
        </div>

        <!-- Register Form -->
        <div
          class="w-full md:w-1/2 flex flex-col items-center justify-center px-8 md:px-12 py-10 md:py-0 transition-all duration-700"
          :class="[ activeTab === 'login' ? 'md:opacity-0 md:invisible md:translate-y-4 hidden md:flex' : 'opacity-100 visible translate-y-0 flex' ]"
        >
          <div class="w-full max-w-[340px] pb-24 md:pb-0">
            <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">Aramıza Katıl</h2>
            <form @submit.prevent="handleRegister" class="space-y-4">
              <input v-model="registerForm.fullName" type="text" placeholder="Ad Soyad" class="auth-input" />
              <input v-model="registerForm.username" type="text" placeholder="Kullanıcı Adı" class="auth-input" />
              <input v-model="registerForm.email" type="email" placeholder="E-posta" class="auth-input" />
              <div class="relative group">
                <input v-model="registerForm.password" :type="showPassword ? 'text' : 'password'" placeholder="Şifre" class="auth-input" />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-all">
                   <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                   <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
              <button type="submit" :disabled="registerLoading" class="auth-btn mt-4 shadow-blue-500/10">{{ registerLoading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur' }}</button>
              <p class="text-center text-gray-500 dark:text-white/30 text-xs mt-4">Zaten üye misin? <button type="button" @click="activeTab = 'login'" class="text-blue-600 dark:text-blue-400 font-black hover:underline transition-all">Giriş Yap</button></p>
            </form>
          </div>
        </div>

        <!-- Login Form -->
        <div
          class="w-full md:w-1/2 flex flex-col items-center justify-center px-8 md:px-12 py-10 md:py-0 transition-all duration-700 md:ml-auto"
          :class="[ activeTab === 'register' ? 'md:opacity-0 md:invisible md:translate-y-4 hidden md:flex' : 'opacity-100 visible translate-y-0 flex' ]"
        >
          <div class="w-full max-w-[340px] pb-24 md:pb-0">
            <h2 class="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">Tekrar Hoş Geldin</h2>
            <form @submit.prevent="handleLogin" class="space-y-4">
              <div class="relative flex items-center">
                <input v-model="loginForm.email" type="text" placeholder="Öğrenci No veya E-posta" class="auth-input pr-32 md:pr-32" />
                <span v-if="loginForm.email && !loginForm.email.includes('@')" class="absolute right-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter pointer-events-none select-none">@ogr.mehmetakif.edu.tr</span>
              </div>
              <div class="relative group">
                <input v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" placeholder="Şifre" class="auth-input" />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                  <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
              <button type="submit" :disabled="loginLoading" class="auth-btn mt-4 shadow-blue-500/10">Giriş Yap</button>
              <div class="flex items-center justify-between mt-4 px-1">
                <button type="button" @click="forgotStep = 1; showForgotModal = true" class="text-xs font-black text-slate-400 hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">Şifremi Unuttum</button>
                <p class="text-slate-400 text-xs font-medium">Hesabın yok mu? <button type="button" @click="activeTab = 'register'" class="text-blue-600 dark:text-blue-400 font-black hover:underline ml-1 transition-all">Kayıt Ol</button></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-input {
  @apply w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/[0.07] text-gray-900 dark:text-white focus:border-blue-500/50 outline-none transition-all text-sm placeholder-gray-500;
}
.auth-btn {
  @apply w-full py-3.5 rounded-xl text-white text-sm font-black bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50;
}
</style>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const activeTab = ref<"login" | "register">("login");
const loginLoading = ref(false);
const registerLoading = ref(false);
const showPassword = ref(false);

const showVerification = ref(false);
const verifyLoading = ref(false);
const verificationCode = ref("");

const showForgotModal = ref(false);
const forgotStep = ref(1);
const forgotLoading = ref(false);
const forgotForm = ref({ email: "", code: "", newPassword: "" });

const loginForm = ref({ email: "", password: "" });
const registerForm = ref({ fullName: "", username: "", email: "", password: "" });

const handleLogin = async () => {
  loginLoading.value = true;
  try {
    await authStore.login({ email: loginForm.value.email, password: loginForm.value.password });
    toast.success("Hoş geldin! 👋");
    router.push("/");
  } catch (error: any) {
    toast.error(error.response?.data?.message || "E-posta veya şifre hatalı.");
  } finally {
    loginLoading.value = false;
  }
};

const handleRegister = async () => {
  registerLoading.value = true;
  try {
    await apiClient.post("/users/register", registerForm.value);
    toast.success("Kayıt başarılı! Lütfen mailini kontrol et. 🎉");
    showVerification.value = true;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Kayıt sırasında bir hata oluştu.");
  } finally {
    registerLoading.value = false;
  }
};

const handleVerify = async () => {
  if (verificationCode.value.length !== 6) {
    toast.error("Lütfen 6 haneli kodu girin.");
    return;
  }
  verifyLoading.value = true;
  try {
    await apiClient.post("/users/verify-email", { email: registerForm.value.email, code: verificationCode.value });
    toast.success("Hesabın doğrulandı! Şimdi giriş yapabilirsin.");
    showVerification.value = false;
    activeTab.value = "login";
  } catch (error: any) {
    toast.error("Doğrulama kodu hatalı.");
  } finally {
    verifyLoading.value = false;
  }
};

const handleSendResetCode = async () => {
  if (!forgotForm.value.email) {
    toast.error("Lütfen e-posta adresinizi girin.");
    return;
  }
  forgotLoading.value = true;
  try {
    await apiClient.post("/users/forgot-password", { email: forgotForm.value.email });
    toast.success("Sıfırlama kodu gönderildi!");
    forgotStep.value = 2;
  } catch (error: any) {
    toast.error("Kod gönderilemedi.");
  } finally {
    forgotLoading.value = false;
  }
};

const handleResetPassword = async () => {
  if (forgotForm.value.code.length !== 6) {
    toast.error("Lütfen 6 haneli kodu girin.");
    return;
  }
  if (!forgotForm.value.newPassword || forgotForm.value.newPassword.length < 6) {
    toast.error("Yeni şifre en az 6 karakter olmalıdır.");
    return;
  }
  forgotLoading.value = true;
  try {
    await apiClient.post("/users/reset-password", { email: forgotForm.value.email, code: forgotForm.value.code, newPassword: forgotForm.value.newPassword });
    toast.success("Şifren güncellendi! Giriş yapabilirsin.");
    showForgotModal.value = false;
    activeTab.value = "login";
  } catch (error: any) {
    toast.error("Şifre güncellenemedi.");
  } finally {
    forgotLoading.value = false;
  }
};
</script>
