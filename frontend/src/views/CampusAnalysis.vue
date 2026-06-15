<!-- src/views/CampusAnalysis.vue -->
<template>
  <div
    class="min-h-screen bg-[#050505] text-slate-400 font-sans selection:bg-blue-500/30 antialiased overflow-x-hidden flex flex-col relative text-left"
  >
    <!-- ZEMİN DOKUSU -->
    <div
      class="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"
    ></div>

    <header
      class="fixed top-6 left-0 right-0 md:left-1/2 md:-translate-x-1/2 z-50 w-full md:max-w-fit px-6"
    >
      <nav
        class="bg-[#0A0A0C]/80 backdrop-blur-2xl border border-white/[0.05] rounded-2xl md:rounded-full p-1.5 flex flex-col md:flex-row items-center shadow-2xl relative overflow-hidden"
      >
        <div class="flex items-center w-full md:w-auto">
          <!-- Logo: Daha Küçük ve Zarif -->
          <div
            class="flex items-center px-3 py-1 mr-2 group cursor-default border-r border-white/[0.03]"
          >
            <Zap class="w-4 h-4 text-blue-500 mr-2 group-hover:animate-pulse" />
            <span
              class="text-[10px] font-black text-white tracking-[0.3em] uppercase"
              >MAKÜ</span
            >
          </div>

          <!-- Navigasyon: İnce ve Modern -->
          <div class="flex items-center gap-1">
            <button
              v-for="m in menuItems"
              :key="m.id"
              @click="activeTab = m.id"
              :class="[
                'h-9 px-4 rounded-full flex items-center transition-all duration-300 group relative border',
                activeTab === m.id
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-200',
              ]"
            >
              <component
                :is="m.icon"
                :class="[
                  'w-3.5 h-3.5 transition-colors',
                  activeTab === m.id
                    ? 'text-blue-400'
                    : 'text-slate-600 group-hover:text-slate-400',
                ]"
              />
              <span
                class="ml-2 font-black uppercase tracking-[0.2em] text-[10px]"
                >{{ m.label }}</span
              >

              <!-- Seçili İndikatörü: Parlayan Çizgi -->
              <div
                v-if="activeTab === m.id"
                class="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-blue-400 rounded-full shadow-[0_0_10px_#3b82f6] animate-pulse"
              ></div>
            </button>
          </div>

          <!-- Ayrıl: Minimalist Kırmızı Pill -->
          <button
            @click="$router.push('/campus')"
            class="h-8.5 px-4 ml-3 rounded-full border border-red-500/10 hover:border-red-500/30 bg-red-500/[0.02] hover:bg-red-500/5 text-red-500/60 hover:text-red-400 transition-all flex items-center gap-2 group"
          >
            <LogOut class="w-3 h-3" />
            <span class="text-[10px] font-black uppercase tracking-widest"
              >AYRIL</span
            >
          </button>
        </div>

        <!-- Zaman Filtresi: En Sağda İnce Tasarım -->
        <div class="flex md:contents">
          <div
            class="w-full md:w-auto mt-2 md:mt-0 flex bg-white/[0.02] p-1 rounded-full border border-white/[0.03] md:ml-4"
          >
            <button
              v-for="t in timeOptions"
              :key="t.id"
              @click="
                interval = t.id;
                fetchAnalytics();
              "
              :class="[
                'px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all',
                interval === t.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-600 hover:text-slate-400',
              ]"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
      </nav>
    </header>

    <main
      class="flex-1 w-full max-w-[1400px] mx-auto px-8 pt-36 pb-24 relative z-10 text-left"
    >
      <div
        v-if="loading"
        class="h-[60vh] flex flex-col items-center justify-center"
      >
        <div
          class="w-10 h-10 rounded-full border-2 border-white/5 border-t-blue-500 animate-spin mb-6"
        ></div>
        <p
          class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse"
        >
          Sinyaller İşleniyor
        </p>
      </div>

      <div
        v-else
        class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000"
      >
        <header class="px-2">
          <h2
            class="text-3xl font-black text-white uppercase italic tracking-tighter leading-none"
          >
            {{ activeTabLabel }}
            <span
              class="text-blue-600 text-sm tracking-[0.2em] ml-4 font-black not-italic opacity-60"
              >/ {{ currentIntervalLabel }}</span
            >
          </h2>
          <p
            class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1"
          >
            MAKÜ Kampüs Dinamikleri
          </p>
        </header>

        <!-- GENEL -->
        <div v-if="activeTab === 'GENEL'" class="space-y-12">
          <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            <div
              v-for="(stat, i) in summaryStats"
              :key="i"
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[1.5rem] p-6 h-[130px] flex flex-col justify-between group relative overflow-hidden"
            >
              <div
                class="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"
              ></div>
              <p
                class="text-[9px] font-black text-slate-500 uppercase tracking-widest relative z-10"
              >
                {{ stat.label }}
              </p>
              <h4
                class="text-3xl font-medium text-white tracking-tighter relative z-10 tabular-nums"
              >
                {{ stat.value }}
              </h4>
            </div>
          </section>

          <!-- AI Özet -->
          <div
            class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl"
          >
            <div
              class="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-600/[0.04] rounded-full blur-[120px]"
            ></div>
            <div
              class="relative z-10 flex flex-col md:flex-row items-center gap-12 text-left"
            >
              <div
                class="w-20 h-20 bg-white/[0.02] border border-white/[0.05] rounded-3xl flex items-center justify-center text-4xl text-blue-500"
              >
                🤖
              </div>
              <div class="space-y-4 flex-1">
                <span
                  class="px-3 py-1 bg-blue-500 text-white text-[8px] font-black rounded-md uppercase tracking-widest"
                  >AI KAMPÜS ÖZETİ</span
                >
                <h2
                  class="text-xl sm:text-2xl font-medium text-slate-200 italic tracking-tight leading-snug"
                >
                  "{{
                    campusStore.analytics?.aiSummary ||
                    "Analiz motoru veri bekliyor..."
                  }}"
                </h2>
              </div>
            </div>
          </div>

          <!-- En Aktif Öğrenciler -->
          <div
            class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2.5rem] p-10 shadow-2xl space-y-8"
          >
            <div
              class="flex items-center justify-between border-b border-white/[0.02] pb-6"
            >
              <div>
                <h3
                  class="text-white font-medium text-2xl tracking-tight uppercase italic leading-none"
                >
                  Yıldız Üyeler
                </h3>
                <p
                  class="text-[10px] text-slate-600 uppercase font-black tracking-[0.2em] mt-2"
                >
                  Dönemin En Aktif Paylaşımcıları
                </p>
              </div>
              <span
                class="px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl text-[9px] font-black text-blue-500 uppercase tracking-widest italic"
                >{{ currentIntervalLabel }}</span
              >
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div
                v-for="(user, idx) in campusStore.analytics?.social?.topUsers"
                :key="user.username"
                class="flex flex-col items-center text-center p-6 bg-white/[0.01] border border-white/[0.03] rounded-[2rem] hover:bg-white/[0.03] hover:border-blue-500/20 transition-all group relative overflow-hidden"
              >
                <div
                  class="absolute top-4 right-4 text-[20px] font-black text-white/5 italic select-none"
                >
                  #{{ idx + 1 }}
                </div>

                <div
                  class="w-20 h-20 rounded-2xl overflow-hidden bg-white/[0.05] border border-white/[0.1] mb-4 relative"
                >
                  <img
                    v-if="user.avatarUrl"
                    :src="campusStore.getAvatarUrl(user.avatarUrl)"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-2xl font-black text-slate-600"
                  >
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                </div>

                <div class="space-y-1 w-full text-left">
                  <h4 class="text-sm font-bold text-white truncate">
                    {{ user.fullName || user.username }}
                  </h4>
                  <p
                    class="text-[10px] text-slate-500 font-medium truncate italic mb-4"
                  >
                    @{{ user.username }}
                  </p>

                  <div
                    class="flex flex-col gap-2 pt-4 border-t border-white/[0.02]"
                  >
                    <div class="flex items-center justify-between">
                      <span
                        class="text-[8px] font-black text-slate-600 uppercase tracking-widest"
                        >PAYLAŞIM</span
                      >
                      <span
                        class="text-[11px] font-black text-blue-500 tabular-nums"
                        >{{ user.postCount }}</span
                      >
                    </div>
                    <div class="flex items-center justify-between">
                      <span
                        class="text-[8px] font-black text-slate-600 uppercase tracking-widest"
                        >KATEGORİ</span
                      >
                      <span
                        class="text-[9px] font-black text-white uppercase tracking-tighter truncate"
                        >{{ user.topCategory }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SOSYAL -->
        <div v-if="activeTab === 'SOSYAL'" class="space-y-10">
          <!-- Üst Bilgi Kartları -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-6 flex flex-col justify-between h-[120px] shadow-xl group relative overflow-hidden"
            >
              <div
                class="absolute -right-2 -top-2 w-12 h-12 bg-blue-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform"
              ></div>
              <span
                class="text-[9px] font-black text-slate-500 uppercase tracking-widest relative z-10"
                >ZİRVE SAAT</span
              >
              <div
                class="text-3xl font-medium italic tracking-tighter text-white relative z-10"
              >
                {{ data?.social?.peakHour || "22:00" }}
              </div>
              <p
                class="text-[8px] text-slate-600 font-bold uppercase tracking-widest relative z-10"
              >
                En Aktif Zaman
              </p>
            </div>

            <div
              class="md:col-span-3 bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-6 flex flex-col justify-between h-[120px] shadow-xl group"
            >
              <span
                class="text-[9px] font-black text-slate-500 uppercase tracking-widest"
                >İÇERİK KARIŞIMI</span
              >
              <div class="flex items-center gap-4 w-full">
                <div
                  class="flex-1 h-3 bg-white/5 rounded-full overflow-hidden flex"
                >
                  <div
                    :style="{
                      width:
                        ((data?.social?.contentMix?.media /
                          data?.summary?.totalPosts) *
                          100 || 0) + '%',
                    }"
                    class="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    title="Medya"
                  ></div>
                  <div
                    :style="{
                      width:
                        ((data?.social?.contentMix?.docs /
                          data?.summary?.totalPosts) *
                          100 || 0) + '%',
                    }"
                    class="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    title="Döküman"
                  ></div>
                  <div
                    :style="{
                      width:
                        ((data?.social?.contentMix?.textOnly /
                          data?.summary?.totalPosts) *
                          100 || 0) + '%',
                    }"
                    class="h-full bg-slate-700"
                    title="Sadece Metin"
                  ></div>
                </div>
                <div
                  class="flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500"
                >
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    Medya
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    Döküman
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                    Metin
                  </div>
                </div>
              </div>
              <p
                class="text-[8px] text-slate-600 font-bold uppercase tracking-widest"
              >
                Paylaşımların Yapısı
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-10 flex flex-col items-center shadow-2xl"
            >
              <h3
                class="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] w-full text-left mb-10"
              >
                Kategori Dağılımı
              </h3>
              <div class="w-full aspect-square max-w-[220px]">
                <apexchart
                  type="donut"
                  height="100%"
                  :options="categoryDonutOptions"
                  :series="categoryDonutSeries"
                />
              </div>
            </div>
            <div
              class="lg:col-span-2 bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-10 h-[400px] shadow-2xl relative overflow-hidden group"
            >
              <!-- Grafikte Premium Arka Plan Efekti -->
              <div
                class="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-1000"
              ></div>

              <h3
                class="text-white font-medium text-xl tracking-tight leading-none mb-2"
              >
                Aktivite Akışı
              </h3>
              <p
                class="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-10"
              >
                Paylaşım Yoğunluğu (Premium Analiz)
              </p>
              <div class="flex-1 w-full h-[250px]">
                <apexchart
                  type="area"
                  height="100%"
                  :options="areaChartOptions"
                  :series="areaChartSeries"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Kategoriler Tablosu -->
            <section
              class="lg:col-span-2 bg-[#0A0A0C] border border-white/[0.03] rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div class="p-8 border-b border-white/[0.02]">
                <h4 class="text-white font-medium tracking-tight">
                  Kategori Performansı
                </h4>
                <p
                  class="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1"
                >
                  Görmek istediğin kategoriye tıkla
                </p>
              </div>
              <table class="w-full text-left">
                <thead>
                  <tr
                    class="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/[0.02]"
                  >
                    <th class="py-6 px-10">Kategori Adı</th>
                    <th class="py-6 px-10 text-center">Toplam</th>
                    <th class="py-6 px-10 text-center">Etkileşim Skor</th>
                    <th class="py-6 px-10 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.02]">
                  <tr
                    v-for="cat in data?.social?.categories"
                    :key="cat.name"
                    @click="fetchCategoryPosts(cat.id, cat.name)"
                    :class="[
                      'hover:bg-white/[0.02] transition-all cursor-pointer group',
                      selectedCategoryId === cat.id ? 'bg-blue-500/[0.03]' : '',
                    ]"
                  >
                    <td class="py-6 px-10">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                          :style="{ backgroundColor: cat.color }"
                        ></div>
                        <span
                          :class="[
                            'text-xs font-medium uppercase tracking-wider group-hover:text-white transition-colors',
                            selectedCategoryId === cat.id
                              ? 'text-white'
                              : 'text-slate-400',
                          ]"
                          >{{ cat.name }}</span
                        >
                      </div>
                    </td>
                    <td
                      class="py-6 px-10 text-center text-slate-400 font-black tabular-nums"
                    >
                      {{ cat.count }}
                    </td>
                    <td class="py-6 px-10 text-center">
                      <div class="flex flex-col items-center gap-1">
                        <span class="text-[10px] font-black text-blue-500"
                          >{{ cat.engagementRate }}%</span
                        >
                        <div
                          class="w-12 h-1 bg-white/5 rounded-full overflow-hidden"
                        >
                          <div
                            class="h-full bg-blue-500"
                            :style="{ width: cat.engagementRate * 10 + '%' }"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td class="py-6 px-10 text-right">
                      <svg
                        :class="[
                          'w-4 h-4 ml-auto transition-transform',
                          selectedCategoryId === cat.id
                            ? 'rotate-90 text-blue-500'
                            : 'text-slate-700 group-hover:translate-x-1',
                        ]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M9 5l7 7-7 7"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <!-- Kategori Detay / Son Postlar -->
            <section
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col h-[800px]"
            >
              <div
                v-if="!selectedCategoryId"
                class="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30"
              >
                <svg
                  class="w-12 h-12 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <p class="text-[10px] font-black uppercase tracking-[0.2em]">
                  Kategori Seçilmedi
                </p>
              </div>

              <div v-else class="space-y-6 flex-1 flex flex-col">
                <div
                  class="flex items-center justify-between border-b border-white/[0.03] pb-4"
                >
                  <div>
                    <h5
                      class="text-white font-black text-[10px] uppercase tracking-widest"
                    >
                      {{ selectedCategoryName }}
                    </h5>
                    <p
                      class="text-[8px] text-slate-600 font-bold uppercase mt-0.5"
                    >
                      Son Paylaşımlar
                    </p>
                  </div>
                  <button
                    @click="selectedCategoryId = null"
                    class="text-slate-600 hover:text-white transition-colors"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        stroke-width="2.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <div
                  v-if="catPostsLoading"
                  class="flex-1 flex items-center justify-center"
                >
                  <div
                    class="w-6 h-6 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"
                  ></div>
                </div>

                <div
                  v-else-if="categoryPosts.length"
                  class="space-y-3 overflow-y-auto no-scrollbar max-h-[650px]"
                >
                  <div
                    v-for="post in categoryPosts"
                    :key="post.id"
                    @click="$router.push('/post/' + post.id)"
                    class="p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl hover:bg-white/[0.03] transition-all group cursor-pointer"
                  >
                    <div class="flex items-center gap-3 mb-2">
                      <div
                        class="w-6 h-6 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center"
                      >
                        <img
                          v-if="post.author.avatarUrl"
                          :src="getAvatarUrl(post.author.avatarUrl)"
                          class="w-full h-full object-cover"
                        />
                        <span
                          v-else
                          class="text-[8px] font-black text-slate-600"
                          >{{
                            post.author.username.charAt(0).toUpperCase()
                          }}</span
                        >
                      </div>
                      <span class="text-[10px] font-bold text-slate-200"
                        >@{{ post.author.username }}</span
                      >
                    </div>
                    <p
                      class="text-[11px] text-slate-400 line-clamp-2 italic leading-relaxed"
                    >
                      "{{ post.content }}"
                    </p>
                  </div>
                </div>

                <div
                  v-else
                  class="flex-1 flex items-center justify-center text-center opacity-20"
                >
                  <p class="text-[9px] font-black uppercase italic">
                    Bu dönemde paylaşım yok
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- PSİKOLOJİ -->
        <div v-if="activeTab === 'PSİKOLOJİ'" class="space-y-12 text-left">
          <!-- Psikoloji Üst Bilgi Kartları -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-8 flex flex-col justify-between h-[160px] shadow-xl group relative overflow-hidden text-left"
            >
              <div
                class="absolute -right-2 -top-2 text-6xl opacity-10 group-hover:scale-125 transition-transform"
              >
                {{ data?.psychology?.forecast?.icon || "☀️" }}
              </div>
              <span
                class="text-[9px] font-black text-slate-500 uppercase tracking-widest relative z-10"
                >HAVA DURUMU</span
              >
              <div
                class="text-2xl font-black italic text-white relative z-10 uppercase"
              >
                {{ data?.psychology?.forecast?.label || "STABİL" }}
              </div>
              <p
                class="text-[8px] text-slate-600 font-bold uppercase tracking-widest relative z-10"
              >
                Gelecek 6 Saat Tahmini
              </p>
            </div>
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-8 flex flex-col justify-between h-[160px] shadow-xl text-left relative overflow-hidden"
            >
              <span
                class="text-[9px] font-black text-slate-500 uppercase tracking-widest"
                >DUYGU DENGESİ</span
              >
              <div
                class="text-4xl font-medium italic text-emerald-400 tabular-nums"
              >
                %{{ data?.psychology?.emotionalBalance || 0 }}
              </div>
              <p
                class="text-[8px] text-slate-600 font-bold uppercase tracking-widest relative z-10"
              >
                Pozitif Sinyal Oranı
              </p>
            </div>
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-8 flex flex-col justify-between h-[160px] shadow-xl text-left relative overflow-hidden"
            >
              <span
                class="text-[9px] font-black text-slate-500 uppercase tracking-widest text-left"
                >VOLATİLİTE</span
              >
              <div class="flex items-end gap-2 text-left">
                <div class="text-4xl font-medium italic text-orange-400">
                  {{ data?.psychology?.volatility || 0 }}
                </div>
                <span
                  class="text-[10px] font-black text-slate-600 mb-2 uppercase"
                  >/ 10</span
                >
              </div>
              <p
                class="text-[8px] text-slate-600 font-bold uppercase tracking-widest relative z-10 text-left"
              >
                Ruh Hali Değişkenliği
              </p>
            </div>
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-8 flex flex-col justify-between h-[160px] shadow-xl text-left relative overflow-hidden"
            >
              <span
                class="text-[9px] font-black text-slate-500 uppercase tracking-widest text-left"
                >RADİKAL ALAN</span
              >
              <div
                class="text-2xl font-medium italic text-purple-400 uppercase truncate text-left"
              >
                {{ data?.psychology?.mostPolarizedCategory || "KAMPÜS" }}
              </div>
              <p
                class="text-[8px] text-slate-600 font-bold uppercase tracking-widest relative z-10 text-left"
              >
                Duyguların En Uç Yaşandığı Alan
              </p>
            </div>
          </div>

          <!-- DUYGU LİDERLERİ -->
          <div
            class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2.5rem] p-10 shadow-2xl space-y-8"
          >
            <div
              class="flex items-center justify-between border-b border-white/[0.02] pb-6"
            >
              <div>
                <h3
                  class="text-white font-medium text-2xl tracking-tight uppercase italic leading-none"
                >
                  Duygu Liderleri
                </h3>
                <p
                  class="text-[10px] text-slate-600 uppercase font-black tracking-[0.2em] mt-2"
                >
                  Kampüsün Modunu En Çok Etkileyenler
                </p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                v-for="inf in data?.psychology?.influencers"
                :key="inf.username"
                class="p-6 bg-white/[0.01] border border-white/[0.03] rounded-[2rem] flex items-center gap-5 hover:bg-white/[0.03] transition-all group text-left"
              >
                <div
                  class="w-14 h-14 rounded-2xl bg-white/5 overflow-hidden flex-shrink-0"
                >
                  <img
                    v-if="inf.avatarUrl"
                    :src="getAvatarUrl(inf.avatarUrl)"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center font-black text-slate-600"
                  >
                    {{ inf.username.charAt(0) }}
                  </div>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white">
                    @{{ inf.username }}
                  </h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span
                      class="text-[8px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 uppercase"
                      >ETKİ: {{ inf.impact }}</span
                    >
                    <span
                      :class="[
                        'text-[8px] font-black px-2 py-0.5 rounded-full uppercase',
                        inf.dominantMood === 'Pozitif'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400',
                      ]"
                      >{{ inf.dominantMood }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- DUYGU MERCEĞİ -->
          <section
            class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3.5rem] p-10 lg:p-16 shadow-2xl space-y-12 text-left relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-[100px] pointer-events-none"
            ></div>

            <div
              class="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/[0.03] pb-10"
            >
              <div>
                <h3
                  class="text-white font-medium text-3xl tracking-tight uppercase italic leading-none"
                >
                  Duygu Merceği
                </h3>
                <p
                  class="text-[11px] text-slate-600 uppercase font-black tracking-[0.3em] mt-3"
                >
                  Korelasyon ve AI Tutarlılık Testi
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="s in sentiments"
                  :key="s.name"
                  @click="
                    selectedSentiment = s.name;
                    fetchTopPosts();
                  "
                  :class="[
                    'px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2',
                    selectedSentiment === s.name
                      ? 'bg-white/[0.05]'
                      : 'bg-transparent border-white/[0.03] text-slate-600 hover:border-white/10',
                  ]"
                  :style="{
                    borderColor: selectedSentiment === s.name ? s.color : '',
                    color: selectedSentiment === s.name ? s.color : '',
                  }"
                >
                  {{ s.name }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div
                class="bg-white/[0.01] border border-white/[0.03] rounded-[2.5rem] p-8 flex flex-col items-center"
              >
                <h4
                  class="text-[10px] font-black text-slate-600 uppercase tracking-widest w-full mb-6 text-left"
                >
                  Duygu Profili
                </h4>
                <div class="w-full h-[300px]">
                  <apexchart
                    type="radar"
                    height="100%"
                    :options="radarChartOptions"
                    :series="radarChartSeries"
                  />
                </div>
              </div>
              <div
                class="bg-white/[0.01] border border-white/[0.03] rounded-[2.5rem] p-8 flex flex-col text-left"
              >
                <h4
                  class="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 text-left"
                >
                  Skor vs. Etkileşim Korelasyonu
                </h4>
                <div class="flex-1 w-full h-[300px]">
                  <apexchart
                    type="scatter"
                    height="100%"
                    :options="correlationChartOptions"
                    :series="correlationChartSeries"
                  />
                </div>
                <p
                  class="text-[7px] text-slate-700 font-bold uppercase mt-4 text-center"
                >
                  X: SKOR | Y: ETKİLEŞİM | NEON: SİNYAL GÜCÜ
                </p>
              </div>
            </div>

            <div
              class="bg-white/[0.01] border border-white/[0.03] rounded-[2.5rem] p-10 text-left"
            >
              <div class="flex items-center justify-between mb-8">
                <h4
                  class="text-[10px] font-black text-slate-600 uppercase tracking-widest"
                >
                  Zaman Bazlı Skor Dağılımı
                </h4>
                <div class="flex gap-6">
                  <div v-for="stat in currentSentimentStats" :key="stat.label">
                    <p
                      class="text-[8px] font-black text-slate-700 uppercase tracking-widest text-left"
                    >
                      {{ stat.label }}
                    </p>
                    <p
                      :class="[
                        'text-lg font-bold tabular-nums mt-0.5 text-left',
                        stat.color || 'text-white',
                      ]"
                    >
                      {{ stat.value }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="w-full h-[250px]">
                <apexchart
                  type="line"
                  height="100%"
                  :options="anomalyChartOptions"
                  :series="anomalyChartSeries"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div
                v-for="post in topPosts"
                :key="post.id"
                @click="$router.push('/post/' + post.id)"
                class="p-8 bg-white/[0.01] border border-white/[0.03] rounded-[2.5rem] flex gap-6 hover:bg-white/[0.03] transition-all group cursor-pointer relative overflow-hidden text-left"
              >
                <div
                  class="absolute top-0 right-0 px-5 py-2.5 rounded-bl-3xl text-[11px] font-black tabular-nums border-l border-b border-white/[0.05]"
                  :class="[
                    post.sentimentScore > 0.7
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : post.sentimentScore < 0.4
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-blue-400 bg-blue-500/10',
                  ]"
                >
                  SKOR: {{ post.sentimentScore?.toFixed(2) }}
                </div>
                <div
                  class="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden flex-shrink-0"
                >
                  <img
                    v-if="post.author.avatarUrl"
                    :src="getAvatarUrl(post.author.avatarUrl)"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-sm font-black text-slate-600"
                  >
                    {{ post.author.username.charAt(0) }}
                  </div>
                </div>
                <div class="flex-1 space-y-3 pt-1">
                  <span class="text-sm font-bold text-white tracking-tight"
                    >@{{ post.author.username }}</span
                  >
                  <p
                    class="text-sm text-slate-400 italic leading-relaxed line-clamp-2 pr-12"
                  >
                    "{{ post.content }}"
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Alt Katman Grafikler -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-12 flex flex-col items-center shadow-2xl relative overflow-hidden text-left"
            >
              <h3
                class="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] w-full text-left mb-12 relative z-10"
              >
                Genel Dağılım
              </h3>
              <div class="relative w-full aspect-square max-w-[260px] z-10">
                <apexchart
                  type="donut"
                  height="100%"
                  :options="sentimentDonutOptions"
                  :series="sentimentDonutSeries"
                />
              </div>
            </div>
            <div
              class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-12 flex flex-col h-[400px] shadow-2xl relative overflow-hidden group text-left"
            >
              <h3
                class="text-white font-medium text-xl tracking-tight mb-2 text-left"
              >
                Duygu Yoğunluk Haritası
              </h3>
              <div class="flex-1 w-full h-[250px]">
                <apexchart
                  type="heatmap"
                  height="100%"
                  :options="heatmapOptions"
                  :series="heatmapSeries"
                />
              </div>
            </div>
          </div>

          <!-- Kategori Bazlı Duygu Karnesi -->
          <section
            class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div
              class="p-8 border-b border-white/[0.02] flex items-center justify-between"
            >
              <div>
                <h4 class="text-white font-medium tracking-tight">
                  Duygu Karnesi
                </h4>
                <p
                  class="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1"
                >
                  Kategorilerin Ortalama Pozitiflik Puanları
                </p>
              </div>
            </div>
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.02]"
            >
              <div
                v-for="cat in data?.psychology?.categorySentiments"
                :key="cat.name"
                class="bg-[#0A0A0C] p-8 group hover:bg-white/[0.01] transition-colors text-left"
              >
                <div class="flex items-center justify-between mb-4">
                  <span
                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                    >{{ cat.name }}</span
                  >
                  <div
                    :class="[
                      'text-lg font-black italic tracking-tighter',
                      cat.avgScore > 0.6
                        ? 'text-emerald-500'
                        : cat.avgScore < 0.4
                          ? 'text-red-500'
                          : 'text-blue-500',
                    ]"
                  >
                    {{ cat.avgScore }}
                  </div>
                </div>
                <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    :style="{
                      width: cat.avgScore * 100 + '%',
                      backgroundColor:
                        cat.avgScore > 0.6
                          ? '#10b981'
                          : cat.avgScore < 0.4
                            ? '#ef4444'
                            : '#3b82f6',
                    }"
                    class="h-full transition-all duration-1000"
                  ></div>
                </div>
                <div
                  class="flex items-center justify-between mt-3 text-[7px] font-black uppercase tracking-widest"
                >
                  <span class="text-slate-700">{{ cat.postCount }} VERİ</span>
                  <span class="text-purple-500/40 italic"
                    >RADİKALLİK: {{ cat.polarization }}</span
                  >
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- DAYANIŞMA -->
        <div v-if="activeTab === 'EKONOMİ'" class="space-y-10">
          <div
            v-if="!data?.solidarity"
            class="py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-[0.3em]"
          >
            Dayanışma Verileri Hazırlanıyor...
          </div>
          <div v-else class="space-y-10">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Solidarity Pulse -->
              <div
                class="lg:col-span-2 bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-10 h-[400px] shadow-2xl relative overflow-hidden group text-left"
              >
                <div
                  class="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]"
                ></div>
                <h3
                  class="text-white font-medium text-xl tracking-tight leading-none mb-2 text-left"
                >
                  Dayanışma Nabzı
                </h3>
                <p
                  class="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-10 text-left"
                >
                  Yardımlaşma Akış Hızı
                </p>
                <div class="flex-1 w-full h-[250px]">
                  <apexchart
                    :key="'pulse-' + (data?.solidarity?.series?.length || 0)"
                    type="area"
                    height="100%"
                    :options="solidarityPulseOptions"
                    :series="solidarityPulseSeries"
                  />
                </div>
              </div>

              <!-- Efficiency Gauge -->
              <div
                class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden"
              >
                <h3
                  class="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] w-full text-left mb-4"
                >
                  Çözüm Verimliliği
                </h3>
                <div class="w-full aspect-square max-w-[240px]">
                  <apexchart
                    :key="'eff-' + (data?.summary?.solidarityEfficiency || 0)"
                    type="radialBar"
                    height="100%"
                    :options="solidarityEfficiencyOptions"
                    :series="solidarityEfficiencySeries"
                  />
                </div>
                <p
                  class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4 text-center"
                >
                  İhtiyaçların Tamamlanma Oranı
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div
                class="bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] p-10 flex flex-col items-center shadow-2xl text-left"
              >
                <h3
                  class="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] w-full text-left mb-10"
                >
                  Etki Dağılımı
                </h3>
                <div class="w-full aspect-square max-w-[220px]">
                  <apexchart
                    :key="
                      'donut-' + (data?.solidarity?.categories?.length || 0)
                    "
                    type="donut"
                    height="100%"
                    :options="solidarityDonutOptions"
                    :series="solidarityDonutSeries"
                  />
                </div>
              </div>
              <div
                class="lg:col-span-2 bg-[#0A0A0C] border border-white/[0.03] rounded-[3rem] shadow-2xl overflow-hidden text-left"
              >
                <table class="w-full text-left">
                  <thead>
                    <tr
                      class="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/[0.02]"
                    >
                      <th class="py-6 px-10">Kategori</th>
                      <th class="py-6 px-10 text-center">Aktif Süreç</th>
                      <th class="py-6 px-10 text-right">Sosyal Etki</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/[0.02]">
                    <tr
                      v-for="cat in data?.solidarity?.categories"
                      :key="cat.label"
                      class="hover:bg-white/[0.01] transition-colors group"
                    >
                      <td class="py-6 px-10">
                        <div class="flex items-center gap-3">
                          <div
                            class="w-1.5 h-1.5 rounded-full"
                            :style="{ backgroundColor: cat.color }"
                          ></div>
                          <span
                            class="text-xs font-medium text-white uppercase tracking-wider"
                            >{{ cat.label }}</span
                          >
                        </div>
                      </td>
                      <td
                        class="py-6 px-10 text-center text-slate-400 font-black tabular-nums"
                      >
                        {{ cat.count }}
                      </td>
                      <td
                        class="py-6 px-10 text-right text-amber-500 font-black tabular-nums"
                      >
                        {{ cat.impactScore }} PTS
                      </td>
                    </tr>
                    <tr v-if="!data?.solidarity?.categories?.length">
                      <td
                        colspan="3"
                        class="py-20 text-center text-[10px] font-black uppercase italic opacity-30 text-slate-600"
                      >
                        Bu dönemde dayanışma kaydı bulunamadı
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <!-- İSTATİSTİK -->
        <div v-if="activeTab === 'İSTATİSTİK'" class="space-y-10">

          <!-- Yükleniyor -->
          <div v-if="wilcoxonLoading" class="py-32 flex flex-col items-center justify-center gap-6">
            <div class="w-10 h-10 rounded-full border-2 border-white/5 border-t-violet-500 animate-spin"></div>
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">
              İstatistiksel Analiz Hesaplanıyor...
            </p>
          </div>

          <div v-else-if="wilcoxonData" class="space-y-8">

            <!-- Başlık açıklama kartı -->
            <div class="bg-[#0A0A0C] border border-violet-500/10 rounded-[2rem] p-8 relative overflow-hidden">
              <div class="absolute -top-16 -right-16 w-48 h-48 bg-violet-600/5 rounded-full blur-[60px]"></div>
              <div class="flex items-start gap-6 relative z-10">
                <div class="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center shrink-0">
                  <FlaskConical class="w-5 h-5 text-violet-400" />
                </div>
                <div class="space-y-2">
                  <span class="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[8px] font-black rounded-md uppercase tracking-widest">
                    HİPOTEZ TESTİ
                  </span>
                  <h3 class="text-white font-medium text-lg tracking-tight leading-snug mt-2">
                    Wilcoxon Sıra Toplamı Testi
                  </h3>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    Son 1 ay ile önceki 5 aydaki yorum duygu skorları arasında istatistiksel olarak anlamlı bir fark olup olmadığını test eder.
                    Parametrik olmayan bu test, 0–1 arasındaki olasılık skorlarını sıralara dönüştürerek karşılaştırır.
                  </p>
                </div>
              </div>
            </div>

            <!-- İki dönem dağılım kartları -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <!-- Son 1 Ay -->
              <div class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px]"></div>
                <div class="flex items-center justify-between relative z-10">
                  <div>
                    <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Dönem 1</p>
                    <h4 class="text-white font-medium text-xl mt-1">Son 1 Ay</h4>
                  </div>
                  <div class="text-right">
                    <p class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Toplam Yorum</p>
                    <p class="text-2xl font-black text-blue-400 tabular-nums">{{ wilcoxonData.recentPeriod.count }}</p>
                  </div>
                </div>

                <div v-if="wilcoxonData.recentPeriod.dominant" class="flex items-center gap-3 px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-xl relative z-10">
                  <component :is="sentimentIcon(wilcoxonData.recentPeriod.dominant)" class="w-5 h-5 shrink-0" :style="{ color: sentimentColor(wilcoxonData.recentPeriod.dominant) }" />
                  <div>
                    <p class="text-[8px] font-black text-slate-600 uppercase tracking-widest">Baskın Duygu</p>
                    <p class="text-sm font-black text-white">{{ wilcoxonData.recentPeriod.dominant }}</p>
                  </div>
                  <span class="ml-auto text-[10px] font-black text-blue-400 tabular-nums">{{ wilcoxonData.recentPeriod.dominantCount }} yorum</span>
                </div>

                <div class="space-y-2 relative z-10">
                  <p class="text-[8px] font-black text-slate-600 uppercase tracking-[0.25em] mb-3">Duygu Dağılımı</p>
                  <div v-for="item in wilcoxonData.recentPeriod.distribution" :key="item.name" class="flex items-center gap-3">
                    <component :is="sentimentIcon(item.name)" class="w-3.5 h-3.5 shrink-0" :style="{ color: sentimentColor(item.name) }" />
                    <span class="text-[10px] text-slate-500 w-16 truncate">{{ item.name }}</span>
                    <div class="flex-1 h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-700"
                        :style="{
                          width: wilcoxonData.recentPeriod.count > 0 ? (item.count / wilcoxonData.recentPeriod.count * 100) + '%' : '0%',
                          backgroundColor: sentimentColor(item.name)
                        }"
                      ></div>
                    </div>
                    <span class="text-[10px] font-black text-slate-400 tabular-nums w-8 text-right">{{ item.count }}</span>
                    <span class="text-[9px] text-slate-600 tabular-nums w-10 text-right">{{ item.avgScore.toFixed(2) }}</span>
                  </div>
                </div>

                <div v-if="wilcoxonData.testApplied" class="flex justify-between items-center px-4 py-3 bg-white/[0.02] rounded-xl relative z-10">
                  <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ort. {{ wilcoxonData.targetSentiment }} Skoru</span>
                  <span class="text-lg font-black text-blue-400 tabular-nums">{{ wilcoxonData.recentPeriod.avgScore?.toFixed(3) }}</span>
                </div>
              </div>

              <!-- Önceki 5 Ay -->
              <div class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px]"></div>
                <div class="flex items-center justify-between relative z-10">
                  <div>
                    <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Dönem 2</p>
                    <h4 class="text-white font-medium text-xl mt-1">Önceki 5 Ay</h4>
                  </div>
                  <div class="text-right">
                    <p class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Toplam Yorum</p>
                    <p class="text-2xl font-black text-emerald-400 tabular-nums">{{ wilcoxonData.olderPeriod.count }}</p>
                  </div>
                </div>

                <div v-if="wilcoxonData.olderPeriod.dominant" class="flex items-center gap-3 px-4 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl relative z-10">
                  <component :is="sentimentIcon(wilcoxonData.olderPeriod.dominant)" class="w-5 h-5 shrink-0" :style="{ color: sentimentColor(wilcoxonData.olderPeriod.dominant) }" />
                  <div>
                    <p class="text-[8px] font-black text-slate-600 uppercase tracking-widest">Baskın Duygu</p>
                    <p class="text-sm font-black text-white">{{ wilcoxonData.olderPeriod.dominant }}</p>
                  </div>
                  <span class="ml-auto text-[10px] font-black text-emerald-400 tabular-nums">{{ wilcoxonData.olderPeriod.dominantCount }} yorum</span>
                </div>

                <div class="space-y-2 relative z-10">
                  <p class="text-[8px] font-black text-slate-600 uppercase tracking-[0.25em] mb-3">Duygu Dağılımı</p>
                  <div v-for="item in wilcoxonData.olderPeriod.distribution" :key="item.name" class="flex items-center gap-3">
                    <component :is="sentimentIcon(item.name)" class="w-3.5 h-3.5 shrink-0" :style="{ color: sentimentColor(item.name) }" />
                    <span class="text-[10px] text-slate-500 w-16 truncate">{{ item.name }}</span>
                    <div class="flex-1 h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-700"
                        :style="{
                          width: wilcoxonData.olderPeriod.count > 0 ? (item.count / wilcoxonData.olderPeriod.count * 100) + '%' : '0%',
                          backgroundColor: sentimentColor(item.name)
                        }"
                      ></div>
                    </div>
                    <span class="text-[10px] font-black text-slate-400 tabular-nums w-8 text-right">{{ item.count }}</span>
                    <span class="text-[9px] text-slate-600 tabular-nums w-10 text-right">{{ item.avgScore.toFixed(2) }}</span>
                  </div>
                </div>

                <div v-if="wilcoxonData.testApplied" class="flex justify-between items-center px-4 py-3 bg-white/[0.02] rounded-xl relative z-10">
                  <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ort. {{ wilcoxonData.targetSentiment }} Skoru</span>
                  <span class="text-lg font-black text-emerald-400 tabular-nums">{{ wilcoxonData.olderPeriod.avgScore?.toFixed(3) }}</span>
                </div>
              </div>
            </div>

            <!-- Test uygulanamadı -->
            <div v-if="!wilcoxonData.testApplied" class="bg-[#0A0A0C] border border-amber-500/10 rounded-[2rem] p-10 flex items-start gap-6">
              <div class="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle class="w-5 h-5 text-amber-400" />
              </div>
              <div class="space-y-2">
                <p class="text-[9px] font-black text-amber-500/70 uppercase tracking-widest">Test Uygulanamadı</p>
                <p class="text-white font-medium text-sm leading-relaxed">{{ wilcoxonData.reason }}</p>
                <p class="text-[10px] text-slate-600 mt-2">
                  Wilcoxon testi ancak her iki dönemde de aynı duygunun baskın çıktığı durumlarda uygulanabilir.
                </p>
              </div>
            </div>

            <!-- Test sonuçları -->
            <div v-if="wilcoxonData.testApplied && wilcoxonData.test" class="space-y-6">

              <!-- Hipotezler -->
              <div class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-8 space-y-4">
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Hipotezler</p>
                <div class="space-y-3">
                  <div class="flex items-start gap-4 p-4 bg-white/[0.02] rounded-xl">
                    <span class="px-2 py-0.5 bg-slate-700 text-slate-300 text-[9px] font-black rounded uppercase tracking-widest shrink-0 mt-0.5">H0</span>
                    <p class="text-[11px] text-slate-400 leading-relaxed">{{ wilcoxonData.test.h0 }}</p>
                  </div>
                  <div class="flex items-start gap-4 p-4 bg-white/[0.02] rounded-xl">
                    <span class="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-[9px] font-black rounded uppercase tracking-widest shrink-0 mt-0.5">H1</span>
                    <p class="text-[11px] text-slate-400 leading-relaxed">{{ wilcoxonData.test.h1 }}</p>
                  </div>
                </div>
              </div>

              <!-- İstatistik değerleri -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-[#0A0A0C] border border-white/[0.03] rounded-2xl p-6 flex flex-col gap-2">
                  <p class="text-[8px] font-black text-slate-600 uppercase tracking-widest">U İstatistiği</p>
                  <p class="text-2xl font-black text-white tabular-nums">{{ wilcoxonData.test.U }}</p>
                </div>
                <div class="bg-[#0A0A0C] border border-white/[0.03] rounded-2xl p-6 flex flex-col gap-2">
                  <p class="text-[8px] font-black text-slate-600 uppercase tracking-widest">Z Skoru</p>
                  <p class="text-2xl font-black text-white tabular-nums">{{ wilcoxonData.test.z }}</p>
                </div>
                <div class="bg-[#0A0A0C] border border-white/[0.03] rounded-2xl p-6 flex flex-col gap-2">
                  <p class="text-[8px] font-black text-slate-600 uppercase tracking-widest">p-değeri</p>
                  <p class="text-2xl font-black tabular-nums" :class="wilcoxonData.test.significant ? 'text-rose-400' : 'text-emerald-400'">
                    {{ wilcoxonData.test.pValue.toFixed(4) }}
                  </p>
                </div>
                <div class="bg-[#0A0A0C] border border-white/[0.03] rounded-2xl p-6 flex flex-col gap-2">
                  <p class="text-[8px] font-black text-slate-600 uppercase tracking-widest">Anlamlılık Düzeyi</p>
                  <p class="text-2xl font-black text-slate-300 tabular-nums">α = {{ wilcoxonData.test.alpha }}</p>
                </div>
              </div>

              <!-- Sonuç kutusu -->
              <div
                :class="[
                  'rounded-[2rem] p-8 border flex items-start gap-6 relative overflow-hidden',
                  wilcoxonData.test.significant
                    ? 'bg-rose-500/[0.04] border-rose-500/20'
                    : 'bg-emerald-500/[0.04] border-emerald-500/20'
                ]"
              >
                <div
                  :class="[
                    'absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[60px]',
                    wilcoxonData.test.significant ? 'bg-rose-500/10' : 'bg-emerald-500/10'
                  ]"
                ></div>
                <div
                  :class="[
                    'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border',
                    wilcoxonData.test.significant
                      ? 'bg-rose-500/10 border-rose-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/20'
                  ]"
                >
                  <component :is="wilcoxonData.test.significant ? BarChart2 : TrendingUp" class="w-6 h-6" :class="wilcoxonData.test.significant ? 'text-rose-400' : 'text-emerald-400'" />
                </div>
                <div class="space-y-3 relative z-10">
                  <span
                    :class="[
                      'px-3 py-1 text-[8px] font-black rounded-md uppercase tracking-widest border',
                      wilcoxonData.test.significant
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    ]"
                  >
                    {{ wilcoxonData.test.significant ? 'H0 Reddedildi' : 'H0 Reddedilemedi' }}
                  </span>
                  <p class="text-white font-medium text-sm leading-relaxed">
                    {{ wilcoxonData.test.conclusion }}
                  </p>
                  <p class="text-[10px] text-slate-500 leading-relaxed">
                    <template v-if="wilcoxonData.test.significant">
                      İki dönem arasında istatistiksel olarak anlamlı bir fark saptandı. Bu, kampüs duygusal ikliminin zaman içinde değiştiğine işaret eder.
                    </template>
                    <template v-else>
                      İki dönem arasında istatistiksel olarak anlamlı bir fark saptanamadı. Kampüsteki duygusal iklim istikrarlı seyrini sürdürmektedir.
                    </template>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Hata durumu -->
          <div v-else-if="!wilcoxonLoading" class="py-32 text-center">
            <p class="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Veri Yüklenemedi</p>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h, watch } from "vue";
import { useCampusStore } from "@/stores/campus";
import { useToast } from "vue-toastification";
import VueApexCharts from "vue3-apexcharts";
import apiClient from "@/api/client";

const apexchart = VueApexCharts;
const toast = useToast();
const campusStore = useCampusStore();

import {
  LayoutDashboard,
  Users,
  Brain,
  HandHelping,
  LogOut,
  ChevronLeft,
  FlaskConical,
  Smile,
  Frown,
  Flame,
  ShieldAlert,
  Wind,
  Lightbulb,
  Minus,
  AlertTriangle,
  BarChart2,
  TrendingUp,
} from "lucide-vue-next";

const activeTab = ref("GENEL");
const interval = ref("day");

const loading = computed(() => campusStore.loading);
const data = computed(() => campusStore.analytics);

const topPosts = ref<any[]>([]);
const topPostsLoading = ref(false);
const selectedSentiment = ref("Neşeli");
const sentiments = [
  { name: "Neşeli", color: "#10b981" },
  { name: "Hüzünlü", color: "#3b82f6" },
  { name: "Kızgın", color: "#ef4444" },
  { name: "Endişeli", color: "#f59e0b" },
  { name: "Sakin", color: "#14b8a6" },
  { name: "Meraklı", color: "#8b5cf6" },
  { name: "Ciddi", color: "#64748b" },
];

const selectedCategoryId = ref<number | null>(null);
const selectedCategoryName = ref("");
const categoryPosts = ref<any[]>([]);
const catPostsLoading = ref(false);

const menuItems = [
  { id: "GENEL", label: "ÖZET", icon: LayoutDashboard },
  { id: "SOSYAL", label: "SOSYAL", icon: Users },
  { id: "PSİKOLOJİ", label: "PSİKOLOJİ", icon: Brain },
  { id: "EKONOMİ", label: "DAYANIŞMA", icon: HandHelping },
  { id: "İSTATİSTİK", label: "İSTATİSTİK", icon: FlaskConical },
];

const timeOptions = [
  { id: "hour", label: "24 SAAT" },
  { id: "day", label: "7 GÜN" },
  { id: "week", label: "30 GÜN" },
  { id: "7months", label: "7 AY" },
  { id: "4years", label: "4 YIL" },
];

const activeTabLabel = computed(
  () => menuItems.find((m) => m.id === activeTab.value)?.label || "ANALİZ",
);
const currentIntervalLabel = computed(
  () => timeOptions.find((t) => t.id === interval.value)?.label || "HAFTALIK",
);

const summaryStats = computed(() => [
  {
    label: "TOPLAM GÖNDERİ",
    value: campusStore.analytics?.summary?.totalPosts || 0,
  },
  {
    label: "ETKİLEŞİM",
    value: campusStore.analytics?.summary?.totalInteractions || 0,
  },
  {
    label: "ETKİLEŞİM ORANI",
    value: campusStore.analytics?.summary?.interactionRate || 0,
  },
  { label: "YENİ ÜYE", value: campusStore.analytics?.summary?.newUsers || 0 },
  {
    label: "DAYANIŞMA ADEDİ",
    value: campusStore.analytics?.summary?.solidarityCount || 0,
  },
  {
    label: "SOSYAL ETKİ",
    value:
      (campusStore.analytics?.summary?.solidarityImpact || 0).toLocaleString() +
      " PTS",
  },
]);

const solidarityKPIs = computed(() => [
  {
    label: "Topluluk Etkisi",
    value:
      (campusStore.analytics?.summary?.solidarityImpact || 0).toLocaleString() +
      " PTS",
    color: "text-white",
  },
  {
    label: "Çözüm Verimliliği",
    value: "%" + (campusStore.analytics?.summary?.solidarityEfficiency || 0),
    color: "text-blue-400",
  },
  {
    label: "Aktif Destekler",
    value: campusStore.analytics?.summary?.solidarityCount || 0,
    color: "text-emerald-400",
  },
]);

const wilcoxonData = ref<any>(null);
const wilcoxonLoading = ref(false);

const SENTIMENT_COLORS: Record<string, string> = {
  Neşeli: "#10b981",
  Hüzünlü: "#3b82f6",
  Kızgın: "#ef4444",
  Endişeli: "#f59e0b",
  Sakin: "#14b8a6",
  Meraklı: "#8b5cf6",
  Ciddi: "#64748b",
};

const SENTIMENT_ICONS: Record<string, any> = {
  Neşeli: Smile,
  Hüzünlü: Frown,
  Kızgın: Flame,
  Endişeli: ShieldAlert,
  Sakin: Wind,
  Meraklı: Lightbulb,
  Ciddi: Minus,
};

const sentimentColor = (name: string) => SENTIMENT_COLORS[name] ?? "#64748b";
const sentimentIcon = (name: string) => SENTIMENT_ICONS[name] ?? Minus;

const fetchWilcoxon = async () => {
  wilcoxonLoading.value = true;
  try {
    const res = await apiClient.get("/campus/analytics/wilcoxon");
    wilcoxonData.value = res.data;
  } catch {
    toast.error("İstatistiksel analiz yüklenemedi");
  } finally {
    wilcoxonLoading.value = false;
  }
};

const fetchAnalytics = async () => {
  await campusStore.fetchAnalytics(interval.value);
  if (activeTab.value === "PSİKOLOJİ") fetchTopPosts();
};

const fetchTopPosts = async () => {
  topPostsLoading.value = true;
  try {
    const res = await apiClient.get(
      `/campus/analytics/top-sentiment?sentiment=${selectedSentiment.value}&interval=${interval.value}`,
    );
    topPosts.value = res.data;
  } catch {
    toast.error("Popüler içerikler yüklenemedi");
  } finally {
    topPostsLoading.value = false;
  }
};

const fetchCategoryPosts = async (catId: number, catName: string) => {
  selectedCategoryId.value = catId;
  selectedCategoryName.value = catName;
  catPostsLoading.value = true;
  try {
    const res = await apiClient.get(
      `/campus/analytics/category-posts?categoryId=${catId}&interval=${interval.value}`,
    );
    categoryPosts.value = res.data;
  } catch {
    toast.error("Kategori içerikleri yüklenemedi");
  } finally {
    catPostsLoading.value = false;
  }
};

const getAvatarUrl = (path: string) => campusStore.getAvatarUrl(path);

watch(activeTab, (newTab) => {
  if (newTab === "PSİKOLOJİ") {
    fetchTopPosts();
  } else if (newTab === "SOSYAL" && selectedCategoryId.value) {
    fetchCategoryPosts(selectedCategoryId.value, selectedCategoryName.value);
  } else if (newTab === "İSTATİSTİK" && !wilcoxonData.value) {
    fetchWilcoxon();
  }
});

const categoryDonutOptions = computed(() => ({
  chart: { type: "donut", background: "transparent" },
  labels:
    campusStore.analytics?.social?.categories?.map((c: any) => c.name) || [],
  colors: campusStore.analytics?.social?.categories?.map(
    (c: any) => c.color,
  ) || ["#3b82f6"],
  stroke: { show: false },
  legend: { position: "bottom", labels: { colors: "#64748b" } },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: "85%" } } },
}));
const categoryDonutSeries = computed(
  () =>
    campusStore.analytics?.social?.categories?.map((c: any) => c.count) || [],
);

const barChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, background: "transparent" },
  plotOptions: {
    bar: { columnWidth: "40%", borderRadius: 10, distributed: true },
  },
  xaxis: {
    categories:
      campusStore.analytics?.timeSeries?.map((p: any) => p.label) || [],
    labels: { style: { colors: "#475569", fontSize: "10px" } },
  },
  yaxis: { labels: { show: false } },
  grid: { borderColor: "#ffffff03" },
  legend: { show: false },
}));
const barChartSeries = computed(() => [
  {
    name: "Gönderi",
    data: campusStore.analytics?.timeSeries?.map((p: any) => p.count) || [],
  },
]);

const areaChartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    background: "transparent",
    sparkline: { enabled: false },
  },
  stroke: { curve: "smooth", width: 3, colors: ["#3b82f6"] },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100],
      colorStops: [
        { offset: 0, color: "#3b82f6", opacity: 0.4 },
        { offset: 100, color: "#3b82f6", opacity: 0 },
      ],
    },
  },
  xaxis: {
    categories:
      campusStore.analytics?.timeSeries?.map((p: any) => p.label) || [],
    labels: { style: { colors: "#475569", fontSize: "10px", fontWeight: 800 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { show: false } },
  grid: { borderColor: "#ffffff03", strokeDashArray: 4 },
  markers: { size: 0, hover: { size: 5 } },
  tooltip: { theme: "dark" },
}));
const areaChartSeries = computed(() => [
  {
    name: "Aktivite",
    data: campusStore.analytics?.timeSeries?.map((p: any) => p.count) || [],
  },
]);

const sentimentDonutOptions = computed(() => {
  const distribution = campusStore.analytics?.psychology?.distribution || [];
  // Backend'den gelen label sırasına göre renkleri sentiments array'inden eşleştirelim
  const colors = distribution.map(
    (d: any) => sentiments.find((s) => s.name === d.label)?.color || "#3b82f6",
  );

  return {
    chart: {
      type: "donut",
      background: "transparent",
      events: {
        dataPointSelection: (event: any, chartContext: any, config: any) => {
          const sentimentName = config.w.config.labels[config.dataPointIndex];
          if (sentimentName) {
            selectedSentiment.value = sentimentName;
            fetchTopPosts();
          }
        },
      },
    },
    labels: distribution.map((s: any) => s.label),
    colors: colors,
    stroke: { show: true, width: 2, colors: ["#0A0A0C"] },
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "82%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "9px",
              fontWeight: 900,
              color: "#64748b",
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 500,
              color: "#fff",
              offsetY: 10,
              formatter: (val: any) => val,
            },
            total: {
              show: true,
              label: "KAMPÜS MODU",
              color: "#64748b",
              fontSize: "8px",
              fontWeight: 900,
              formatter: (w: any) => {
                const total = w.globals.seriesTotals.reduce(
                  (a: any, b: any) => a + b,
                  0,
                );
                return total > 0 ? "AKTİF" : "SESSİZ";
              },
            },
          },
        },
      },
    },
    tooltip: { theme: "dark" },
  };
});
const sentimentDonutSeries = computed(
  () =>
    campusStore.analytics?.psychology?.distribution?.map((s: any) => s.count) ||
    [],
);

const lineChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, background: "transparent" },
  stroke: { curve: "smooth", width: 4 },
  colors: ["#6366f1"],
  xaxis: {
    categories:
      campusStore.analytics?.timeSeries?.map((p: any) => p.label) || [],
    labels: { style: { colors: "#475569", fontSize: "10px" } },
  },
  yaxis: { min: 0, max: 1, labels: { show: false } },
  grid: { borderColor: "#ffffff03" },
}));
const lineChartSeries = computed(() => [
  {
    name: "Motivasyon",
    data:
      campusStore.analytics?.timeSeries?.map((p: any) =>
        p.avgSentiment.toFixed(2),
      ) || [],
  },
]);

const heatmapOptions = computed(() => ({
  chart: {
    type: "heatmap",
    toolbar: { show: false },
    background: "transparent",
  },
  dataLabels: { enabled: false },
  colors: ["#3b82f6"],
  xaxis: {
    categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    labels: { style: { colors: "#475569", fontSize: "9px" } },
  },
  yaxis: {
    labels: { style: { colors: "#64748b", fontSize: "10px", fontWeight: 700 } },
  },
  grid: { show: false },
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      radius: 4,
      useFillColorAsStroke: false,
      colorScale: {
        ranges: [
          { from: 0, to: 0, name: "Sessiz", color: "#1e293b" },
          { from: 1, to: 5, name: "Düşük", color: "#1d4ed8" },
          { from: 6, to: 15, name: "Orta", color: "#3b82f6" },
          { from: 16, to: 100, name: "Yüksek", color: "#60a5fa" },
        ],
      },
    },
  },
}));

const heatmapSeries = computed(() => {
  const matrix = campusStore.analytics?.psychology?.matrix || {};
  return Object.entries(matrix).map(([name, points]: any) => ({
    name: name.toUpperCase(),
    data: points.map((val: number, i: number) => ({ x: `${i}:00`, y: val })),
  }));
});

// DAYANIŞMA GRAFİKLERİ
const solidarityPulseOptions = computed(() => ({
  chart: { toolbar: { show: false }, background: "transparent" },
  stroke: { curve: "smooth", width: [3, 2], dashArray: [0, 5] },
  fill: {
    type: "gradient",
    gradient: { opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] },
  },
  xaxis: {
    categories:
      campusStore.analytics?.solidarity?.series?.map((s: any) => s.label) || [],
    labels: { style: { colors: "#475569", fontSize: "10px" } },
  },
  yaxis: { show: false },
  grid: { borderColor: "#ffffff03" },
  colors: ["#f59e0b", "#d4af37"],
  legend: {
    position: "top",
    horizontalAlign: "right",
    labels: { colors: "#64748b" },
    markers: { radius: 12 },
  },
}));

const solidarityPulseSeries = computed(() => [
  {
    name: "Yardım Talepleri",
    data:
      campusStore.analytics?.solidarity?.series?.map((s: any) => s.count) || [],
  },
  {
    name: "Çözülen İhtiyaçlar",
    data:
      campusStore.analytics?.solidarity?.series?.map((s: any) => s.completed) ||
      [],
  },
]);

const solidarityEfficiencyOptions = computed(() => ({
  chart: { type: "radialBar" },
  plotOptions: {
    radialBar: {
      hollow: { size: "70%" },
      track: { background: "#ffffff05" },
      dataLabels: {
        name: {
          show: true,
          label: "VERİMLİLİK",
          color: "#64748b",
          fontSize: "10px",
          fontWeight: 900,
          offsetY: -10,
        },
        value: {
          show: true,
          color: "#fff",
          fontSize: "24px",
          fontWeight: 500,
          offsetY: 5,
          formatter: (v: any) => "%" + v,
        },
      },
    },
  },
  colors: ["#f59e0b"],
  stroke: { lineCap: "round" },
}));

const solidarityEfficiencySeries = computed(() => [
  campusStore.analytics?.summary?.solidarityEfficiency || 0,
]);

const solidarityDonutOptions = computed(() => ({
  chart: { type: "donut", background: "transparent" },
  labels:
    campusStore.analytics?.solidarity?.categories?.map((c: any) => c.label) ||
    [],
  colors: ["#f59e0b", "#d4af37", "#fbbf24", "#926239", "#78350f"],
  stroke: { show: false },
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: "85%" } } },
}));
const solidarityDonutSeries = computed(
  () =>
    campusStore.analytics?.solidarity?.categories?.map((c: any) => c.count) ||
    [],
);

// --- PSİKOLOJİ SEKRESİ VERİ İŞLEME (DEEP DIVE) ---

const radarChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, background: "transparent" },
  xaxis: {
    categories: ["YOĞUNLUK", "ETKİLEŞİM", "İSTİKRAR"],
    labels: {
      style: {
        colors: ["#64748b", "#64748b", "#64748b"],
        fontSize: "9px",
        fontWeight: 900,
      },
    },
  },
  yaxis: { show: false, min: 0, max: 1 },
  colors: [
    sentiments.find((s) => s.name === selectedSentiment.value)?.color ||
      "#3b82f6",
  ],
  fill: { opacity: 0.4 },
}));

const radarChartSeries = computed(() => {
  const dive = data.value?.psychology?.deepDive?.find(
    (d: any) => d.label === selectedSentiment.value,
  );
  // Etkileşimi 0-1 arasına normalize ediyoruz (max 20 etkileşim gibi varsayıyoruz)
  return [
    {
      name: dive?.label || "Duygu",
      data: [
        dive?.avgIntensity || 0,
        Math.min((dive?.avgEngagement || 0) / 20, 1),
        dive?.stability || 0,
      ],
    },
  ];
});

const correlationChartOptions = computed(() => {
  const themeColor =
    sentiments.find((s) => s.name === selectedSentiment.value)?.color ||
    "#3b82f6";

  return {
    chart: {
      type: "scatter",
      toolbar: { show: false },
      background: "transparent",
      dropShadow: {
        enabled: true,
        blur: 10,
        left: 0,
        top: 0,
        color: themeColor,
        opacity: 0.7,
      },
    },
    xaxis: {
      type: "numeric", // Eksen tipini sayısal olarak sabitledik
      min: 0,
      max: 1,
      tickAmount: 5, // 0.2'lik dilimler için 5 tick
      decimalsInFloat: 1, // Ondalık basamak sayısını zorladık
      labels: {
        style: { colors: "#475569", fontSize: "9px", fontWeight: 900 },
        formatter: (val: any) => {
          return parseFloat(val).toFixed(1); // Kesin ondalık formatı
        },
      },
      title: {
        text: "AI DUYGU PUANI",
        style: {
          color: "#334155",
          fontSize: "8px",
          fontWeight: 900,
          letterSpacing: "0.2em",
        },
      },
      axisBorder: { show: true, color: "#ffffff05" },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: { colors: "#475569", fontSize: "9px", fontWeight: 900 },
        formatter: (val: number) => Math.floor(val).toString(), // Sadece tam sayı göster
      },
      title: {
        text: "ETKİLEŞİM",
        style: {
          color: "#334155",
          fontSize: "8px",
          fontWeight: 900,
          letterSpacing: "0.2em",
        },
      },
    },
    colors: [themeColor],
    markers: {
      size: 7,
      strokeWidth: 2,
      strokeColors: "#fff",
      strokeOpacity: 1,
      fillOpacity: 1,
      shape: "square", // Noktalar artık teknik kare bloklar
      radius: 0,
      hover: {
        size: 10,
        strokeWidth: 0,
      },
    },
    grid: {
      borderColor: "#ffffff03",
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    annotations: {
      position: "back",
      xaxis: [{ x: 0.5, borderColor: themeColor + "30", strokeDashArray: 4 }],
      yaxis: [{ y: 15, borderColor: themeColor + "30", strokeDashArray: 4 }],
      points: [
        {
          x: 0.85,
          y: 35,
          label: {
            text: "VİRAL PAYLAŞIMLAR",
            style: {
              background: themeColor,
              color: "#fff",
              fontSize: "7px",
              fontWeight: 900,
            },
          },
        },
        {
          x: 0.15,
          y: 35,
          label: {
            text: "ANOMALİ / TARTIŞMALI",
            style: {
              background: "#ef4444",
              color: "#fff",
              fontSize: "7px",
              fontWeight: 900,
            },
          },
        },
      ],
    },
    tooltip: {
      theme: "dark",
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        const d = w.config.series[seriesIndex].data[dataPointIndex];
        return (
          '<div class="px-4 py-3 bg-[#0A0A0C]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">' +
          '<div class="flex items-center gap-2 mb-2"><div class="w-2 h-2 bg-white"></div>' +
          '<span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Veri Bloğu</span></div>' +
          '<div class="text-[12px] text-white">Duygu Puanı: <span class="font-black" style="color:' +
          themeColor +
          '">' +
          d.x +
          "</span></div>" +
          '<div class="text-[12px] text-white">Etkileşim: <span class="font-black text-blue-400">' +
          d.y +
          "</span></div>" +
          "</div>"
        );
      },
    },
  };
});

const correlationChartSeries = computed(() => {
  const dive = data.value?.psychology?.deepDive?.find(
    (d: any) => d.label === selectedSentiment.value,
  );
  if (!dive?.samples) return [{ name: "Veri", data: [] }];
  return [
    {
      name: "Analiz Noktası",
      data: dive.samples.map((s: any) => ({
        x: parseFloat(s.score || 0),
        y: parseInt(s.engagement || 0),
      })),
    },
  ];
});

const anomalyChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, background: "transparent" },
  stroke: { curve: "smooth", width: 3 },
  xaxis: {
    categories: Array.from({ length: 20 }, (_, i) => i + 1),
    labels: { show: false },
  },
  yaxis: { min: 0, max: 1, labels: { style: { colors: "#475569" } } },
  grid: { borderColor: "#ffffff03" },
  colors: [
    sentiments.find((s) => s.name === selectedSentiment.value)?.color ||
      "#3b82f6",
  ],
}));

const anomalyChartSeries = computed(() => {
  const dive = data.value?.psychology?.deepDive?.find(
    (d: any) => d.label === selectedSentiment.value,
  );
  return [
    { name: "Skor", data: dive?.samples?.map((s: any) => s.score) || [] },
  ];
});

const currentSentimentStats = computed(() => {
  const dive = data.value?.psychology?.deepDive?.find(
    (d: any) => d.label === selectedSentiment.value,
  );
  if (!dive) return [];
  return [
    { label: "YOĞUNLUK", value: dive.avgIntensity, color: "text-blue-500" },
    { label: "ETKİLEŞİM", value: dive.avgEngagement, color: "text-amber-500" },
    {
      label: "GÜVEN",
      value: "%" + Math.round(dive.stability * 100),
      color: "text-emerald-500",
    },
  ];
});

onMounted(fetchAnalytics);
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
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
