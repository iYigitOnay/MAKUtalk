<!-- src/views/Admin.vue -->
<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8 pb-24 bg-white dark:bg-gray-950 min-h-screen transition-colors duration-500">
    <!-- Modern Header -->
    <header class="relative mb-12 py-10 px-8 rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl shadow-blue-900/20 group">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20"></div>
      <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg shadow-blue-500/40">Sistem Admin</span>
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
          </div>
          <h1 class="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
            Komuta <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Merkezi</span>
          </h1>
          <p class="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest opacity-70">MAKUtalk v1.2.5 • Kampüs Denetim</p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="h-12 w-[1px] bg-white/10 hidden md:block"></div>
          <div class="text-right hidden sm:block">
            <p class="text-white font-black text-sm uppercase tracking-tighter">{{ stats.totalUsers }} Aktif Kullanıcı</p>
            <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Veritabanı Güncel</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Visual Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <!-- User Stat Card -->
      <div class="relative group">
        <div class="absolute inset-0 bg-blue-600 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
        <div class="relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center overflow-hidden h-full min-h-[220px] justify-center">
          <div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-1">Toplam Kullanıcı</p>
          <h3 class="text-4xl font-black text-gray-900 dark:text-white italic tracking-tighter">{{ stats.totalUsers }}</h3>
        </div>
      </div>

      <!-- Report Stat Card -->
      <div class="relative group">
        <div class="absolute inset-0 bg-orange-600 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
        <div class="relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center overflow-hidden h-full min-h-[220px] justify-center">
          <div class="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-1">Acil Şikayetler</p>
          <h3 class="text-4xl font-black text-gray-900 dark:text-white italic tracking-tighter">{{ stats.totalReports }}</h3>
        </div>
      </div>

      <!-- Feedback Stat Card -->
      <div class="relative group">
        <div class="absolute inset-0 bg-purple-600 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
        <div class="relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center overflow-hidden h-full min-h-[220px] justify-center">
          <div class="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-1">Yeni Mesajlar</p>
          <h3 class="text-4xl font-black text-gray-900 dark:text-white italic tracking-tighter">{{ stats.totalFeedbacks }}</h3>
        </div>
      </div>
    </div>

    <!-- Glass Tabs -->
    <div class="flex items-center justify-center mb-12">
      <div class="flex p-1.5 bg-gray-100 dark:bg-gray-900/80 rounded-[2rem] border border-gray-200 dark:border-primary-900/20 backdrop-blur-md shadow-inner">
        <button 
          v-for="tab in [{id:'users', n:'Kullanıcılar', i: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'}, {id:'reports', n:'Şikayetler', i: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'}, {id:'feedbacks', n:'Mesajlar', i: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'}]" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300"
          :class="activeTab === tab.id ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.i" /></svg>
          {{ tab.n }}
        </button>
      </div>
    </div>

    <!-- Dynamic Content Area -->
    <transition name="fade" mode="out-in">
      <!-- 1. KULLANICI YÖNETİMİ -->
      <div v-if="activeTab === 'users'" key="users" class="space-y-4">
        <div class="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-primary-900/20 overflow-hidden shadow-2xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-primary-900/10">
                  <th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kimlik Bilgisi</th>
                  <th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Erişim Durumu</th>
                  <th class="p-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Yönetim</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-primary-900/10">
                <tr v-for="user in users" :key="user.id" class="group hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all duration-300">
                  <td class="p-8">
                    <div class="flex items-center gap-4">
                      <div class="relative">
                        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center font-black text-xl text-blue-600 uppercase shadow-sm group-hover:rotate-3 transition-transform">{{ user.username.charAt(0) }}</div>
                        <div v-if="user.role === 'ADMIN'" class="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
                      </div>
                      <div>
                        <p class="text-base font-black text-gray-900 dark:text-white tracking-tighter">@{{ user.username }}</p>
                        <p class="text-[11px] text-gray-400 font-bold uppercase tracking-tight opacity-60">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-8 text-center">
                    <span class="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all" :class="user.isBanned ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-600' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-600'">
                      {{ user.isBanned ? 'ERİŞİM YASAKLI' : 'AKTİF KULLANICI' }}
                    </span>
                  </td>
                  <td class="p-8 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button 
                        @click="handleBanToggle(user)" 
                        class="p-2 rounded-xl transition-all active:scale-90 group/btn bg-transparent"
                        :title="user.isBanned ? 'Yasağı Kaldır' : 'Yasakla'"
                      >
                        <!-- Arka plan yok, sadece ikon renkli -->
                        <svg v-if="!user.isBanned" class="w-6 h-6 text-red-500 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <svg v-else class="w-6 h-6 text-emerald-500 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                      <button @click="$router.push(`/profile/${user.username}`)" class="p-2 text-blue-600 hover:text-blue-700 transition-all active:scale-90 bg-transparent">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 2. ŞİKAYET DENETİMİ -->
      <div v-else-if="activeTab === 'reports'" key="reports" class="space-y-6 max-w-4xl mx-auto">
        <div v-if="reports.length === 0" class="text-center py-24 bg-gray-50/50 dark:bg-gray-900/40 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-primary-900/10">
          <p class="text-gray-400 font-black uppercase tracking-[0.3em]">Huzur hakim, şikayet yok.</p>
        </div>
        <div v-for="report in reports" :key="report.id" class="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[3rem] shadow-xl hover:shadow-orange-500/10 transition-all flex flex-col gap-8 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/10 transition-all"></div>
          
          <!-- Header Info -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <span class="px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 border border-orange-200/50">{{ report.reason }}</span>
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{{ formatDate(report.createdAt) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <span class="text-[10px] font-black text-gray-400 uppercase">Bildiren</span>
              <p class="text-xs font-black text-gray-900 dark:text-white">@{{ report.reporter.username }}</p>
            </div>
          </div>

          <!-- Description Section -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-1">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Şikayet Gerekçesi</p>
              <p class="text-sm font-bold text-gray-900 dark:text-white leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border-l-4 border-orange-500">
                {{ report.subReason || 'Detay belirtilmemiş.' }}
              </p>
            </div>

            <!-- Content Preview -->
            <div class="md:col-span-2">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Şikayet Edilen İçerik</p>
              
              <div v-if="report.reportedPost" class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group/box h-full">
                <p class="text-[13px] text-slate-600 dark:text-slate-300 italic mb-6 leading-relaxed">"{{ report.reportedPost.content }}"</p>
                <div class="flex items-center justify-between mt-auto">
                  <button @click="$router.push(`/post/${report.reportedPost.id}`)" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">GÖNDERİYİ DENETLE</button>
                  <span class="text-[10px] font-bold text-gray-400">Post ID: #{{ report.reportedPost.id }}</span>
                </div>
              </div>

              <div v-else-if="report.reportedUser" class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 h-full flex flex-col justify-center items-center text-center">
                <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-black text-blue-600 mb-3">@</div>
                <p class="text-base font-black text-gray-900 dark:text-white mb-4">@{{ report.reportedUser.username }}</p>
                <button @click="$router.push(`/profile/${report.reportedUser.username}`)" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">PROFİLİ DENETLE</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. GERİ BİLDİRİM KUTUSU -->
      <div v-else-if="activeTab === 'feedbacks'" key="feedbacks" class="space-y-6">
        <div v-if="feedbacks.length === 0" class="text-center py-24 bg-gray-50/50 dark:bg-gray-900/40 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-primary-900/10">
          <p class="text-gray-400 font-black uppercase tracking-[0.3em]">Mesaj kutusu boş.</p>
        </div>
        <div v-for="feedback in feedbacks" :key="feedback.id" class="group p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-primary-900/20 rounded-[3rem] shadow-lg hover:shadow-2xl transition-all duration-500">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
              </div>
              <div>
                <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block mb-1" :class="getFeedbackTypeClass(feedback.type)">
                  {{ translateFeedbackType(feedback.type) }}
                </span>
                <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">{{ formatDate(feedback.createdAt) }}</p>
              </div>
            </div>
            <div v-if="feedback.user" class="flex items-center gap-2 px-4 py-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/20">
              <div class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white capitalize">{{ feedback.user.username.charAt(0) }}</div>
              <p class="text-xs font-black text-gray-900 dark:text-white">@{{ feedback.user.username }}</p>
            </div>
            <div v-else class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic opacity-50">Anonim Gönderi</div>
          </div>
          <div class="relative p-6 bg-slate-50/50 dark:bg-gray-800/30 rounded-[2rem] border border-gray-50 dark:border-gray-800">
            <svg class="absolute -left-3 -top-3 w-10 h-10 text-gray-200 dark:text-gray-700 pointer-events-none opacity-40 group-hover:text-blue-500/20 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C11.1216 16 12.017 16.8954 12.017 18V21C12.017 22.1046 11.1216 23 10.017 23H7.017C5.91243 23 5.017 22.1046 5.017 21Z" /></svg>
            <p class="text-base text-gray-700 dark:text-gray-200 font-medium leading-relaxed pl-4 relative z-10">
              {{ feedback.message }}
            </p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/api/client';
import { useToast } from 'vue-toastification';

const toast = useToast();
const activeTab = ref('users');
const users = ref<any[]>([]);
const feedbacks = ref<any[]>([]);
const reports = ref<any[]>([]);
const stats = ref({
  totalUsers: 0,
  totalReports: 0,
  totalFeedbacks: 0
});

const fetchAllData = async () => {
  try {
    const [statsRes, usersRes, feedbacksRes, reportsRes] = await Promise.all([
      apiClient.get('/admin/stats'),
      apiClient.get('/admin/users'),
      apiClient.get('/admin/feedbacks'),
      apiClient.get('/admin/reports')
    ]);
    
    stats.value = statsRes.data;
    users.value = usersRes.data;
    feedbacks.value = feedbacksRes.data;
    reports.value = reportsRes.data;
  } catch (err: any) {
    console.error("Admin data load error:", err);
    toast.error("Veriler yüklenirken bir hata oluştu.");
  }
};

const handleBanToggle = async (user: any) => {
  try {
    const res = await apiClient.post(`/users/${user.id}/ban`);
    user.isBanned = res.data.banned;
    toast.info(res.data.message);
    // İstatistikleri tazele
    const statsRes = await apiClient.get('/admin/stats');
    stats.value = statsRes.data;
  } catch { toast.error("İşlem başarısız."); }
};

const translateFeedbackType = (type: string) => {
  const map: any = { error: 'Hata Bildirimi', suggestion: 'Öneri', complaint: 'Şikayet', other: 'Diğer' };
  return map[type] || type;
};

const getFeedbackTypeClass = (type: string) => {
  const map: any = { 
    error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200/50', 
    suggestion: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200/50',
    complaint: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200/50',
    other: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50'
  };
  return map[type] || 'bg-gray-100 text-gray-600';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchAllData();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Custom Scrollbar for modern look */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-slate-200 dark:bg-slate-800 rounded-full;
}
</style>
