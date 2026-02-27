<!-- src/views/Profile.vue -->
<template>
  <div class="max-w-4xl mx-auto pb-20">
    <!-- Loading & Error States -->
    <div v-if="loading" class="text-center py-20">
      <div
        class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
      ></div>
      <p class="mt-4 text-slate-500 dark:text-gray-400 font-bold">
        Yükleniyor...
      </p>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <div class="text-6xl mb-4">😕</div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {{ error }}
      </h2>
      <router-link to="/" class="btn-primary inline-block"
        >Ana Sayfaya Dön</router-link
      >
    </div>

    <template v-else-if="displayedUser">
      <!-- Profile Header -->
      <div class="relative">
        <div
          class="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-primary-700 dark:to-primary-800 rounded-t-xl overflow-hidden shadow-lg"
        >
          <img
            v-if="displayedUser.coverUrl"
            :src="displayedUser.coverUrl"
            alt="Cover"
            class="w-full h-full object-cover"
          />
        </div>
        <button
          v-if="isMyProfile"
          @click="showEditModal = true"
          class="absolute top-4 right-4 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-full text-sm font-bold backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
        >
          Profili Düzenle
        </button>
        <div class="absolute -bottom-16 left-6">
          <div
            class="p-1 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow-xl"
          >
            <img
              v-if="displayedUser.avatarUrl"
              :src="displayedUser.avatarUrl"
              alt="Avatar"
              class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 object-cover"
            />
            <div
              v-else
              class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
            >
              <span class="text-white font-bold text-4xl">{{
                userInitials
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Info -->
      <div
        class="bg-white dark:bg-gray-900/40 rounded-b-xl border-x border-b border-slate-200 dark:border-primary-900/30 pt-20 px-6 pb-6 shadow-sm"
      >
        <div
          class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4"
        >
          <div>
            <h1
              class="text-2xl font-black text-slate-900 dark:text-white flex items-center flex-wrap gap-2"
            >
              {{ displayedUser.fullName || displayedUser.username }}

              <!-- Rozetler (İkon Odaklı) -->
              <div
                v-if="
                  (displayedUser.badges && displayedUser.badges.length) ||
                  displayedUser.role === 'ADMIN'
                "
                class="flex gap-1.5 ml-1"
              >
                <!-- Kurucu Rozeti (Sadece Adminlere Otomatik) -->
                <div
                  v-if="displayedUser.role === 'ADMIN'"
                  class="group relative flex items-center justify-center cursor-help"
                >
                  <div
                    class="p-1.5 rounded-full text-white shadow-lg transition-all hover:scale-110"
                    :style="{
                      backgroundColor: '#1E3A8A',
                      boxShadow: '0 0 12px rgba(30, 58, 138, 0.4)',
                    }"
                  >
                    <div
                      class="w-3.5 h-3.5"
                      v-html="getBadgeIcon('founder')"
                    ></div>
                  </div>
                  <!-- Tooltip -->
                  <div
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10"
                  >
                    KURUCU
                  </div>
                </div>

                <div
                  v-for="ub in displayedUser.badges"
                  :key="ub.badge.id"
                  class="group relative flex items-center justify-center cursor-help"
                >
                  <div
                    class="p-1.5 rounded-full shadow-sm transition-all hover:scale-110 border"
                    :style="{
                      backgroundColor: ub.badge.color,
                      color:
                        ub.badge.color === '#FFFFFF' ||
                        ub.badge.color.toLowerCase() === '#ffffff'
                          ? '#1e293b'
                          : 'white',
                      borderColor:
                        ub.badge.color === '#FFFFFF' ||
                        ub.badge.color.toLowerCase() === '#ffffff'
                          ? '#e2e8f0'
                          : 'transparent',
                    }"
                  >
                    <div
                      class="w-3.5 h-3.5"
                      v-html="getBadgeIcon(ub.badge.icon)"
                    ></div>
                  </div>
                  <!-- Tooltip -->
                  <div
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-[9px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl"
                  >
                    {{ ub.badge.name }}
                  </div>
                </div>
              </div>
            </h1>
            <p class="text-slate-500 dark:text-gray-400 font-bold">
              @{{ displayedUser.username }}
            </p>

            <!-- Bölüm & Sınıf Bilgisi -->
            <div
              v-if="displayedUser.department || displayedUser.class"
              class="flex flex-wrap gap-2 mt-2"
            >
              <span
                v-if="displayedUser.department"
                class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-blue-100 dark:border-blue-800/30"
              >
                {{ displayedUser.department }}
              </span>
              <span
                v-if="displayedUser.class"
                class="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-purple-100 dark:border-purple-800/30"
              >
                {{ displayedUser.class }}
              </span>
            </div>
          </div>

          <div
            v-if="!isMyProfile && authStore.isAuthenticated"
            class="flex gap-2 relative"
          >
            <button
              @click="handleFollowToggle"
              :disabled="followLoading"
              class="px-6 py-2 rounded-full font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              :class="[
                isFollowing
                  ? 'bg-slate-200 dark:bg-gray-800 text-slate-900 dark:text-white'
                  : isRequestSent
                    ? 'bg-slate-100 dark:bg-gray-900 text-slate-400 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20',
              ]"
            >
              <span v-if="followLoading" class="animate-spin inline-block mr-1"
                >...</span
              >
              {{
                isFollowing
                  ? "Takipten Çık"
                  : isRequestSent
                    ? "İstek Gönderildi"
                    : "Takip Et"
              }}
            </button>

            <button
              @click="router.push({ name: 'Messages', query: { userId: displayedUser.id } })"
              class="p-2.5 rounded-full border border-slate-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-all"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>

            <div class="relative">
              <button
                @click="showOptionsMenu = !showOptionsMenu"
                class="p-2.5 rounded-full border border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
              >
                <svg
                  class="w-5 h-5 text-slate-600 dark:text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                  />
                </svg>
              </button>

              <div
                v-if="showOptionsMenu"
                class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  @click="openReportModal"
                  class="w-full text-left px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors flex items-center gap-3"
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Şikayet Et
                </button>
                <button
                  @click="openBlockConfirm"
                  class="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"
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
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ displayedUser.isBlocked ? "Engeli Kaldır" : "Engelle" }}
                </button>

                <div
                  v-if="authStore.user?.role === 'ADMIN'"
                  class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <p
                    class="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    Yönetici Paneli
                  </p>
                  <button
                    v-if="!isMyProfile"
                    @click="handleAdminBanToggle"
                    class="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    {{ displayedUser.isBanned ? "Yasağı Kaldır" : "Yasakla" }}
                  </button>
                  <button
                    v-if="!isMyProfile"
                    @click="handleAdminDeleteUser"
                    class="w-full text-left px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Tamamen Sil
                  </button>
                  <button
                    @click="openBadgeModal"
                    class="w-full text-left px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center gap-3"
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
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    Rozet Yönetimi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div v-if="displayedUser.bio" class="mt-4 mb-6">
          <p
            class="text-slate-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap"
          >
            {{ displayedUser.bio }}
          </p>
        </div>

        <div
          class="flex items-center gap-8 mb-8 pb-6 border-b border-slate-100 dark:border-gray-800"
        >
          <div>
            <span class="font-black text-slate-900 dark:text-white text-lg">{{
              displayedUser._count?.posts || 0
            }}</span
            ><span class="text-slate-500 dark:text-gray-400 ml-1 font-bold"
              >Paylaşım</span
            >
          </div>
          <button
            @click="openFollowers"
            :disabled="!canViewContent"
            class="hover:underline disabled:no-underline disabled:cursor-default"
          >
            <span class="font-black text-slate-900 dark:text-white text-lg">{{
              displayedUser._count?.followers || 0
            }}</span>
            <span class="text-slate-500 dark:text-gray-400 ml-1 font-bold"
              >Takipçi</span
            >
          </button>
          <button
            @click="openFollowing"
            :disabled="!canViewContent"
            class="hover:underline disabled:no-underline disabled:cursor-default"
          >
            <span class="font-black text-slate-900 dark:text-white text-lg">{{
              displayedUser._count?.following || 0
            }}</span>
            <span class="text-slate-500 dark:text-gray-400 ml-1 font-bold"
              >Takip</span
            >
          </button>
        </div>

        <!-- Privacy Lock State -->
        <div
          v-if="!canViewContent"
          class="py-20 flex flex-col items-center justify-center text-center"
        >
          <div
            class="w-24 h-24 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6"
          >
            <svg
              class="w-12 h-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3
            class="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter"
          >
            Bu hesap gizli
          </h3>
          <p
            class="text-sm text-slate-500 dark:text-gray-400 max-w-xs leading-relaxed"
          >
            Paylaşımlarını görmek için bu kullanıcıyı takip etmen gerekiyor.
          </p>
        </div>

        <template v-else>
          <div class="flex border-b border-slate-100 dark:border-gray-800 mb-6">
            <button
              v-for="tab in ['posts', 'reposts', 'likes']"
              :key="tab"
              @click="activeTab = tab as any"
              :class="[
                'px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all',
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600',
              ]"
            >
              {{
                tab === "posts"
                  ? "Gönderiler"
                  : tab === "reposts"
                    ? "Remakü"
                    : "Beğeniler"
              }}
            </button>
          </div>

          <div v-if="postsLoading" class="py-10 text-center">
            <div
              class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
            ></div>
          </div>
          <div
            v-else-if="currentTabPosts.length === 0"
            class="py-20 text-center"
          >
            <p
              class="text-slate-400 font-bold uppercase tracking-widest text-xs"
            >
              Henüz içerik yok
            </p>
          </div>
          <div v-else class="space-y-4">
            <PostCard
              v-for="post in currentTabPosts"
              :key="post.id"
              :post="post"
              @delete="handleDeletePost"
              @showComments="handleShowComments"
              @interaction="handleInteraction"
            />
          </div>
        </template>
      </div>
    </template>

    <!-- CUSTOM BLOCK CONFIRMATION MODAL -->
    <div
      v-if="showBlockModal"
      class="fixed inset-0 z-[110] flex items-center justify-center px-4"
    >
      <div
        class="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl"
        @click="showBlockModal = false"
      ></div>
      <div
        class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-primary-900/20 relative z-10 animate-in zoom-in-95 duration-200"
      >
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white">
            Emin misin?
          </h3>
          <p class="text-xs text-gray-500 mt-2 leading-relaxed">
            Bu kullanıcıyı engellediğinde paylaşımlarını göremezsin ve o da seni
            takip edemez.
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <button
            @click="handleBlockToggle"
            class="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all"
          >
            {{ displayedUser.isBlocked ? "ENGELİ KALDIR" : "EVET, ENGELLE" }}
          </button>
          <button
            @click="showBlockModal = false"
            class="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            VAZGEÇ
          </button>
        </div>
      </div>
    </div>

    <!-- REPORT MODAL -->
    <div
      v-if="showReportModal"
      class="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      <div
        class="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl"
        @click="closeReportModal"
      ></div>
      <div
        class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-primary-900/20 relative z-10 animate-in zoom-in-95 duration-200"
      >
        <div class="mb-6 flex items-center justify-between">
          <button
            v-if="reportStep === 2"
            @click="reportStep = 1"
            class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div v-else class="w-9"></div>
          <h3
            class="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter"
          >
            Şikayet Bildirimi
          </h3>
          <button
            @click="closeReportModal"
            class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div
          v-if="reportStep === 1"
          class="space-y-2 max-h-[60vh] overflow-y-auto pr-2"
        >
          <button
            v-for="(cat, name) in reportCategories"
            :key="name"
            @click="selectReportCategory(name)"
            class="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all text-left border border-transparent hover:border-blue-200"
          >
            <span class="font-bold text-gray-900 dark:text-white text-sm">{{
              name
            }}</span>
            <svg
              class="w-4 h-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <div
          v-if="reportStep === 2"
          class="space-y-2 max-h-[60vh] overflow-y-auto pr-2"
        >
          <p
            class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2"
          >
            {{ selectedReportCategory }}
          </p>
          <button
            v-for="reason in reportCategories[selectedReportCategory]"
            :key="reason"
            @click="submitReport(reason)"
            :disabled="reportLoading"
            class="w-full p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all text-left border border-transparent hover:border-red-200"
          >
            <span class="font-bold text-gray-900 dark:text-white text-sm">{{
              reason
            }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- BADGE MANAGEMENT MODAL (Ultra Minimalist & Icon Grid) -->
    <div
      v-if="showBadgeModal"
      class="fixed inset-0 z-[120] flex items-center justify-center px-4"
    >
      <div
        class="absolute inset-0 bg-white/60 dark:bg-gray-950/60 backdrop-blur-md"
        @click="showBadgeModal = false"
      ></div>
      <div
        class="bg-white dark:bg-gray-900 w-full max-w-xs rounded-[3rem] p-8 shadow-2xl border border-gray-100 dark:border-primary-900/20 relative z-10 animate-in zoom-in-95 duration-200"
      >
        <div class="text-center mb-8">
          <h3
            class="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest"
          >
            Rozet Ata
          </h3>
          <p class="text-[10px] text-gray-400 font-bold uppercase mt-1">
            İkon seçimi yapın
          </p>
        </div>

        <!-- Minimal Grid -->
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="badge in allBadges"
            :key="badge.id"
            @click="handleBadgeToggle(badge.id)"
            class="relative aspect-square rounded-2xl flex items-center justify-center transition-all group overflow-hidden border-2"
            :style="{
              backgroundColor: hasBadge(badge.id)
                ? badge.color + '15'
                : 'transparent',
              borderColor: hasBadge(badge.id)
                ? badge.color
                : 'rgba(226, 232, 240, 0.5)',
              color: badge.color,
            }"
          >
            <div
              class="w-8 h-8 transition-transform group-hover:scale-110"
              v-html="getBadgeIcon(badge.icon)"
            ></div>
            <!-- Checkmark for active -->
            <div v-if="hasBadge(badge.id)" class="absolute top-1 right-1">
              <div
                class="w-3 h-3 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :style="{ backgroundColor: badge.color }"
                ></div>
              </div>
            </div>
            <!-- Tooltip Label -->
            <div
              class="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[8px] font-black text-center py-1 translate-y-full group-hover:translate-y-0 transition-transform"
            >
              {{ badge.name.toUpperCase() }}
            </div>
          </button>
        </div>

        <button
          @click="showBadgeModal = false"
          class="w-full mt-8 py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-black rounded-2xl uppercase text-[10px] tracking-[0.3em] active:scale-95 transition-all"
        >
          Tamam
        </button>
      </div>
    </div>

    <!-- EDIT PROFILE MODAL -->
    <EditProfileModal
      :is-open="showEditModal"
      :user="displayedUser"
      @close="showEditModal = false"
      @save="handleSaveProfile"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useFollowStore } from "@/stores/follow";
import { useChatStore } from "@/stores/chat";
import { useNotificationsStore } from "@/stores/notifications";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import PostCard from "@/components/PostCard.vue";
import FollowModal from "@/components/FollowModal.vue";
import CommentsModal from "@/components/CommentsModal.vue";
import EditProfileModal from "@/components/EditProfileModal.vue";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const followStore = useFollowStore();
const chatStore = useChatStore();
const notificationsStore = useNotificationsStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const displayedUser = ref<any>(null);
const userPosts = ref<any[]>([]);
const reposts = ref<any[]>([]);
const likedPosts = ref<any[]>([]);
const activeTab = ref<"posts" | "reposts" | "likes">("posts");

const currentTabPosts = computed(() => {
  if (activeTab.value === "posts") return userPosts.value;
  if (activeTab.value === "reposts") return reposts.value;
  if (activeTab.value === "likes") return likedPosts.value;
  return [];
});
const followers = ref([]);
const following = ref([]);
const loading = ref(true);
const postsLoading = ref(true);
const followLoading = ref(false);
const error = ref("");

const showOptionsMenu = ref(false);
const showEditModal = ref(false);
const showBlockModal = ref(false);
const showBadgeModal = ref(false);
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);

// Rozet State & Ikon Eşleştirme
const allBadges = ref<any[]>([]);
const badgeIcons: Record<string, string> = {
  founder:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
  academic:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 12.083 0 0012 20.055a11.952 12.083 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>',
  herald:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>',
  social:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
  merchant:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>',
  observer:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>',
  voice:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>',
  athlete:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  inventor:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>',
  musician:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>',
};

const getBadgeIcon = (iconName: string) => {
  return (
    badgeIcons[iconName] ||
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
  );
};

// Şikayet Kategorileri
const reportCategories: Record<string, string[]> = {
  Nefret: [
    "Hakaretler",
    "Irkçı veya cinsiyetçi klişeler",
    "İnsanlıktan çıkarma",
    "Korku veya ayrımcılığa teşvik",
    "Nefret dolu göndermeler",
    "Nefret dolu semboller ve logolar",
  ],
  "Taciz ve Rahatsızlık": [
    "Hakaret",
    "İstenmeyen Cinsel İçerik",
    "Açıkça Nesneleştirme",
    "İstenmeyen Yetişkinlere Yönelik İçerik",
    "Şiddet Olayını İnkar Etme",
    "Hedefli Taciz",
  ],
  "Şiddet içeren konuşma": [
    "Şiddet Tehditleri",
    "Zarar Verme İsteği",
    "Şiddeti Yüceltme",
    "Şiddete Teşvik",
    "Şifreli Şiddete Teşvik",
  ],
  "Çocuk Güvenliği": [
    "Çocuk cinsel istismarı",
    "Çocuk istismarına hazırlık",
    "Fiziksel çocuk istismarı",
    "Reşit olmayan kullanıcı",
  ],
  Mahremiyet: [
    "Özel bilgileri paylaşmak",
    "Özel bilgileri paylaşmakla tehdit etmek",
    "Rızam olmadan özel görüntü paylaşımı",
    "İstemediğim görüntülerimin paylaşılması",
  ],
  "Yasadışı Davranışlar": [
    "İnsan sömürüsü",
    "Cinsel hizmetler",
    "Uyuşturucu",
    "Silah",
    "Nesli tehlikede türler",
    "Yasadışı faaliyet aracılığı",
  ],
  "İstenmeyen e-posta": [
    "Sahte etkileşim",
    "Dolandırıcılık",
    "Sahte hesaplar",
    "Zararlı bağlantılar",
  ],
  "İntihar veya Zarar Verme": [
    "Kendine zarar vermeyi teşvik",
    "Destekleme",
    "Talimat vermek",
    "Strateji paylaşmak",
  ],
  "Hassas veya Rahatsız Edici Medya": [
    "Grafik içerik",
    "Gereksiz kanlı sahneler",
    "Yetişkin çıplaklığı",
    "Şiddet içeren cinsel davranışlar",
    "Ölü birey tasviri",
  ],
  Taklit: [
    "Başka biri gibi davranmak",
    "Kurallara uymayan parodi/hayran hesapları",
  ],
  "Şiddet ve Nefret Dolu Varlıklar": [
    "Şiddet içeren aşırıcılık ve terörizm",
    "Nefret grupları ve ağları",
  ],
  "Yurttaşlık Bütünlüğü": [
    "Seçmen katılımını engelleme",
    "Oy kullanmanın korkutulması",
    "Yanıltıcı içerik",
  ],
};

// State Helpers
const reportStep = ref(1);
const selectedReportCategory = ref("");
const reportLoading = ref(false);
const showReportModal = ref(false);

const openReportModal = () => {
  showOptionsMenu.value = false;
  showReportModal.value = true;
  reportStep.value = 1;
};
const closeReportModal = () => {
  showReportModal.value = false;
};
const selectReportCategory = (name: string) => {
  selectedReportCategory.value = name;
  reportStep.value = 2;
};

const submitReport = async (subReason: string) => {
  reportLoading.value = true;
  try {
    await apiClient.post("/users/report", {
      reportedUsername: displayedUser.value.username,
      reason: selectedReportCategory.value,
      subReason: subReason,
    });
    toast.success("Şikayet iletildi! 🛡️");
    closeReportModal();
  } catch {
    toast.error("Şikayet gönderilemedi.");
  } finally {
    reportLoading.value = false;
  }
};

const openBlockConfirm = () => {
  showOptionsMenu.value = false;
  showBlockModal.value = true;
};

const handleBlockToggle = async () => {
  showBlockModal.value = false;
  try {
    const res = await apiClient.post(`/users/${displayedUser.value.id}/block`);
    const isBlocked = res.data.blocked;
    displayedUser.value.isBlocked = isBlocked;
    
    // Chat listesini ve aktif sohbeti güncelle
    await chatStore.fetchConversations();
    
    // Eğer bu kişiyle açık bir sohbet varsa reaktif olarak güncelle
    if (chatStore.activeConversation) {
      const otherId = chatStore.activeConversation.otherParticipant?.id || 
                      chatStore.activeConversation.participants?.find((p: any) => Number(p.userId || p.id) !== authStore.userId)?.user?.id;
      
      if (Number(otherId) === Number(displayedUser.value.id)) {
        chatStore.activeConversation.isBlockedByMe = isBlocked;
      }
    }

    if (isBlocked) {
      toast.warning("Kullanıcı engellendi.");
      displayedUser.value.isFollowing = false;
      displayedUser.value._count.followers = Math.max(
        0,
        displayedUser.value._count.followers - 1,
      );
    } else {
      toast.success("Engel kaldırıldı.");
    }
  } catch {
    toast.error("Hata oluştu.");
  }
};

const openBadgeModal = async () => {
  showOptionsMenu.value = false;
  showBadgeModal.value = true;
  try {
    const res = await apiClient.get("/users/badges/all");
    allBadges.value = res.data;
  } catch {
    toast.error("Rozetler yüklenemedi.");
  }
};

const hasBadge = (badgeId: number) =>
  displayedUser.value?.badges?.some((ub: any) => ub.badgeId === badgeId);

const handleBadgeToggle = async (badgeId: number) => {
  try {
    const res = await apiClient.post(
      `/users/${displayedUser.value.id}/badges/${badgeId}`,
    );
    if (res.data.assigned) toast.success("Rozet atandı! ✨");
    else toast.info("Rozet kaldırıldı.");
    fetchProfile();
  } catch {
    toast.error("İşlem başarısız.");
  }
};

const handleAdminBanToggle = async () => {
  try {
    const res = await apiClient.post(`/users/${displayedUser.value.id}/ban`);
    displayedUser.value.isBanned = res.data.banned;
    toast.info(res.data.message);
  } catch {
    toast.error("Yetki hatası.");
  }
};

const handleAdminDeleteUser = async () => {
  if (!confirm("HESABI TAMAMEN SİLECEKSİNİZ! Emin misiniz?")) return;
  try {
    await apiClient.delete(`/users/${displayedUser.value.id}/admin`);
    toast.success("Hesap silindi.");
    router.push("/");
  } catch {
    toast.error("Hata oluştu.");
  }
};

const userInitials = computed(() => {
  if (!displayedUser.value) return "";
  const name = displayedUser.value.fullName || displayedUser.value.username;
  return name.charAt(0).toUpperCase();
});

const isMyProfile = computed(
  () => authStore.user?.id === displayedUser.value?.id,
);
const isFollowing = computed(() => displayedUser.value?.isFollowing);
const isRequestSent = computed(() => displayedUser.value?.isFollowRequestSent);
const canViewContent = computed(() => {
  if (isMyProfile.value) return true;
  if (!displayedUser.value?.isPrivate) return true;
  return isFollowing.value;
});

const fetchProfile = async () => {
  const paramId = route.params.id as string;

  // Eğer kendi profilimiz ise ama ID yoksa, authStore'un yüklenmesini bekle
  if (!paramId && !authStore.user?.username) {
    // 1 saniye bekleyelim, eğer hala yoksa hata verelim (veya login'e atalım)
    let retryCount = 0;
    while (!authStore.user?.username && retryCount < 10) {
      await new Promise((r) => setTimeout(r, 100));
      retryCount++;
    }
  }

  const username = paramId || authStore.user?.username;

  // Geçersiz kullanıcı adı kontrolü (undefined stringi vb.)
  if (!username || username === "undefined" || username === "null") {
    if (!paramId && !authStore.isAuthenticated) {
      router.push("/auth");
      return;
    }
    error.value = "Kullanıcı adı belirtilmedi.";
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = "";
  try {
    const url = `/users/username/${username}`;
    const params: any = {};
    if (authStore.user?.id) {
      params.currentUserId = authStore.user.id;
    }
    const response = await apiClient.get(url, { params });
    displayedUser.value = response.data;

    // Sadece içerik görebiliyorsak diğer verileri çek
    if (canViewContent.value) {
      await Promise.all([
        fetchUserPosts(displayedUser.value.id),
        fetchUserReposts(displayedUser.value.id),
        fetchLikedPosts(displayedUser.value.id),
        fetchFollowData(displayedUser.value.id),
      ]);
    } else {
      postsLoading.value = false;
    }
  } catch {
    error.value = "Kullanıcı bulunamadı.";
  } finally {
    loading.value = false;
  }
};

const handleFollowToggle = async () => {
  if (!authStore.user) return;
  followLoading.value = true;
  try {
    const result = await followStore.toggleFollow(displayedUser.value.id);
    // Backend'den dönen status bilgisine göre state güncelle
    if (result.status === "PENDING") {
      displayedUser.value.isFollowRequestSent = true;
      displayedUser.value.isFollowing = false;
    } else if (result.status === "FOLLOWING") {
      displayedUser.value.isFollowRequestSent = false;
      displayedUser.value.isFollowing = true;
      displayedUser.value._count.followers++;
      // Takip gerçekleşince verileri çek
      fetchProfile();
    } else {
      displayedUser.value.isFollowRequestSent = false;
      displayedUser.value.isFollowing = false;
      if (!result.status || result.status === "NONE") {
        // Eğer zaten takip ediyorduysa ve bıraktıysa azalt
        if (isFollowing.value)
          displayedUser.value._count.followers = Math.max(
            0,
            displayedUser.value._count.followers - 1,
          );
      }
    }
    toast.success(result.message);
  } catch {
    toast.error("İşlem başarısız.");
  } finally {
    followLoading.value = false;
  }
};

const handleSaveProfile = async (data: any) => {
  try {
    // Username güncellenemez olduğu için DTO hatası vermemesi adına çıkarıyoruz
    const { username, ...updateData } = data;

    // API isteği atarken currentUserId'yi de gönderiyoruz
    const res = await apiClient.patch(
      `/users/${displayedUser.value.id}`,
      updateData,
      {
        params: { currentUserId: authStore.user?.id },
      },
    );

    const updatedUser = res.data;
    const userId = Number(displayedUser.value.id);

    // 1. Yerel Profil Görünümünü Güncelle
    displayedUser.value = { ...displayedUser.value, ...updatedUser };

    // 2. Auth Store'u Güncelle (LocalStorage dahil)
    if (authStore.user?.id === userId) {
      authStore.updateUser(updatedUser);
    }

    // 3. CANLI GÜNCELLEME: Tüm store'lardaki kullanıcı bilgilerini anında tazele
    const profileUpdateInfo = {
      fullName: updatedUser.fullName,
      avatarUrl: updatedUser.avatarUrl,
      department: updatedUser.department,
      class: updatedUser.class
    };

    postsStore.updateUserInPosts(userId, profileUpdateInfo);
    chatStore.updateUserInChat(userId, profileUpdateInfo);
    notificationsStore.updateUserInNotifications(userId, profileUpdateInfo);

    showEditModal.value = false;
    toast.success("Profil güncellendi! ✨");
  } catch (err: any) {
    const msg = err.response?.data?.message?.[0] || "Güncelleme başarısız.";
    toast.error(msg);
  }
};

const fetchUserPosts = async (userId: number) => {
  postsLoading.value = true;
  try {
    const params: any = {};
    if (authStore.user?.id) {
      params.currentUserId = authStore.user.id;
    }
    const res = await apiClient.get(`/users/${userId}/posts`, { params });
    userPosts.value = res.data;
  } finally {
    postsLoading.value = false;
  }
};

const fetchUserReposts = async (userId: number) => {
  try {
    reposts.value = await postsStore.fetchUserReposts(
      userId,
      authStore.user?.id,
    );
  } catch {}
};

const fetchLikedPosts = async (userId: number) => {
  try {
    const params: any = {};
    if (authStore.user?.id) {
      params.currentUserId = authStore.user.id;
    }
    const res = await apiClient.get(`/posts/user/${userId}/likes`, { params });
    likedPosts.value = res.data;
  } catch {}
};

const fetchFollowData = async (userId: number) => {
  try {
    const followersData = await followStore.getFollowers(userId);
    followers.value = followersData.map((f: any) => f.follower);
    const followingData = await followStore.getFollowing(userId);
    following.value = followingData.map((f: any) => f.following);
  } catch {}
};

const handleInteraction = (data: {
  type: string;
  postId: number;
  status: boolean;
  post?: any;
}) => {
  const { type, postId, status, post } = data;

  // Tüm listelerde ilgili postu bul ve güncelle (beğeni sayısı vb.)
  const updateLists = (list: any[]) => {
    list.forEach((p) => {
      const target = p.repostOf || p;
      if (target.id === postId) {
        if (type === "like") {
          target.isLiked = status;
          if (target._count) {
            target._count.likes = Math.max(
              0,
              target._count.likes + (status ? 1 : -1),
            );
          }
        } else if (type === "repost") {
          target.isReposted = status;
          if (target._count) {
            target._count.reposts = Math.max(
              0,
              target._count.reposts + (status ? 1 : -1),
            );
          }
        }
      }
    });
  };

  updateLists(userPosts.value);
  updateLists(reposts.value);
  updateLists(likedPosts.value);

  // Kendi profilimizdeysek listelere ekle/çıkar yap
  if (isMyProfile.value) {
    if (type === "repost") {
      if (status && post) {
        // Zaten listede yoksa başa ekle
        if (!reposts.value.some((r) => r.id === post.id)) {
          reposts.value.unshift(post);
        }
      } else {
        // Remakü geri alındıysa listeden çıkar
        reposts.value = reposts.value.filter((r) => r.repostId !== postId);
      }
    }

    if (type === "like") {
      if (!status) {
        likedPosts.value = likedPosts.value.filter(
          (p) => (p.repostOf?.id || p.id) !== postId,
        );
      } else if (post) {
        if (
          !likedPosts.value.some((p) => (p.repostOf?.id || p.id) === postId)
        ) {
          likedPosts.value.unshift(post);
        }
      }
    }
  }
};
const handleDeletePost = async (postId: number) => {
  if (!confirm("Silmek istediğine emin misin?")) return;
  try {
    await postsStore.deletePost(postId);
    fetchProfile();
  } catch {}
};

const handleShowComments = (id: number) => {
  selectedPostId.value = id;
  commentsModalOpen.value = true;
};
const openFollowers = () => {
  showFollowersModal.value = true;
};
const openFollowing = () => {
  showFollowingModal.value = true;
};
const formatJoinDate = (d: any) =>
  new Date(d).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

onMounted(fetchProfile);
watch(() => route.params.id, fetchProfile);
</script>

<style scoped>
.btn-primary {
  @apply px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
