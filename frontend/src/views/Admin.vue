<template>
  <div
    class="min-h-screen bg-[#050505] text-slate-400 font-sans selection:bg-blue-500/30 antialiased overflow-x-hidden flex flex-col relative"
  >
    <!-- ZEMİN DOKUSU -->
    <div
      class="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"
    ></div>

    <!-- DOCK MENÜ -->
    <header
      class="fixed top-4 md:top-8 left-0 right-0 md:left-1/2 md:-translate-x-1/2 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] w-full md:max-w-fit px-4"
    >
      <nav
        class="bg-[#0A0A0C]/90 backdrop-blur-2xl border border-white/[0.04] rounded-2xl md:rounded-full p-1.5 flex items-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative"
      >
        <div
          class="flex items-center px-3 md:px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] mr-2 md:mr-3 ml-1 group cursor-default hover:bg-white/[0.06] transition-all duration-500 flex-shrink-0"
        >
          <div class="flex flex-col items-start leading-none">
            <span
              class="text-[9px] md:text-[10px] font-bold text-white tracking-[0.2em] uppercase opacity-90 group-hover:opacity-100 transition-opacity"
              >MAKUtalk</span
            >
            <span
              class="text-[7px] md:text-[8px] font-semibold text-blue-400 tracking-widest uppercase mt-0.5"
              >Kumanda Odası</span
            >
          </div>
          <div
            class="ml-2 md:ml-3 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          ></div>
        </div>

        <div
          class="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar px-2 md:px-0"
        >
          <button
            v-for="m in menuItems"
            :key="m.id"
            @click="activeTab = m.id"
            :class="[
              'h-9 md:h-10 rounded-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative group flex-shrink-0',
              activeTab === m.id
                ? 'px-4 md:px-5 text-white bg-white/[0.02]'
                : 'w-9 md:w-10 px-0 text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]',
            ]"
          >
            <component
              :is="m.icon"
              :class="[
                'w-3.5 h-3.5 md:w-4 md:h-4 transition-all duration-500 relative z-10',
                activeTab === m.id ? 'text-white' : '',
              ]"
            />
            <span
              :class="[
                'font-semibold uppercase tracking-[0.2em] text-[8px] md:text-[9px] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10',
                activeTab === m.id
                  ? 'max-w-[100px] ml-2 opacity-100'
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

        <div class="hidden md:block w-px h-6 bg-white/[0.04] mx-3"></div>

        <!-- Premium Çıkış Butonu -->
        <router-link
          to="/"
          class="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-slate-500 transition-all duration-500 relative group/exit flex-shrink-0"
        >
          <div
            class="absolute inset-0 rounded-full bg-rose-500/0 group-hover/exit:bg-rose-500/10 group-hover/exit:scale-150 transition-all duration-700 blur-xl"
          ></div>
          <div
            class="absolute inset-0 rounded-full border border-rose-500/0 group-hover/exit:border-rose-500/20 group-hover/exit:scale-110 transition-all duration-500"
          ></div>
          <svg
            class="w-4 h-4 relative z-10 group-hover/exit:text-rose-500 group-hover/exit:translate-x-1 transition-all duration-500 ease-out"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </router-link>
      </nav>
    </header>

    <main
      class="flex-1 w-full max-w-[1400px] mx-auto px-8 pt-36 pb-24 relative z-10"
    >
      <!-- ÖZET METRİKLER -->
      <section
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-10"
      >
        <div
          v-for="(stat, i) in summaryStats"
          :key="i"
          class="bg-[#0A0A0C] border border-white/[0.03] rounded-[1.5rem] p-6 hover:border-white/[0.08] transition-colors duration-500 flex flex-col justify-between h-[120px]"
        >
          <div class="flex items-center justify-between">
            <p
              class="text-[9px] font-medium text-slate-500 uppercase tracking-widest"
            >
              {{ stat.label }}
            </p>
            <component :is="stat.icon" class="w-3.5 h-3.5 text-slate-600" />
          </div>
          <h4 class="text-3xl font-medium text-white tracking-tight">
            {{ stat.value || 0 }}
          </h4>
        </div>
      </section>

      <!-- GRAFİKLER -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div
          class="col-span-1 lg:col-span-2 bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-8 flex flex-col"
        >
          <div class="flex items-center justify-between mb-8">
            <div>
              <h3 class="text-white font-medium text-sm tracking-wide">
                Ağ Aktivitesi
              </h3>
              <p
                class="text-[10px] text-slate-500 uppercase tracking-wider mt-1"
              >
                Gerçek Zamanlı Sinyal Yoğunluğu
              </p>
            </div>
            <div
              class="px-3 py-1 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center gap-2"
            >
              <span
                class="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"
              ></span>
              <span
                class="text-[8px] font-semibold text-slate-300 uppercase tracking-widest"
                >Canlı</span
              >
            </div>
          </div>
          <div class="flex-1 min-h-[240px] w-full">
            <apexchart
              type="line"
              height="100%"
              :options="chartOptions"
              :series="mainChartSeries"
            />
          </div>
        </div>

        <div
          class="col-span-1 bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-8 flex flex-col items-center relative overflow-hidden"
        >
          <h3
            class="text-slate-500 font-semibold text-[9px] uppercase tracking-[0.2em] w-full text-left mb-6"
          >
            Duygu Analizi
          </h3>
          <div class="relative w-full aspect-square max-w-[180px] mb-8">
            <apexchart
              type="donut"
              height="100%"
              :options="donutOptions"
              :series="donutSeries"
            />
            <div
              class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              <span class="text-2xl font-medium text-white tracking-tighter">{{
                stats?.totalPosts || 0
              }}</span>
              <span
                class="text-[8px] text-slate-600 font-bold uppercase tracking-widest"
                >Post</span
              >
            </div>
          </div>
          <div class="w-full grid grid-cols-2 gap-y-3 gap-x-4">
            <div
              v-for="s in stats?.chartData?.sentiment"
              :key="s.sentiment"
              class="flex items-center gap-2 group transition-all duration-300"
            >
              <div
                class="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                :style="{ backgroundColor: getSentimentColor(s.sentiment) }"
              ></div>
              <div class="flex flex-col">
                <span
                  class="text-[10px] text-slate-300 font-medium group-hover:text-white transition-colors leading-none"
                  >{{ s.sentiment }}</span
                >
                <span class="text-[8px] text-slate-600 font-bold mt-0.5"
                  >{{ s._count }} Kayıt</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ANA PANEL -->
      <section
        class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2.5rem] overflow-hidden relative min-h-[600px]"
      >
        <div
          class="p-10 lg:p-12 text-center flex flex-col items-center justify-center h-[500px]"
          v-if="tabLoading"
        >
          <div
            class="w-8 h-8 rounded-full border-[2px] border-white/5 border-t-blue-500 animate-spin mb-4"
          ></div>
          <p
            class="text-[9px] font-semibold text-slate-500 uppercase tracking-widest"
          >
            Veriler İşleniyor
          </p>
        </div>

        <div class="p-10 lg:p-12" v-else>
          <transition name="smooth-slide" mode="out-in">
            <div :key="activeTab">
              <!-- 1. ÜYELER -->
              <div v-if="activeTab === 'users'">
                <div
                  class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/[0.03]"
                >
                  <div>
                    <h2 class="text-white font-medium text-xl tracking-tight">
                      Kullanıcı Dizini
                    </h2>
                    <p
                      class="text-[10px] text-slate-500 uppercase tracking-widest mt-1"
                    >
                      Erişim & Rol Yönetimi ({{ users.length }} Kayıt)
                    </p>
                  </div>
                  <input
                    v-model="userSearch"
                    type="text"
                    placeholder="Kullanıcı ara..."
                    class="w-full md:w-72 bg-white/[0.02] border border-white/[0.05] rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-blue-500/40 transition-colors font-medium"
                  />
                </div>
                <div
                  v-if="users.length === 0"
                  class="py-20 text-center text-slate-600 text-sm"
                >
                  Kullanıcı bulunamadı.
                </div>
                <div v-else class="overflow-x-auto custom-scrollbar">
                  <table class="w-full text-left">
                    <thead>
                      <tr
                        class="text-[9px] font-semibold text-slate-600 uppercase tracking-[0.2em] border-b border-white/[0.02]"
                      >
                        <th class="pb-4 px-4">Kullanıcı</th>
                        <th class="pb-4 px-4 text-center">Yetki</th>
                        <th class="pb-4 px-4 text-right">Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/[0.02]">
                      <tr
                        v-for="u in filteredUsers"
                        :key="u.id"
                        class="hover:bg-white/[0.01] transition-colors duration-300"
                      >
                        <td class="py-4 px-4">
                          <div class="flex items-center gap-4">
                            <div class="relative shrink-0 w-9 h-9">
                              <img
                                v-if="u.avatarUrl"
                                :src="getFullUrl(u.avatarUrl)"
                                class="w-full h-full rounded-full object-cover border border-white/[0.05]"
                              />
                              <div
                                v-else
                                class="w-full h-full rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase"
                              >
                                {{ u.username?.substring(0, 2) }}
                              </div>
                              <div
                                v-if="u.isOnline"
                                class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-500 border-2 border-[#0A0A0C] rounded-full"
                              ></div>
                            </div>
                            <div class="flex flex-col">
                              <span
                                class="text-sm font-medium text-white tracking-tight"
                                >@{{ u.username }}</span
                              ><span class="text-[10px] text-slate-500">{{
                                u.email
                              }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="py-4 px-4 text-center">
                          <select
                            @change="updateRole(u.id, $event.target.value)"
                            :value="u.role"
                            class="appearance-none bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2 text-[10px] font-bold text-slate-300 outline-none focus:border-blue-500/40 transition-all cursor-pointer uppercase tracking-widest"
                          >
                            <option value="USER">Üye</option>
                            <option value="ACADEMIC">Akademisyen</option>
                            <option value="ADMIN">Yönetici</option>
                          </select>
                        </td>
                        <td class="py-4 px-4 text-right">
                          <button
                            @click="
                              openConfirmModal(
                                'Erişim',
                                `@${u.username} durumu değişsin mi?`,
                                () => toggleBan(u.id),
                              )
                            "
                            :class="[
                              'px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors border',
                              u.isBanned
                                ? 'bg-white/[0.02] text-slate-300 border-white/[0.05]'
                                : 'bg-transparent text-rose-500 border-rose-500/20 hover:bg-rose-500/10',
                            ]"
                          >
                            {{ u.isBanned ? "Aç" : "Engelle" }}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 2. GÜVENLİK -->
              <div v-if="activeTab === 'reports'">
                <div
                  class="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.03]"
                >
                  <div>
                    <h2 class="text-white font-medium text-xl tracking-tight">
                      Güvenlik Merkezi
                    </h2>
                    <p
                      class="text-[10px] text-slate-500 uppercase tracking-widest mt-1"
                    >
                      Moderasyon Bekleyen Kayıtlar
                    </p>
                  </div>
                </div>
                <div
                  v-if="reports.length === 0"
                  class="py-20 text-center text-slate-600 text-sm"
                >
                  Bekleyen rapor bulunmuyor.
                </div>
                <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div
                    v-for="r in reports"
                    :key="r.id"
                    class="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6 flex flex-col justify-between hover:border-white/[0.08] transition-colors"
                  >
                    <div>
                      <div class="flex items-center justify-between mb-4">
                        <span
                          class="text-[9px] font-bold text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-md border border-rose-400/20 uppercase tracking-wider"
                          >{{ r.reason }}</span
                        >
                        <span
                          class="text-[10px] text-slate-500 uppercase font-bold tracking-widest"
                          >{{ formatDate(r.createdAt) }}</span
                        >
                      </div>
                      <div
                        class="bg-[#050505] p-4 rounded-xl mb-6 border border-white/[0.02]"
                      >
                        <p
                          v-if="r.reportedPost"
                          class="text-sm text-slate-300 font-medium italic mb-2"
                        >
                          "{{ r.reportedPost.content }}"
                        </p>
                        <p
                          v-else-if="r.reportedComment"
                          class="text-sm text-slate-300 font-medium italic mb-2"
                        >
                          "{{ r.reportedComment.content }}"
                        </p>
                        <p
                          v-else-if="r.reportedMessage"
                          class="text-sm text-slate-300 font-medium italic mb-2"
                        >
                          "{{
                            r.subReason ||
                            "Şifreli Mesaj (ID: " + r.reportedMessageId + ")"
                          }}"
                        </p>
                        <p
                          v-else
                          class="text-sm text-slate-300 font-medium italic mb-2"
                        >
                          "İçerik bulunamadı."
                        </p>

                        <p
                          class="text-[9px] text-slate-500 uppercase tracking-widest"
                        >
                          Kaynak:
                          <span class="text-slate-300"
                            >@{{ r.reporter?.username || "Bilinmiyor" }}</span
                          >
                          <span v-if="r.reportedMessage" class="ml-2"
                            >• Gönderen: @{{
                              r.reportedMessage.sender?.username
                            }}</span
                          >
                        </p>
                      </div>
                    </div>
                    <div class="flex gap-3">
                      <button
                        @click="updateReportStatus(r.id, 'RESOLVED')"
                        class="flex-1 py-2 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/[0.05]"
                      >
                        Güvenli
                      </button>
                      <button
                        v-if="r.reportedPostId"
                        @click="
                          openConfirmModal('Sil', 'İçerik silinsin mi?', () =>
                            deletePost(r.reportedPostId, r.id),
                          )
                        "
                        class="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest rounded-lg"
                      >
                        Sil
                      </button>
                      <button
                        v-else-if="r.reportedCommentId"
                        @click="
                          openConfirmModal('Sil', 'Yorum silinsin mi?', () =>
                            deleteComment(r.reportedCommentId, r.id),
                          )
                        "
                        class="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest rounded-lg"
                      >
                        Sil
                      </button>
                      <button
                        v-else-if="r.reportedMessageId"
                        @click="
                          openConfirmModal('Sil', 'Mesaj silinsin mi?', () =>
                            deleteMessage(r.reportedMessageId, r.id),
                          )
                        "
                        class="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest rounded-lg"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. TOPLULUKLAR -->
              <div v-if="activeTab === 'clubs'">
                <div
                  class="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.03]"
                >
                  <div>
                    <h2 class="text-white font-medium text-xl tracking-tight">
                      Topluluk Dizini
                    </h2>
                    <p
                      class="text-[10px] text-slate-500 uppercase tracking-widest mt-1"
                    >
                      Tüm Kulüpler ve Başvurular ({{ clubs.length }})
                    </p>
                  </div>
                </div>
                <div
                  v-if="clubs.length === 0"
                  class="py-20 text-center text-slate-600 text-sm"
                >
                  Topluluk bulunmuyor.
                </div>
                <div
                  v-else
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <div
                    v-for="c in clubs"
                    :key="c.id"
                    :class="[
                      'bg-white/[0.01] border rounded-2xl p-6 flex flex-col justify-between hover:border-white/[0.08] transition-all group relative',
                      c.status === 'APPROVED'
                        ? 'border-white/[0.03]'
                        : 'border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]',
                    ]"
                  >
                    <div
                      v-if="c.status !== 'APPROVED'"
                      class="absolute -top-2 -right-2 bg-blue-500 text-white text-[7px] font-black px-2 py-1 rounded-full uppercase tracking-tighter animate-bounce"
                    >
                      Yeni
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-4">
                        <div
                          class="w-10 h-10 rounded-xl bg-[#050505] border border-white/[0.05] flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
                        >
                          {{ c.emoji || "🏛️" }}
                        </div>
                        <div class="flex gap-2">
                          <span
                            :class="[
                              'px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border',
                              c.adminApproval
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-white/[0.02] text-slate-600 border-white/[0.05]',
                            ]"
                            >{{ c.adminApproval ? "ADM ✓" : "ADM" }}</span
                          >
                          <span
                            :class="[
                              'px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border',
                              c.academicApproval
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-white/[0.02] text-slate-600 border-white/[0.05]',
                            ]"
                            >{{ c.academicApproval ? "ACD ✓" : "ACD" }}</span
                          >
                        </div>
                      </div>
                      <h3
                        class="text-base font-bold text-white mb-1 tracking-tight"
                      >
                        @{{ c.name }}
                      </h3>
                      <div class="flex items-center gap-2 mb-4">
                        <img
                          v-if="c.founder?.avatarUrl"
                          :src="getFullUrl(c.founder.avatarUrl)"
                          class="w-4 h-4 rounded-full"
                        />
                        <span
                          class="text-[10px] text-slate-500 font-bold uppercase"
                          >Kurucu: @{{
                            c.founder?.username || "Silinmiş"
                          }}</span
                        >
                      </div>
                      <p
                        class="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-6"
                      >
                        {{ c.description }}
                      </p>
                    </div>
                    <div class="flex flex-col gap-2">
                      <div
                        v-if="c.status === 'APPROVED'"
                        class="w-full py-2 bg-white/[0.02] text-slate-500 text-[9px] font-bold uppercase tracking-widest rounded-lg border border-white/[0.05] text-center uppercase"
                      >
                        Aktif Topluluk
                      </div>
                      <template v-else>
                        <button
                          v-if="!c.adminApproval"
                          @click="approveClub(c.id, 'admin')"
                          class="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all"
                        >
                          Sistemi Onayla
                        </button>
                        <button
                          v-if="!c.academicApproval"
                          @click="approveClub(c.id, 'academic')"
                          class="w-full py-2 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-lg border border-white/[0.05]"
                        >
                          Akademik Onay
                        </button>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. ETKİNLİKLER -->
              <div v-if="activeTab === 'events'">
                <div
                  class="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.03]"
                >
                  <div>
                    <h2 class="text-white font-medium text-xl tracking-tight">
                      Etkinlik Merkezi
                    </h2>
                    <p
                      class="text-[10px] text-slate-500 uppercase tracking-widest mt-1"
                    >
                      Kampüs Organizasyonları ({{ events.length }})
                    </p>
                  </div>
                </div>
                <div
                  v-if="events.length === 0"
                  class="py-20 text-center text-slate-600 text-sm"
                >
                  Etkinlik bulunmuyor.
                </div>
                <div
                  v-else
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <div
                    v-for="e in events"
                    :key="e.id"
                    class="bg-white/[0.01] border border-white/[0.03] rounded-3xl p-6 flex flex-col justify-between hover:border-white/[0.08] transition-all group overflow-hidden relative"
                  >
                    <div
                      v-if="e.imageUrl"
                      class="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity"
                    >
                      <img
                        :src="getFullUrl(e.imageUrl)"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div class="relative z-10">
                      <div class="flex items-center justify-between mb-4">
                        <span
                          class="text-[9px] font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md border border-blue-400/20 uppercase tracking-widest"
                          >{{ e.type }}</span
                        >
                        <span class="text-[10px] text-slate-500 font-bold">{{
                          formatDate(e.date)
                        }}</span>
                      </div>
                      <h3
                        class="text-base font-bold text-white mb-2 tracking-tight"
                      >
                        @{{ e.title }}
                      </h3>
                      <p class="text-[11px] text-slate-400 line-clamp-2 mb-4">
                        {{ e.description }}
                      </p>
                      <div class="flex items-center gap-2 mb-6">
                        <img
                          v-if="e.creator?.avatarUrl"
                          :src="getFullUrl(e.creator.avatarUrl)"
                          class="w-4 h-4 rounded-full"
                        />
                        <span
                          class="text-[9px] text-slate-500 uppercase font-bold"
                          >@{{ e.creator?.username }}</span
                        >
                        <span class="text-slate-700 mx-1">•</span>
                        <span
                          class="text-[9px] text-slate-500 font-bold uppercase"
                          >{{ e._count?.participants }} Katılımcı</span
                        >
                      </div>
                    </div>
                    <button
                      @click="
                        openConfirmModal(
                          'İptal',
                          'Etkinlik iptal edilsin mi?',
                          () => deleteEvent(e.id),
                        )
                      "
                      class="relative z-10 w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              </div>

              <!-- 5. PAZAR (SPOT) -->
              <div v-if="activeTab === 'spot'">
                <div
                  class="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.03]"
                >
                  <div>
                    <h2 class="text-white font-medium text-xl tracking-tight">
                      İlan Pazarı
                    </h2>
                    <p
                      class="text-[10px] text-slate-500 uppercase tracking-widest mt-1"
                    >
                      Aktif Spot İlanlar ({{ spots.length }})
                    </p>
                  </div>
                </div>
                <div
                  v-if="spots.length === 0"
                  class="py-20 text-center text-slate-600 text-sm"
                >
                  Aktif ilan bulunmuyor.
                </div>
                <div
                  v-else
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <div
                    v-for="s in spots"
                    :key="s.id"
                    class="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6 flex flex-col justify-between hover:border-white/[0.08] transition-colors"
                  >
                    <div>
                      <div class="flex items-center gap-4 mb-4">
                        <img
                          v-if="s.author?.avatarUrl"
                          :src="getFullUrl(s.author.avatarUrl)"
                          class="w-8 h-8 rounded-full border border-white/[0.05] object-cover"
                        />
                        <div
                          v-else
                          class="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[8px] text-slate-600 font-bold uppercase"
                        >
                          {{ s.author?.username.substring(0, 2) }}
                        </div>
                        <div class="flex flex-col">
                          <span class="text-xs font-bold text-white"
                            >@{{ s.author?.username }}</span
                          ><span
                            class="text-[9px] text-slate-500 uppercase tracking-widest font-bold"
                            >{{ s.category }}</span
                          >
                        </div>
                      </div>
                      <h3 class="text-sm font-bold text-white mb-2">
                        {{ s.title }}
                      </h3>
                      <p class="text-[11px] text-slate-400 line-clamp-2 mb-4">
                        {{ s.description }}
                      </p>
                    </div>
                    <div
                      class="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.02]"
                    >
                      <span class="text-blue-400 font-bold text-xs">{{
                        s.price ? s.price + " ₺" : "Ücretsiz"
                      }}</span>
                      <button
                        @click="
                          openConfirmModal('Sil', 'İlan kaldırılsın mı?', () =>
                            deleteSpot(s.id),
                          )
                        "
                        class="text-[9px] font-bold text-rose-500/70 hover:text-rose-500 uppercase tracking-widest transition-all"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 6. TRENDLER -->
              <div v-if="activeTab === 'trends'" class="max-w-4xl mx-auto py-6">
                <div
                  class="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.03]"
                >
                  <div>
                    <h2 class="text-white font-medium text-xl tracking-tight">
                      Trend Analizi
                    </h2>
                    <p
                      class="text-[10px] text-slate-500 uppercase tracking-widest mt-1"
                    >
                      Kampüs Gündemi
                    </p>
                  </div>
                </div>
                <div
                  v-if="trends.length === 0"
                  class="py-20 text-center text-slate-600 text-sm"
                >
                  Yeterli veri toplanmadı.
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    v-for="(t, i) in trends"
                    :key="i"
                    @click="router.push('/hashtag/' + t.name)"
                    class="bg-white/[0.01] border border-white/[0.03] rounded-3xl p-8 flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden cursor-pointer"
                  >
                    <div
                      class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"
                    ></div>
                    <div class="flex items-start justify-between relative z-10">
                      <div class="flex flex-col">
                        <span
                          class="text-4xl font-bold text-white/5 mb-4 group-hover:text-blue-500/10 transition-colors"
                          >#0{{ i + 1 }}</span
                        ><span
                          class="text-2xl font-bold text-white tracking-tighter mb-1"
                          >#{{ t.name }}</span
                        ><span
                          class="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]"
                          >{{ t._count?.posts || 0 }} Etkileşim</span
                        >
                      </div>
                      <div
                        class="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/20 group-hover:text-blue-500 transition-colors"
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
                            stroke-width="1.5"
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </div>
                    </div>
                    <div class="mt-8 relative z-10">
                      <div
                        class="h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden"
                      >
                        <div
                          class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          :style="{
                            width:
                              (t._count?.posts /
                                (trends[0]?._count?.posts || 1)) *
                                100 +
                              '%',
                          }"
                        ></div>
                      </div>
                      <div class="flex justify-between mt-3">
                        <span
                          class="text-[8px] text-slate-600 font-bold uppercase tracking-widest"
                          >Popülerlik Skoru</span
                        ><span
                          class="text-[8px] text-slate-400 font-bold uppercase tracking-widest"
                          >{{
                            Math.round(
                              (t._count?.posts /
                                (trends[0]?._count?.posts || 1)) *
                                100,
                            )
                          }}%</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 7. DESTEK -->
              <div v-if="activeTab === 'feedbacks'">
                <div
                  class="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.03]"
                >
                  <div>
                    <h2 class="text-white font-medium text-xl tracking-tight">
                      Destek & Geri Bildirim
                    </h2>
                    <p
                      class="text-[10px] text-slate-500 uppercase tracking-widest mt-1"
                    >
                      Kullanıcı Talepleri ({{ feedbacks.length }})
                    </p>
                  </div>
                </div>
                <div
                  v-if="feedbacks.filter((f) => f.user).length === 0"
                  class="py-20 text-center text-slate-600 text-sm"
                >
                  Geri bildirim bulunmuyor.
                </div>
                <div
                  v-for="f in feedbacks.filter((f) => f.user)"
                  :key="f.id"
                  class="bg-[#0A0A0C] border border-white/[0.03] rounded-[2rem] p-8 hover:border-white/[0.08] transition-all group mb-6 relative overflow-hidden"
                >
                  <div
                    class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-blue-500/[0.03] transition-colors"
                  ></div>
                  <div
                    class="flex items-center justify-between mb-6 relative z-10"
                  >
                    <div class="flex items-center gap-4">
                      <!-- Avatar Mantığı -->
                      <div
                        class="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center overflow-hidden shadow-inner"
                      >
                        <img
                          v-if="f.user?.avatarUrl"
                          :src="getFullUrl(f.user.avatarUrl)"
                          class="w-full h-full object-cover"
                        />
                        <span
                          v-else
                          class="text-xs text-slate-500 font-black uppercase"
                          >{{ f.user?.username?.substring(0, 2) || "MS" }}</span
                        >
                      </div>
                      <div class="flex flex-col">
                        <span
                          class="text-sm font-bold text-white tracking-tight"
                          >{{
                            f.user?.username
                              ? `@${f.user.username}`
                              : "Misafir Kullanıcı"
                          }}</span
                        >
                        <span
                          class="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1"
                          >{{ formatDate(f.createdAt) }}</span
                        >
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                      <span
                        :class="[
                          'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border',
                          f.type === 'BUG'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
                        ]"
                      >
                        {{ getFeedbackLabel(f.type) }}
                      </span>
                    </div>
                  </div>
                  <div
                    class="bg-[#050505] p-6 rounded-2xl border border-white/[0.02] group-hover:border-white/[0.05] transition-colors relative z-10"
                  >
                    <p
                      class="text-sm text-slate-300 leading-relaxed font-medium"
                    >
                      {{ f.message }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- 8. DUYURU -->
              <div
                v-if="activeTab === 'announce'"
                class="max-w-md mx-auto py-8"
              >
                <div class="space-y-6">
                  <div>
                    <label
                      class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"
                      >Başlık</label
                    ><input
                      v-model="announcement.title"
                      type="text"
                      class="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/40"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2"
                      >İçerik</label
                    ><textarea
                      v-model="announcement.content"
                      rows="4"
                      class="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/40 resize-none"
                    ></textarea>
                  </div>
                  <div class="flex gap-3">
                    <select
                      v-model="announcement.type"
                      class="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 text-xs font-bold focus:border-blue-500/40"
                    >
                      <option value="INFO">BİLGİ</option>
                      <option value="ALERT">UYARI</option>
                    </select>
                    <button
                      @click="sendAnnouncement"
                      class="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-opacity"
                    >
                      Yayınla
                    </button>
                  </div>
                </div>
              </div>

              <!-- 9. LOGLAR -->
              <div v-if="activeTab === 'logs'">
                <div class="flex items-center justify-between mb-6 px-2">
                  <h3
                    class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                  >
                    Sistem Olayları
                  </h3>
                  <button
                    @click="fetchLogs"
                    class="text-[10px] text-blue-400 hover:text-blue-300 uppercase font-bold tracking-widest"
                  >
                    Yenile
                  </button>
                </div>
                <div
                  class="bg-[#050505] rounded-2xl p-4 border border-white/[0.03] h-[400px] overflow-y-auto custom-scrollbar font-mono text-[10px]"
                >
                  <div
                    v-for="(log, i) in logs"
                    :key="i"
                    class="flex flex-col sm:flex-row gap-3 py-3 border-b border-white/[0.02] hover:bg-white/[0.01] px-3 rounded-lg transition-colors"
                  >
                    <span class="text-slate-600 shrink-0 font-bold uppercase">{{
                      formatDateShort(log.timestamp)
                    }}</span>
                    <span
                      :class="[
                        'px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0',
                        getLogLevelColor(log.level),
                      ]"
                      >{{ log.level }}</span
                    >
                    <span class="text-slate-300 break-all">{{
                      log.message
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </section>
    </main>

    <!-- MODALLAR -->
    <transition name="fade"
      ><div
        v-if="confirmModal.show"
        class="fixed inset-0 bg-[#050505]/90 backdrop-blur-sm z-[190]"
      ></div
    ></transition>
    <transition name="modal-smooth"
      ><div
        v-if="confirmModal.show"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      >
        <div
          class="bg-[#0A0A0C] border border-white/[0.05] rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
        >
          <div
            class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-purple-500"
          ></div>
          <h3 class="text-white font-bold text-lg mb-2 tracking-tight">
            {{ confirmModal.title }}
          </h3>
          <p class="text-sm text-slate-400 mb-8 leading-relaxed">
            {{ confirmModal.message }}
          </p>
          <div class="flex gap-3 justify-end">
            <button
              @click="confirmModal.show = false"
              class="px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 text-xs font-bold rounded-xl border border-white/[0.05]"
            >
              İptal</button
            ><button
              @click="confirmModal.onConfirm"
              class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold rounded-xl"
            >
              Onayla
            </button>
          </div>
        </div>
      </div></transition
    >
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  defineComponent,
  h,
  reactive,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { useNotification } from "@/composables/useNotification";
import VueApexCharts from "vue3-apexcharts";

const apexchart = VueApexCharts;
const router = useRouter();
const { showNotification } = useNotification();

const getFullUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://127.0.0.1:3000";
  return `${baseUrl}${path}`;
};

const getFeedbackLabel = (type: string) => {
  const map: Record<string, string> = {
    BUG: "HATA BİLDİRİMİ",
    SUGGESTION: "ÖNERİ",
    COMPLAINT: "ŞİKAYET",
    OTHER: "DİĞER",
  };
  return map[type] || type;
};

// İKONLAR
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
const ReportIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      }),
    ]),
});
const ClubIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
      }),
    ]),
});
const CalendarIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      }),
    ]),
});
const SpotIcon = defineComponent({
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
const TrendIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      }),
    ]),
});
const MegaPhoneIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.088 0 01-1.564-.317z",
      }),
    ]),
});
const ChatIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
      }),
    ]),
});
const LogIcon = defineComponent({
  render: () =>
    h("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "1.5",
        d: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      }),
    ]),
});

const activeTab = ref("users");
const tabLoading = ref(false);
const stats = ref<any>(null);
const users = ref<any[]>([]);
const reports = ref<any[]>([]);
const clubs = ref<any[]>([]);
const events = ref<any[]>([]);
const spots = ref<any[]>([]);
const trends = ref<any[]>([]);
const feedbacks = ref<any[]>([]);
const logs = ref<any[]>([]);
const userSearch = ref("");
const announcement = reactive({ title: "", content: "", type: "INFO" });

const summaryStats = computed(() => [
  { label: "Üyeler", value: stats.value?.totalUsers || 0, icon: UsersIcon },
  {
    label: "Raporlar",
    value: stats.value?.totalReports || 0,
    icon: ReportIcon,
  },
  {
    label: "Başvurular",
    value: stats.value?.pendingClubsCount || 0,
    icon: ClubIcon,
  },
  { label: "İlanlar", value: stats.value?.totalSpot || 0, icon: SpotIcon },
  {
    label: "İçerikler",
    value: stats.value?.totalPosts || 0,
    icon: MegaPhoneIcon,
  },
  { label: "Aktif", value: stats.value?.onlineUsers || 0, icon: UsersIcon },
]);

const menuItems = [
  { id: "users", label: "Üyeler", icon: UsersIcon },
  { id: "reports", label: "Güvenlik", icon: ReportIcon },
  { id: "clubs", label: "Topluluk", icon: ClubIcon },
  { id: "events", label: "Etkinlik", icon: CalendarIcon },
  { id: "spot", label: "Pazar", icon: SpotIcon },
  { id: "trends", label: "Trendler", icon: TrendIcon },
  { id: "announce", label: "Duyuru", icon: MegaPhoneIcon },
  { id: "feedbacks", label: "Destek", icon: ChatIcon },
  { id: "logs", label: "Sistem", icon: LogIcon },
];

const fetchTabData = async () => {
  tabLoading.value = true;
  try {
    const res = await apiClient.get(`/admin/${activeTab.value}`);
    if (activeTab.value === "users") users.value = res.data;
    if (activeTab.value === "reports") reports.value = res.data;
    if (activeTab.value === "clubs") clubs.value = res.data;
    if (activeTab.value === "events") events.value = res.data;
    if (activeTab.value === "spot") spots.value = res.data;
    if (activeTab.value === "trends") trends.value = res.data;
    if (activeTab.value === "feedbacks") feedbacks.value = res.data;
    if (activeTab.value === "logs") logs.value = res.data;
  } catch (e) {
    showNotification("Veri çekilemedi", "error");
  } finally {
    tabLoading.value = false;
  }
};

watch(activeTab, fetchTabData);

const fetchBaseStats = async () => {
  try {
    stats.value = (await apiClient.get("/admin/stats")).data;
  } catch (e) {}
};

const updateRole = async (id: number, role: string) => {
  try {
    await apiClient.patch(`/admin/users/${id}/role`, { role });
    fetchTabData();
    showNotification("Rol güncellendi", "success");
  } catch (e) {}
};

const toggleBan = async (id: number) => {
  try {
    await apiClient.patch(`/admin/users/${id}/ban`);
    fetchTabData();
    showNotification("İşlem başarılı", "success");
  } catch (e) {}
};

const deletePost = async (id: number, reportId: number) => {
  try {
    await apiClient.delete(`/admin/posts/${id}`);
    await apiClient.patch(`/admin/reports/${reportId}/status`, {
      status: "RESOLVED",
    });
    fetchTabData();
    showNotification("Silindi", "success");
  } catch (e) {}
};

const deleteComment = async (id: number, reportId: number) => {
  try {
    await apiClient.delete(`/admin/comments/${id}`);
    await apiClient.patch(`/admin/reports/${reportId}/status`, {
      status: "RESOLVED",
    });
    fetchTabData();
    showNotification("Yorum Silindi", "success");
  } catch (e) {}
};

const deleteMessage = async (id: number, reportId: number) => {
  try {
    await apiClient.delete(`/admin/messages/${id}`);
    await apiClient.patch(`/admin/reports/${reportId}/status`, {
      status: "RESOLVED",
    });
    fetchTabData();
    showNotification("Mesaj Silindi", "success");
  } catch (e) {}
};

const updateReportStatus = async (id: number, status: string) => {
  try {
    await apiClient.patch(`/admin/reports/${id}/status`, { status });
    fetchTabData();
    showNotification("Güncellendi", "success");
  } catch (e) {}
};

const approveClub = async (id: number, type: "admin" | "academic") => {
  try {
    await apiClient.patch(`/admin/clubs/${id}/approve`, { type });
    fetchTabData();
    showNotification("Onaylandı", "success");
  } catch (e) {}
};

const deleteSpot = async (id: number) => {
  try {
    await apiClient.delete(`/admin/spot/${id}`);
    fetchTabData();
    showNotification("Kaldırıldı", "success");
  } catch (e) {}
};

const deleteEvent = async (id: number) => {
  try {
    await apiClient.delete(`/admin/events/${id}`);
    fetchTabData();
    showNotification("İptal edildi", "success");
  } catch (e) {}
};

const sendAnnouncement = async () => {
  if (!announcement.title || !announcement.content) return;
  try {
    await apiClient.post("/admin/announce", announcement);
    showNotification("Yayınlandı", "success");
    announcement.title = "";
    announcement.content = "";
  } catch (e) {}
};

const fetchLogs = async () => {
  try {
    logs.value = (await apiClient.get("/admin/logs")).data;
  } catch (e) {}
};

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value;
  return users.value.filter(
    (u) =>
      u.username?.toLowerCase().includes(userSearch.value.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.value.toLowerCase()),
  );
});

const mainChartSeries = computed(() => [
  {
    name: "Etkileşim",
    data: stats.value?.chartData?.posts?.map((p: any) => p._count) || [
      0, 0, 0, 0, 0, 0, 0,
    ],
  },
]);
const chartOptions = {
  chart: {
    type: "line",
    toolbar: { show: false },
    background: "transparent",
    fontFamily: "inherit",
  },
  colors: ["#3b82f6"],
  stroke: { curve: "smooth", width: 2 },
  xaxis: {
    categories:
      stats.value?.chartData?.posts?.map((p: any) =>
        new Date(p.date).toLocaleDateString("tr-TR", { weekday: "short" }),
      ) || [],
    labels: { style: { colors: "#64748b", fontSize: "10px" } },
  },
  yaxis: { show: false },
  grid: { borderColor: "#ffffff05" },
  tooltip: { theme: "dark" },
};

const getSentimentColor = (sentiment: string) => {
  const s = sentiment?.toLowerCase();
  if (s === "neşeli" || s === "positive") return "#4ade80";
  if (s === "hüzünlü") return "#60a5fa";
  if (s === "kızgın" || s === "negative") return "#f87171";
  if (s === "endişeli") return "#fb923c";
  if (s === "meraklı") return "#c084fc";
  if (s === "sakin" || s === "neutral") return "#2dd4bf";
  if (s === "ciddi") return "#d1d5db";
  return "#4b5563";
};

const donutSeries = computed(
  () => stats.value?.chartData?.sentiment?.map((s: any) => s._count) || [1],
);
const donutOptions = computed(() => ({
  chart: { type: "donut", fontFamily: "inherit" },
  labels: stats.value?.chartData?.sentiment?.map((s: any) => s.sentiment) || [
    "Veri Bekleniyor",
  ],
  colors: stats.value?.chartData?.sentiment?.map((s: any) =>
    getSentimentColor(s.sentiment),
  ) || ["#1e1e1e"],
  stroke: { show: false },
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: "85%", background: "transparent" } } },
  tooltip: { theme: "dark" },
}));

const confirmModal = reactive({
  show: false,
  title: "",
  message: "",
  onConfirm: () => {},
});
const openConfirmModal = (
  title: string,
  message: string,
  onConfirm: Function,
) => {
  confirmModal.title = title;
  confirmModal.message = message;
  confirmModal.onConfirm = () => {
    onConfirm();
    confirmModal.show = false;
  };
  confirmModal.show = true;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
const formatDateShort = (date: string) =>
  new Date(date).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
const getLogLevelColor = (level: string) => {
  const l = level?.toLowerCase();
  if (l === "error") return "text-rose-400 bg-rose-400/10";
  if (l === "warn") return "text-amber-400 bg-amber-400/10";
  return "text-emerald-400 bg-emerald-400/10";
};

onMounted(async () => {
  await fetchBaseStats();
  await fetchTabData();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
}
.smooth-slide-enter-active,
.smooth-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.smooth-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.smooth-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.modal-smooth-enter-active,
.modal-smooth-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-smooth-enter-from,
.modal-smooth-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
