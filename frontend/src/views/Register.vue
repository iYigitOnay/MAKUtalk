<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <!-- Logo & Branding -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center mb-4">
          <img
            src="/makutalklogo.png"
            alt="MAKUtalk Logo"
            class="w-24 h-24 object-contain drop-shadow-lg"
          />
        </div>
        <h1
          class="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
        >
          MAKUtalk
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 font-medium">
          Kampüs hayatını MAKÜ'de hepimizle paylaş, bağlantı kur ve öğren
        </p>
      </div>

      <!-- Card -->
      <div
        class="bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur"
      >
        <div class="text-center mb-8">
          <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Topluluğa Katıl
          </h2>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            MAKÜ'ye özel sosyal ağa hoş geldin
          </p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Email -->
          <div>
            <label
              for="email"
              class="flex items-center gap-2 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >
              Kurumsal E-posta <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl border-2 transition-all outline-none"
              :class="emailError ? 'border-red-500/50 focus:border-red-500' : 'border-transparent focus:border-blue-500'"
              placeholder="isim@ogr.mehmetakif.edu.tr"
            />
            <p v-if="emailError" class="text-[10px] font-bold text-red-500 mt-1.5 px-1 uppercase tracking-wide">
              {{ emailError }}
            </p>
            <p v-else class="text-[10px] font-bold text-gray-400 mt-1.5 px-1 uppercase tracking-wide">
              Sadece @mehmetakif.edu.tr uzantıları kabul edilir.
            </p>
          </div>

          <!-- Username -->
          <div>
            <label
              for="username"
              class="flex items-center gap-2 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >
              Kullanıcı Adı <span class="text-red-500">*</span>
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl border-2 transition-all outline-none"
              :class="usernameError ? 'border-red-500/50 focus:border-red-500' : 'border-transparent focus:border-blue-500'"
              placeholder="kullanici_adi"
            />
            <p v-if="usernameError" class="text-[10px] font-bold text-red-500 mt-1.5 px-1 uppercase tracking-wide">
              {{ usernameError }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <label
              for="password"
              class="flex items-center gap-2 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2"
            >
              Güçlü Parola <span class="text-red-500">*</span>
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl border-2 transition-all outline-none"
              :class="passwordError ? 'border-red-500/50 focus:border-red-500' : 'border-transparent focus:border-blue-500'"
              placeholder="••••••••"
            />
            
            <!-- Şifre Gereksinimleri -->
            <div class="mt-3 grid grid-cols-2 gap-2 px-1">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full" :class="passChecks.length ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'"></div>
                <span class="text-[9px] font-bold uppercase tracking-tight" :class="passChecks.length ? 'text-emerald-500' : 'text-gray-400'">8+ Karakter</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full" :class="passChecks.upper ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'"></div>
                <span class="text-[9px] font-bold uppercase tracking-tight" :class="passChecks.upper ? 'text-emerald-500' : 'text-gray-400'">Büyük Harf</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full" :class="passChecks.special ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'"></div>
                <span class="text-[9px] font-bold uppercase tracking-tight" :class="passChecks.special ? 'text-emerald-500' : 'text-gray-400'">Özel Karakter</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full" :class="passChecks.number ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'"></div>
                <span class="text-[9px] font-bold uppercase tracking-tight" :class="passChecks.number ? 'text-emerald-500' : 'text-gray-400'">Rakam</span>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || hasErrors"
            class="w-full mt-6 px-4 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-2xl transition-all duration-200 shadow-xl shadow-blue-500/20"
          >
            <span v-if="!loading">Kayıt Ol</span>
            <span v-else class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              İşleniyor...
            </span>
          </button>
        </form>

        <!-- Link to Login -->
        <div
          class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center"
        >
          <p class="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            Zaten hesabın var mı?
            <router-link
              to="/login"
              class="text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              Giriş Yap
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const form = reactive({
  email: "",
  username: "",
  password: "",
});

const loading = ref(false);

// Validasyonlar
const emailError = computed(() => {
  if (!form.email) return null;
  const regex = /^[a-zA-Z0-9._%+-]+@(ogr\.)?mehmetakif\.edu\.tr$/;
  return regex.test(form.email) ? null : "Sadece kurumsal MAKÜ e-postası!";
});

const usernameError = computed(() => {
  if (!form.username) return null;
  if (form.username.length < 3) return "En az 3 karakter olmalı.";
  const regex = /^[a-zA-Z0-9_]+$/;
  return regex.test(form.username) ? null : "Sadece harf, rakam ve alt çizgi.";
});

const passChecks = computed(() => ({
  length: form.password.length >= 8,
  upper: /[A-Z]/.test(form.password),
  special: /[^A-Za-z0-9]/.test(form.password),
  number: /[0-9]/.test(form.password),
}));

const passwordError = computed(() => {
  if (!form.password) return null;
  const c = passChecks.value;
  if (!c.length || !c.upper || !c.special || !c.number) return "Parola şartları karşılamıyor.";
  return null;
});

const hasErrors = computed(() => !!emailError.value || !!usernameError.value || !!passwordError.value);

const handleRegister = async () => {
  if (hasErrors.value) return;
  
  loading.value = true;
  try {
    await authStore.register(form);
    toast.success("Kayıt başarılı! Lütfen mailini doğrula.");
    router.push("/login");
  } catch (error: any) {
    const message = Array.isArray(error.response?.data?.message) 
      ? error.response.data.message[0] 
      : error.response?.data?.message || "Kayıt yapılamadı.";
    toast.error(message);
  } finally {
    loading.value = false;
  }
};
</script>
