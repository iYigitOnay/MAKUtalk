<template>
  <div
    class="min-h-screen bg-[#050505] text-slate-400 font-sans selection:bg-blue-500/30 antialiased overflow-x-hidden flex flex-col relative text-left"
  >
    <!-- ZEMİN DOKUSU -->
    <div
      class="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"
    ></div>

    <!-- YÜZEN DOCK MENÜ (Global Zaman Kontrolüyle) -->
    <header
      class="fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full max-w-fit px-4 text-left"
    >
      <nav
        class="bg-[#0A0A0C]/90 backdrop-blur-2xl border border-white/[0.04] rounded-full p-1.5 flex items-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative"
      >
        <!-- Logo & İkon -->
        <div
          class="flex items-center px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] mr-3 ml-1 group cursor-default hover:bg-white/[0.06] transition-all duration-500 text-left"
        >
          <div
            class="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 mr-3 group-hover:rotate-[15deg] transition-transform duration-500"
          >
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div class="flex flex-col items-start leading-none text-left">
            <span
              class="text-[10px] font-black text-white tracking-[0.2em] uppercase opacity-90 leading-none"
              >MAKÜ</span
            >
            <span
              class="text-[7px] font-black text-blue-400 tracking-widest uppercase mt-1 opacity-60 leading-none text-left text-left text-left"
              >ANALİZ MERKEZİ</span
            >
          </div>
        </div>

        <!-- Menü Butonları -->
        <div class="flex items-center gap-1 text-left">
          <button
            v-for="m in menuItems"
            :key="m.id"
            @click="activeTab = m.id"
            :class="[
              'h-10 rounded-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative group overflow-hidden',
              activeTab === m.id
                ? 'px-5 text-white bg-white/[0.02]'
                : 'w-10 px-0 text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]',
            ]"
          >
            <component
              :is="m.icon"
              :class="[
                'w-4 h-4 transition-all duration-500 relative z-10',
                activeTab === m.id ? 'text-blue-400' : '',
              ]"
            />
            <span
              :class="[
                'font-black uppercase tracking-[0.2em] text-[9px] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10',
                activeTab === m.id
                  ? 'max-w-[120px] ml-2.5 opacity-100'
                  : 'max-w-0 ml-0 opacity-0',
              ]"
            >
              {{ m.label }}
            </span>
            <div
              :class="[
                'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-r from-blue-500 to-purple-500',
                activeTab === m.id ? 'w-1/2 opacity-100' : 'w-0 opacity-0',
              ]"
            ></div>
          </button>
        </div>

        <div class="w-px h-6 bg-white/[0.04] mx-3 text-left"></div>

        <!-- GLOBAL ZAMAN SEÇİCİ -->
        <div
          class="flex bg-white/[0.02] p-1 rounded-full border border-white/[0.05] mr-2"
        >
          <button
            v-for="t in timeOptions"
            :key="t.id"
            @click="
              interval = t.id;
              fetchAnalytics();
            "
            :class="[
              'px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all',
              interval === t.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-300',
            ]"
          >
            {{ t.label }}
          </button>
        </div>

        <button
          @click="$router.push('/campus')"
          class="w-10 h-10 flex items-center justify-center text-slate-500 transition-all duration-500 relative group/exit text-left"
        >
          <div
            class="absolute inset-0 rounded-full bg-rose-500/0 group-hover/exit:bg-rose-500/10 group-hover/exit:scale-150 transition-all duration-700 blur-xl text-left"
          ></div>
          <svg
            class="w-4 h-4 relative z-10 group-hover/exit:text-rose-500 transition-all duration-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
      </nav>
    </header>

    <main
      class="flex-1 w-full max-w-[1400px] mx-auto px-8 pt-36 pb-24 relative z-10 text-left"
    >
      <!-- LOADING -->
      <div
        v-if="loading"
        class="h-[60vh] flex flex-col items-center justify-center text-left text-left"
      >
        <div
          class="w-10 h-10 rounded-full border-[2px] border-white/5 border-t-blue-500 animate-spin mb-6 text-left"
        ></div>
        <p
          class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse"
        >
          Sinyaller İşleniyor
        </p>
      </div>

      <div
        v-else
        class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 text-left"
      >
        <!-- ÜST PANEL -->
        <section class="flex items-end justify-between px-2 text-left">
          <div class="space-y-1 text-left text-left">
            <h2
              class="text-3xl font-black text-white uppercase italic tracking-tighter leading-none text-left"
            >
              {{ activeTabLabel }}
              <span
                class="text-blue-600 text-sm tracking-[0.2em] ml-4 font-black not-italic opacity-60"
                >/ {{ currentIntervalLabel }} ANALİZİ</span
              >
            </h2>
            <p
              class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]"
            >
              Kampüs verileri anlık olarak işlenmektedir
            </p>
          </div>
        </section>

        <!-- 1. MODÜL: ÖZET -->
        <div v-if="activeTab === 'GENEL'" class="space-y-12 text-left">
          <section
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 text-left text-left"
          >
            <div
              v-for="(stat, i) in extendedStats"
              :key="i"
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[1.5rem] p-6 hover:border-white/[0.08] transition-all duration-500 flex flex-col justify-between h-[135px] group relative overflow-hidden text-left text-left"
            >
              <div
                class="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 text-left text-left"
              ></div>
              <div
                class="flex items-center justify-between relative z-10 text-left text-left"
              >
                <p
                  class="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity text-left text-left text-left text-left text-left"
                >
                  {{ stat.label }}
                </p>
                <component
                  :is="stat.icon"
                  class="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors"
                />
              </div>
              <h4
                class="text-3xl font-medium text-white tracking-tighter tabular-nums relative z-10 text-left text-left"
              >
                {{ stat.value }}
              </h4>
            </div>
          </section>

          <div
            class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2.5rem] p-10 lg:p-14 relative overflow-hidden group shadow-2xl text-left text-left"
          >
            <div
              class="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-600/[0.04] rounded-full blur-[120px] animate-pulse text-left text-left text-left"
            ></div>
            <div
              class="relative z-10 flex flex-col md:flex-row items-center gap-12 text-left text-left text-left text-left"
            >
              <div
                class="w-20 h-20 bg-white/[0.02] border border-white/[0.05] rounded-3xl flex items-center justify-center text-blue-500 shadow-inner text-4xl text-left text-left text-left text-left"
              >
                🤖
              </div>
              <div
                class="space-y-5 flex-1 text-left text-left text-left text-left"
              >
                <span
                  class="px-3 py-1 bg-blue-500 text-white text-[8px] font-black rounded-md uppercase tracking-widest text-left text-left"
                  >YAPAY ZEKA YORUMU</span
                >
                <h2
                  class="text-xl sm:text-2xl font-medium text-slate-200 italic tracking-tight leading-snug max-w-3xl text-left text-left"
                >
                  "{{ data?.aiSummary || "Analiz motoru veri bekliyor..." }}"
                </h2>
              </div>
            </div>
          </div>

          <section
            class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2.5rem] overflow-hidden text-left shadow-2xl text-left text-left text-left text-left"
          >
            <div
              class="p-8 border-b border-white/[0.02] flex justify-between items-center bg-white/[0.01] text-left text-left text-left text-left text-left text-left"
            >
              <h3
                class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-left text-left text-left text-left"
              >
                Haftanın En Aktif Öğrencileri
              </h3>
            </div>
            <div
              class="overflow-x-auto text-left text-left text-left text-left text-left"
            >
              <table
                v-if="data?.topUsers?.length"
                class="w-full text-left text-left text-left text-left"
              >
                <thead>
                  <tr
                    class="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/[0.02] text-left text-left text-left text-left text-left"
                  >
                    <th
                      class="py-6 px-10 text-left text-left text-left text-left text-left"
                    >
                      Öğrenci Profili
                    </th>
                    <th
                      class="py-6 px-10 text-center text-left text-left text-left text-left text-left text-left"
                    >
                      Paylaşım Sayısı
                    </th>
                    <th
                      class="py-6 px-10 text-right text-left text-left text-left text-left text-left text-left text-left text-left"
                    >
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="divide-y divide-white/[0.02] text-left text-left text-left text-left text-left"
                >
                  <tr
                    v-for="u in data.topUsers"
                    :key="u.username"
                    class="hover:bg-white/[0.01] transition-colors duration-500 group text-left text-left text-left text-left text-left text-left"
                  >
                    <td
                      class="py-6 px-10 text-left text-left text-left text-left text-left"
                    >
                      <div
                        class="flex items-center gap-5 text-left text-left text-left text-left text-left text-left"
                      >
                        <div
                          class="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden group-hover:scale-110 transition-all duration-500 text-left text-left text-left text-left text-left text-left"
                        >
                          <img
                            v-if="u.avatarUrl"
                            :src="getAvatarUrl(u.avatarUrl)"
                            class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700"
                          />
                          <div
                            v-else
                            class="w-full h-full flex items-center justify-center text-xs font-black text-slate-600 uppercase"
                          >
                            {{ u.username.charAt(0) }}
                          </div>
                        </div>
                        <div
                          class="flex flex-col text-left text-left text-left text-left text-left text-left"
                        >
                          <span
                            class="text-sm font-medium text-white tracking-tight leading-none mb-1.5 text-left text-left"
                            >@{{ u.username }}</span
                          >
                          <span
                            class="text-[9px] font-black text-slate-600 uppercase tracking-widest text-left text-left text-left text-left text-left"
                            >{{ u.fullName || "Öğrenci" }}</span
                          >
                        </div>
                      </div>
                    </td>
                    <td class="py-6 px-10 text-center">
                      <span
                        class="text-xl font-medium text-slate-200 tabular-nums"
                        >{{ u._count.posts }}</span
                      >
                    </td>
                    <td class="py-6 px-10 text-right">
                      <div
                        class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/5 text-blue-400 text-[8px] font-black rounded-full uppercase border border-blue-500/10 tracking-[0.1em]"
                      >
                        <div
                          class="w-1 h-1 rounded-full bg-blue-500 animate-ping"
                        ></div>
                        Aktif
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                v-else
                class="py-24 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.2em] italic opacity-40 text-left text-left text-left"
              >
                Veri bulunamadı.
              </div>
            </div>
          </section>
        </div>

        <!-- 2. MODÜL: SOSYAL (GÖNDERİ ANALİZİ) -->
        <div
          v-if="activeTab === 'SOSYAL'"
          class="space-y-10 text-left text-left"
        >
          <div
            class="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left text-left"
          >
            <div
              class="lg:col-span-2 bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-10 flex flex-col h-[550px] shadow-2xl relative overflow-hidden text-left text-left text-left"
            >
              <div
                class="flex items-center justify-between mb-10 text-left text-left text-left"
              >
                <div>
                  <h3
                    class="text-white font-medium text-xl tracking-tight leading-none mb-2"
                  >
                    Aktivite Akışı
                  </h3>
                  <p
                    class="text-[10px] text-slate-600 uppercase font-black tracking-widest"
                  >
                    Paylaşım Yoğunluğu ({{ currentIntervalLabel }})
                  </p>
                </div>
              </div>
              <div class="flex-1 w-full text-left text-left text-left">
                <apexchart
                  type="bar"
                  height="100%"
                  :options="barChartOptions"
                  :series="barChartSeries"
                />
              </div>
            </div>
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-10 flex flex-col items-center justify-center shadow-2xl text-left text-left"
            >
              <h3
                class="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] w-full text-left mb-10"
              >
                Etkileşim Dengesi
              </h3>
              <div class="relative w-full aspect-square max-w-[220px]">
                <apexchart
                  type="donut"
                  height="100%"
                  :options="engagementDonutOptions"
                  :series="engagementDonutSeries"
                />
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                >
                  <span
                    class="text-xs text-slate-600 font-black uppercase tracking-widest text-center"
                    >Toplam</span
                  >
                  <span
                    class="text-2xl font-black text-white tabular-nums text-left text-left"
                    >{{ engagementTotal }}</span
                  >
                </div>
              </div>
              <div class="w-full mt-10 space-y-3">
                <div
                  v-for="item in engagementBreakdown"
                  :key="item.label"
                  class="flex items-center justify-between px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl group hover:bg-white/[0.04] transition-colors text-left"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-2 h-2 rounded-full"
                      :style="{ backgroundColor: item.color }"
                    ></div>
                    <span
                      class="text-[10px] font-black text-slate-400 uppercase group-hover:text-white transition-colors"
                      >{{ item.label }}</span
                    >
                  </div>
                  <span
                    class="text-xs font-black text-white tabular-nums text-left text-left"
                    >{{ item.value }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- KAMPÜS NABZI -->
          <div
            class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-10 flex flex-col h-[450px] shadow-2xl relative overflow-hidden text-left text-left text-left text-left"
          >
            <div
              class="flex items-center justify-between mb-10 text-left text-left text-left"
            >
              <div>
                <h3
                  class="text-white font-medium text-xl tracking-tight leading-none mb-2 text-left"
                >
                  Günlük Nabız
                </h3>
                <p
                  class="text-[10px] text-slate-600 uppercase font-black tracking-widest text-left text-left"
                >
                  24 Saatlik Gönderi Dağılımı
                </p>
              </div>
            </div>
            <div class="flex-1 w-full text-left text-left">
              <apexchart
                type="area"
                height="100%"
                :options="pulseChartOptions"
                :series="pulseChartSeries"
              />
            </div>
          </div>

          <!-- EN POPÜLER GÖNDERİLER -->
          <section
            class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] overflow-hidden shadow-2xl text-left text-left text-left text-left"
          >
            <div
              class="p-8 border-b border-white/[0.02] bg-white/[0.01] text-left text-left text-left"
            >
              <h3
                class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-left text-left"
              >
                En Yüksek Etkileşimli Gönderiler
              </h3>
            </div>
            <div class="overflow-x-auto text-left text-left text-left">
              <table
                v-if="data?.topPosts?.length"
                class="w-full text-left text-left text-left"
              >
                <thead>
                  <tr
                    class="bg-gray-50/30 dark:bg-gray-800/30 font-black text-slate-600 uppercase tracking-widest border-b border-white/[0.02] text-left text-left text-left"
                  >
                    <th class="py-6 px-10 text-left">Yazar & Mesaj</th>
                    <th class="py-6 px-10 text-center text-left">Beğeni</th>
                    <th class="py-6 px-10 text-center text-left">Yorum</th>
                    <th class="py-6 px-10 text-center text-left">Remakü</th>
                    <th class="py-6 px-10 text-right text-left">Etki</th>
                  </tr>
                </thead>
                <tbody
                  class="divide-y divide-white/[0.02] text-left text-left text-left text-left"
                >
                  <tr
                    v-for="p in data.topPosts"
                    :key="p.id"
                    class="hover:bg-white/[0.01] transition-colors group text-left text-left text-left"
                  >
                    <td class="py-6 px-10 max-w-md text-left text-left">
                      <div class="flex flex-col space-y-1.5">
                        <span
                          class="text-sm font-medium text-white tracking-tight leading-none mb-1 text-left text-left text-left"
                          >@{{ p.author.username }}</span
                        ><span
                          class="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed text-left text-left text-left text-left"
                          >"{{ p.content }}"</span
                        >
                      </div>
                    </td>
                    <td
                      class="py-6 px-10 text-center font-medium text-slate-200 tabular-nums"
                    >
                      {{ p._count.likes }}
                    </td>
                    <td
                      class="py-6 px-10 text-center font-medium text-slate-200 tabular-nums"
                    >
                      {{ p._count.comments }}
                    </td>
                    <td
                      class="py-6 px-10 text-center font-medium text-slate-200 tabular-nums"
                    >
                      {{ p._count.reposts }}
                    </td>
                    <td class="py-6 px-10 text-right">
                      <div
                        class="w-24 ml-auto h-1.5 bg-white/[0.02] rounded-full overflow-hidden border border-white/[0.05]"
                      >
                        <div
                          class="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                          :style="{
                            width: Math.min(p._count.likes * 10, 100) + '%',
                          }"
                        ></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                v-else
                class="py-24 text-center text-slate-700 font-black uppercase italic opacity-40 text-left text-left"
              >
                Gönderi verisi bulunamadı.
              </div>
            </div>
          </section>
        </div>

        <!-- MODÜL 3: DUYGU -->
        <div
          v-if="activeTab === 'DUYGU'"
          class="space-y-10 text-left text-left text-left"
        >
          <div
            class="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left text-left text-left"
          >
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-12 flex flex-col items-center shadow-2xl text-left text-left text-left"
            >
              <h3
                class="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] w-full text-left mb-12 text-left text-left"
              >
                Duygu Dağılım Analizi
              </h3>
              <div
                class="relative w-full aspect-square max-w-[260px] text-left text-left"
              >
                <apexchart
                  v-if="data?.sentiment?.distribution?.length"
                  type="donut"
                  height="100%"
                  :options="sentimentDonutOptions"
                  :series="sentimentDonutSeries"
                />
                <div
                  v-else
                  class="h-full flex items-center justify-center opacity-40 italic text-[10px] font-black uppercase text-left text-left text-left"
                >
                  Veri Yok
                </div>
              </div>
            </div>
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-12 flex flex-col shadow-2xl text-left text-left text-left"
            >
              <h3
                class="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] w-full text-left mb-12 text-left text-left"
              >
                Kategori Bazlı Mod
              </h3>
              <div class="flex-1 text-left text-left text-left">
                <apexchart
                  v-if="data?.sentiment?.categoryAnalysis?.length"
                  type="bar"
                  height="100%"
                  :options="sentimentBarOptions"
                  :series="sentimentBarSeries"
                />
                <div
                  v-else
                  class="h-full flex items-center justify-center opacity-40 italic text-[10px] font-black uppercase text-left text-left text-left text-left"
                >
                  Veri Yok
                </div>
              </div>
            </div>
          </div>
          <div
            class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-12 flex flex-col h-[500px] shadow-2xl relative overflow-hidden text-left text-left text-left text-left"
          >
            <div
              class="flex items-center justify-between mb-12 text-left text-left text-left text-left"
            >
              <div>
                <h3
                  class="text-white font-medium text-xl tracking-tight leading-none mb-2 text-left text-left text-left"
                >
                  Motivasyon Çizelgesi
                </h3>
                <p
                  class="text-[10px] text-slate-600 uppercase font-black tracking-widest text-left text-left text-left"
                >
                  Haftalık Duygu Trendi
                </p>
              </div>
            </div>
            <div
              class="flex-1 w-full text-left text-left text-left text-left text-left text-left"
            >
              <apexchart
                type="line"
                height="100%"
                :options="lineChartOptions"
                :series="lineChartSeries"
              />
            </div>
          </div>
        </div>

        <!-- MODÜL 4: EKONOMİ -->
        <div
          v-if="activeTab === 'EKONOMİ'"
          class="space-y-10 text-left text-left text-left text-left"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left text-left text-left"
          >
            <div
              v-for="card in economyKPIs"
              :key="card.label"
              class="p-8 bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] flex flex-col justify-between h-[160px] shadow-xl text-left text-left text-left text-left"
            >
              <span
                class="text-[10px] font-black text-slate-600 uppercase tracking-widest text-left text-left text-left text-left text-left"
                >{{ card.label }}</span
              >
              <div
                class="text-4xl font-medium italic tracking-tighter tabular-nums text-left text-left text-left text-left text-left"
                :class="card.color"
              >
                {{ card.value }}
              </div>
              <span
                class="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic text-left text-left text-left text-left text-left text-left text-left"
                >{{ currentIntervalLabel }} Verisi</span
              >
            </div>
          </div>
          <div
            class="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left text-left text-left text-left text-left"
          >
            <div
              class="lg:col-span-1 bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-10 flex flex-col items-center shadow-2xl text-left text-left text-left text-left text-left text-left"
            >
              <h3
                class="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] w-full text-left mb-10 text-left text-left text-left text-left"
              >
                Pazar Payı
              </h3>
              <div
                class="relative w-full aspect-square max-w-[220px] text-left text-left text-left text-left"
              >
                <apexchart
                  v-if="data?.economy?.categories?.length"
                  type="donut"
                  height="100%"
                  :options="economyDonutOptions"
                  :series="economyDonutSeries"
                />
                <div
                  v-else
                  class="h-full flex items-center justify-center opacity-40 italic text-[10px] font-black uppercase text-left text-left text-left text-left text-left text-left text-left"
                >
                  Veri Yok
                </div>
              </div>
            </div>
            <div
              class="lg:col-span-2 bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] shadow-2xl overflow-hidden text-left text-left text-left text-left text-left text-left text-left"
            >
              <div
                class="p-8 border-b border-white/[0.02] bg-white/[0.01] text-left text-left text-left text-left text-left text-left text-left text-left text-left"
              >
                <h3
                  class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-left text-left text-left text-left text-left"
                >
                  Kategori Detayları
                </h3>
              </div>
              <div
                class="overflow-x-auto text-left text-left text-left text-left text-left text-left text-left"
              >
                <table
                  v-if="data?.economy?.categories?.length"
                  class="w-full text-left text-left text-left text-left text-left text-left text-left text-left"
                >
                  <thead>
                    <tr
                      class="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/[0.02] text-left text-left text-left text-left text-left text-left text-left text-left"
                    >
                      <th
                        class="py-6 px-10 text-left text-left text-left text-left text-left"
                      >
                        Kategori
                      </th>
                      <th
                        class="py-6 px-10 text-center text-left text-left text-left text-left text-left"
                      >
                        İlan
                      </th>
                      <th
                        class="py-6 px-10 text-center text-left text-left text-left text-left text-left"
                      >
                        Hacim
                      </th>
                      <th
                        class="py-6 px-10 text-right text-left text-left text-left text-left text-left text-left"
                      >
                        Ortalama
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    class="divide-y divide-white/[0.02] text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"
                  >
                    <tr
                      v-for="cat in data.economy.categories"
                      :key="cat.label"
                      class="hover:bg-white/[0.01] transition-colors duration-500 group text-left text-left text-left text-left text-left text-left text-left text-left text-left"
                    >
                      <td
                        class="py-6 px-10 text-left text-left text-left text-left text-left text-left text-left text-left"
                      >
                        <span
                          class="text-xs font-medium text-white uppercase tracking-wider text-left text-left text-left text-left text-left"
                          >{{ cat.label }}</span
                        >
                      </td>
                      <td
                        class="py-6 px-10 text-center text-left text-left text-left text-left text-left text-left text-left"
                      >
                        <span
                          class="text-sm text-slate-400 tabular-nums text-left text-left text-left text-left text-left text-left"
                          >{{ cat.count }}</span
                        >
                      </td>
                      <td
                        class="py-6 px-10 text-center text-left text-left text-left text-left text-left text-left text-left text-left"
                      >
                        <span
                          class="text-sm font-black text-slate-200 tabular-nums text-left text-left text-left text-left text-left text-left text-left"
                          >{{ cat.totalValue.toLocaleString() }}₺</span
                        >
                      </td>
                      <td
                        class="py-6 px-10 text-right text-left text-left text-left text-left text-left text-left text-left text-left"
                      >
                        <span
                          class="px-3 py-1 bg-white/[0.02] text-blue-400 text-[10px] font-black rounded-lg border border-white/[0.05] text-left text-left text-left text-left"
                          >~{{ cat.avgPrice }}₺</span
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h } from "vue";
import apiClient from "@/api/client";
import { useToast } from "vue-toastification";
import VueApexCharts from "vue3-apexcharts";

const apexchart = VueApexCharts;
const toast = useToast();
const loading = ref(true);
const activeTab = ref("GENEL");
const interval = ref<"hour" | "day" | "week">("day");
const data = ref<any>(null);

// PREMIUM İKONLAR
const DashIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
      }),
    ]),
});
const SocialIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
      }),
    ]),
});
const VibeIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M13 10V3L4 14h7v7l9-11h-7z",
      }),
    ]),
});
const EconIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
      }),
    ]),
});
const ActivityIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      }),
    ]),
});
const UsersIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      }),
    ]),
});

const menuItems = [
  { id: "GENEL", label: "Özet Panel", icon: DashIcon },
  { id: "SOSYAL", label: "Gönderi Analizi", icon: SocialIcon },
  { id: "DUYGU", label: "Kampüs Modu", icon: VibeIcon },
  { id: "EKONOMİ", label: "Pazar Analizi", icon: EconIcon },
];

const activeTabLabel = computed(
  () => menuItems.find((m) => m.id === activeTab.value)?.label || "DASHBOARD",
);

const timeOptions = [
  { id: "hour", label: "24 SAAT" },
  { id: "day", label: "7 GÜN" },
  { id: "week", label: "30 GÜN" },
];

const currentIntervalLabel = computed(
  () => timeOptions.find((t) => t.id === interval.value)?.label || "HAFTALIK",
);

const extendedStats = computed(() => [
  {
    label: "TOPLAM GÖNDERİ",
    value: data.value?.summary?.totalPosts || 0,
    icon: ActivityIcon,
    textColor: "text-blue-400",
  },
  {
    label: "GÜNLÜK ORT.",
    value: data.value?.summary?.avgDailyPosts || 0,
    icon: DashIcon,
    textColor: "text-slate-200",
  },
  {
    label: "ETKİLEŞİM",
    value: data.value?.summary?.interactionRate || "%0",
    icon: VibeIcon,
    textColor: "text-purple-400",
  },
  {
    label: "YENİ ÜYE",
    value: data.value?.summary?.newUsers || 0,
    icon: UsersIcon,
    textColor: "text-emerald-400",
  },
  {
    label: "SPOT İLAN",
    value: data.value?.summary?.spotCount || 0,
    icon: EconIcon,
    textColor: "text-amber-400",
  },
  {
    label: "DURUM",
    value: data.value?.summary?.totalPosts > 0 ? "AKTİF" : "STBY",
    icon: ActivityIcon,
    textColor: "text-blue-500",
  },
]);

const engagementTotal = computed(
  () =>
    (data.value?.social?.engagementMix?.likes || 0) +
    (data.value?.social?.engagementMix?.comments || 0) +
    (data.value?.social?.engagementMix?.reposts || 0),
);
const engagementBreakdown = computed(() => [
  {
    label: "Fav",
    value: data.value?.social?.engagementMix?.likes || 0,
    color: "#ef4444",
  },
  {
    label: "Yorum",
    value: data.value?.social?.engagementMix?.comments || 0,
    color: "#3b82f6",
  },
  {
    label: "Remakü",
    value: data.value?.social?.engagementMix?.reposts || 0,
    color: "#22c55e",
  },
]);

const economyKPIs = computed(() => [
  {
    label: "Toplam Hacim",
    value:
      (data.value?.summary?.spotTotalValue || 0).toLocaleString("tr-TR") + "₺",
    color: "text-white",
  },
  {
    label: "Aktif İlanlar",
    value: data.value?.summary?.spotCount || 0,
    color: "text-slate-200",
  },
  {
    label: "Ortalama Fiyat",
    value:
      "~" +
      Math.round(
        (data.value?.summary?.spotTotalValue || 0) /
          (data.value?.summary?.spotCount || 1),
      ) +
      "₺",
    color: "text-purple-400",
  },
]);

const fetchAnalytics = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get(
      `/campus/analytics?interval=${interval.value}`,
    );
    data.value = res.data;
  } catch (error) {
    toast.error("Bağlantı hatası");
  } finally {
    loading.value = false;
  }
};

const getAvatarUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `http://localhost:3000${path.startsWith("/uploads") ? path : "/uploads/avatars/" + path}`;
};

// --- CHART CONFIGS ---
const barChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    background: "transparent",
    fontFamily: "inherit",
  },
  plotOptions: {
    bar: { columnWidth: "30%", borderRadius: 12, distributed: true },
  },
  colors: ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#3b82f6"],
  xaxis: {
    categories: data.value?.timeSeries.map((p: any) => p.label) || [],
    labels: { style: { colors: "#475569", fontSize: "10px", fontWeight: 900 } },
    axisBorder: { show: false },
  },
  yaxis: {
    labels: { style: { colors: "#475569", fontSize: "10px", fontWeight: 900 } },
  },
  grid: { borderColor: "#ffffff03", strokeDashArray: 6 },
  legend: { show: false },
  tooltip: { theme: "dark" },
}));
const barChartSeries = computed(() => [
  {
    name: "Gönderi Sayısı",
    data: data.value?.timeSeries.map((p: any) => p.count) || [],
  },
]);

const lineChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    background: "transparent",
    fontFamily: "inherit",
  },
  stroke: { curve: "smooth", width: 5 },
  colors: ["#a855f7"],
  xaxis: {
    categories: data.value?.timeSeries.map((p: any) => p.label) || [],
    labels: { style: { colors: "#475569", fontSize: "10px", fontWeight: 900 } },
    axisBorder: { show: false },
  },
  yaxis: {
    min: 0,
    max: 1,
    labels: { style: { colors: "#475569", fontSize: "10px", fontWeight: 900 } },
  },
  grid: { borderColor: "#ffffff03", strokeDashArray: 6 },
  markers: {
    size: 6,
    colors: ["#a855f7"],
    strokeColors: "#050505",
    strokeWidth: 3,
  },
  tooltip: { theme: "dark" },
}));
const lineChartSeries = computed(() => [
  {
    name: "Mod Skoru",
    data:
      data.value?.timeSeries.map((p: any) => p.avgSentiment.toFixed(2)) || [],
  },
]);

const pulseChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    background: "transparent",
    fontFamily: "inherit",
  },
  stroke: { curve: "smooth", width: 3 },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100],
    },
  },
  colors: ["#3b82f6"],
  xaxis: {
    categories: data.value?.social?.hourlyPulse?.map((p: any) => p.hour) || [],
    labels: { style: { colors: "#475569", fontSize: "9px" } },
  },
  yaxis: { show: false },
  grid: { show: false },
  dataLabels: { enabled: false },
  tooltip: { theme: "dark" },
}));
const pulseChartSeries = computed(() => [
  {
    name: "Gönderi",
    data: data.value?.social?.hourlyPulse?.map((p: any) => p.count) || [],
  },
]);

const engagementDonutOptions = computed(() => ({
  chart: { type: "donut", fontFamily: "inherit" },
  labels: ["Fav", "Yorum", "Remakü"],
  colors: ["#ef4444", "#3b82f6", "#22c55e"],
  stroke: { show: false },
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: "85%", background: "transparent" } } },
  tooltip: { theme: "dark" },
}));
const engagementDonutSeries = computed(() => [
  data.value?.social?.engagementMix?.likes || 0,
  data.value?.social?.engagementMix?.comments || 0,
  data.value?.social?.engagementMix?.reposts || 0,
]);

const sentimentDonutOptions = computed(() => ({
  chart: { type: "donut", fontFamily: "inherit" },
  labels: data.value?.sentiment?.distribution?.map((s: any) => s.label) || [],
  colors: ["#4ade80", "#60a5fa", "#f87171", "#fb923c", "#c084fc", "#2dd4bf"],
  stroke: { show: false },
  legend: { position: "bottom", labels: { colors: "#64748b" } },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: "80%", background: "transparent" } } },
  tooltip: { theme: "dark" },
}));
const sentimentDonutSeries = computed(
  () => data.value?.sentiment?.distribution?.map((s: any) => s.count) || [],
);

const sentimentBarOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    background: "transparent",
    fontFamily: "inherit",
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 8,
      barHeight: "40%",
      distributed: true,
    },
  },
  colors: data.value?.sentiment?.categoryAnalysis?.map((c: any) => c.color) || [
    "#3b82f6",
  ],
  xaxis: {
    categories:
      data.value?.sentiment?.categoryAnalysis?.map((c: any) => c.name) || [],
    labels: { style: { colors: "#475569" } },
    max: 1,
  },
  grid: { borderColor: "#ffffff03" },
  legend: { show: false },
  tooltip: { theme: "dark" },
}));
const sentimentBarSeries = computed(() => [
  {
    name: "Pozitiflik Skoru",
    data:
      data.value?.sentiment?.categoryAnalysis?.map((c: any) =>
        c.avgScore.toFixed(2),
      ) || [],
  },
]);

const economyDonutOptions = computed(() => ({
  chart: { type: "donut", fontFamily: "inherit" },
  labels: data.value?.economy?.categories?.map((c: any) => c.label) || [],
  colors: ["#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#10b981"],
  stroke: { show: false },
  legend: { position: "bottom", labels: { colors: "#64748b" } },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: "80%", background: "transparent" } } },
  tooltip: { theme: "dark" },
}));
const economyDonutSeries = computed(
  () => data.value?.economy?.categories?.map((c: any) => c.totalValue) || [],
);

const donutOptions = computed(() => ({
  chart: { type: "donut", fontFamily: "inherit" },
  labels: data.value?.categories?.map((s: any) => s.name) || ["Bekleniyor"],
  colors: ["#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#10b981"],
  stroke: { show: false },
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: "85%", background: "transparent" } } },
  tooltip: { theme: "dark" },
}));
const donutSeries = computed(
  () => data.value?.categories?.map((s: any) => s.count) || [1],
);

onMounted(fetchAnalytics);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.animate-in {
  animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
