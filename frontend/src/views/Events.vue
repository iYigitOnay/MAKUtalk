<!-- src/views/Events.vue -->
<template>
  <div
    class="max-w-5xl mx-auto p-4 md:p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans transition-colors duration-500"
  >
    <!-- HEADER -->
    <header class="mb-8 md:mb-12 text-center pt-4">
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
      class="max-w-4xl mx-auto mb-12 md:mb-16 space-y-6 md:space-y-8 text-center"
    >
      <!-- Hafta Filtresi -->
      <div class="flex justify-center px-4">
        <div
          class="flex p-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 w-full max-w-[260px] font-black"
        >
          <button
            @click="activePeriod = 'this-week'"
            class="flex-1 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all"
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
            class="flex-1 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all"
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

      <!-- Yerleşke Filtresi (Carousel) -->
      <div
        class="relative w-full overflow-hidden h-16 md:h-20 flex items-center"
      >
        <div
          ref="campusNavRef"
          @scroll="handleCarouselScroll"
          class="flex items-center gap-3 md:gap-4 overflow-x-auto px-[30%] md:px-[35%] scrollbar-hide snap-x snap-mandatory scroll-smooth w-full h-14 md:h-16"
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
                'w-24 md:w-28 h-9 md:h-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2 px-3 md:px-4',
                selectedCampus === campus
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl scale-110'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400 scale-90 opacity-60',
              ]"
            >
              <span
                class="text-[8px] md:text-[9px] font-black uppercase tracking-widest"
                >{{ campus }}</span
              >
            </button>
          </div>
        </div>
      </div>

      <div class="px-4">
        <button
          v-if="canCreateEvent"
          @click="showCreateModal = true"
          class="w-full md:w-auto px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-95"
        >
          + ETKİNLİK OLUŞTUR
        </button>
      </div>
    </section>

    <!-- EVENTS LIST (THE TICKETS) -->
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
      class="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 md:px-0"
    >
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="ticket-card group flex flex-row h-40 md:h-48 transition-all duration-500 hover:scale-[1.01] relative"
      >
        <!-- LEFT STUB (The Date) -->
        <div
          class="w-16 md:w-24 bg-emerald-600 dark:bg-emerald-700 rounded-l-[1.5rem] md:rounded-l-3xl flex flex-col items-center justify-between py-6 md:py-8 text-white relative border-r border-dashed border-white/20 flex-shrink-0"
        >
          <!-- Punched Holes -->
          <div
            class="absolute -top-3 -right-3 w-6 h-6 bg-[#fafafa] dark:bg-[#0b0f19] rounded-full z-10"
          ></div>
          <div
            class="absolute -bottom-3 -right-3 w-6 h-6 bg-[#fafafa] dark:bg-[#0b0f19] rounded-full z-10"
          ></div>

          <span
            class="text-[8px] md:text-[10px] font-black opacity-60 uppercase tracking-[0.3em] z-10"
            >{{ getMonth(event.date) }}</span
          >
          <span
            class="text-3xl md:text-5xl font-black tracking-tighter leading-none z-10"
            >{{ getDay(event.date) }}</span
          >
          <span
            class="text-[8px] md:text-[10px] font-black opacity-60 uppercase tracking-widest z-10"
            >{{ getTime(event.date) }}</span
          >

          <!-- Decorative Vertical Pass Text (THE SIGNATURE - MOVED TO FAR LEFT) -->
          <div
            class="absolute left-0 md:left-1.5 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap hidden sm:block"
          >
            <span
              class="text-[5px] md:text-[6px] font-black uppercase tracking-[0.5em] opacity-20"
              >MAKUTALK EVENT PASS</span
            >
          </div>
        </div>

        <!-- RIGHT MAIN (The Content) -->
        <div
          class="flex-1 bg-white dark:bg-gray-900 rounded-r-[1.5rem] md:rounded-r-3xl flex flex-row overflow-hidden shadow-2xl shadow-black/5 border border-l-0 border-gray-100 dark:border-white/5 relative"
        >
          <!-- Poster (Responsive Width) -->
          <div
            class="w-24 md:w-44 h-full bg-emerald-50 dark:bg-emerald-950/20 flex-shrink-0 relative overflow-hidden"
          >
            <img
              v-if="event.imageUrl"
              :src="getImageUrl(event.imageUrl)"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-emerald-200 dark:text-emerald-800"
            >
              <svg
                class="w-8 h-8 md:w-10 md:h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div
              class="absolute top-2 md:top-3 left-2 md:left-3 px-1.5 md:px-2 py-0.5 bg-emerald-600/90 backdrop-blur-md text-white text-[6px] md:text-[7px] font-black rounded uppercase tracking-widest"
            >
              {{ event.type }}
            </div>
          </div>

          <!-- Info -->
          <div
            class="flex-1 p-3 md:p-6 flex flex-col justify-between text-left min-w-0"
          >
            <div class="space-y-1 md:space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <span
                  class="text-[7px] md:text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest truncate"
                  >{{ event.campus }} Yerleşkesi</span
                >
                <span
                  class="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[60px] md:max-w-[100px]"
                  >{{ event.location }}</span
                >
              </div>
              <h3
                class="text-sm md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight group-hover:text-emerald-600 transition-colors truncate"
              >
                {{ event.title }}
              </h3>
              <p
                class="text-[9px] md:text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-2 italic opacity-80"
              >
                "{{ event.description }}"
              </p>
            </div>

            <div
              class="flex items-center justify-between pt-2 md:pt-4 border-t border-gray-50 dark:border-white/5"
            >
              <div class="flex items-center gap-1.5 md:gap-2 truncate mr-2">
                <div
                  class="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-white dark:border-gray-700 shadow-sm flex-shrink-0"
                >
                  <img
                    v-if="event.creator?.avatarUrl"
                    :src="getImageUrl(event.creator.avatarUrl)"
                    class="w-full h-full object-cover"
                  />
                  <span
                    v-else
                    class="text-[7px] md:text-[8px] font-black text-emerald-600"
                    >{{
                      event.creator?.username?.charAt(0).toUpperCase()
                    }}</span
                  >
                </div>
                <span
                  class="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-tight truncate"
                  >{{ event.club?.name || event.creator?.username }}</span
                >
              </div>

              <div class="flex items-center gap-2 md:gap-4 flex-shrink-0">
                <!-- Participants Mini -->
                <div
                  v-if="event._count?.participants > 0"
                  class="flex -space-x-1.5 items-center hidden sm:flex"
                >
                  <div
                    v-for="user in event.displayParticipants"
                    :key="user.username"
                    class="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-sm"
                  >
                    <img
                      v-if="user.avatarUrl"
                      :src="getImageUrl(user.avatarUrl)"
                      class="w-full h-full object-cover"
                    />
                    <span
                      v-else
                      class="text-[6px] md:text-[7px] font-black text-gray-400 uppercase"
                      >{{ user.username.charAt(0) }}</span
                    >
                  </div>
                  <div
                    v-if="event._count.participants > 3"
                    class="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-[6px] md:text-[7px] font-black text-emerald-600 border-2 border-white dark:border-gray-900 shadow-sm"
                  >
                    +{{ event._count.participants - 3 }}
                  </div>
                </div>

                <button
                  @click="toggleAttend(event.id)"
                  class="px-5 py-2 rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 border-2"
                  :class="
                    event.isAttending
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'border-emerald-600/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  "
                >
                  {{ event.isAttending ? "BİLET ALINDI" : "BİLET AL" }}
                </button>
              </div>
            </div>
          </div>

          <!-- Validated Stamp -->
          <transition name="fade">
            <div
              v-if="event.isAttending"
              class="absolute inset-0 bg-emerald-600/[0.03] pointer-events-none flex items-center justify-center overflow-hidden"
            >
              <div
                class="border-[4px] md:border-[6px] border-emerald-600/10 rounded-full w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rotate-[25deg] animate-in zoom-in-150 duration-500 opacity-40"
              >
                <span
                  class="text-[10px] md:text-[12px] font-black text-emerald-600/40 uppercase tracking-[0.4em]"
                  >VALID</span
                >
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div
      v-else
      class="py-32 text-center bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 max-w-4xl mx-auto px-6"
    >
      <p
        class="text-gray-400 font-black uppercase tracking-widest text-[9px] italic text-center"
      >
        Henüz aktif bir bilet bulunamadı.
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

const toast = useToast();
const authStore = useAuthStore();
const loading = ref(false);
const activePeriod = ref("all");
const selectedCampus = ref("TÜMÜ");
const showCreateModal = ref(false);
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
  return events.value.filter(
    (e) => selectedCampus.value === "TÜMÜ" || e.campus === selectedCampus.value,
  );
});

const getDay = (dateStr: string) => new Date(dateStr).getDate();
const getMonth = (dateStr: string) =>
  new Date(dateStr).toLocaleString("tr-TR", { month: "short" }).toUpperCase();
const getTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
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
.animate-in {
  animation-duration: 0.6s;
}
.ticket-card {
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.04));
}
.dark .ticket-card {
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
}
</style>
