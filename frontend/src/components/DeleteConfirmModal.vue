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
          <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>

          <!-- İçerik -->
          <div class="mb-8">
            <h3 class="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-tight mb-2">
              {{ title || 'Emin misiniz?' }}
            </h3>
            <p class="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
              {{ message || 'Bu işlem kalıcıdır ve geri dönüşü olmayacaktır.' }}
            </p>
          </div>

          <!-- Butonlar -->
          <div class="flex flex-col gap-3">
            <button
              @click="handleConfirm"
              :disabled="isDeleting"
              class="w-full py-4 bg-red-600 text-white font-black rounded-2xl active:scale-95 transition-all text-xs tracking-widest uppercase shadow-xl shadow-red-500/20 disabled:opacity-50"
            >
              {{ isDeleting ? "İşlem Yapılıyor..." : confirmText || "Evet, Sil" }}
            </button>
            <button
              @click="handleCancel"
              class="text-xs font-black text-slate-400 uppercase tracking-widest py-3 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
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
  isDeleting?: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
}

interface Emits {
  (e: "confirm"): void;
  (e: "cancel"): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleConfirm = () => emit("confirm");
const handleCancel = () => emit("cancel");
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
