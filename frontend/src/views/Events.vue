<!-- src/views/Events.vue -->
<template>
  <div
    class="max-w-5xl mx-auto p-4 md:p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans transition-colors duration-500"
  >
    <!-- HEADER -->
    <header class="mb-8 md:mb-10 text-center pt-4">
      <button
        @click="$router.push('/campus')"
        class="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition-colors font-black uppercase text-[8px] md:text-[9px] tracking-widest mb-4 outline-none group"
      >
        <svg
          class="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Rehbere Dön
      </button>
      <h1
        class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none"
      >
        Etkinlik <span class="text-emerald-600">Takvimi</span>
      </h1>
    </header>

    <!-- KONTROL PANELİ -->
    <section
      class="max-w-4xl mx-auto mb-10 md:mb-12 space-y-6 md:space-y-8 text-center"
    >
      <!-- 1. Hafta Filtresi -->
      <div class="flex justify-center px-4">
        <div
          class="flex p-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 w-full max-w-[240px] font-black"
        >
          <button
            @click="activePeriod = 'this-week'"
            class="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            :class="
              activePeriod === 'this-week'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-gray-400 hover:text-gray-600'
            "
          >
            Bu Hafta
          </button>
          <button
            @click="activePeriod = 'all'"
            class="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            :class="
              activePeriod === 'all'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-gray-400 hover:text-gray-600'
            "
          >
            Tümü
          </button>
        </div>
      </div>

      <!-- 2. Yerleşke Filtresi -->
      <div class="relative w-full overflow-hidden h-16 flex items-center">
        <div
          ref="campusNavRef"
          @scroll="handleCarouselScroll"
          class="flex items-center gap-3 md:gap-4 overflow-x-auto px-[30%] md:px-[35%] scrollbar-hide snap-x snap-mandatory scroll-smooth w-full h-14"
        >
          <div
            v-for="(campus, index) in campuses"
            :key="campus"
            class="flex-shrink-0 snap-center carousel-item"
          >
            <button
              @click="
                selectedCampus = campus;
                centerCarouselItem(index);
              "
              :class="[
                'w-24 md:w-28 h-9 md:h-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 border-2 px-3 md:px-4',
                selectedCampus === campus
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl scale-110'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400 scale-90 opacity-60',
              ]"
            >
              <span
                v-if="campus !== 'TÜMÜ'"
                class="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-current"
              ></span>
              <span
                class="text-[8px] md:text-[9px] font-black uppercase tracking-widest"
                >{{ campus }}</span
              >
            </button>
          </div>
        </div>
      </div>

      <div class="px-4 pt-2 flex flex-col items-center gap-3">
        <button
          v-if="canCreateEvent"
          @click="showCreateModal = true"
          class="w-full md:w-auto px-10 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-95"
        >
          + ETKİNLİK OLUŞTUR
        </button>

        <!-- Manuel Sync Butonu (Sadece Root Admin) -->
        <button
          v-if="authStore.user?.email === '2312101063@ogr.mehmetakif.edu.tr'"
          @click="syncManual"
          :disabled="syncLoading"
          class="text-[8px] font-black text-emerald-600 uppercase tracking-widest hover:underline disabled:opacity-50"
        >
          {{
            syncLoading ? "Senkronize Ediliyor..." : "Üni Etkinliklerini Çek"
          }}
        </button>
      </div>
    </section>

    <!-- EVENTS LIST -->
    <div v-if="loading" class="py-20 text-center flex flex-col items-center">
      <div
        class="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"
      ></div>
      <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">
        Yükleniyor
      </p>
    </div>

    <div
      v-else-if="filteredEvents.length > 0"
      class="max-w-4xl mx-auto space-y-6 px-2 md:px-0"
    >
      <EventTicket
        v-for="event in filteredEvents"
        :key="event.id"
        :event="event"
        @attend="toggleAttend"
      />
    </div>

    <!-- EMPTY STATE -->
    <div
      v-else
      class="py-32 text-center bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 max-w-4xl mx-auto px-6"
    >
      <p
        class="text-gray-400 font-black uppercase tracking-widest text-[9px] italic text-center"
      >
        Seçilen dönemde bilet bulunamadı.
      </p>
    </div>

    <CreateEventModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="fetchEvents"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import apiClient from "@/api/client";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import CreateEventModal from "@/components/CreateEventModal.vue";
import EventTicket from "@/components/EventTicket.vue";

const toast = useToast();
const authStore = useAuthStore();
const loading = ref(false);
const activePeriod = ref("all");
const selectedCampus = ref("TÜMÜ");
const showCreateModal = ref(false);
const syncLoading = ref(false);
const campusNavRef = ref<HTMLElement | null>(null);
const events = ref<any[]>([]);

const campuses = ["İstiklal", "Merkez", "TÜMÜ", "Bucak", "Gölhisar"];

const canCreateEvent = computed(() => {
  return (
    authStore.user?.role === "ADMIN" ||
    authStore.user?.role === "ACADEMIC" ||
    authStore.user?.email === "2312101063@ogr.mehmetakif.edu.tr"
  );
});

const handleCarouselScroll = () => {
  const el = campusNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll(".carousel-item");
  const containerRect = el.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;
  items.forEach((item: any) => {
    const itemRect = item.getBoundingClientRect();
    const factor = Math.min(
      Math.abs(containerCenterX - (itemRect.left + itemRect.width / 2)) /
        (el.clientWidth / 2.5),
      1,
    );
    const btn = item.querySelector("button");
    if (btn) {
      btn.style.transform = `scale(${1.1 - factor * 0.2})`;
      btn.style.opacity = (1 - factor * 0.5).toString();
    }
  });
};

const centerCarouselItem = (index: number) => {
  const el = campusNavRef.value;
  if (!el) return;
  const target = el.querySelectorAll(".carousel-item")[index] as HTMLElement;
  if (target)
    el.scrollTo({
      left: target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2,
      behavior: "smooth",
    });
};

const fetchEvents = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get("/events", {
      params: { currentUserId: authStore.user?.id },
    });
    events.value = res.data;
  } catch {
    toast.error("Hata!");
  } finally {
    loading.value = false;
    setTimeout(() => {
      centerCarouselItem(2);
      handleCarouselScroll();
    }, 300);
  }
};

const toggleAttend = async (eventId: number) => {
  if (!authStore.isAuthenticated) {
    toast.info("Lütfen giriş yapın.");
    return;
  }
  try {
    const res = await apiClient.post(`/events/${eventId}/attend`);
    await fetchEvents();
    if (res.data.attending) toast.success("Biletin Hazır! 🎟️");
  } catch {}
};

const filteredEvents = computed(() => {
  return events.value.filter((e) => {
    const campusMatch =
      selectedCampus.value === "TÜMÜ" || e.campus === selectedCampus.value;

    if (activePeriod.value === "this-week") {
      const eventDate = new Date(e.date);
      const now = new Date();

      // Haftanın başlangıcı (Pazartesi) ve bitişi (Pazar) hesaplama
      const first =
        now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
      const last = first + 6;

      const firstDay = new Date(now.setDate(first));
      firstDay.setHours(0, 0, 0, 0);

      const lastDay = new Date(now.setDate(last));
      lastDay.setHours(23, 59, 59, 999);

      return campusMatch && eventDate >= firstDay && eventDate <= lastDay;
    }

    return campusMatch;
  });
});

const syncManual = async () => {
  syncLoading.value = true;
  try {
    await apiClient.post("/events/sync-manual");
    toast.success("Üniversite etkinlikleri güncellendi! 🤖");
    await fetchEvents();
  } catch {
    toast.error("Senkronizasyon başarısız.");
  } finally {
    syncLoading.value = false;
  }
};

onMounted(fetchEvents);
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.carousel-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
