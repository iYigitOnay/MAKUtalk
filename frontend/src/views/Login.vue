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
          class="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2"
        >
          MAKUtalk
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 font-medium">
          Kampüs hayatını MAKU'da hepimizle paylaş, bağlantı kur ve öğren
        </p>
      </div>

      <!-- Card -->
      <div
        class="card dark:border-primary-900/30 bg-white dark:bg-gray-900/80 backdrop-blur"
      >
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Hoş Geldin
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Giriş yaparak başlayalım
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div>
            <label
              for="email"
              class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              <svg
                class="w-5 h-5 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"
                />
              </svg>
              E-posta Adresin
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="ornek@ogr.mehmetakif.edu.tr"
            />
          </div>

          <!-- Password -->
          <div>
            <label
              for="password"
              class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              <svg
                class="w-5 h-5 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Parolan
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-6 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 active:scale-95 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105"
          >
            <span v-if="!loading">Giriş Yap</span>
            <span v-else class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Giriş yapılıyor...
            </span>
          </button>
        </form>

        <!-- Link to Register -->
        <div
          class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center"
        >
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Hesabın yok mu?
            <router-link
              to="/register"
              class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold underline transition-colors"
            >
              Kayıt Ol
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const form = reactive({
  email: "",
  password: "",
});

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    await authStore.login(form);
    toast.success("Giriş başarılı!");
    router.push("/");
  } catch (error: any) {
    const message = error.message?.[0] || "Giriş yapılamadı.";
    toast.error(message);
  } finally {
    loading.value = false;
  }
};
</script>