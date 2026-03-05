<!-- src/views/Admin.vue -->
<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8 pb-24 bg-white dark:bg-gray-950 min-h-screen font-sans">
    <!-- Modern Header (Komuta Merkezi) -->
    <header class="relative mb-12 py-10 px-8 rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl group text-center md:text-left">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>
      <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
            <span class="px-3 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-full border border-blue-500/30 shadow-lg shadow-blue-500/10">Sistem Admin</span>
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
          </div>
          <h1 class="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
            Komuta <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Merkezi</span>
          </h1>
          <p class="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest opacity-70">MAKUtalk v1.4.0 • Denetim Paneli</p>
        </div>
        <div class="hidden sm:block text-right">
          <p class="text-white font-black text-xl italic tracking-tighter">{{ stats.totalUsers }}</p>
          <p class="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Kullanıcı</p>
        </div>
      </div>
    </header>

    <!-- 6'LI STATS GRID -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-16">
      <div v-for="s in statItems" :key="s.label" class="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl flex flex-col sm:flex-row items-center gap-3 sm:gap-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-5 transition-opacity duration-500 group-hover:opacity-10" :style="{ backgroundColor: s.color }"></div>
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center border shadow-inner transition-colors duration-500" :style="{ backgroundColor: s.bg, color: s.color, borderColor: s.border }">
          <div class="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center" v-html="s.icon"></div>
        </div>
        <div class="relative z-10 text-center sm:text-left">
          <p class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{{ s.label }}</p>
          <p class="text-lg sm:text-xl font-black text-gray-900 dark:text-white italic tracking-tighter leading-none">{{ s.value }}</p>
        </div>
      </div>
    </div>

    <!-- ADMIN TABS -->
    <div class="relative mb-16 py-4 border-y border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-gray-900/30 rounded-3xl overflow-hidden">
      <div ref="adminTabsRef" @scroll="handleTabsScroll" class="flex items-center gap-4 overflow-x-auto px-[35%] scrollbar-hide no-scrollbar scroll-smooth h-16">
        <div v-for="(tab, index) in adminTabs" :key="tab.id" class="flex-shrink-0 snap-center tab-item">
          <button @click.prevent="activeTab = tab.id; centerTabItem(index)" :class="['w-36 h-12 rounded-xl flex items-center justify-center transition-all duration-500 border-2 px-4', activeTab === tab.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-110' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400 opacity-60 scale-90']">
            <span class="text-[10px] font-black uppercase tracking-widest">{{ tab.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- DYNAMIC CONTENT -->
    <div class="min-h-[500px]">
      <transition name="fade" mode="out-in">
        <div :key="activeTab">
          <!-- 1. KULLANICILAR -->
          <div v-if="activeTab === 'users'">
            <!-- Masaüstü Tablo -->
            <div class="hidden md:block bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl">
              <table class="w-full text-left">
                <thead><tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-white/5"><th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kullanıcı</th><th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Durum</th><th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Eylem</th></tr></thead>
                <tbody class="divide-y divide-gray-50 dark:divide-white/5">
                  <tr v-for="user in users" :key="user.id" class="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all duration-300 group">
                    <td class="p-8">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-gray-800 flex items-center justify-center font-black text-blue-600 uppercase shadow-inner group-hover:rotate-3 transition-transform overflow-hidden">
                          <img v-if="user.avatarUrl" :src="getImageUrl(user.avatarUrl)" class="w-full h-full object-cover" />
                          <span v-else>{{ user.username.charAt(0) }}</span>
                        </div>
                        <div>
                          <p class="text-sm font-black text-gray-900 dark:text-white">@{{ user.username }}</p>
                          <p class="text-[10px] text-gray-400 font-bold uppercase">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-8 text-center"><span class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm" :class="user.isBanned ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'">{{ user.isBanned ? 'YASAKLI' : 'AKTİF' }}</span></td>
                    <td class="p-8 text-right"><div class="flex items-center justify-end gap-2"><button @click="$router.push(`/profile/${user.username}`)" class="p-2 text-blue-500 hover:scale-110 transition-transform" title="Profili Gör"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></button><button @click="handleBanToggle(user)" class="p-2 text-red-500 hover:scale-110 transition-transform" title="Yasakla/Kaldır"><svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Mobil Kullanıcı Kartları -->
            <div class="md:hidden space-y-4 px-1">
              <div v-for="user in users" :key="user.id" class="relative bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden group">
                <div class="absolute top-4 right-6 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full animate-pulse" :class="user.isBanned ? 'bg-red-500' : 'bg-emerald-500'"></span>
                  <span class="text-[8px] font-black uppercase tracking-widest" :class="user.isBanned ? 'text-red-500' : 'text-emerald-500'">{{ user.isBanned ? 'Yasaklı' : 'Aktif' }}</span>
                </div>

                <div class="flex items-center gap-5">
                  <div class="relative flex-shrink-0">
                    <div class="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-inner">
                      <img v-if="user.avatarUrl" :src="getImageUrl(user.avatarUrl)" class="w-full h-full object-cover rounded-[1.8rem]" />
                      <span v-else class="text-2xl font-black text-blue-600 uppercase">{{ user.username.charAt(0) }}</span>
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <h4 class="text-lg font-black text-gray-900 dark:text-white truncate tracking-tighter">@{{ user.username }}</h4>
                    <p class="text-[10px] text-gray-400 font-bold uppercase truncate tracking-wide mt-0.5">{{ user.email }}</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span v-if="user.role === 'ADMIN'" class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[7px] font-black uppercase rounded-lg border border-blue-100 dark:border-blue-900/30">Admin</span>
                      <span class="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[7px] font-black uppercase rounded-lg border border-gray-100 dark:border-white/5">Katılım: {{ formatDate(user.createdAt).split(',')[0] }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-6 pt-4 border-t border-gray-50 dark:border-white/5 flex gap-3">
                  <button @click="$router.push(`/profile/${user.username}`)" class="flex-1 h-12 bg-slate-50 dark:bg-gray-800 text-gray-900 dark:text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    Profile Git
                  </button>
                  <button 
                    @click="handleBanToggle(user)" 
                    class="flex-1 h-12 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all border"
                    :class="user.isBanned 
                      ? 'bg-emerald-500 text-white border-transparent' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    {{ user.isBanned ? 'Yasağı Kaldır' : 'Yasakla' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. TOPLULUKLAR -->
          <div v-else-if="activeTab === 'clubs'" class="space-y-6 max-w-4xl mx-auto px-1 sm:px-2">
            <div v-if="pendingClubs.length === 0" class="py-24 text-center opacity-30 font-black uppercase text-xs tracking-widest italic border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2.5rem] sm:rounded-[3rem]">Henüz başvuru yapılmamış.</div>
            <div v-for="club in pendingClubs" :key="club.id" class="bg-white dark:bg-gray-900 border-2 border-gray-50 dark:border-white/5 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 shadow-2xl flex flex-col gap-6 sm:gap-8 transition-all hover:border-blue-500/20">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div class="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                  <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-3xl sm:text-4xl shadow-inner flex-shrink-0 border border-gray-100 dark:border-white/5 overflow-hidden" :style="{ backgroundColor: club.color + '15', color: club.color }">
                    <span v-if="isEmoji(club.emoji)">{{ club.emoji }}</span>
                    <span v-else class="text-lg sm:text-xl font-black uppercase tracking-tighter">{{ club.emoji }}</span>
                  </div>
                  <div class="min-w-0">
                    <div class="flex flex-wrap gap-2 items-center">
                      <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[7px] sm:text-[8px] font-black uppercase tracking-widest rounded-full border border-gray-200 dark:border-white/5">{{ club.category }}</span>
                      <span v-if="club.mainType === 'PROJECT'" class="text-[7px] font-black text-blue-500 uppercase tracking-widest">🚀 Proje Ekibi</span>
                      <span v-else-if="club.mainType === 'SOCIAL'" class="text-[7px] font-black text-amber-500 uppercase tracking-widest">🌍 Sosyal Grup</span>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mt-1 truncate">{{ club.name }}</h3>
                  </div>
                </div>
                <div class="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                  <p class="text-[9px] sm:text-[10px] font-black" :class="club.academicApproval ? 'text-emerald-500' : 'text-amber-500'">{{ club.academicApproval ? 'HOCA ONAYLADI ✅' : 'HOCA BEKLENİYOR ⏳' }}</p>
                  <p class="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Kurucu: @{{ club.founder?.username }}</p>
                </div>
              </div>

              <div v-if="club.mainType !== 'DIGITAL'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-if="club.deadline" class="p-4 bg-rose-50/30 dark:bg-rose-900/5 rounded-2xl border border-rose-100/50 dark:border-rose-900/20">
                  <p class="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">{{ club.mainType === 'PROJECT' ? 'Son Başvuru' : 'Etkinlik Tarihi' }}</p>
                  <p class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ new Date(club.deadline).toLocaleDateString('tr-TR') }}</p>
                </div>
                <div v-if="club.maxMembers" class="p-4 bg-blue-50/30 dark:bg-blue-900/5 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
                  <p class="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">Kontenjan</p>
                  <p class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ club.maxMembers }} Kişi</p>
                </div>
                <div v-if="club.requiredSkills" class="sm:col-span-2 p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Aranan Yetenekler</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="skill in club.requiredSkills.split(',')" :key="skill" class="px-2 py-0.5 bg-white dark:bg-gray-800 text-[9px] font-bold rounded-md border border-gray-100 dark:border-white/5 shadow-sm text-slate-600 dark:text-slate-400">{{ skill.trim() }}</span>
                  </div>
                </div>
              </div>

              <div class="p-5 sm:p-6 bg-slate-50 dark:bg-black/40 rounded-[1.5rem] sm:rounded-[2rem] italic text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border border-gray-100/50 dark:border-white/5 shadow-inner line-clamp-4 overflow-hidden break-words">"{{ club.description }}"</div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-gray-50 dark:border-white/5">
                <div class="flex items-center gap-3">
                  <span class="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">Danışman:</span>
                  <div class="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div v-if="club.advisor?.avatarUrl" class="w-5 h-5 rounded-full overflow-hidden"><img :src="getImageUrl(club.advisor.avatarUrl)" class="w-full h-full object-cover" /></div>
                    <p class="text-[10px] sm:text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">{{ club.advisor?.fullName || club.advisorName }}</p>
                  </div>
                </div>
                <div class="flex gap-3 sm:gap-4">
                  <button @click="handleRejectClub(club.id)" class="flex-1 sm:flex-none px-6 sm:px-8 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 text-[9px] sm:text-[10px] font-black uppercase rounded-2xl transition-all border border-transparent hover:border-red-500/20 active:scale-95">Reddet</button>
                  <button @click="handleApproveClub(club.id)" class="flex-2 sm:flex-none px-8 sm:px-10 py-3 bg-blue-600 text-white text-[9px] sm:text-[10px] font-black rounded-2xl uppercase hover:bg-blue-700 shadow-xl shadow-blue-500/30 active:scale-95 transition-all">Kesin Onay</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. ŞİKAYETLER -->
          <div v-else-if="activeTab === 'reports'" class="space-y-6 max-w-4xl mx-auto">
            <div v-if="reports.length === 0" class="py-24 text-center opacity-30 font-black uppercase text-xs italic">Şikayet kaydı yok.</div>
            <div v-for="report in reports" :key="report.id" class="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-xl flex flex-col gap-6">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100">{{ report.reason }}</span>
                  <span v-if="report.reportedPost" class="px-2 py-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-lg border border-blue-100">POST</span>
                  <span v-else-if="report.reportedComment" class="px-2 py-1 bg-purple-50 text-purple-600 text-[8px] font-black uppercase rounded-lg border border-purple-100">YORUM</span>
                  <span v-else-if="report.reportedUser" class="px-2 py-1 bg-gray-50 text-gray-600 text-[8px] font-black uppercase rounded-lg border border-gray-100">PROFİL</span>
                </div>
                <span class="text-[9px] font-black text-gray-400 uppercase">{{ formatDate(report.createdAt) }}</span>
              </div>

              <div v-if="report.reportedPost || report.reportedComment" class="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                <p class="text-[9px] font-black text-gray-400 uppercase mb-2">Şikayet Edilen İçerik:</p>
                <p class="text-sm text-gray-800 dark:text-gray-200 font-medium">
                  {{ report.reportedPost?.content || report.reportedComment?.content }}
                </p>
                <p class="text-[9px] font-bold text-blue-500 mt-2 uppercase">
                  Yazar: @{{ report.reportedPost?.author?.username || report.reportedComment?.user?.username }}
                </p>
              </div>

              <div v-else-if="report.reportedUser" class="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <img v-if="report.reportedUser.avatarUrl" :src="getImageUrl(report.reportedUser.avatarUrl)" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center font-black text-gray-400">{{ report.reportedUser.username.charAt(0) }}</div>
                </div>
                <div>
                  <p class="text-[9px] font-black text-gray-400 uppercase">Şikayet Edilen Kullanıcı:</p>
                  <p class="text-sm font-black text-gray-900 dark:text-white">@{{ report.reportedUser.username }}</p>
                </div>
              </div>

              <div class="p-5 bg-orange-50/30 dark:bg-orange-900/10 rounded-2xl border-l-4 border-orange-500 text-sm font-bold text-gray-700 dark:text-gray-300 italic">
                <p class="text-[9px] font-black text-orange-500 uppercase mb-1">Şikayet Gerekçesi:</p>
                "{{ report.subReason || 'Gerekçe belirtilmemiş.' }}"
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                <p class="text-[10px] font-black text-gray-400 uppercase">Bildiren: <span class="text-gray-900 dark:text-white">@{{ report.reporter?.username }}</span></p>
                <div class="flex gap-2">
                  <button @click="report.reportedPost ? $router.push(`/post/${report.reportedPost.id}`) : (report.reportedComment ? $router.push(`/post/${report.reportedComment.postId}`) : $router.push(`/profile/${report.reportedUser.username}`))" class="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase rounded-xl shadow-lg hover:scale-105 transition-transform">İncele</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. GERİ BİLDİRİMLER -->
          <div v-else-if="activeTab === 'feedbacks'" class="space-y-6 max-w-4xl mx-auto">
            <div v-if="feedbacks.length === 0" class="py-24 text-center opacity-30 font-black uppercase text-xs italic">Geri bildirim yok.</div>
            <div v-for="fb in feedbacks" :key="fb.id" class="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-xl">
              <div class="flex justify-between items-center mb-6"><span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border" :class="getFeedbackStyle(fb.type).class">{{ getFeedbackStyle(fb.type).label }}</span><span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">{{ formatDate(fb.createdAt) }}</span></div>
              <div class="p-6 bg-slate-50 dark:bg-black/20 rounded-[2rem] text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed italic border border-white/5 shadow-inner">"{{ fb.message }}"</div>
              <p v-if="fb.user" class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6 text-right opacity-60">Gönderen: @{{ fb.user.username }}</p>
            </div>
          </div>

          <div v-else class="py-40 text-center opacity-20"><h3 class="text-3xl font-black italic uppercase tracking-tighter">Geliştiriliyor</h3></div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/api/client';
import { useToast } from 'vue-toastification';

const toast = useToast();
const activeTab = ref('users');
const adminTabsRef = ref<HTMLElement | null>(null);
const users = ref<any[]>([]);
const feedbacks = ref<any[]>([]);
const reports = ref<any[]>([]);
const pendingClubs = ref<any[]>([]);
const stats = ref({ totalUsers: 0, totalReports: 0, totalFeedbacks: 0 });

const getImageUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanPath = url.startsWith("/") ? url.substring(1) : url;
  return `http://localhost:3000/${cleanPath}`;
};

const adminTabs = [
  { id: 'clubs', name: 'Topluluklar' },
  { id: 'reports', name: 'Şikayetler' },
  { id: 'users', name: 'Kullanıcılar' },
  { id: 'feedbacks', name: 'Geri Bildirimler' },
  { id: 'market', name: 'MAKÜ-Spot' },
  { id: 'analytics', name: 'Analizler' }
];

const statItems = computed(() => [
  { label: 'Kullanıcılar', value: stats.value.totalUsers, bg: 'rgba(37, 99, 235, 0.05)', color: '#2563eb', border: 'rgba(37, 99, 235, 0.1)', icon: '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>' },
  { label: 'Şikayetler', value: stats.value.totalReports, bg: 'rgba(220, 38, 38, 0.05)', color: '#dc2626', border: 'rgba(220, 38, 38, 0.1)', icon: '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>' },
  { label: 'Başvurular', value: pendingClubs.value.length, bg: 'rgba(225, 29, 72, 0.05)', color: '#e11d48', border: 'rgba(225, 29, 72, 0.1)', icon: '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>' },
  { label: 'Geri Bildirim', value: stats.value.totalFeedbacks, bg: 'rgba(124, 58, 237, 0.05)', color: '#7c3aed', border: 'rgba(124, 58, 237, 0.1)', icon: '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>' },
  { label: 'MAKÜ-Spot', value: '0', bg: 'rgba(217, 119, 6, 0.05)', color: '#d97706', border: 'rgba(217, 119, 6, 0.1)', icon: '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>' },
  { label: 'Analizler', value: 'LIVE', bg: 'rgba(22, 163, 74, 0.05)', color: '#16a34a', border: 'rgba(22, 163, 74, 0.1)', icon: '<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>' }
]);

const handleTabsScroll = () => {
  const el = adminTabsRef.value;
  if (!el) return;
  const items = el.querySelectorAll('.tab-item');
  const containerCenterX = el.getBoundingClientRect().left + el.clientWidth / 2;
  items.forEach((item: any) => {
    const itemCenterX = item.getBoundingClientRect().left + item.clientWidth / 2;
    const factor = Math.min(Math.abs(containerCenterX - itemCenterX) / (el.clientWidth / 2.5), 1);
    const btn = item.querySelector('button');
    if (btn) { btn.style.transform = `scale(${1.1 - (factor * 0.2)})`; btn.style.opacity = (1 - (factor * 0.6)).toString(); }
  });
};

const centerTabItem = (index: number) => {
  const el = adminTabsRef.value;
  if (!el) return;
  const items = el.querySelectorAll('.tab-item');
  const target = items[index] as HTMLElement;
  if (target) el.scrollTo({ left: target.offsetLeft - (el.clientWidth / 2) + (target.clientWidth / 2), behavior: 'smooth' });
};

const fetchAllData = async () => {
  try {
    const [s, u, f, r, p] = await Promise.all([
      apiClient.get('/admin/stats'), 
      apiClient.get('/admin/users'),
      apiClient.get('/admin/feedbacks'), 
      apiClient.get('/admin/reports'),
      apiClient.get('/clubs/pending')
    ]);
    stats.value = s.data; 
    users.value = u.data; 
    feedbacks.value = f.data; 
    reports.value = r.data; 
    pendingClubs.value = p.data;
  } catch (err: any) { 
    console.error("Admin data fetch error:", err.response?.data || err.message);
    toast.error("Veriler yüklenemedi! (Hata: " + (err.response?.status || "Bilinmiyor") + ")"); 
  }
  finally { setTimeout(() => { centerTabItem(2); handleTabsScroll(); }, 300); }
};

const getFeedbackStyle = (t: string) => {
  const map: any = { error: { label: 'Hata', class: 'text-red-600 border-red-100 bg-red-50' }, suggestion: { label: 'Öneri', class: 'text-green-600 border-green-100 bg-green-50' }, complaint: { label: 'Şikayet', class: 'text-orange-600 border-orange-100 bg-orange-50' } };
  return map[t] || { label: 'Geri Bildirim', class: 'text-blue-600 border-blue-100 bg-blue-50' };
};

const handleApproveClub = async (id: number) => {
  try { await apiClient.post(`/clubs/${id}/approve-admin`); toast.success("Yayına alındı! 🚀"); fetchAllData(); } catch { toast.error("Hata!"); }
};

const handleRejectClub = async (id: number) => {
  try { await apiClient.post(`/clubs/${id}/reject`); toast.warning("Reddedildi."); fetchAllData(); } catch { toast.error("Hata!"); }
};

const handleBanToggle = async (user: any) => {
  try { const res = await apiClient.post(`/users/${user.id}/ban`); user.isBanned = res.data.banned; toast.info(res.data.message); fetchAllData(); } catch { toast.error("Hata!"); }
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const isEmoji = (str: string) => {
  if (!str) return true;
  return /\p{Emoji}/u.test(str) && str.length <= 2;
};

onMounted(fetchAllData);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
