<!-- src/views/Banned.vue -->
<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <div class="bg-slate-900/50 backdrop-blur-2xl border border-red-500/20 rounded-[3rem] p-8 sm:p-12 text-center shadow-2xl shadow-red-900/20 animate-in zoom-in-95 duration-500">
        <!-- Shield Icon -->
        <div class="relative inline-block mb-8">
          <div class="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-ping"></div>
          <div class="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-2xl relative z-10">
            <component :is="ShieldAlert" class="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 class="text-3xl sm:text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">
          Erişim <span class="text-red-500">Engellendi</span>
        </h1>
        
        <div class="h-1 w-20 bg-red-600 mx-auto mb-8 rounded-full"></div>

        <p class="text-slate-400 text-base sm:text-lg leading-relaxed mb-10 font-medium">
          Hesabınız, topluluk kurallarımızı ihlal eden davranışlar nedeniyle <span class="text-red-400 font-bold">kalıcı olarak</span> askıya alınmıştır.
        </p>

        <div class="space-y-4">
          <button @click="handleLogout" class="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
            Çıkış Yap
          </button>
          
          <a href="mailto:destek@makutalk.com" class="block w-full py-4 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all">
            Destekle İletişime Geç
          </a>
        </div>

        <div class="mt-12 pt-8 border-t border-white/5">
          <p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">
            MAKUtalk Güvenlik Birimi
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShieldAlert } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>
