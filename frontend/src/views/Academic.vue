<!-- src/views/Academic.vue -->
<template>
  <div
    class="max-w-6xl mx-auto p-4 sm:p-8 pb-24 bg-white dark:bg-gray-950 min-h-screen transition-colors duration-500"
  >
    <!-- Modern Header (Akademik Denetim Merkezi) -->
    <header
      class="relative mb-12 py-8 sm:py-10 px-6 sm:px-8 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-[#064e3b] shadow-2xl shadow-emerald-900/20 group text-center md:text-left"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-teal-600/20"
      ></div>
      <div
        class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"
      ></div>

      <div
        class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div
            class="flex items-center justify-center md:justify-start gap-3 mb-2"
          >
            <span
              class="px-3 py-1 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg shadow-emerald-500/40"
              >Akademik Danışman</span
            >
            <span
              class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"
            ></span>
          </div>
          <h1
            class="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter italic leading-none"
          >
            Akademik
            <span
              class="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
              >Denetim</span
            >
          </h1>
          <p
            class="text-emerald-200/60 text-[10px] sm:text-sm font-bold mt-2 uppercase tracking-widest opacity-70 italic"
          >
            MAKUtalk • Danışman Yönetim Portalı
          </p>
        </div>

        <div class="flex items-center justify-center md:justify-end gap-4">
          <div class="h-12 w-[1px] bg-white/10 hidden md:block"></div>
          <div class="text-center md:text-right">
            <p
              class="text-white font-black text-xs sm:text-sm uppercase tracking-tighter"
            >
              {{ pendingClubs.length }} Onay Bekliyor
            </p>
            <p
              class="text-emerald-400/50 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest italic leading-none mt-1"
            >
              İşlem Gerekli
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Stats Summary (Minimalist) -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-16"
    >
      <div
        class="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl flex items-center gap-4 relative overflow-hidden group"
      >
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-900/30"
        >
          <svg
            class="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p
            class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 leading-none"
          >
            Bekleyen Başvuru
          </p>
          <p
            class="text-lg sm:text-xl font-black text-gray-900 dark:text-white italic tracking-tighter mt-1"
          >
            {{ pendingClubs.length }}
          </p>
        </div>
      </div>
    </div>

    <!-- Requests List -->
    <div v-if="loading" class="py-20 text-center">
      <div
        class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"
      ></div>
    </div>

    <div v-else-if="pendingClubs.length > 0" class="space-y-6">
      <h2
        class="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-2 sm:ml-4 mb-6 text-center sm:text-left"
      >
        Onayınızı Bekleyen Topluluklar
      </h2>

      <div
        v-for="club in pendingClubs"
        :key="club.id"
        class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center gap-6 sm:gap-8 group hover:-translate-y-1 transition-all overflow-hidden relative"
      >
        <!-- LOGO KUTUSU (Renkli Destek) -->
        <div
          class="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-3xl sm:text-4xl shadow-inner flex-shrink-0 border border-gray-100 dark:border-white/5 overflow-hidden"
          :style="{ backgroundColor: club.color + '15', color: club.color }"
        >
          <span v-if="isEmoji(club.emoji)">{{ club.emoji }}</span>
          <span
            v-else
            class="text-lg sm:text-xl font-black uppercase tracking-tighter"
            >{{ club.emoji }}</span
          >
        </div>

        <div class="flex-1 text-center md:text-left space-y-3 min-w-0 w-full">
          <div class="flex flex-col md:flex-row md:items-center gap-1 sm:gap-2">
            <span
              class="inline-block mx-auto md:mx-0 px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[7px] sm:text-[8px] font-black rounded-full border border-emerald-100 dark:border-emerald-800 uppercase tracking-widest"
              >{{ club.category }}</span
            >
            <span
              v-if="club.mainType === 'PROJECT'"
              class="text-[7px] font-black text-blue-500 uppercase tracking-widest"
              >🚀 Proje Ekibi</span
            >
            <span
              v-else-if="club.mainType === 'SOCIAL'"
              class="text-[7px] font-black text-amber-500 uppercase tracking-widest"
              >🌍 Sosyal Grup</span
            >
            <span
              class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest"
              >Kurucu: @{{ club.founder?.username }}</span
            >
          </div>
          <h3
            class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate"
          >
            {{ club.name }}
          </h3>

          <!-- EK DETAYLAR (YENİ) -->
          <div
            v-if="club.mainType !== 'DIGITAL'"
            class="flex flex-wrap justify-center md:justify-start gap-3"
          >
            <div
              v-if="club.deadline"
              class="px-2 py-1 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900/20 flex items-center gap-1.5"
            >
              <svg
                class="w-3 h-3 text-rose-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke-width="2.5"
                />
              </svg>
              <span class="text-[8px] font-black text-rose-600 uppercase">{{
                new Date(club.deadline).toLocaleDateString("tr-TR")
              }}</span>
            </div>
            <div
              v-if="club.maxMembers"
              class="px-2 py-1 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20 flex items-center gap-1.5"
            >
              <span class="text-[8px] font-black text-blue-600 uppercase"
                >{{ club.memberCount }}/{{ club.maxMembers }} Kişi</span
              >
            </div>
          </div>

          <p
            class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium italic line-clamp-3 overflow-hidden break-words leading-relaxed"
          >
            "{{ club.description }}"
          </p>

          <div v-if="club.requiredSkills" class="pt-2">
            <div class="flex flex-wrap justify-center md:justify-start gap-1.5">
              <span
                v-for="skill in club.requiredSkills.split(',')"
                :key="skill"
                class="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-[7px] font-bold rounded-md text-gray-500 uppercase border border-gray-100 dark:border-gray-700"
                >{{ skill.trim() }}</span
              >
            </div>
          </div>
        </div>
        <div
          class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0"
        >
          <button
            @click="handleReject(club.id)"
            class="w-full sm:w-auto px-6 py-3 text-red-500 text-[10px] font-black uppercase rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 active:scale-95"
          >
            Reddet
          </button>
          <button
            @click="handleApprove(club.id)"
            class="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-xl uppercase hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="py-32 text-center bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl"
    >
      <p
        class="text-gray-400 font-black uppercase text-xs tracking-widest italic"
      >
        Onaylanacak başvuru bulunamadı.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import apiClient from "@/api/client";
import { useToast } from "vue-toastification";

const toast = useToast();
const loading = ref(true);
const pendingClubs = ref<any[]>([]);

const fetchPendingClubs = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get("/clubs/pending");
    pendingClubs.value = res.data;
  } catch {
    toast.error("Veriler alınamadı.");
  } finally {
    loading.value = false;
  }
};

const handleApprove = async (id: number) => {
  try {
    await apiClient.post(`/clubs/${id}/approve-academic`);
    toast.success("Topluluk için akademik onay verildi! 🛡️");
    fetchPendingClubs();
  } catch {
    toast.error("İşlem başarısız.");
  }
};

const handleReject = async (id: number) => {
  try {
    await apiClient.post(`/clubs/${id}/reject`);
    toast.warning("Başvuru reddedildi.");
    fetchPendingClubs();
  } catch {
    toast.error("İşlem başarısız.");
  }
};

const isEmoji = (str: string) => {
  if (!str) return true;
  return /\p{Emoji}/u.test(str) && str.length <= 2;
};

onMounted(fetchPendingClubs);
</script>
