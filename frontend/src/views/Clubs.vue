<!-- src/views/Clubs.vue -->
<template>
  <div
    class="max-w-5xl mx-auto p-4 sm:p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans"
  >
    <!-- HEADER -->
    <header class="mb-8 sm:mb-12 text-center pt-4">
      <button
        @click="$router.push('/campus')"
        class="inline-flex items-center gap-2 text-gray-400 hover:text-rose-500 transition-colors font-black uppercase text-[10px] tracking-widest mb-4 outline-none group"
      >
        <svg
          class="w-4 h-4 transition-transform group-hover:-translate-x-1"
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
        class="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none"
      >
        MAKÜ <span class="text-rose-600">Hub</span>
      </h1>
    </header>

    <!-- KONTROL PANELİ -->
    <section class="max-w-4xl mx-auto mb-8 sm:mb-12 space-y-4 text-center">
      <!-- Search -->
      <div class="relative max-w-md mx-auto group mb-8">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Topluluk, proje veya ekip ara..."
          class="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-4 focus:ring-rose-500/10 transition-all outline-none text-gray-900 dark:text-white font-bold shadow-sm"
        />
        <svg
          class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <!-- ÜST ANA KATEGORİ ÇARKI -->
      <div class="relative w-full overflow-hidden h-20 flex items-center mb-2">
        <div
          ref="mainTypeNavRef"
          @scroll="handleMainCarouselScroll"
          class="flex items-center gap-4 overflow-x-auto px-[35%] scrollbar-hide snap-x snap-mandatory scroll-smooth w-full h-full"
        >
          <div
            v-for="(type, index) in centeredMainTypes"
            :key="type.value"
            class="flex-shrink-0 snap-center main-carousel-item"
          >
            <button
              @click="
                selectedMainType = type.value;
                selectedCategory = 'TÜMÜ';
                centerMainCarouselItem(index);
                resetSubCarousel();
              "
              :class="[
                'w-28 h-11 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 border-2 px-3',
                selectedMainType === type.value
                  ? 'bg-rose-600 border-rose-600 text-white shadow-lg scale-110'
                  : 'bg-white dark:bg-gray-800 border-transparent text-gray-400 opacity-40 scale-90',
              ]"
            >
              <span
                v-if="type.value !== 'ALL'"
                class="w-1.5 h-1.5 rounded-full bg-current"
              ></span>
              <span class="text-[9px] font-black uppercase tracking-tight">{{
                type.label
              }}</span>
            </button>
          </div>
        </div>
        <div
          class="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fafafa] dark:from-[#0b0f19] to-transparent pointer-events-none z-10"
        ></div>
        <div
          class="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#fafafa] dark:from-[#0b0f19] to-transparent pointer-events-none z-10"
        ></div>
      </div>

      <!-- ALT ALT KATEGORİ ÇARKI (Kırmızı Tema) -->
      <transition name="fade">
        <div
          v-if="selectedMainType !== 'ALL'"
          class="relative w-full overflow-hidden h-20 flex items-center mb-4"
        >
          <div
            ref="categoryNavRef"
            @scroll="handleSubCarouselScroll"
            class="flex items-center gap-4 overflow-x-auto px-[35%] scrollbar-hide snap-x snap-mandatory scroll-smooth w-full h-full"
          >
            <div
              v-for="(cat, index) in currentSubCategories"
              :key="cat"
              class="flex-shrink-0 snap-center sub-carousel-item"
            >
              <button
                @click="
                  selectedCategory = cat;
                  centerSubCarouselItem(index);
                "
                :class="[
                  'min-w-[100px] h-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 border-2 px-4',
                  selectedCategory === cat
                    ? 'bg-rose-600 border-rose-600 text-white shadow-lg scale-110'
                    : 'bg-white dark:bg-gray-800 border-transparent text-gray-400 opacity-40 scale-90',
                ]"
              >
                <span
                  v-if="cat !== 'TÜMÜ'"
                  class="w-1.5 h-1.5 rounded-full bg-current"
                ></span>
                <span class="text-[9px] font-black uppercase tracking-widest">{{
                  cat
                }}</span>
              </button>
            </div>
          </div>
          <div
            class="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fafafa] dark:from-[#0b0f19] to-transparent pointer-events-none z-10"
          ></div>
          <div
            class="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#fafafa] dark:from-[#0b0f19] to-transparent pointer-events-none z-10"
          ></div>
        </div>
      </transition>

      <div class="pt-6">
        <button
          @click="showCreateModal = true"
          class="px-10 py-4 bg-rose-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20 active:scale-95"
        >
          + YENİ TOPLULUK BAŞLAT
        </button>
      </div>
    </section>

    <!-- TOPLULUK LİSTESİ -->
    <div v-if="loading" class="py-20 text-center flex flex-col items-center">
      <div
        class="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"
      ></div>
      <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">
        Yükleniyor
      </p>
    </div>

    <div
      v-else-if="filteredClubs.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto text-left animate-in fade-in duration-700"
    >
      <div
        v-for="club in filteredClubs"
        :key="club.id"
        @click="goToDetail(club)"
        class="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-7 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-2 cursor-pointer overflow-hidden"
      >
        <!-- KART ARKA PLAN PARLAMASI (Glow) -->
        <div
          class="absolute -right-12 -top-12 w-32 h-32 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"
          :style="{ backgroundColor: club.color }"
        ></div>

        <div>
          <div class="flex justify-between items-start mb-6">
            <div
              class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100 dark:border-white/5 group-hover:rotate-6 transition-transform overflow-hidden relative"
              :style="{ backgroundColor: club.color + '15', color: club.color }"
            >
              <span
                v-if="isEmoji(club.emoji)"
                class="text-3xl sm:text-4xl relative z-10"
              >
                {{ club.emoji }}
              </span>
              <span
                v-else
                class="text-lg sm:text-xl font-black uppercase tracking-tighter relative z-10"
              >
                {{ club.emoji }}
              </span>
            </div>

            <div class="flex flex-col items-end gap-1.5">
              <!-- DURUM ETİKETİ (Status Tag) -->
              <div
                v-if="
                  club.maxMembers &&
                  club.maxMembers - club.memberCount <= 2 &&
                  club.maxMembers - club.memberCount > 0
                "
                class="px-2 py-0.5 bg-rose-500 text-white text-[7px] font-black rounded-full animate-pulse uppercase tracking-widest"
              >
                SON {{ club.maxMembers - club.memberCount }} KİŞİ
              </div>

              <span
                class="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[8px] font-black rounded-full border border-gray-100 dark:border-white/5 uppercase tracking-widest"
              >
                {{ club.category }}
              </span>
            </div>
          </div>

          <h3
            class="text-lg sm:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2 leading-tight truncate group-hover:text-rose-600 transition-colors"
          >
            {{ club.name }}
          </h3>
          <p
            class="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 line-clamp-2 italic h-8"
          >
            "{{ club.description }}"
          </p>

          <!-- KATEGORİYE ÖZEL GÖRSELLEŞTİRME (SPECIALIZED UI) -->
          <div class="mb-6 min-h-[44px] flex items-center">
            <!-- 1. HALISAHA & OYUN: Lobi/Slot Görünümü -->
            <div
              v-if="club.category === 'HALISAHA' || club.category === 'OYUN'"
              class="w-full space-y-3"
            >
              <div class="flex items-center justify-between mb-1">
                <span
                  class="text-[8px] font-black text-gray-400 uppercase tracking-widest"
                  >Kadro Durumu</span
                >
                <span class="text-[9px] font-black text-rose-600">
                  {{ club.memberCount }}/{{ club.maxMembers || "∞" }}
                </span>
              </div>
              <div class="flex gap-1.5">
                <div
                  v-for="i in club.maxMembers || 5"
                  :key="i"
                  :class="[
                    'h-1.5 flex-1 rounded-full transition-all duration-500',
                    i <= club.memberCount
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.4)]'
                      : 'bg-gray-100 dark:bg-gray-800',
                  ]"
                ></div>
              </div>
            </div>

            <!-- 2. GEZİ: Rota Görünümü -->
            <div
              v-if="club.category === 'GEZİ' && club.metadata?.tripFrom"
              class="w-full flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-2xl border border-gray-100 dark:border-white/5"
            >
              <div class="flex-1 text-center">
                <p class="text-[7px] font-black text-gray-400 uppercase">
                  Kalkış
                </p>
                <p
                  class="text-[9px] font-black text-gray-700 dark:text-gray-200 truncate"
                >
                  {{ club.metadata.tripFrom }}
                </p>
              </div>
              <div class="flex flex-col items-center px-1">
                <svg
                  class="w-4 h-4 text-rose-500 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
              <div v-if="club.metadata.tripTo" class="flex-1 text-center">
                <p class="text-[7px] font-black text-gray-400 uppercase">
                  Varış
                </p>
                <p class="text-[9px] font-black text-rose-600 truncate">
                  {{ club.metadata.tripTo }}
                </p>
              </div>
            </div>

            <!-- 3. AKTİVİTE: Vibe & Type -->
            <div
              v-if="club.category === 'AKTİVİTE'"
              class="w-full flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-2 h-2 rounded-full bg-amber-500 animate-ping"
                ></div>
                <span
                  class="text-[9px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-tighter"
                >
                  {{ club.metadata?.activityType || "Buluşma" }}
                </span>
              </div>
              <span
                class="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[8px] font-black rounded-lg border border-amber-100 dark:border-amber-900/20 uppercase tracking-widest"
              >
                {{ club.metadata?.activityVibe || "Chill" }} Vibe
              </span>
            </div>

            <!-- 4. DİJİTAL / PROJE: Tech & Academic -->
            <div
              v-if="club.mainType === 'DIGITAL' || club.mainType === 'PROJECT'"
              class="w-full flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                ></div>
                <span
                  class="text-[9px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-tighter"
                >
                  {{
                    club.mainType === "PROJECT"
                      ? "Aktif Proje"
                      : "Dijital Topluluk"
                  }}
                </span>
              </div>
              <div v-if="club.advisorName" class="flex items-center gap-1.5">
                <svg
                  class="w-3 h-3 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  />
                </svg>
                <span
                  class="text-[8px] font-black text-emerald-600 uppercase tracking-widest"
                >
                  Hoca Onaylı
                </span>
              </div>
            </div>
          </div>

          <!-- ALT BİLGİLER & KATILIMCI SOSYAL LİSTESİ -->
          <div
            class="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5"
          >
            <!-- KATILIMCILAR (Facepile) -->
            <div class="flex items-center gap-3">
              <div
                class="flex items-center -space-x-2.5 cursor-pointer hover:scale-105 transition-transform"
                @click.stop="openMembersModal(club)"
              >
                <template v-if="club.members && club.members.length > 0">
                  <div
                    v-for="member in club.members.slice(0, 3)"
                    :key="member.id"
                    class="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-sm"
                  >
                    <img
                      v-if="member.avatarUrl"
                      :src="getAvatarUrl(member.avatarUrl)"
                      @error="handleImageError($event, member)"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-[8px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800 uppercase"
                    >
                      {{ member.username ? member.username.charAt(0) : "?" }}
                    </div>
                  </div>
                  <div
                    v-if="club.memberCount > 3"
                    class="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm"
                  >
                    <span class="text-[8px] font-black text-gray-400"
                      >+{{ club.memberCount - 3 }}</span
                    >
                  </div>
                </template>
                <div
                  v-else
                  class="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group/join"
                  @click.stop="toggleJoin(club)"
                >
                  <div
                    class="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center group-hover/join:border-rose-500 group-hover/join:bg-rose-500/10 transition-colors"
                  >
                    <span
                      class="text-[10px] text-gray-400 group-hover/join:text-rose-500"
                      >+</span
                    >
                  </div>
                  <span
                    class="text-[8px] font-black text-gray-400 uppercase tracking-widest group-hover/join:text-rose-600"
                    >İlk Sen Katıl</span
                  >
                </div>
              </div>

              <!-- HIZLI KATIL / AYRIL BUTONU -->
              <button
                v-if="club.members && club.members.length > 0"
                @click.stop="toggleJoin(club)"
                :class="[
                  'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 group/toggle',
                  club.isJoined
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 shadow-none border border-emerald-100 dark:border-emerald-900/20'
                    : 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600 hover:rotate-90 hover:scale-110',
                ]"
                :title="club.isJoined ? 'Ayrıl' : 'Hızlı Katıl'"
              >
                <!-- Katılmamışsa: Artı İkonu -->
                <svg
                  v-if="!club.isJoined"
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="4"
                    d="M12 6v12m6-6H6"
                  />
                </svg>

                <!-- Katılmışsa: Tik İkonu (Hover'da Çarpı olacak) -->
                <div
                  v-else
                  class="relative w-full h-full flex items-center justify-center"
                >
                  <svg
                    class="w-3.5 h-3.5 group-hover/toggle:hidden"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="4"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <svg
                    class="w-3.5 h-3.5 hidden group-hover/toggle:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="4"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </button>
            </div>

            <button
              class="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-rose-600 group-hover:text-white transition-all flex items-center justify-center shadow-sm"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="py-20 text-center opacity-40 italic">
      <p class="text-sm font-black uppercase tracking-widest text-gray-500">
        Bu kategoride henüz topluluk bulunamadı
      </p>
    </div>

    <!-- KATILIMCI LİSTESİ MODALI -->
    <transition name="fade">
      <div
        v-if="showMembersModal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-white/40 dark:bg-gray-950/70 backdrop-blur-xl"
          @click="showMembersModal = false"
        ></div>
        <div
          class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 relative flex flex-col overflow-hidden max-h-[70vh] animate-in zoom-in-95 duration-300"
        >
          <div
            class="p-6 text-center border-b border-gray-50 dark:border-white/5"
          >
            <h3
              class="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic"
            >
              Katılımcı <span class="text-rose-600">Listesi</span>
            </h3>
            <p
              class="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1"
            >
              {{ selectedClubForMembers?.memberCount }} ÜYE MEVCUT
            </p>
          </div>
          <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div class="space-y-3">
              <div
                v-for="member in selectedClubForMembers?.members"
                :key="member.id"
                class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/50 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-white dark:bg-gray-800 overflow-hidden shadow-sm"
                  >
                    <img
                      v-if="member.avatarUrl"
                      :src="getAvatarUrl(member.avatarUrl)"
                      @error="handleImageError($event, member)"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-xs font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 uppercase"
                    >
                      {{ member.username ? member.username.charAt(0) : "?" }}
                    </div>
                  </div>
                  <div>
                    <p
                      class="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight"
                    >
                      {{ member.fullName || member.username }}
                    </p>
                    <p class="text-[9px] font-bold text-rose-500">
                      @{{ member.username }}
                    </p>
                  </div>
                </div>
                <div
                  v-if="member.role === 'LEADER'"
                  class="px-2 py-0.5 bg-rose-600 text-white text-[7px] font-black rounded-full uppercase tracking-widest"
                >
                  LİDER
                </div>
              </div>
            </div>
          </div>
          <div class="p-4 border-t border-gray-50 dark:border-white/5">
            <button
              @click="showMembersModal = false"
              class="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all"
            >
              KAPAT
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- CREATE MODAL -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-[150] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-white/40 dark:bg-gray-950/70 backdrop-blur-xl"
        @click="showCreateModal = false"
      ></div>
      <div
        class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 relative flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-300"
      >
        <div
          class="p-8 pb-4 text-center w-full border-b border-gray-50 dark:border-white/5"
        >
          <h3
            class="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2"
          >
            Hub'a <span class="text-rose-600">Katıl</span>
          </h3>
          <p
            class="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]"
          >
            Yeni Bir Topluluk Başlat
          </p>
        </div>

        <form
          @submit.prevent="handleCreateClub"
          class="p-8 pt-6 space-y-6 overflow-y-auto custom-scrollbar relative"
        >
          <!-- ANA TİP SEÇİMİ -->
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="type in mainTypesList"
              :key="type.value"
              type="button"
              @click="
                form.mainType = type.value;
                form.category = categoryMap[type.value][0];
              "
              :class="[
                'py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border-2',
                form.mainType === type.value
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                  : 'bg-slate-50 dark:bg-gray-800 text-gray-400 border-transparent hover:border-gray-200 dark:hover:border-gray-700',
              ]"
            >
              {{ type.label }}
            </button>
          </div>

          <div class="space-y-4">
            <div class="space-y-1 text-left">
              <label
                class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1"
                >Topluluk Adı</label
              >
              <input
                v-model="form.name"
                required
                type="text"
                placeholder="Örn: Teknofest İHA Takımı..."
                class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none outline-none text-sm font-bold shadow-inner transition-all border-2 border-transparent focus:border-rose-500/20"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1 text-left relative">
                <label
                  class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1"
                  >Kategori</label
                >
                <button
                  type="button"
                  @click="showCategoryDropdown = !showCategoryDropdown"
                  class="w-full h-14 px-5 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-gray-700 shadow-inner border-2 border-transparent"
                  :class="{ 'border-rose-500/20': showCategoryDropdown }"
                >
                  <span
                    class="text-[10px] font-black uppercase tracking-tight text-gray-900 dark:text-white"
                    >{{ form.category }}</span
                  >
                  <svg
                    class="w-4 h-4 text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showCategoryDropdown }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <transition name="fade">
                  <div
                    v-if="showCategoryDropdown"
                    class="absolute z-[180] left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <button
                      v-for="cat in categoryMap[form.mainType]"
                      :key="cat"
                      @click="
                        form.category = cat;
                        showCategoryDropdown = false;
                      "
                      type="button"
                      class="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors border-b last:border-0"
                    >
                      {{ cat }}
                    </button>
                  </div>
                </transition>
              </div>

              <div class="space-y-1 text-left relative">
                <label
                  class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1"
                  >Stil</label
                >
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="
                      showEmojiGrid = !showEmojiGrid;
                      showColorPicker = false;
                    "
                    class="flex-1 h-14 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-700 shadow-inner"
                  >
                    <span
                      v-if="form.emoji"
                      :class="
                        isEmoji(form.emoji)
                          ? 'text-2xl'
                          : 'text-[10px] font-black uppercase'
                      "
                      :style="{ color: isEmoji(form.emoji) ? '' : form.color }"
                      >{{ form.emoji }}</span
                    >
                    <span
                      v-else
                      class="text-[8px] font-black text-gray-400 uppercase"
                      >İkon</span
                    >
                  </button>
                  <button
                    type="button"
                    @click="
                      showColorPicker = !showColorPicker;
                      showEmojiGrid = false;
                    "
                    class="w-14 h-14 rounded-2xl shadow-lg border-4 border-white dark:border-gray-800 transition-transform"
                    :style="{ backgroundColor: form.color }"
                  ></button>
                </div>
                <transition name="fade">
                  <div
                    v-if="showColorPicker"
                    class="absolute right-0 top-full mt-3 p-4 bg-white dark:bg-gray-900 border rounded-3xl shadow-2xl z-[200] grid grid-cols-3 gap-3 w-40"
                  >
                    <button
                      v-for="color in chatThemes"
                      :key="color"
                      @click="
                        form.color = color;
                        showColorPicker = false;
                      "
                      type="button"
                      class="w-8 h-8 rounded-full border-2 border-white transition-transform hover:scale-125"
                      :style="{ backgroundColor: color }"
                    ></button>
                  </div>
                </transition>
                <transition name="fade">
                  <div
                    v-if="showEmojiGrid"
                    class="absolute z-[190] right-0 top-full mt-3 w-72 bg-white dark:bg-gray-900 border rounded-[2.5rem] shadow-2xl p-6 space-y-4"
                  >
                    <input
                      v-model="customIconText"
                      maxlength="3"
                      @input="form.emoji = customIconText.toUpperCase()"
                      type="text"
                      placeholder="Kısa Ad (Örn: IHA)"
                      class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest shadow-inner"
                      :style="{ color: form.color }"
                    />
                    <div
                      class="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1"
                    >
                      <button
                        v-for="e in clubEmojis"
                        :key="e"
                        @click="
                          form.emoji = e;
                          customIconText = '';
                          showEmojiGrid = false;
                        "
                        type="button"
                        class="text-xl hover:scale-125 transition-transform p-1 rounded-lg"
                      >
                        {{ e }}
                      </button>
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <!-- DİNAMİK ALANLAR (Metadata) -->
            <div class="space-y-4 animate-in slide-in-from-top-2 duration-500">
              <!-- Proje Detayları -->
              <template v-if="form.mainType === 'PROJECT'">
                <div
                  v-if="form.category === 'TÜBİTAK'"
                  class="space-y-1 text-left"
                >
                  <label
                    class="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1"
                    >TÜBİTAK Program Kodu</label
                  >
                  <input
                    v-model="form.metadata.programCode"
                    type="text"
                    placeholder="2209-A, 2209-B vb."
                    class="w-full px-5 py-4 bg-rose-50/30 dark:bg-rose-900/5 rounded-2xl border-none outline-none text-xs font-bold shadow-inner"
                  />
                </div>
                <div
                  v-if="form.category === 'TEKNOFEST'"
                  class="space-y-1 text-left"
                >
                  <label
                    class="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1"
                    >Yarışma Kategorisi</label
                  >
                  <input
                    v-model="form.metadata.competitionCategory"
                    type="text"
                    placeholder="İHA, Roket, Yazılım vb."
                    class="w-full px-5 py-4 bg-blue-50/30 dark:bg-blue-900/5 rounded-2xl border-none outline-none text-xs font-bold shadow-inner"
                  />
                </div>
                <div class="space-y-1 text-left">
                  <label
                    class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1"
                    >Aranan Yetenekler</label
                  >
                  <input
                    v-model="form.requiredSkills"
                    type="text"
                    placeholder="Yazılım, Tasarım, Analiz..."
                    class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none outline-none text-xs font-bold shadow-inner"
                  />
                </div>
              </template>

              <!-- Sosyal Detaylar -->
              <template v-if="form.mainType === 'SOCIAL'">
                <!-- Halı Saha Detayları (Taktik Tahtası) -->
                <div
                  v-if="form.category === 'HALISAHA'"
                  class="space-y-8 pt-4 animate-in slide-in-from-top-4 duration-500"
                >
                  <!-- Taktik Tahtası -->
                  <div class="space-y-4">
                    <div class="flex items-center justify-between px-1">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]"
                        >Eksik Mevki Seçimi</label
                      >
                      <span
                        class="text-[10px] font-black text-rose-600 uppercase tracking-tighter"
                        >{{
                          form.metadata.position === "KL"
                            ? "KALECİ"
                            : form.metadata.position === "DF"
                              ? "DEFANS"
                              : form.metadata.position === "OS"
                                ? "ORTA SAHA"
                                : "FORVET"
                        }}
                        ARANIYOR</span
                      >
                    </div>
                    <div
                      class="relative w-full aspect-[16/9] bg-emerald-600 dark:bg-emerald-900/40 rounded-[2rem] border-4 border-emerald-500/30 shadow-2xl overflow-hidden group"
                    >
                      <div
                        class="absolute inset-0 border-2 border-white/20 m-4 rounded-lg pointer-events-none"
                      ></div>
                      <div
                        class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/20 pointer-events-none"
                      ></div>
                      <div
                        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/20 rounded-full pointer-events-none"
                      ></div>
                      <div
                        class="absolute inset-y-1/4 left-4 w-8 border-2 border-white/20 border-l-0 pointer-events-none"
                      ></div>
                      <div
                        class="absolute inset-y-1/4 right-4 w-8 border-2 border-white/20 border-r-0 pointer-events-none"
                      ></div>
                      <div
                        class="absolute inset-0 grid grid-cols-4 items-center px-8 sm:px-12"
                      >
                        <button
                          v-for="p in ['KL', 'DF', 'OS', 'FV']"
                          :key="p"
                          type="button"
                          @click="form.metadata.position = p"
                          :class="[
                            'w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 z-10',
                            form.metadata.position === p
                              ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] scale-125'
                              : 'bg-white/10 text-white/50 hover:bg-white/20',
                          ]"
                        >
                          {{ p }}
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- Maç Detayları (Hizalı) -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                    <div class="space-y-3 text-left">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                        >Maç Formatı</label
                      >
                      <div
                        class="flex bg-slate-100/50 dark:bg-gray-800/50 p-1.5 rounded-[1.25rem] shadow-inner h-14 items-center"
                      >
                        <button
                          v-for="m in ['6v6', '7v7', '8v8']"
                          :key="m"
                          type="button"
                          @click="form.metadata.matchType = m"
                          :class="[
                            'flex-1 h-11 text-[9px] font-black rounded-xl transition-all duration-300',
                            form.metadata.matchType === m
                              ? 'bg-white dark:bg-gray-700 text-rose-600 shadow-md scale-[1.02]'
                              : 'text-gray-400 hover:text-gray-500',
                          ]"
                        >
                          {{ m }}
                        </button>
                      </div>
                    </div>
                    <div class="space-y-3 text-left">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                        >Maç Saati</label
                      >
                      <input
                        v-model="form.metadata.matchTime"
                        type="text"
                        placeholder="Örn: 21:00 - 22:00"
                        class="w-full h-14 px-6 bg-slate-100/50 dark:bg-gray-800/50 rounded-[1.25rem] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>

                  <!-- Saha ve Ücret (Manuel Giriş) -->
                  <div class="grid grid-cols-1 sm:grid-cols-[1fr,120px] gap-6">
                    <div class="space-y-3 text-left">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                        >Saha İsmi & Konum</label
                      >
                      <input
                        v-model="form.metadata.pitchLocation"
                        type="text"
                        placeholder="Örn: Kampüs Üst Saha, Gölbaşı vb."
                        class="w-full h-14 px-6 bg-slate-100/50 dark:bg-gray-800/50 rounded-[1.25rem] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                    <div class="space-y-3 text-left">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                        >Kişi Başı</label
                      >
                      <div class="relative group">
                        <input
                          v-model="form.metadata.matchFee"
                          type="text"
                          placeholder="150"
                          class="w-full h-14 px-5 bg-slate-100/50 dark:bg-gray-800/50 rounded-[1.25rem] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-rose-500/20"
                        />
                        <span
                          class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-rose-600"
                          >₺</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="form.category === 'OYUN'"
                  class="space-y-8 pt-4 animate-in slide-in-from-top-4 duration-500"
                >
                  <!-- Lobi Görseli (Eksik Slotlar) -->
                  <div class="space-y-4">
                    <div class="flex items-center justify-between px-1">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]"
                        >Lobi Durumu</label
                      >
                      <span
                        class="text-[10px] font-black text-rose-600 uppercase tracking-tighter"
                        >{{ form.metadata.missingPlayers }} KİŞİ ARANIYOR</span
                      >
                    </div>

                    <div
                      class="bg-slate-100/50 dark:bg-gray-800/50 p-6 rounded-[2rem] shadow-inner flex items-center justify-center gap-4"
                    >
                      <div
                        v-for="i in form.metadata.lobbySize"
                        :key="i"
                        class="relative"
                      >
                        <!-- Slot Daireleri -->
                        <div
                          :class="[
                            'w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500',
                            i >
                            form.metadata.lobbySize -
                              form.metadata.missingPlayers
                              ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(225,29,72,0.3)] animate-pulse'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
                          ]"
                        >
                          <svg
                            v-if="
                              i >
                              form.metadata.lobbySize -
                                form.metadata.missingPlayers
                            "
                            class="w-5 h-5 text-rose-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                            />
                          </svg>
                          <svg
                            v-else
                            class="w-5 h-5 text-gray-300 dark:text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                            />
                          </svg>
                        </div>
                        <!-- Aranan Kişi İşareti -->
                        <div
                          v-if="
                            i >
                            form.metadata.lobbySize -
                              form.metadata.missingPlayers
                          "
                          class="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
                        >
                          <span class="text-[8px] text-white font-black"
                            >?</span
                          >
                        </div>
                      </div>
                    </div>

                    <!-- Lobi Kontrolleri -->
                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-2 text-left">
                        <label
                          class="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1"
                          >Lobi Boyutu</label
                        >
                        <select
                          v-model="form.metadata.lobbySize"
                          class="w-full h-12 px-4 bg-white dark:bg-gray-900 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm border border-gray-100 dark:border-white/5"
                        >
                          <option :value="2">2 Kişilik</option>
                          <option :value="3">3 Kişilik</option>
                          <option :value="4">4 Kişilik</option>
                          <option :value="5">5 Kişilik</option>
                        </select>
                      </div>
                      <div class="space-y-2 text-left">
                        <label
                          class="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1"
                          >Aranan Sayısı</label
                        >
                        <select
                          v-model="form.metadata.missingPlayers"
                          class="w-full h-12 px-4 bg-white dark:bg-gray-900 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm border border-gray-100 dark:border-white/5"
                        >
                          <option
                            v-for="n in form.metadata.lobbySize - 1"
                            :key="n"
                            :value="n"
                          >
                            {{ n }} Kişi
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Oyun Parametreleri -->
                  <div class="space-y-6 pt-2">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <!-- Platform -->
                      <div class="space-y-3 text-left">
                        <label
                          class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                          >Platform</label
                        >
                        <div
                          class="flex bg-slate-100/50 dark:bg-gray-800/50 p-1 rounded-[1.25rem] shadow-inner"
                        >
                          <button
                            v-for="p in ['PC', 'KONSOL', 'MOBİL', 'MASA']"
                            :key="p"
                            type="button"
                            @click="form.metadata.gamePlatform = p"
                            :class="[
                              'flex-1 py-3 text-[8px] font-black rounded-xl transition-all duration-300',
                              form.metadata.gamePlatform === p
                                ? 'bg-white dark:bg-gray-700 text-rose-600 shadow-md'
                                : 'text-gray-400',
                            ]"
                          >
                            {{ p }}
                          </button>
                        </div>
                      </div>
                      <!-- Mod (Mood) -->
                      <div class="space-y-3 text-left">
                        <label
                          class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                          >Oyun Modu</label
                        >
                        <div
                          class="flex bg-slate-100/50 dark:bg-gray-800/50 p-1 rounded-[1.25rem] shadow-inner"
                        >
                          <button
                            v-for="m in ['EĞLENCE', 'REKABET']"
                            :key="m"
                            type="button"
                            @click="form.metadata.gameMood = m"
                            :class="[
                              'flex-1 py-3 text-[8px] font-black rounded-xl transition-all duration-300',
                              form.metadata.gameMood === m
                                ? 'bg-rose-600 text-white shadow-lg'
                                : 'text-gray-400',
                            ]"
                          >
                            {{ m }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-3 text-left">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                        >Oyun Adı & Notlar</label
                      >
                      <input
                        v-model="form.metadata.gameDetails"
                        type="text"
                        placeholder="Örn: Valorant Dereceli, 101 Okey Kafe vb."
                        class="w-full h-14 px-6 bg-slate-100/50 dark:bg-gray-800/50 rounded-[1.25rem] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>
                </div>

                <!-- Gezi Detayları (Patika Animasyonlu) -->
                <div
                  v-if="form.category === 'GEZİ'"
                  class="space-y-6 pt-2 animate-in slide-in-from-top-4 duration-500"
                >
                  <div
                    class="relative grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-4"
                  >
                    <!-- Nereden -->
                    <div class="space-y-1 text-left">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1"
                        >Nereden</label
                      >
                      <input
                        v-model="form.metadata.tripFrom"
                        type="text"
                        placeholder="Örn: İstiklal Yerleşkesi"
                        class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none outline-none text-xs font-bold shadow-inner transition-all focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>

                    <!-- Enerji Nabzı (Işık Huzmesi) - Hizalama Düzeltildi -->
                    <div
                      class="h-6 sm:w-20 flex items-center justify-center relative translate-y-2 sm:translate-y-2.5"
                    >
                      <transition name="fade">
                        <div
                          v-if="form.metadata.tripTo"
                          class="w-full flex items-center justify-center"
                        >
                          <!-- Arka plan hattı -->
                          <div
                            class="absolute w-full h-[1px] bg-gray-100 dark:bg-white/5"
                          ></div>
                          <!-- Nabız Işığı -->
                          <div class="absolute w-full h-[1px] overflow-hidden">
                            <div
                              class="w-1/3 h-full bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-energy-pulse"
                            ></div>
                          </div>
                          <!-- Varış Noktası Halkası -->
                          <div
                            class="absolute right-0 w-2 h-2 rounded-full border-2 border-rose-500 bg-white dark:bg-gray-900 shadow-[0_0_8px_rgba(225,29,72,0.5)] animate-ping-once"
                          ></div>
                        </div>
                      </transition>
                    </div>

                    <!-- Nereye -->
                    <div class="space-y-1 text-left">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1"
                        >Nereye</label
                      >
                      <input
                        v-model="form.metadata.tripTo"
                        type="text"
                        placeholder="Örn: Salda Gölü"
                        class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none outline-none text-xs font-bold shadow-inner transition-all focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>

                  <!-- Ek Gezi Parametreleri - Dikey Yerleşim -->
                  <div
                    class="flex flex-col space-y-6 pt-6 border-t border-gray-50 dark:border-white/5"
                  >
                    <!-- Ulaşım -->
                    <div class="space-y-3 text-left">
                      <div class="flex items-center justify-between px-1">
                        <label
                          class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]"
                          >Ulaşım Tipi</label
                        >
                        <span
                          class="text-[8px] font-black text-rose-500/50 uppercase tracking-widest"
                          >Zorunlu</span
                        >
                      </div>
                      <div
                        class="flex bg-slate-100/50 dark:bg-gray-800/50 p-1.5 rounded-[1.25rem] shadow-inner"
                      >
                        <button
                          v-for="t in ['OTOBÜS', 'ARAÇ', 'YÜRÜYÜŞ']"
                          :key="t"
                          type="button"
                          @click="form.metadata.transport = t"
                          :class="[
                            'flex-1 py-3.5 text-[9px] font-black rounded-xl transition-all duration-300',
                            form.metadata.transport === t
                              ? 'bg-white dark:bg-gray-700 text-rose-600 shadow-md scale-[1.01]'
                              : 'text-gray-400 hover:text-gray-500',
                          ]"
                        >
                          {{ t }}
                        </button>
                      </div>
                    </div>

                    <!-- Konaklama -->
                    <div class="space-y-3 text-left">
                      <div class="flex items-center justify-between px-1">
                        <label
                          class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]"
                          >Konaklama Durumu</label
                        >
                        <span
                          class="text-[8px] font-black text-rose-500/50 uppercase tracking-widest"
                          >Zorunlu</span
                        >
                      </div>
                      <div
                        class="flex bg-slate-100/50 dark:bg-gray-800/50 p-1.5 rounded-[1.25rem] shadow-inner"
                      >
                        <button
                          v-for="a in ['OTEL', 'KAMP', 'YOK']"
                          :key="a"
                          type="button"
                          @click="form.metadata.accommodation = a"
                          :class="[
                            'flex-1 py-3.5 text-[9px] font-black rounded-xl transition-all duration-300',
                            form.metadata.accommodation === a
                              ? 'bg-white dark:bg-gray-700 text-rose-600 shadow-md scale-[1.01]'
                              : 'text-gray-400 hover:text-gray-500',
                          ]"
                        >
                          {{ a === "YOK" ? "GÜNÜBİRLİK" : a }}
                        </button>
                      </div>
                    </div>

                    <!-- Bütçe -->
                    <div class="space-y-3 text-left">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                        >Kişi Başı Tahmini Bütçe</label
                      >
                      <div class="relative group">
                        <input
                          v-model="form.metadata.budget"
                          type="text"
                          placeholder="Örn: 750 - 1500"
                          class="w-full px-6 py-5 bg-slate-100/50 dark:bg-gray-800/50 rounded-[1.25rem] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-rose-500/20 transition-all group-hover:bg-slate-100 dark:group-hover:bg-gray-800"
                        />
                        <span
                          class="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-rose-600"
                          >₺</span
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Aktivite Detayları (Vibe Meter) -->
                <div
                  v-if="form.category === 'AKTİVİTE'"
                  class="space-y-10 pt-4 animate-in slide-in-from-top-4 duration-500"
                >
                  <!-- Atmosfer Metresi (Nabızlı Vibe Tracker) -->
                  <div class="space-y-6">
                    <div class="flex items-center justify-between px-1">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]"
                        >Aktivite Atmosferi</label
                      >
                      <span
                        :class="[
                          'text-[10px] font-black uppercase tracking-tighter transition-all duration-500 px-3 py-1 rounded-full',
                          form.metadata.activityVibe === 'SESSİZ'
                            ? 'bg-blue-500/10 text-blue-500'
                            : form.metadata.activityVibe === 'CHILL'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : form.metadata.activityVibe === 'ENERJİK'
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-rose-500/10 text-rose-600',
                        ]"
                      >
                        {{ form.metadata.activityVibe }} VIBE
                      </span>
                    </div>

                    <div class="relative h-12 flex items-center px-2">
                      <!-- Arka Plan Hattı -->
                      <div
                        class="absolute inset-x-0 h-[2px] bg-slate-100 dark:bg-white/5 rounded-full"
                      ></div>

                      <!-- Renkli İlerleme Hattı - Oranlar Düzeltildi -->
                      <div
                        class="absolute left-0 h-[2px] transition-all duration-700 ease-out rounded-full overflow-hidden mx-2"
                        :style="{
                          width: `calc(${form.metadata.activityVibe === 'SESSİZ' ? '0%' : form.metadata.activityVibe === 'CHILL' ? '33.33%' : form.metadata.activityVibe === 'ENERJİK' ? '66.66%' : '100%'} - 4px)`,
                          backgroundColor:
                            form.metadata.activityVibe === 'SESSİZ'
                              ? '#3b82f6'
                              : form.metadata.activityVibe === 'CHILL'
                                ? '#10b981'
                                : form.metadata.activityVibe === 'ENERJİK'
                                  ? '#f59e0b'
                                  : '#e11d48',
                        }"
                      >
                        <!-- Nabız Işığı (Hattın İçinde Akıyor) -->
                        <div class="w-full h-full relative overflow-hidden">
                          <div
                            class="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-energy-pulse"
                          ></div>
                        </div>
                      </div>

                      <!-- İnteraktif Duraklar -->
                      <div class="absolute inset-x-0 flex justify-between px-2">
                        <button
                          v-for="v in ['SESSİZ', 'CHILL', 'ENERJİK', 'PARTY']"
                          :key="v"
                          type="button"
                          @click="form.metadata.activityVibe = v"
                          class="group relative flex flex-col items-center"
                        >
                          <!-- Durak Noktası -->
                          <div
                            :class="[
                              'w-4 h-4 rounded-full border-2 transition-all duration-500 z-10',
                              form.metadata.activityVibe === v
                                ? 'scale-125 bg-white dark:bg-gray-900'
                                : 'bg-slate-50 dark:bg-gray-800 border-transparent hover:border-gray-300 dark:hover:border-gray-600',
                              v === 'SESSİZ' && form.metadata.activityVibe === v
                                ? 'border-blue-500 shadow-[0_0_10px_#3b82f6]'
                                : v === 'CHILL' &&
                                    form.metadata.activityVibe === v
                                  ? 'border-emerald-500 shadow-[0_0_10px_#10b981]'
                                  : v === 'ENERJİK' &&
                                      form.metadata.activityVibe === v
                                    ? 'border-amber-500 shadow-[0_0_10px_#f59e0b]'
                                    : v === 'PARTY' &&
                                        form.metadata.activityVibe === v
                                      ? 'border-rose-500 shadow-[0_0_10px_#e11d48]'
                                      : '',
                            ]"
                          ></div>
                          <!-- Etiket -->
                          <span
                            :class="[
                              'absolute -bottom-6 text-[7px] font-black tracking-widest transition-colors duration-500',
                              form.metadata.activityVibe === v
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-400',
                            ]"
                            >{{ v }}</span
                          >
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Aktivite Tipi -->
                  <div class="space-y-3 text-left">
                    <label
                      class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                      >Aktivite Türü</label
                    >
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="type in [
                          'TANIŞMA',
                          'ATÖLYE',
                          'SİNEMA',
                          'YEMEK',
                          'GEZİNTİ',
                        ]"
                        :key="type"
                        type="button"
                        @click="form.metadata.activityType = type"
                        :class="[
                          'px-4 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all border-2',
                          form.metadata.activityType === type
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                            : 'bg-slate-50 dark:bg-gray-800 text-gray-400 border-transparent hover:border-gray-200 dark:hover:border-gray-700',
                        ]"
                      >
                        {{ type }}
                      </button>
                    </div>
                  </div>

                  <!-- Mekan ve Şartlar -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="space-y-3 text-left">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                        >Mekan Tipi</label
                      >
                      <div
                        class="flex bg-slate-100/50 dark:bg-gray-800/50 p-1 rounded-2xl shadow-inner"
                      >
                        <button
                          type="button"
                          @click="form.metadata.activityLocationType = 'KAPALI'"
                          :class="[
                            'flex-1 py-3 text-[8px] font-black rounded-xl transition-all',
                            form.metadata.activityLocationType === 'KAPALI'
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-400',
                          ]"
                        >
                          KAPALI ALAN
                        </button>
                        <button
                          type="button"
                          @click="form.metadata.activityLocationType = 'AÇIK'"
                          :class="[
                            'flex-1 py-3 text-[8px] font-black rounded-xl transition-all',
                            form.metadata.activityLocationType === 'AÇIK'
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-400',
                          ]"
                        >
                          AÇIK HAVA
                        </button>
                      </div>
                    </div>
                    <div class="space-y-3 text-left">
                      <label
                        class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
                        >Katılım Şartı / Not</label
                      >
                      <input
                        v-model="form.metadata.activityRequirement"
                        type="text"
                        placeholder="Örn: Ücretsiz, Kendi biletini al vb."
                        class="w-full h-12 px-5 bg-slate-100/50 dark:bg-gray-800/50 rounded-2xl border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1 text-left">
                  <label
                    class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1"
                    >Kontenjan</label
                  >
                  <input
                    v-model="form.maxMembers"
                    type="number"
                    placeholder="Sınırsız"
                    class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl outline-none text-xs font-bold shadow-inner no-arrows"
                  />
                </div>
                <div class="space-y-1 text-left">
                  <label
                    class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1"
                    >{{
                      form.mainType === "PROJECT"
                        ? "Son Başvuru"
                        : "Etkinlik Tarihi"
                    }}</label
                  >
                  <VueDatePicker
                    v-model="form.deadline"
                    :dark="true"
                    :enable-time-picker="false"
                    auto-apply
                    format="dd/MM/yyyy"
                    placeholder="Tarih Seç"
                    class="hub-datepicker"
                  />
                </div>
              </div>
            </div>

            <!-- AKADEMİK DANIŞMAN (Zümrüt Doğrulama) -->
            <div
              v-if="form.mainType === 'DIGITAL'"
              class="space-y-1 relative text-left"
            >
              <label
                class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1"
                >Akademik Danışman</label
              >
              <div class="relative group">
                <input
                  v-model="advisorSearchQuery"
                  @input="handleAdvisorSearch"
                  type="text"
                  placeholder="@hoca_adi ile ara..."
                  class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none outline-none text-sm font-bold shadow-inner transition-all focus:ring-2 focus:ring-emerald-500/20"
                />
                <div
                  v-if="selectedAdvisor"
                  class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  <div
                    class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-in zoom-in duration-300"
                  >
                    <svg
                      class="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <transition name="fade">
                <div
                  v-if="showAdvisorSuggestions"
                  class="absolute z-[160] left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border rounded-3xl shadow-2xl overflow-hidden"
                >
                  <div
                    v-for="u in advisorSuggestions"
                    :key="u.id"
                    @click="selectAdvisor(u)"
                    class="w-full p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer border-b last:border-0 text-left"
                  >
                    <p class="text-xs font-black text-emerald-600">
                      @{{ u.username }}
                    </p>
                    <p
                      class="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase"
                    >
                      {{ u.fullName }}
                    </p>
                  </div>
                </div>
              </transition>
              <div
                v-if="selectedAdvisor"
                class="mt-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between animate-in slide-in-from-top-2"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-sm"
                  >
                    {{ selectedAdvisor.username.charAt(0).toUpperCase() }}
                  </div>
                  <span
                    class="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase truncate"
                    >{{
                      selectedAdvisor.fullName || selectedAdvisor.username
                    }}</span
                  >
                </div>
                <button
                  type="button"
                  @click="
                    selectedAdvisor = null;
                    form.advisorEmail = '';
                  "
                  class="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    stroke-width="3"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="space-y-1 text-left">
              <label
                class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block"
                >Açıklama</label
              >
              <textarea
                v-model="form.description"
                required
                rows="4"
                placeholder="Topluluk amacını ve hedefleri belirtin..."
                class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none outline-none text-sm font-medium resize-none shadow-inner"
              ></textarea>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button
              type="button"
              @click="showCreateModal = false"
              class="flex-1 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest outline-none"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="flex-[2] py-4 bg-rose-600 text-white text-[10px] font-black rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-500/30 uppercase tracking-widest active:scale-95 transition-all"
            >
              BAŞVURUYU GÖNDER
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const searchQuery = ref("");
const selectedMainType = ref("ALL");
const selectedCategory = ref("TÜMÜ");
const clubs = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showCreateModal = ref(false);
const showMembersModal = ref(false);
const selectedClubForMembers = ref<any>(null);

const getAvatarUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  // Eğer path zaten /uploads ile başlıyorsa sadece hostu ekle
  if (path.startsWith("/uploads/")) {
    return `http://localhost:3000${path}`;
  }

  // Aksi halde varsayılan avatar klasörünü ekle
  return `http://localhost:3000/uploads/avatars/${path}`;
};

const handleImageError = (e: any, member: any) => {
  console.error("❌ Resim Yüklenemedi:", e.target.src, "Üye:", member.username);
};

const goToDetail = (club: any) => {
  const identifier = club.slug || club.id;
  router.push(`/campus/clubs/${identifier}`);
};

const openMembersModal = (club: any) => {
  console.log("👥 Modal Açılıyor. Üyeler:", club.members);
  selectedClubForMembers.value = club;
  showMembersModal.value = true;
};

const toggleJoin = async (club: any) => {
  if (!authStore.user) {
    toast.error("Önce giriş yapmalısınız! 🛡️");
    return;
  }
  try {
    const res = await apiClient.post(`/clubs/${club.id}/toggle-join`);
    const isJoining = res.data.joined;

    const targetClub = clubs.value.find((c) => c.id === club.id);
    if (targetClub) {
      if (isJoining) {
        targetClub.memberCount++;
        targetClub.isJoined = true;
        if (!targetClub.members) targetClub.members = [];

        const myAvatar = authStore.user.avatarUrl || authStore.user.avatar;
        console.log("✅ Katılma İşlemi. Benim PP:", myAvatar);

        targetClub.members.unshift({
          id: authStore.user.id,
          username: authStore.user.username,
          fullName: authStore.user.fullName,
          avatarUrl: myAvatar,
          role: "MEMBER",
        });
        toast.success("Topluluğa katıldın! 🚀");
      } else {
        targetClub.memberCount--;
        targetClub.isJoined = false;
        targetClub.members = targetClub.members.filter(
          (m: any) => (m.id || m.user?.id) !== authStore.user.id,
        );
        toast.info("Topluluktan ayrıldın.");
      }
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || "İşlem başarısız.");
  }
};

const mainTypeNavRef = ref<HTMLElement | null>(null);
const categoryNavRef = ref<HTMLElement | null>(null);

const mainTypesList = [
  { label: "DİJİTAL TOPLULUK", value: "DIGITAL" },
  { label: "PROJE TAKIMI", value: "PROJECT" },
  { label: "SOSYAL GRUP", value: "SOCIAL" },
];

const centeredMainTypes = computed(() => {
  const list = [...mainTypesList];
  const mid = Math.ceil(list.length / 2);
  return [
    ...list.slice(0, mid),
    { label: "TÜMÜ", value: "ALL" },
    ...list.slice(mid),
  ];
});

const categoryMap: Record<string, string[]> = {
  DIGITAL: ["KÜLTÜR", "SPOR", "BİLİM", "SANAT", "SOSYAL"],
  PROJECT: ["TÜBİTAK", "TEKNOFEST", "STARTUP", "FREELANCE"],
  SOCIAL: ["GEZİ", "HALISAHA", "OYUN", "AKTİVİTE"],
};

const currentSubCategories = computed(() => {
  if (selectedMainType.value === "ALL") return ["TÜMÜ"];
  const subCats = categoryMap[selectedMainType.value] || [];
  const mid = Math.ceil(subCats.length / 2);
  return [...subCats.slice(0, mid), "TÜMÜ", ...subCats.slice(mid)];
});

const handleMainCarouselScroll = () => {
  const el = mainTypeNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll(".main-carousel-item");
  const centerX = el.getBoundingClientRect().left + el.clientWidth / 2;
  items.forEach((item: any) => {
    const factor = Math.min(
      Math.abs(
        centerX - (item.getBoundingClientRect().left + item.clientWidth / 2),
      ) /
        (el.clientWidth / 2.5),
      1,
    );
    const btn = item.querySelector("button");
    if (btn) {
      btn.style.transform = `scale(${1.15 - factor * 0.3})`;
      btn.style.opacity = (1 - factor * 0.7).toString();
    }
  });
};

const handleSubCarouselScroll = () => {
  const el = categoryNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll(".sub-carousel-item");
  const centerX = el.getBoundingClientRect().left + el.clientWidth / 2;
  items.forEach((item: any) => {
    const factor = Math.min(
      Math.abs(
        centerX - (item.getBoundingClientRect().left + item.clientWidth / 2),
      ) /
        (el.clientWidth / 2.5),
      1,
    );
    const btn = item.querySelector("button");
    if (btn) {
      btn.style.transform = `scale(${1.15 - factor * 0.3})`;
      btn.style.opacity = (1 - factor * 0.7).toString();
    }
  });
};

const centerMainCarouselItem = (index: number) => {
  const el = mainTypeNavRef.value;
  if (!el) return;
  const target = el.querySelectorAll(".main-carousel-item")[
    index
  ] as HTMLElement;
  if (target)
    el.scrollTo({
      left: target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2,
      behavior: "smooth",
    });
};

const centerSubCarouselItem = (index: number) => {
  const el = categoryNavRef.value;
  if (!el) return;
  const target = el.querySelectorAll(".sub-carousel-item")[
    index
  ] as HTMLElement;
  if (target)
    el.scrollTo({
      left: target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2,
      behavior: "smooth",
    });
};

const resetSubCarousel = () => {
  setTimeout(() => {
    centerSubCarouselItem(Math.floor(currentSubCategories.value.length / 2));
    handleSubCarouselScroll();
  }, 100);
};

const showEmojiGrid = ref(false);
const showColorPicker = ref(false);
const showCategoryDropdown = ref(false);
const customIconText = ref("");
const clubEmojis = [
  "🎭",
  "💻",
  "🏔️",
  "📸",
  "🏥",
  "🎸",
  "⚽",
  "🎨",
  "🚀",
  "🧠",
  "♟️",
  "🌍",
  "📐",
  "🥘",
  "🎥",
  "🌱",
  "🛡️",
  "⚔️",
  "⚖️",
  "🚲",
  "👟",
  "🧵",
  "🎼",
  "🧩",
];
const chatThemes = [
  "#4f46e5",
  "#e11d48",
  "#2563eb",
  "#eab308",
  "#16a34a",
  "#9333ea",
];
const isEmoji = (str: string) =>
  !str || (/\p{Emoji}/u.test(str) && str.length <= 2);

const advisorSearchQuery = ref("");
const advisorSuggestions = ref<any[]>([]);
const showAdvisorSuggestions = ref(false);
const selectedAdvisor = ref<any | null>(null);

const form = ref<any>({
  name: "",
  mainType: "DIGITAL",
  category: "KÜLTÜR",
  emoji: "",
  color: "#e11d48",
  advisorName: "",
  advisorEmail: "",
  description: "",
  maxMembers: null,
  deadline: null,
  requiredSkills: "",
  metadata: {
    programCode: "",
    competitionCategory: "",
    matchTime: "",
    gameDetails: "",
    tripFrom: "",
    tripTo: "",
    transport: "OTOBÜS",
    accommodation: "GÜNÜBİRLİK",
    budget: "",
    position: "FV",
    matchType: "7v7",
    pitchLocation: "",
    matchFee: "",
    gameType: "DİJİTAL",
    gamePlatform: "PC",
    gameMood: "EĞLENCE",
    lobbySize: 4,
    missingPlayers: 1,
    activityType: "TANIŞMA",
    activityVibe: "CHILL",
    activityLocationType: "KAPALI",
    activityRequirement: "",
  },
});

const handleAdvisorSearch = async (e: any) => {
  const q = e.target.value.replace("@", "").trim();
  if (q.length >= 2) {
    try {
      const res = await apiClient.get(
        `/users/search-mentions?q=${q}&role=ACADEMIC`,
      );
      advisorSuggestions.value = res.data;
      showAdvisorSuggestions.value = advisorSuggestions.value.length > 0;
    } catch {
      showAdvisorSuggestions.value = false;
    }
  } else showAdvisorSuggestions.value = false;
};

const selectAdvisor = (u: any) => {
  selectedAdvisor.value = u;
  form.value.advisorName = u.fullName || u.username;
  form.value.advisorEmail = u.email;
  advisorSearchQuery.value = `@${u.username}`;
  showAdvisorSuggestions.value = false;
};

const fetchClubs = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get("/clubs", {
      params: { currentUserId: authStore.user?.id },
    });
    clubs.value = res.data;
  } catch {
    toast.error("Hata!");
  } finally {
    loading.value = false;
    setTimeout(() => {
      centerMainCarouselItem(Math.floor(centeredMainTypes.value.length / 2));
      handleMainCarouselScroll();
    }, 300);
  }
};

const handleCreateClub = async () => {
  if (form.value.mainType === "DIGITAL" && !form.value.advisorEmail) {
    toast.error("Danışman seçilmelidir.");
    return;
  }
  if (!form.value.emoji) {
    toast.error("İkon seçin.");
    return;
  }
  submitting.value = true;
  try {
    await apiClient.post("/clubs", form.value);
    toast.success("Başvuru iletildi! 🛡️");
    showCreateModal.value = false;
    form.value = {
      name: "",
      mainType: "DIGITAL",
      category: "KÜLTÜR",
      emoji: "",
      color: "#e11d48",
      advisorName: "",
      advisorEmail: "",
      description: "",
      maxMembers: null,
      deadline: null,
      requiredSkills: "",
      metadata: {},
    };
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Hata!");
  } finally {
    submitting.value = false;
  }
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });

onMounted(fetchClubs);

const filteredClubs = computed(() => {
  return clubs.value.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesMainType =
      selectedMainType.value === "ALL" || c.mainType === selectedMainType.value;
    const matchesCategory =
      selectedCategory.value === "TÜMÜ" ||
      c.category === selectedCategory.value;
    return matchesSearch && matchesMainType && matchesCategory;
  });
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(225, 29, 72, 0.1);
  border-radius: 10px;
}
.main-carousel-item,
.sub-carousel-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.no-arrows::-webkit-outer-spin-button,
.no-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-arrows {
  -moz-appearance: textfield;
}

/* ENERGY PULSE ANIMATION */
.animate-energy-pulse {
  animation: energy-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes energy-pulse {
  0% {
    transform: translateX(-150%);
  }
  100% {
    transform: translateX(150%);
  }
}
.animate-ping-once {
  animation: ping-once 0.5s cubic-bezier(0, 0, 0.2, 1) forwards;
}
@keyframes ping-once {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* DATEPICKER PREMIUM STYLING */
:deep(.dp__input) {
  @apply bg-slate-50 dark:bg-gray-800 border-none rounded-2xl py-4 pl-12 pr-5 text-sm font-bold shadow-inner transition-all !important;
}
:deep(.dp__input_icon) {
  @apply left-4 !important;
  color: #e11d48 !important;
}
:deep(.dp__theme_dark) {
  --dp-background-color: #1f2937;
  --dp-text-color: #f9fafb;
  --dp-hover-color: #374151;
  --dp-hover-text-color: #ffffff;
  --dp-hover-icon-color: #9ca3af;
  --dp-primary-color: #e11d48;
  --dp-primary-text-color: #ffffff;
  --dp-secondary-color: #4b5563;
  --dp-border-color: #374151;
  --dp-menu-border-color: #374151;
  --dp-menu-min-width: 260px;
  --dp-action-buttons-padding: 12px;
  --dp-border-radius: 20px;
}
</style>
