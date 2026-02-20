<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-8rem)]">
    <div class="card w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">MAKUtalk'a Giriş Yap</h1>
        <p class="text-gray-600 mt-2">Kampüs hayatına devam et 🎓</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            E-posta
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="input-field"
            placeholder="ornek@makutalk.com"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Parola
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? "Giriş yapılıyor..." : "Giriş Yap" }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-600 mt-6">
        Hesabın yok mu?
        <router-link
          to="/register"
          class="text-primary-600 hover:text-primary-700 font-medium"
        >
          Kayıt Ol
        </router-link>
      </p>
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
    toast.success("Giriş başarılı! 🎉");
    router.push("/");
  } catch (error: any) {
    const message = error.message?.[0] || "Giriş yapılamadı.";
    toast.error(message);
  } finally {
    loading.value = false;
  }
};
</script>
