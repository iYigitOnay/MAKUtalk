<!-- src/views/ClubDetail.vue -->
<template>
  <div
    class="max-w-4xl mx-auto p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans"
  >
    <div v-if="loading" class="py-20 text-center flex flex-col items-center">
      <div
        class="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"
      ></div>
      <p class="text-xs font-black uppercase tracking-widest text-gray-400">
        Yükleniyor
      </p>
    </div>

    <div
      v-else-if="club"
      class="flex flex-col items-center text-center space-y-10 animate-in fade-in duration-700"
    >
      <!-- 1. ÜST NAVİGASYON & LOGO -->
      <section class="relative w-full flex flex-col items-center pt-8">
        <button
          @click="$router.push('/campus/clubs')"
          class="absolute left-0 top-0 text-gray-400 hover:text-rose-500 transition-colors font-black uppercase text-xs tracking-widest outline-none group flex items-center gap-2"
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
          Geri Dön
        </button>

        <div
          class="w-28 h-28 rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-6 overflow-hidden border border-white dark:border-white/5"
          :style="{
            backgroundColor: isEmoji(club.emoji)
              ? '#e11d4810'
              : club.color + '10',
            color: isEmoji(club.emoji) ? '#e11d48' : club.color,
          }"
        >
          <span v-if="isEmoji(club.emoji)" class="text-6xl">{{
            club.emoji
          }}</span>
          <span v-else class="text-3xl font-black uppercase tracking-tighter">{{
            club.emoji
          }}</span>
        </div>

        <div class="flex flex-col items-center gap-3 mb-4">
          <h1
            class="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight max-w-2xl text-center"
          >
            {{ club.name }}
          </h1>
        </div>

        <div
          class="flex flex-wrap justify-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-white/5 px-6 py-3 rounded-full shadow-sm border border-slate-50 dark:border-white/5"
        >
          <div class="flex items-center gap-1.5">
            <span
              class="w-1.5 h-1.5 rounded-full"
              :style="{ backgroundColor: club.color }"
            ></span>
            <span
              >{{ club.memberCount
              }}{{ club.maxMembers ? "/" + club.maxMembers : "" }} ÜYE
            </span>
          </div>
          <span class="opacity-30">•</span>
          <span
            :style="{ color: isEmoji(club.emoji) ? '#e11d48' : club.color }"
            >{{ club.category }}</span
          >
          <template v-if="club.mainType === 'DIGITAL'">
            <span class="opacity-30">•</span>
            <span class="text-slate-400 dark:text-slate-500">{{
              new Date(club.createdAt).getFullYear()
            }}</span>
          </template>
          <template v-else-if="club.mainType === 'PROJECT'">
            <span class="opacity-30">•</span>
            <span class="text-blue-500">PROJE TAKIMI</span>
          </template>
          <template v-else>
            <span class="opacity-30">•</span>
            <span class="text-amber-500">SOSYAL GRUP</span>
          </template>
        </div>
      </section>

      <!-- 2. PROJE TAKIMI ÖZEL PANELİ -->
      <section
        v-if="club.mainType === 'PROJECT'"
        class="w-full max-w-2xl animate-in slide-in-from-top-4 duration-500 space-y-4"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 flex items-center gap-4 shadow-sm group hover:-translate-y-1 transition-all duration-500"
          >
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner"
              :style="{ backgroundColor: club.color + '10', color: club.color }"
            >
              🚀
            </div>
            <div class="text-left overflow-hidden">
              <p
                class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1"
              >
                Görev / Program
              </p>
              <p
                class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate"
              >
                {{
                  club.metadata?.programCode ||
                  club.metadata?.competitionCategory ||
                  club.category
                }}
              </p>
            </div>
          </div>
          <div
            class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 flex items-center gap-4 shadow-sm group hover:-translate-y-1 transition-all duration-500"
          >
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner"
              :style="{ backgroundColor: club.color + '10', color: club.color }"
            >
              📅
            </div>
            <div class="text-left overflow-hidden">
              <p
                class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1"
              >
                Son Başvuru
              </p>
              <p
                class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase"
              >
                {{
                  club.deadline
                    ? new Date(club.deadline).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "SÜRESİZ"
                }}
              </p>
            </div>
          </div>
        </div>
        <div
          v-if="club.requiredSkills"
          class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm text-center"
        >
          <p
            class="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4"
          >
            Aranan Teknik Yetenekler
          </p>
          <div class="flex flex-wrap justify-center gap-2">
            <span
              v-for="skill in club.requiredSkills.split(',')"
              :key="skill"
              class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border"
              :style="{
                color: club.color,
                borderColor: club.color + '20',
                backgroundColor: club.color + '05',
              }"
              ># {{ skill.trim() }}</span
            >
          </div>
        </div>
      </section>

      <!-- 2. SOSYAL GRUP - GEZİ PANELİ -->
      <section
        v-if="club.mainType === 'SOCIAL' && club.category === 'GEZİ'"
        class="w-full max-w-2xl animate-in slide-in-from-top-4 duration-500 space-y-6"
      >
        <div
          class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 shadow-xl relative overflow-hidden"
        >
          <div
            class="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10"
          >
            <div class="text-center sm:text-left flex-1">
              <p
                class="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2"
              >
                Başlangıç
              </p>
              <h4
                class="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic"
              >
                {{ club.metadata?.tripFrom || "Belirtilmedi" }}
              </h4>
            </div>
            <div
              class="flex-1 w-full max-w-[150px] flex items-center justify-center relative py-4"
            >
              <div
                class="absolute w-full h-[2px] bg-slate-100 dark:bg-white/5 rounded-full"
              ></div>
              <div class="absolute w-full h-[2px] overflow-hidden rounded-full">
                <div
                  class="w-1/2 h-full bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-energy-pulse"
                ></div>
              </div>
              <div
                class="absolute -right-1 w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_0_15px_#e11d48]"
              ></div>
            </div>
            <div class="text-center sm:text-right flex-1">
              <p
                class="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2"
              >
                Varış Noktası
              </p>
              <h4
                class="text-xl font-black text-rose-600 uppercase tracking-tighter italic"
              >
                {{ club.metadata?.tripTo || "Belirtilmedi" }}
              </h4>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="item in [
              {
                l: 'ULAŞIM',
                v: club.metadata?.transport,
                i: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
              },
              {
                l: 'KONAKLAMA',
                v:
                  club.metadata?.accommodation === 'YOK'
                    ? 'GÜNÜBİRLİK'
                    : club.metadata?.accommodation,
                i: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
              },
            ]"
            :key="item.l"
            class="bg-white dark:bg-gray-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center gap-3 shadow-sm transition-all hover:-translate-y-1"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
              :style="{ backgroundColor: club.color + '10', color: club.color }"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="item.i"
                />
              </svg>
            </div>
            <div class="text-center">
              <p
                class="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1"
              >
                {{ item.l }}
              </p>
              <p
                class="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase"
              >
                {{ item.v || "BELİRTİLMEMİŞ" }}
              </p>
            </div>
          </div>
          <div
            class="bg-white dark:bg-gray-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center gap-3 shadow-sm transition-all hover:-translate-y-1"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
              :style="{ backgroundColor: club.color + '10', color: club.color }"
            >
              <span class="text-sm font-black">₺</span>
            </div>
            <div class="text-center">
              <p
                class="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1"
              >
                BÜTÇE
              </p>
              <p
                class="text-[11px] font-black text-slate-800 dark:text-slate-200"
              >
                {{
                  club.metadata?.budget
                    ? club.metadata.budget + " ₺"
                    : "BELİRSİZ"
                }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. SOSYAL GRUP - HALI SAHA PANELİ -->
      <section
        v-if="club.mainType === 'SOCIAL' && club.category === 'HALISAHA'"
        class="w-full max-w-2xl animate-in slide-in-from-top-4 duration-500 space-y-6"
      >
        <div
          class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 shadow-xl flex flex-col items-center gap-8 relative overflow-hidden"
        >
          <div
            class="absolute top-0 inset-x-0 h-1"
            :style="{ backgroundColor: club.color }"
          ></div>
          <div class="text-center">
            <p
              class="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4"
            >
              MAÇIN BAŞLAMASINA
            </p>
            <div class="flex items-center gap-4">
              <div
                v-for="(val, label) in getDigitalTime(club.deadline)"
                :key="label"
                class="flex flex-col items-center"
              >
                <div
                  class="w-16 h-20 bg-slate-900 rounded-2xl flex items-center justify-center border-b-4 shadow-2xl relative overflow-hidden"
                  :style="{ borderColor: club.color }"
                >
                  <div
                    class="absolute inset-0 opacity-10 pointer-events-none"
                    style="
                      background: repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        #fff 3px
                      );
                    "
                  ></div>
                  <span
                    class="text-3xl font-black tracking-tighter text-white z-10"
                    >{{ val }}</span
                  >
                </div>
                <span
                  class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3"
                  >{{ label }}</span
                >
              </div>
            </div>
          </div>
          <div class="flex flex-wrap justify-center gap-3">
            <div
              class="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5"
            >
              <div
                class="w-2 h-2 rounded-full animate-pulse"
                :style="{ backgroundColor: club.color }"
              ></div>
              <span
                class="text-[10px] font-black uppercase tracking-widest italic"
                :style="{ color: club.color }"
                >{{
                  club.metadata?.position === "KL"
                    ? "KALECİ"
                    : club.metadata?.position === "DF"
                      ? "DEFANS"
                      : club.metadata?.position === "OS"
                        ? "ORTA SAHA"
                        : "FORVET"
                }}
                ARANIYOR</span
              >
            </div>
            <div
              v-if="club.metadata?.matchTime"
              class="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5"
            >
              <svg
                class="w-3 h-3 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                class="text-[10px] font-black text-slate-600 dark:text-slate-300"
                >{{ club.metadata.matchTime }}</span
              >
            </div>
          </div>
        </div>
        <div
          class="relative w-full aspect-[21/7] bg-emerald-700 dark:bg-emerald-900/60 rounded-[2.5rem] border-4 border-emerald-600/30 shadow-2xl overflow-hidden flex items-center justify-around px-16"
        >
          <div
            class="absolute inset-0 border-2 border-white/10 m-3 rounded-lg pointer-events-none"
          ></div>
          <div
            class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/10 pointer-events-none"
          ></div>
          <div v-for="p in ['KL', 'DF', 'OS', 'FV']" :key="p" class="relative">
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-1000 z-10 border-2',
                club.metadata?.position === p
                  ? 'bg-white dark:bg-gray-900 scale-125'
                  : 'bg-white/5 border-transparent text-white/10',
              ]"
              :style="
                club.metadata?.position === p
                  ? {
                      borderColor: club.color,
                      color: club.color,
                      boxShadow: `0 0 30px ${club.color}60`,
                    }
                  : {}
              "
            >
              {{ p }}
              <div
                v-if="club.metadata?.position === p"
                class="absolute inset-0 rounded-full animate-ping opacity-30"
                :style="{ backgroundColor: club.color }"
              ></div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="item in [
              {
                l: 'MAÇ FORMATI',
                v: club.metadata?.matchType,
                i: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
              },
              {
                l: 'KATILIM ÜCRETİ',
                v: club.metadata?.matchFee
                  ? club.metadata.matchFee + ' ₺'
                  : 'ÜCRETSİZ',
                i: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
              },
              {
                l: 'SAHA KONUMU',
                v: club.metadata?.pitchLocation,
                i: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
              },
            ]"
            :key="item.l"
            class="bg-white dark:bg-gray-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 flex items-center gap-4 shadow-sm transition-all hover:-translate-y-1"
          >
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0"
              :style="{ backgroundColor: club.color + '10', color: club.color }"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="item.i"
                />
              </svg>
            </div>
            <div class="text-left overflow-hidden">
              <p
                class="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1"
              >
                {{ item.l }}
              </p>
              <p
                class="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase truncate"
              >
                {{ item.v || "BELİRSİZ" }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. SOSYAL GRUP - OYUN PANELİ -->
      <section
        v-if="club.mainType === 'SOCIAL' && club.category === 'OYUN'"
        class="w-full max-w-2xl animate-in slide-in-from-top-4 duration-500 space-y-6"
      >
        <div
          class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 shadow-xl flex flex-col items-center gap-8 relative overflow-hidden"
        >
          <div
            class="absolute top-0 inset-x-0 h-1"
            :style="{ backgroundColor: club.color }"
          ></div>
          <div class="text-center w-full">
            <div class="flex items-center justify-between mb-6 px-2">
              <p
                class="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]"
              >
                TAKIM LOBİSİ
              </p>
              <div class="flex items-center gap-2">
                <div
                  class="w-2 h-2 rounded-full animate-ping"
                  :style="{ backgroundColor: club.color }"
                ></div>
                <span
                  class="text-[10px] font-black uppercase tracking-tighter"
                  :style="{ color: club.color }"
                  >{{ club.metadata?.missingPlayers }} OYUNCU ARANIYOR</span
                >
              </div>
            </div>
            <div
              class="flex flex-wrap justify-center gap-4 py-4 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5"
            >
              <div
                v-for="i in club.metadata?.lobbySize || 4"
                :key="i"
                class="relative group"
              >
                <div
                  :class="[
                    'w-14 h-14 rounded-2xl border-4 flex items-center justify-center transition-all duration-500',
                    i >
                    (club.metadata?.lobbySize || 4) -
                      (club.metadata?.missingPlayers || 1)
                      ? 'border-rose-500/50 bg-rose-500/10 animate-pulse'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
                  ]"
                  :style="
                    i >
                    (club.metadata?.lobbySize || 4) -
                      (club.metadata?.missingPlayers || 1)
                      ? {
                          borderColor: club.color + '50',
                          boxShadow: `0 0 20px ${club.color}30`,
                        }
                      : {}
                  "
                >
                  <svg
                    v-if="
                      i >
                      (club.metadata?.lobbySize || 4) -
                        (club.metadata?.missingPlayers || 1)
                    "
                    class="w-6 h-6"
                    :style="{ color: club.color }"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-6 h-6 text-slate-300 dark:text-slate-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
                </div>
                <div
                  v-if="
                    i >
                    (club.metadata?.lobbySize || 4) -
                      (club.metadata?.missingPlayers || 1)
                  "
                  class="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-lg"
                  :style="{ backgroundColor: club.color }"
                >
                  <span class="text-[9px] text-white font-black">?</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            class="bg-white dark:bg-gray-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 flex items-center gap-4 shadow-sm transition-all hover:-translate-y-1"
          >
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0"
              :style="{ backgroundColor: club.color + '10', color: club.color }"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h6l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="text-left overflow-hidden">
              <p
                class="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1"
              >
                PLATFORM
              </p>
              <p
                class="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase"
              >
                {{ club.metadata?.gamePlatform || "BELİRSİZ" }}
              </p>
            </div>
          </div>
          <div
            class="bg-white dark:bg-gray-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 flex items-center gap-4 shadow-sm transition-all hover:-translate-y-1"
          >
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0"
              :style="{ backgroundColor: club.color + '10', color: club.color }"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div class="text-left overflow-hidden">
              <p
                class="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1"
              >
                OYUN MODU
              </p>
              <p class="text-[11px] font-black" :style="{ color: club.color }">
                {{ club.metadata?.gameMood || "EĞLENCE" }}
              </p>
            </div>
          </div>
        </div>
        <div
          v-if="club.metadata?.gameDetails"
          class="bg-white dark:bg-gray-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm text-center italic text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed"
        >
          "{{ club.metadata.gameDetails }}"
        </div>
      </section>

      <!-- 2. SOSYAL GRUP - AKTİVİTE PANELİ -->
      <section
        v-if="club.mainType === 'SOCIAL' && club.category === 'AKTİVİTE'"
        class="w-full max-w-2xl animate-in slide-in-from-top-4 duration-500 space-y-8"
      >
        <!-- VIBE TRACKER -->
        <div
          class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 shadow-xl relative overflow-hidden"
        >
          <div
            class="absolute top-0 inset-x-0 h-1"
            :style="{ backgroundColor: club.color }"
          ></div>
          <div class="space-y-8">
            <div class="flex items-center justify-between px-1">
              <p
                class="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]"
              >
                AKTİVİTE ATMOSFERİ
              </p>
              <span
                :class="[
                  'text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full',
                  club.metadata?.activityVibe === 'SESSİZ'
                    ? 'bg-blue-500/10 text-blue-500'
                    : club.metadata?.activityVibe === 'CHILL'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : club.metadata?.activityVibe === 'ENERJİK'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-rose-500/10 text-rose-600',
                ]"
              >
                {{ club.metadata?.activityVibe || "CHILL" }} VIBE
              </span>
            </div>
            <div class="relative h-4 flex items-center px-2">
              <div
                class="absolute inset-x-0 h-[2px] bg-slate-100 dark:bg-white/5 rounded-full"
              ></div>
              <div
                class="absolute left-0 h-[2px] rounded-full overflow-hidden mx-2 transition-all duration-1000"
                :style="{
                  width: `calc(${club.metadata?.activityVibe === 'SESSİZ' ? '0%' : club.metadata?.activityVibe === 'CHILL' ? '33.33%' : club.metadata?.activityVibe === 'ENERJİK' ? '66.66%' : '100%'})`,
                  backgroundColor:
                    club.metadata?.activityVibe === 'SESSİZ'
                      ? '#3b82f6'
                      : club.metadata?.activityVibe === 'CHILL'
                        ? '#10b981'
                        : club.metadata?.activityVibe === 'ENERJİK'
                          ? '#f59e0b'
                          : '#e11d48',
                }"
              >
                <div class="w-full h-full relative overflow-hidden">
                  <div
                    class="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-energy-pulse"
                  ></div>
                </div>
              </div>
              <div class="absolute inset-x-0 flex justify-between px-2">
                <div
                  v-for="v in ['SESSİZ', 'CHILL', 'ENERJİK', 'PARTY']"
                  :key="v"
                  class="relative group"
                >
                  <div
                    :class="[
                      'w-4 h-4 rounded-full border-2 transition-all duration-1000 z-10',
                      club.metadata?.activityVibe === v
                        ? 'scale-125 bg-white dark:bg-gray-900 border-current shadow-lg'
                        : 'bg-slate-100 dark:bg-gray-800 border-transparent',
                    ]"
                    :style="
                      club.metadata?.activityVibe === v
                        ? {
                            color:
                              v === 'SESSİZ'
                                ? '#3b82f6'
                                : v === 'CHILL'
                                  ? '#10b981'
                                  : v === 'ENERJİK'
                                    ? '#f59e0b'
                                    : '#e11d48',
                          }
                        : {}
                    "
                  ></div>
                  <span
                    class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[7px] font-black tracking-widest text-slate-400"
                    >{{ v }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AKTİVİTE KARTLARI -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            class="bg-white dark:bg-gray-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 flex items-center gap-4 shadow-sm transition-all hover:-translate-y-1"
          >
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0"
              :style="{ backgroundColor: club.color + '10', color: club.color }"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <div class="text-left overflow-hidden">
              <p
                class="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1"
              >
                AKTİVİTE TÜRÜ
              </p>
              <p
                class="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase"
              >
                {{ club.metadata?.activityType || "BELİRSİZ" }}
              </p>
            </div>
          </div>
          <div
            class="bg-white dark:bg-gray-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-6 flex items-center gap-4 shadow-sm transition-all hover:-translate-y-1"
          >
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0"
              :style="{ backgroundColor: club.color + '10', color: club.color }"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="text-left overflow-hidden">
              <p
                class="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1"
              >
                MEKAN TİPİ
              </p>
              <p
                class="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase"
              >
                {{ club.metadata?.activityLocationType || "BELİRSİZ" }} ALAN
              </p>
            </div>
          </div>
        </div>

        <!-- ŞARTLAR & TARİH -->
        <div class="grid grid-cols-1 gap-4">
          <div
            v-if="club.metadata?.activityRequirement"
            class="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <p
              class="text-[7px] font-black text-white/40 uppercase tracking-[0.4em] mb-3 text-center"
            >
              KATILIM NOTU & ŞARTLAR
            </p>
            <p
              class="text-xs font-bold text-white tracking-tight leading-relaxed text-center italic"
            >
              "{{ club.metadata.activityRequirement }}"
            </p>
          </div>
          <!-- TARİH PANELİ (AKTİVİTE) -->
          <div
            v-if="club.deadline"
            class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-[3rem] p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div class="flex items-center gap-5">
              <div
                class="w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner"
                :style="{
                  backgroundColor: club.color + '10',
                  color: club.color,
                }"
              >
                📅
              </div>
              <div class="text-left">
                <p
                  class="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1"
                >
                  ETKİNLİK TARİHİ
                </p>
                <p
                  class="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase"
                >
                  {{
                    new Date(club.deadline).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div
                v-for="(val, label) in getDigitalTime(club.deadline)"
                :key="label"
                class="flex flex-col items-center"
              >
                <div
                  class="w-14 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border-b-4 shadow-sm transition-all"
                  :style="{ borderColor: club.color }"
                >
                  <span
                    class="text-2xl font-black tracking-tighter"
                    :style="{ color: club.color }"
                    >{{ val }}</span
                  >
                </div>
                <span
                  class="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2"
                  >{{ label }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. HAKKINDA -->
      <section class="w-full max-w-2xl">
        <div
          class="bg-white dark:bg-gray-900/50 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group"
        >
          <p
            class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic text-lg relative z-10 break-words whitespace-pre-wrap text-center"
          >
            "{{ club.description }}"
          </p>
        </div>
      </section>

      <!-- 3. EKİP KARTLARI -->
      <section
        v-if="club.mainType !== 'DIGITAL'"
        class="w-full max-w-2xl"
        :class="
          club.advisorEmail
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
            : 'flex justify-center'
        "
      >
        <div
          v-if="club.advisorEmail"
          class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-sm group hover:border-emerald-500/20 transition-all w-full"
        >
          <img
            v-if="club.advisorUser?.avatarUrl"
            :src="club.advisorUser.avatarUrl"
            class="w-12 h-12 rounded-2xl object-cover border border-emerald-500/10"
          />
          <div
            v-else
            class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 font-black text-xl shadow-inner"
          >
            🎓
          </div>
          <div class="text-left overflow-hidden">
            <p
              class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5"
            >
              Akademik Danışman
            </p>
            <p
              class="text-sm font-black text-slate-800 dark:text-slate-200 truncate uppercase"
            >
              {{ club.advisorUser?.fullName || club.advisorName || "Hoca" }}
            </p>
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-900 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-sm group hover:border-blue-500/20 transition-all"
          :class="club.advisorEmail ? 'w-full' : 'max-w-sm w-full'"
        >
          <img
            v-if="club.founder?.avatarUrl"
            :src="club.founder.avatarUrl"
            class="w-12 h-12 rounded-2xl object-cover border border-blue-500/10"
          />
          <div
            v-else
            class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-black text-xl shadow-inner"
          >
            @
          </div>
          <div class="text-left overflow-hidden">
            <p
              class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5"
            >
              {{
                club.mainType === "PROJECT"
                  ? "Proje Yürütücüsü"
                  : "Kurucu Başkan"
              }}
            </p>
            <p
              class="text-sm font-black text-slate-800 dark:text-slate-200 truncate"
            >
              @{{ club.founder?.username }}
            </p>
          </div>
        </div>
      </section>

      <!-- 4. ONUR TABLOSU -->
      <section class="w-full max-w-2xl space-y-6 pt-4">
        <h3
          class="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.5em]"
        >
          Başarı Rozetleri
        </h3>
        <div
          v-if="club.earnedBadges && club.earnedBadges.length > 0"
          class="flex flex-wrap justify-center gap-6"
        >
          <div
            v-for="badge in club.earnedBadges"
            :key="badge.id"
            class="group/badge relative"
          >
            <div
              class="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-gray-800 border border-slate-100 dark:border-white/5 shadow-xl flex items-center justify-center text-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 cursor-help"
              :style="{
                color: badge.color,
                boxShadow: `0 10px 20px -5px ${badge.color}25`,
              }"
            >
              {{ badge.icon }}
            </div>
            <div
              class="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover/badge:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap shadow-2xl scale-90 group-hover/badge:scale-100"
            >
              {{ badge.name }}
            </div>
          </div>
        </div>
        <div v-else class="py-4 text-center opacity-30 italic">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Henüz Rozet Takdim Edilmedi
          </p>
        </div>
        <div
          v-if="canAwardBadge"
          class="pt-4 animate-in slide-in-from-bottom-4 duration-500"
        >
          <button
            @click="showBadgeModal = true"
            class="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white transition-all shadow-lg active:scale-95"
          >
            + ROZET TAKDİM ET
          </button>
        </div>
      </section>

      <!-- 5. ANA AKSİYONLAR -->
      <section class="max-w-xs w-full space-y-4 pt-8">
        <button
          @click="handleToggleJoin"
          :disabled="joining"
          class="w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl"
          :class="
            club.isJoined
              ? 'bg-white dark:bg-gray-800 border-2 border-slate-100 dark:border-white/5 shadow-none'
              : 'text-white'
          "
          :style="
            !club.isJoined
              ? {
                  backgroundColor: isEmoji(club.emoji) ? '#e11d48' : club.color,
                  boxShadow: `0 15px 25px -5px ${isEmoji(club.emoji) ? '#e11d48' : club.color}40`,
                }
              : {
                  color: isEmoji(club.emoji) ? '#e11d48' : club.color,
                  borderColor:
                    (isEmoji(club.emoji) ? '#e11d48' : club.color) + '30',
                }
          "
        >
          {{ club.isJoined ? "EKİPTEN AYRIL" : "EKİBE KATIL" }}
        </button>
        <button
          v-if="
            authStore.user?.role === 'ADMIN' ||
            authStore.user?.role === 'ACADEMIC'
          "
          @click="isDeleteModalOpen = true"
          class="w-full py-4 text-[10px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-[0.3em] transition-colors outline-none"
        >
          {{
            club.mainType === "SOCIAL"
              ? "Etkinliği Kalıcı Olarak Sil"
              : "Topluluğu Kalıcı Olarak Sil"
          }}
        </button>
      </section>

      <DeleteConfirmModal
        :is-open="isDeleteModalOpen"
        :is-deleting="deleting"
        title="TOPLULUĞU SİL"
        message="Bu topluluk ve tüm üyelikleri kalıcı olarak silinecektir."
        confirm-text="EVET, SİL"
        @confirm="confirmDelete"
        @cancel="isDeleteModalOpen = false"
      />

      <div
        v-if="showBadgeModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-white/60 dark:bg-gray-950/80 backdrop-blur-md"
          @click="showBadgeModal = false"
        ></div>
        <div
          class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-white/10 relative z-10 animate-in zoom-in-95 duration-200"
        >
          <div class="text-center mb-8">
            <h3
              class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2"
            >
              Başarıyı <span class="text-rose-600">Ödüllendir</span>
            </h3>
            <p
              class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]"
            >
              Topluluk Rozeti Seç
            </p>
          </div>
          <div
            class="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto p-2 custom-scrollbar"
          >
            <button
              v-for="badge in allBadges"
              :key="badge.id"
              @click="handleAwardBadge(badge.id)"
              :disabled="isBadgeEarned(badge.id)"
              class="p-6 rounded-[2rem] border border-slate-50 dark:border-white/5 flex flex-col items-center gap-3 transition-all hover:border-rose-500/30 hover:shadow-xl group disabled:opacity-20 active:scale-95"
            >
              <span
                class="text-4xl group-hover:scale-110 transition-transform"
                >{{ badge.icon }}</span
              ><span
                class="text-[10px] font-black uppercase tracking-tight text-center leading-tight"
                >{{ badge.name }}</span
              >
            </button>
          </div>
          <button
            @click="showBadgeModal = false"
            class="w-full mt-10 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200"
          >
            VAZGEÇ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api/client";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const club = ref<any>(null);
const allBadges = ref<any[]>([]);
const loading = ref(true);
const joining = ref(false);
const deleting = ref(false);
const isDeleteModalOpen = ref(false);
const showBadgeModal = ref(false);

const isEmoji = (str: string) =>
  str && /\p{Emoji}/u.test(str) && str.length <= 2;
const isBadgeEarned = (badgeId: number) =>
  club.value?.earnedBadges?.some((b: any) => b.id === badgeId);
const canAwardBadge = computed(() => {
  if (!authStore.user || !club.value) return false;
  return (
    authStore.user.role === "ADMIN" ||
    authStore.user.email === club.value.advisorEmail
  );
});

const fetchClub = async () => {
  loading.value = true;
  try {
    const [resClub, resBadges] = await Promise.all([
      apiClient.get(`/clubs/${route.params.slug}`, {
        params: { currentUserId: authStore.user?.id },
      }),
      apiClient.get("/clubs/badges/all"),
    ]);
    club.value = resClub.data;
    allBadges.value = resBadges.data;
  } catch {
    toast.error("Hata!");
    router.push("/campus/clubs");
  } finally {
    loading.value = false;
  }
};

const handleAwardBadge = async (badgeId: number) => {
  try {
    await apiClient.post(`/clubs/${club.value.id}/badges`, { badgeId });
    toast.success("Rozet takdim edildi! 🏆");
    showBadgeModal.value = false;
    fetchClub();
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Hata!");
  }
};

const handleToggleJoin = async () => {
  if (!authStore.isAuthenticated) {
    router.push("/auth");
    return;
  }
  joining.value = true;
  try {
    const res = await apiClient.post(`/clubs/${club.value.id}/toggle-join`);
    club.value.isJoined = res.data.joined;
    club.value.memberCount += res.data.joined ? 1 : -1;
    toast.success(res.data.joined ? "Topluluğa katıldınız! ✨" : "Ayrıldınız.");
  } catch {
    toast.error("Hata!");
  } finally {
    joining.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await apiClient.delete(`/clubs/${club.value.id}`);
    router.push("/campus/clubs");
  } catch {
    toast.error("Hata!");
  } finally {
    deleting.value = false;
  }
};

const formatDate = (d: string) => new Date(d).getFullYear().toString();

const getDigitalTime = (deadline: string) => {
  if (!deadline) return { GÜN: "00", SAAT: "00", DAKİKA: "00" };
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;
  if (diff <= 0) return { GÜN: "00", SAAT: "00", DAKİKA: "00" };
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const pad = (n: number) => n.toString().padStart(2, "0");
  return { GÜN: pad(d), SAAT: pad(h), DAKİKA: pad(m) };
};

const getTimeLeft = (deadline: string) => {
  if (!deadline) return "";
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;
  if (diff <= 0) return "TAMAMLANDI";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (days > 0) return `${pad(days)}G ${pad(hours)}S ${pad(minutes)}D`;
  return `${pad(hours)}S ${pad(minutes)}D KALDI`;
};

onMounted(fetchClub);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
.break-words {
  overflow-wrap: break-word;
  word-break: break-word;
}
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
</style>
