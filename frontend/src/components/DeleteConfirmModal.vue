<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md"
        @click.self="handleCancel"
      >
        <div
          class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-primary-900/20 relative z-10 text-center animate-in zoom-in-95 duration-200"
        >
          <!-- İkon / Görsel Uyarı -->
          <div :class="['w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6', variant === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600']">
            <svg v-if="variant === 'danger'" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <svg v-else class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>

          <!-- İçerik -->
          <div class="mb-8 px-4">
            <h3 class="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-tight mb-2">
              {{ title || 'Emin misiniz?' }}
            </h3>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed opacity-80">
              {{ message || 'Bu işlem kalıcıdır ve geri dönüşü olmayacaktır.' }}
            </p>
          </div>

          <!-- Butonlar -->
          <div class="flex flex-col gap-3">
            <button
              @click="handleConfirm"
              :disabled="loading"
              :class="['w-full py-4 text-white font-black rounded-2xl active:scale-95 transition-all text-[10px] tracking-widest uppercase shadow-xl disabled:opacity-50', variant === 'danger' ? 'bg-red-600 shadow-red-500/20' : 'bg-blue-600 shadow-blue-500/20']"
            >
              {{ loading ? "İşlem Yapılıyor..." : confirmText || "Evet, Onayla" }}
            </button>
            <button
              @click="handleCancel"
              class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-3 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Vazgeç
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  loading?: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  variant?: 'danger' | 'info';
}

interface Emits {
  (e: "confirm"): void;
  (e: "cancel"): void;
}

withDefaults(defineProps<Props>(), {
  variant: 'danger',
  loading: false
});
const emit = defineEmits<Emits>();

const handleConfirm = () => emit("confirm");
const handleCancel = () => emit("cancel");
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
