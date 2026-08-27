<!-- src/views/Cafeteria.vue -->
<template>
  <div
    class="max-w-4xl mx-auto p-4 pb-24 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans transition-colors duration-500"
  >
    <!-- HEADER (Kompakt Modern) -->
    <header class="mb-12 text-center pt-6 relative">
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none"
      ></div>

      <button
        @click="$router.push('/campus')"
        class="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-all font-black uppercase text-[9px] tracking-widest mb-4 outline-none group bg-white dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5 shadow-sm active:scale-95"
      >
        <component
          :is="getIcon('chevron-left')"
          class="w-3 h-3 transition-transform group-hover:-translate-x-1"
        />
        Geri Dön
      </button>

      <h1
        class="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none mb-1"
      >
        MAKÜ
        <span
          class="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"
          >GASTRO</span
        >
      </h1>
      <p
        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] opacity-50 italic"
      >
        Gastronomi Portalı
      </p>
    </header>

    <!-- KONTROL PANELİ -->
    <section
      class="max-w-3xl mx-auto mb-12 space-y-8 text-center relative z-10"
    >
      <!-- 1. Kampüs Seçimi (Daha Küçük Carousel) -->
      <div class="flex flex-col items-center gap-4">
        <div class="relative w-full overflow-hidden h-20 flex items-center">
          <div
            ref="locationNavRef"
            @scroll="handleCarouselScroll"
            class="flex items-center gap-4 overflow-x-auto px-[35%] scrollbar-hide snap-x snap-mandatory scroll-smooth w-full h-16"
          >
            <div
              v-for="(loc, index) in locations"
              :key="loc.id"
              class="flex-shrink-0 snap-center carousel-item"
            >
              <button
                @click="
                  selectedLocation = loc.id;
                  centerCarouselItem(index);
                "
                :class="[
                  'w-36 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-500 border-2 px-4 relative overflow-hidden',
                  selectedLocation === loc.id
                    ? 'bg-orange-600 border-orange-500 text-white shadow-lg scale-110'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-gray-100 dark:border-white/5 text-gray-400 scale-90 opacity-40',
                ]"
              >
                <span
                  class="text-[9px] font-black uppercase tracking-widest relative z-10"
                  >{{ loc.name }}</span
                >
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Hafta Filtresi (Kompakt Pill) -->
      <div class="flex justify-center">
        <div
          class="flex p-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-xl shadow-md border border-white dark:border-white/5 w-full max-w-xs"
        >
          <button
            @click="activeWeek = 'this'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-500"
            :class="
              activeWeek === 'this'
                ? 'bg-orange-500 text-white shadow-md scale-[1.02]'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            "
          >
            <component :is="getIcon('calendar')" class="w-3 h-3" />
            Bu Hafta
          </button>
          <button
            @click="activeWeek = 'next'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-500"
            :class="
              activeWeek === 'next'
                ? 'bg-orange-500 text-white shadow-md scale-[1.02]'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            "
          >
            <component :is="getIcon('arrow-right-circle')" class="w-3 h-3" />
            Gelecek
          </button>
        </div>
      </div>
    </section>

    <!-- CONTENT -->
    <div v-if="loading" class="py-24 text-center flex flex-col items-center">
      <div class="relative w-12 h-12 mb-4">
        <div
          class="absolute inset-0 border-2 border-orange-500/10 rounded-full"
        ></div>
        <div
          class="absolute inset-0 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
      <p
        class="text-[9px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-60"
      >
        Menü Hazırlanıyor
      </p>
    </div>

    <div
      v-else-if="currentMenuData.length > 0"
      class="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700"
    >
      <!-- BUGÜNÜN MENÜSÜ (Kompakt Glass) -->
      <div
        v-if="activeWeek === 'this' && todayMenu"
        class="group relative p-0.5 rounded-[2.5rem] bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 shadow-xl overflow-hidden transition-all duration-700 hover:scale-[1.01]"
      >
        <div class="animated-gradient-bg absolute inset-0 opacity-80"></div>

        <div
          class="relative z-10 p-6 md:p-10 bg-black/5 dark:bg-black/20 backdrop-blur-sm rounded-[2.4rem] border border-white/20"
        >
          <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-8"
          >
            <div class="space-y-6 flex-1 text-left">
              <div
                class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-2xl rounded-full border border-white/10 shadow-lg"
              >
                <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
                <span
                  class="text-[10px] font-black uppercase tracking-[0.15em] text-white"
                  >Günün Menüsü • {{ todayMenu.day }}</span
                >
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                <div
                  v-for="(item, i) in todayMenu.items"
                  :key="i"
                  class="flex items-center gap-4 group/item py-1"
                >
                  <div
                    class="w-9 h-9 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center font-black text-[11px] text-white group-hover/item:bg-white group-hover/item:text-orange-600 shadow-lg border border-white/10 transition-all duration-500 flex-shrink-0"
                  >
                    {{ i + 1 }}
                  </div>
                  <p
                    class="text-[15px] font-black tracking-tight text-white group-hover/item:translate-x-1 transition-transform uppercase italic drop-shadow-sm"
                  >
                    {{ item }}
                  </p>
                </div>
              </div>
            </div>

            <div
              class="hidden lg:flex flex-col items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 self-center group-hover:rotate-6 transition-transform duration-700"
            >
              <component
                :is="getIcon('utensils-crossed')"
                class="w-10 h-10 text-white/90"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- HAFTALIK LİSTE (Kompakt Grid) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="day in currentMenuData"
          :key="day.day"
          class="group p-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-[2rem] hover:shadow-xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden"
          :class="{
            'ring-1 ring-orange-500/20 border-orange-500/20 bg-orange-50/20 dark:bg-orange-950/10':
              isToday(day.day) && activeWeek === 'this',
          }"
        >
          <div class="space-y-6 text-left relative z-10">
            <div class="flex items-center justify-between">
              <span
                class="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.2em] italic"
                >{{ day.day }}</span
              >
              <div
                v-if="isToday(day.day) && activeWeek === 'this'"
                class="px-3 py-1 bg-orange-600 text-white text-[8px] font-black rounded-full uppercase tracking-widest shadow-md"
              >
                BUGÜN
              </div>
            </div>

            <div class="space-y-2.5">
              <p
                v-for="item in day.items"
                :key="item"
                class="text-[12px] font-bold text-gray-800 dark:text-gray-200 leading-tight group-hover:text-orange-600 transition-colors flex items-start gap-2.5 uppercase italic"
              >
                <component
                  :is="getIcon('soup')"
                  class="w-3.5 h-3.5 text-orange-500/30 group-hover:text-orange-500 mt-0.5 flex-shrink-0"
                />
                {{ item }}
              </p>
            </div>
          </div>

          <div
            class="mt-8 pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between opacity-20 group-hover:opacity-100 transition-opacity"
          >
            <span
              class="text-[8px] font-black text-gray-400 uppercase tracking-widest"
              >Akademik</span
            >
            <component
              :is="getIcon('chef-hat')"
              class="w-4 h-4 text-gray-400"
            />
          </div>
        </div>
      </div>

      <!-- FOOTER INFO (Kompakt) -->
      <div
        class="p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[2rem] border border-white dark:border-white/5 flex items-center gap-6 shadow-sm"
      >
        <div
          class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
        >
          <component :is="getIcon('info')" class="w-6 h-6" />
        </div>
        <div class="text-left">
          <h4
            class="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest italic"
          >
            Resmi Bilgi
          </h4>
          <p
            class="text-[11px] text-gray-500 dark:text-gray-400 font-bold leading-tight italic opacity-70"
          >
            Veriler mehmetakif.edu.tr'den anlık olarak çekilmektedir.
          </p>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else class="py-24 text-center">
      <component
        :is="getIcon('clock')"
        class="w-10 h-10 text-gray-200 dark:text-gray-800 mx-auto mb-4"
      />
      <p
        class="text-gray-400 font-black uppercase tracking-widest text-[9px] italic"
      >
        Henüz menü bulunamadı.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import * as LucideIcons from "lucide-vue-next";

const toast = useToast();
const activeWeek = ref<"this" | "next">("this");
const selectedLocation = ref<string>("merkez");
const loading = ref(false);
const locationNavRef = ref<HTMLElement | null>(null);

const locations = [
  { id: "bucak", name: "Bucak", desc: "Bucak Kampüsü" },
  { id: "merkez", name: "Merkez", desc: "Merkez Kampüs" },
  { id: "ilceler", name: "İlçeler", desc: "İlçe Kampüsleri" },
];

const menuData = ref<any>({
  merkez: { thisWeek: [], nextWeek: [] },
  bucak: { thisWeek: [], nextWeek: [] },
  ilceler: { thisWeek: [], nextWeek: [] },
});

const fetchMenu = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get("/campus/cafeteria");
    menuData.value = res.data;
  } catch (error) {
    toast.error("Yemek listesi şu an alınamıyor.");
  } finally {
    loading.value = false;
  }
};

const getIcon = (iconName: string) => {
  if (!iconName) return LucideIcons.HelpCircle;
  const pascalName = iconName
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  return (LucideIcons as any)[pascalName] || LucideIcons.HelpCircle;
};

const handleCarouselScroll = () => {
  const el = locationNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll(".carousel-item");
  const containerRect = el.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;
  items.forEach((item: any) => {
    const itemRect = item.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const factor = Math.min(
      Math.abs(containerCenterX - itemCenterX) / (el.clientWidth / 2.5),
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
  const el = locationNavRef.value;
  if (!el) return;
  const target = el.querySelectorAll(".carousel-item")[index] as HTMLElement;
  if (target) {
    el.scrollTo({
      left: target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2,
      behavior: "smooth",
    });
  }
};

const currentMenuData = computed(() => {
  const locationData = menuData.value[selectedLocation.value];
  if (!locationData) return [];
  return activeWeek.value === "this"
    ? locationData.thisWeek || []
    : locationData.nextWeek || [];
});

const todayMenu = computed(() => {
  const menu = currentMenuData.value;
  if (!menu || menu.length === 0) return null;
  const daysMap: any = {
    Monday: "Pazartesi",
    Tuesday: "Salı",
    Wednesday: "Çarşamba",
    Thursday: "Perşembe",
    Friday: "Cuma",
  };
  const engDay = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(),
  );
  const trDay = daysMap[engDay] || "Pazartesi";
  return menu.find((m: any) => m.day.includes(trDay));
});

const isToday = (dayName: string) => {
  const daysMap: any = {
    Monday: "Pazartesi",
    Tuesday: "Salı",
    Wednesday: "Çarşamba",
    Thursday: "Perşembe",
    Friday: "Cuma",
  };
  const engDay = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(),
  );
  const trDay = daysMap[engDay] || "Pazartesi";
  return dayName.includes(trDay);
};

onMounted(async () => {
  await fetchMenu();
  setTimeout(() => {
    centerCarouselItem(1);
    handleCarouselScroll();
  }, 500);
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.carousel-item {
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}
.animated-gradient-bg {
  background: linear-gradient(-45deg, #f97316, #ef4444, #ea580c, #f97316);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.animate-in {
  animation: fadeIn 0.6s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
