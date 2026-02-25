<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        @click.self="handleCancel"
      >
        <div
          class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 border border-gray-200 dark:border-primary-900/30 animate-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-gray-200 dark:border-primary-900/30"
          >
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              Gönderiyi Sil
            </h3>
          </div>

          <!-- Body -->
          <div class="px-6 py-4">
            <p class="text-gray-700 dark:text-gray-300">
              Bu gönderiyi silmek istediğinden emin misin? Bu işlem geri
              alınamaz.
            </p>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-4 border-t border-gray-200 dark:border-primary-900/30 flex gap-3"
          >
            <button
              @click="handleCancel"
              class="flex-1 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              İptal
            </button>
            <button
              @click="handleConfirm"
              :disabled="isDeleting"
              class="flex-1 px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 dark:hover:bg-red-500 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
            >
              {{ isDeleting ? "Siliniyor..." : "Sil" }}
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
}

interface Emits {
  (e: "confirm"): void;
  (e: "cancel"): void;
}

withDefaults(defineProps<Props>(), {
  isDeleting: false,
});

const emit = defineEmits<Emits>();

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
