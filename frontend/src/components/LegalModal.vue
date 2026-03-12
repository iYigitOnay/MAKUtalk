<!-- src/components/LegalModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
    <div 
      class="w-full max-w-2xl bg-white dark:bg-[#161b27] rounded-[24px] md:rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/[0.06] flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-300"
    >
      <!-- Header -->
      <div class="p-5 md:p-6 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
        <h3 class="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
          {{ title }}
        </h3>
        <button @click="$emit('close')" class="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed custom-scrollbar">
        <div v-if="type === 'kvkk'" class="space-y-4">
          <h4 class="font-black text-slate-900 dark:text-white uppercase text-xs italic">KVKK Aydınlatma Metni</h4>
          <p>MAKUtalk platformu olarak kişisel verilerinizi 6698 sayılı kanun kapsamında güvenle işlemekteyiz. Verileriniz sadece kampüs içi etkileşimi artırmak ve güvenliği sağlamak amacıyla kullanılır.</p>
        </div>
        <div v-if="type === 'terms'" class="space-y-4">
          <h4 class="font-black text-slate-900 dark:text-white uppercase text-xs italic">Kullanım Koşulları</h4>
          <p>Platformu kullanarak topluluk kurallarına, akademik etik değerlere ve Türkiye Cumhuriyeti yasalarına uymayı kabul etmiş sayılırsınız.</p>
        </div>
        <div v-if="type === 'privacy'" class="space-y-4">
          <h4 class="font-black text-slate-900 dark:text-white uppercase text-xs italic">Gizlilik Politikası</h4>
          <p>Verileriniz uçtan uca şifrelenir ve izniniz olmadan üçüncü taraflarla paylaşılmaz. Yapay zeka analizleri anonim olarak yapılır.</p>
        </div>
        <div v-if="type === 'etk'" class="space-y-4">
          <h4 class="font-black text-slate-900 dark:text-white uppercase text-xs italic">Elektronik İleti İzni</h4>
          <p>Kampüs duyuruları, yemekhane menüleri ve önemli güncellemelerden anında haberdar olmanızı sağlar.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 md:p-8 border-t border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.02] flex justify-end">
        <button @click="$emit('close')" class="px-8 py-3 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg">Kapat</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ isOpen: boolean; title: string; type: 'kvkk' | 'terms' | 'privacy' | 'etk' }>();
defineEmits(['close']);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-200 dark:bg-slate-700 rounded-full; }
</style>
