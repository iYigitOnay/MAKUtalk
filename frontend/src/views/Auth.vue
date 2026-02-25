<!-- src/views/Auth.vue -->
<template>
  <div
    class="min-h-screen flex items-center justify-center bg-[#0f1117] px-4 overflow-hidden"
  >
    <div
      class="relative w-full max-w-4xl bg-[#161b27] rounded-[32px] shadow-2xl border border-white/[0.06] min-h-[600px] overflow-hidden"
    >
      <div
        class="absolute top-0 left-0 h-full w-1/2 z-20 transition-transform duration-700 ease-in-out pointer-events-none"
        :class="activeTab === 'register' ? 'translate-x-full' : 'translate-x-0'"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 m-2 rounded-[26px] flex flex-col items-center justify-center text-center p-12 pointer-events-auto"
        >
          <div class="relative z-10">
            <div class="mb-6 flex justify-center">
              <img
                src="/makutalklogo.png"
                alt="MAKUtalk"
                class="w-36 h-36 object-contain drop-shadow-2xl"
              />
            </div>
            <h1 class="text-4xl font-black text-white tracking-tight mb-4">
              MAKU<span
                class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                >talk</span
              >
            </h1>
            <p class="text-white/80 text-sm leading-relaxed max-w-[250px]">
              {{
                activeTab === "login"
                  ? "Dijital Kampüs buluşma noktasına hoş geldin!"
                  : "MAKÜ topluluğunun bir parçası olmaya hazır mısın?"
              }}
            </p>
          </div>
          <div class="absolute inset-0 opacity-20 pointer-events-none">
            <div
              class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl"
            ></div>
          </div>
        </div>
      </div>

      <div class="relative w-full min-h-[600px] flex">
        <div
          class="w-1/2 flex flex-col items-center justify-center px-12 transition-all duration-700"
          :class="
            activeTab === 'login'
              ? 'opacity-0 invisible translate-y-4'
              : 'opacity-100 visible translate-y-0'
          "
        >
          <div class="w-full max-w-[340px]">
            <h2 class="text-2xl font-bold text-white mb-6 text-center">
              Aramıza Katıl
            </h2>
            <form @submit.prevent="handleRegister" class="space-y-4">
              <input
                v-model="registerForm.fullName"
                type="text"
                placeholder="Ad Soyad"
                class="auth-input"
              />
              <input
                v-model="registerForm.username"
                type="text"
                placeholder="Kullanıcı Adı"
                class="auth-input"
              />
              <input
                v-model="registerForm.email"
                type="email"
                placeholder="E-posta"
                class="auth-input"
              />
              <input
                v-model="registerForm.password"
                type="password"
                placeholder="Şifre"
                class="auth-input"
              />
              <button type="submit" class="auth-btn mt-4">Hesap Oluştur</button>
              <p class="text-center text-white/30 text-xs mt-4">
                Zaten üye misin?
                <button
                  type="button"
                  @click="activeTab = 'login'"
                  class="text-blue-400 font-bold"
                >
                  Giriş Yap
                </button>
              </p>
            </form>
          </div>
        </div>

        <div
          class="w-1/2 flex flex-col items-center justify-center px-12 transition-all duration-700 ml-auto"
          :class="
            activeTab === 'register'
              ? 'opacity-0 invisible translate-y-4'
              : 'opacity-100 visible translate-y-0'
          "
        >
          <div class="w-full max-w-[340px]">
            <h2 class="text-2xl font-bold text-white mb-6 text-center">
              Tekrar Hoş Geldin
            </h2>
            <form @submit.prevent="handleLogin" class="space-y-4">
              <input
                v-model="loginForm.email"
                type="email"
                placeholder="E-posta"
                class="auth-input"
              />
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="Şifre"
                class="auth-input"
              />
              <button type="submit" class="auth-btn mt-4">Giriş Yap</button>
              <p class="text-center text-white/30 text-xs mt-4">
                Hesabın yok mu?
                <button
                  type="button"
                  @click="activeTab = 'register'"
                  class="text-blue-400 font-bold"
                >
                  Kayıt Ol
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-input {
  @apply w-full px-4 py-3 rounded-xl bg-[#1a1f2e] border border-white/[0.07] text-white focus:border-blue-500/50 outline-none transition-all text-sm;
}
.auth-btn {
  @apply w-full py-3 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all;
}
</style>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const activeTab = ref<"login" | "register">("login");
const showLoginPw = ref(false);
const showRegisterPw = ref(false);
const loginLoading = ref(false);
const registerLoading = ref(false);
const loginError = ref("");
const registerError = ref("");

const loginForm = ref({ email: "", password: "" });
const registerForm = ref({
  fullName: "",
  username: "",
  email: "",
  password: "",
});

const handleLogin = async () => {
  loginError.value = "";
  loginLoading.value = true;
  try {
    await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password,
    });
    toast.success("Hoş geldin! 👋");
    router.push("/");
  } catch (error: any) {
    console.error("Login error:", error);
    loginError.value = error.message?.[0] || "E-posta veya şifre hatalı.";
  } finally {
    loginLoading.value = false;
  }
};

const handleRegister = async () => {
  registerError.value = "";
  registerLoading.value = true;
  try {
    await authStore.register(registerForm.value);
    toast.success("Hesabın oluşturuldu! 🎉");
    // Kayıttan sonra direkt login
    await authStore.login({
      email: registerForm.value.email,
      password: registerForm.value.password,
    });
    router.push("/");
  } catch (error: any) {
    console.error("Register error:", error);
    registerError.value =
      error.message?.[0] || "Kayıt sırasında bir hata oluştu.";
  } finally {
    registerLoading.value = false;
  }
};
</script>

<style scoped>
/* Marka paneli geçiş animasyonu - Daha yumuşak */
.brand-enter-active,
.brand-leave-active {
  transition:
    opacity 0.4s ease-in-out,
    transform 0.4s ease-in-out;
}
.brand-enter-from {
  opacity: 0;
  transform: scale(0.9) translateX(-20px);
}
.brand-leave-to {
  opacity: 0;
  transform: scale(0.9) translateX(20px);
}

/* Form geçiş animasyonu - Yatay kayma */
.form-enter-active,
.form-leave-active {
  transition:
    opacity 0.5s ease-in-out,
    transform 0.5s ease-in-out;
}
.form-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.form-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
