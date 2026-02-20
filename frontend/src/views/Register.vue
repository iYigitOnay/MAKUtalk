<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-8rem)]">
    <div class="card w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">MAKUtalk'a Katıl</h1>
        <p class="text-gray-600 mt-2">Kampüs topluluğuna hoş geldin! 👋</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            E-posta <span class="text-red-500">*</span>
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
            for="username"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Kullanıcı Adı <span class="text-red-500">*</span>
          </label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            minlength="3"
            class="input-field"
            placeholder="johndoe"
          />
        </div>

        <div>
          <label
            for="fullName"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Ad Soyad
          </label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            class="input-field"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Parola <span class="text-red-500">*</span>
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? "Kayıt yapılıyor..." : "Kayıt Ol" }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-600 mt-6">
        Zaten hesabın var mı?
        <router-link
          to="/login"
          class="text-primary-600 hover:text-primary-700 font-medium"
        >
          Giriş Yap
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
  username: "",
  fullName: "",
  password: "",
});

const loading = ref(false);

const handleRegister = async () => {
  loading.value = true;
  try {
    await authStore.register(form);
    toast.success("Kayıt başarılı! Giriş yapabilirsin. 🎉");
    router.push("/login");
  } catch (error: any) {
    const message = error.message?.[0] || "Kayıt yapılamadı.";
    toast.error(message);
  } finally {
    loading.value = false;
  }
};
</script>
