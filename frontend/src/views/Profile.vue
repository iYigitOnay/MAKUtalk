<template>
  <div class="max-w-4xl mx-auto pb-20 text-left">
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
          class="h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-primary-700 dark:to-primary-800 rounded-t-xl overflow-hidden shadow-lg group"
        >
          <img
            v-if="displayedUser.coverUrl"
            :src="getImageUrl(displayedUser.coverUrl)"
            alt="Cover"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <button
          v-if="isMyProfile"
          @click="showEditModal = true"
          class="absolute top-3 right-3 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full text-[10px] sm:text-sm font-bold backdrop-blur-sm transition-all z-10"
        >
          Profili Düzenle
        </button>
        <div class="absolute -bottom-10 sm:-bottom-16 left-4 sm:left-6">
          <div
            @click="displayedUser.avatarUrl ? (showAvatarZoom = true) : null"
            class="relative group rounded-full shadow-xl transition-transform duration-300 hover:scale-105 active:scale-95"
            :class="[displayedUser.avatarUrl ? 'cursor-pointer' : '']"
          >
            <UserAvatar
              :user="displayedUser"
              size="profile"
              customClass="border-4 border-white dark:border-gray-950"
            />

            <div
              v-if="displayedUser.isBanned"
              class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full"
            >
              <component
                :is="getBadgeComponent('shield-off')"
                class="w-8 h-8 sm:w-12 sm:h-12 text-white drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Info Section -->
      <div
        class="bg-white dark:bg-gray-950/40 rounded-b-xl border-x border-b border-slate-200 dark:border-primary-900/30 pt-12 sm:pt-20 px-4 sm:px-6 pb-6 shadow-sm"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6"
        >
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h1
                class="text-lg sm:text-2xl font-black text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-full"
                :class="{
                  'text-gray-400 line-through decoration-red-500':
                    displayedUser.isBanned,
                }"
              >
                {{ displayedUser.fullName || displayedUser.username }}
              </h1>

              <!-- BADGES -->
              <div
                v-if="
                  (displayedUser.badges?.length ||
                    displayedUser.role === 'ADMIN') &&
                  !displayedUser.isBanned
                "
                class="flex flex-wrap gap-1 items-center"
              >
                <div
                  v-if="displayedUser.role === 'ADMIN'"
                  class="p-1 rounded-full text-white bg-[#1E3A8A] shadow-sm group relative"
                >
                  <component
                    :is="getBadgeComponent('crown')"
                    class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
                  />
                  <div
                    class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[100] pointer-events-none uppercase"
                  >
                    Sistem Kurucusu
                  </div>
                </div>
                <div
                  v-for="ub in displayedUser.badges"
                  :key="ub.badge?.id || ub.id"
                  class="p-1 rounded-full border border-gray-100 group relative"
                  :style="{
                    backgroundColor: ub.badge?.color || '#3b82f6',
                    color: 'white',
                  }"
                >
                  <component
                    :is="getBadgeComponent(ub.badge?.icon || 'award')"
                    class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"
                  />
                  <div
                    class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[100] pointer-events-none uppercase"
                  >
                    {{ ub.badge?.name }}
                  </div>
                </div>
              </div>
            </div>
            <p
              class="text-xs sm:text-base text-slate-500 dark:text-gray-400 font-bold"
            >
              @{{ displayedUser.username }}
            </p>

            <!-- ACADEMIC INFO (Option 1) -->
            <div
              v-if="displayedUser.department || displayedUser.class"
              class="mt-2 flex items-center gap-1 text-[11px] sm:text-sm text-slate-500 dark:text-gray-400 font-bold opacity-90 animate-in fade-in slide-in-from-left-2 duration-500"
            >
              <component
                :is="getBadgeComponent('graduation-cap')"
                class="w-3.5 h-3.5 text-blue-500 dark:text-blue-400"
              />
              <span>{{
                displayedUser.department || "Bölüm Belirtilmemiş"
              }}</span>
              <span
                v-if="displayedUser.department && displayedUser.class"
                class="mx-0.5 opacity-30"
                >•</span
              >
              <span v-if="displayedUser.class">{{ displayedUser.class }}</span>
            </div>
          </div>

          <div
            v-if="!isMyProfile && authStore.isAuthenticated"
            class="flex items-center gap-2"
          >
            <template v-if="!displayedUser.isBanned">
              <button
                @click="handleFollowToggle"
                :disabled="followLoading"
                class="px-5 py-2 sm:py-2.5 rounded-full font-black text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
                :class="[
                  displayedUser.followStatus === 'FOLLOWING'
                    ? 'bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10'
                    : displayedUser.followStatus === 'PENDING'
                      ? 'bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-gray-800'
                      : 'bg-blue-600 text-white shadow-blue-500/20',
                ]"
              >
                {{
                  displayedUser.followStatus === "FOLLOWING"
                    ? "Takipten Çık"
                    : displayedUser.followStatus === "PENDING"
                      ? "İstek Gönderildi"
                      : "Takip Et"
                }}
              </button>
              <button
                @click="handleMessageUser"
                class="p-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm active:scale-95"
              >
                <component
                  :is="getBadgeComponent('mail')"
                  class="w-5 h-5 text-slate-600 dark:text-gray-300"
                />
              </button>
            </template>

            <div class="relative" id="profile-options-container">
              <button
                @click="showOptionsMenu = !showOptionsMenu"
                class="p-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm active:scale-95"
              >
                <component
                  :is="getBadgeComponent('more-horizontal')"
                  class="w-5 h-5 text-slate-600 dark:text-gray-300"
                />
              </button>

              <!-- DROPDOWN MENU (TELEPORTED TO BODY TO PREVENT CLIPPING) -->
              <Teleport to="body">
                <div
                  v-if="showOptionsMenu"
                  class="fixed bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-[2rem] shadow-2xl z-[999] py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
                  :style="dropdownStyle"
                >
                  <button
                    v-if="!displayedUser.isBanned"
                    @click="openUserReport"
                    class="w-full text-left px-5 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors flex items-center gap-3"
                  >
                    <component
                      :is="getBadgeComponent('alert-triangle')"
                      class="w-5 h-5"
                    />
                    Şikayet Et
                  </button>
                  <button
                    @click="handleBlockToggle"
                    class="w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"
                  >
                    <component
                      :is="getBadgeComponent('user-x')"
                      class="w-5 h-5"
                    />
                    {{ displayedUser?.isBlocked ? "Engeli Kaldır" : "Engelle" }}
                  </button>
                  <!-- ADMIN SECTION -->
                  <div
                    v-if="authStore.user?.role === 'ADMIN'"
                    class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <p
                      class="px-5 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                    >
                      Yönetici Paneli
                    </p>
                    <button
                      @click="handleBanToggle"
                      class="w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"
                    >
                      <component
                        :is="getBadgeComponent('shield-off')"
                        class="w-5 h-5"
                      />
                      {{
                        displayedUser?.isBanned ? "Yasağı Kaldır" : "Yasakla"
                      }}
                    </button>
                    <button
                      @click="handleAdminDeleteUser"
                      class="w-full text-left px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                    >
                      <component
                        :is="getBadgeComponent('trash-2')"
                        class="w-5 h-5"
                      />
                      Tamamen Sil
                    </button>
                    <button
                      @click="showBadgeModal = true"
                      class="w-full text-left px-5 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center gap-3"
                    >
                      <component
                        :is="getBadgeComponent('award')"
                        class="w-5 h-5"
                      />
                      Rozet Yönetimi
                    </button>
                  </div>
                </div>
                <!-- Backdrop to close dropdown -->
                <div
                  v-if="showOptionsMenu"
                  @click="showOptionsMenu = false"
                  class="fixed inset-0 z-[998] bg-transparent"
                ></div>
              </Teleport>
            </div>
          </div>
        </div>

        <!-- BANNED PROFILE VIEW -->
        <div v-if="displayedUser.isBanned" class="mt-8 mb-4">
          <div
            class="relative group overflow-hidden bg-gradient-to-br from-red-500/10 via-red-600/5 to-transparent border border-red-500/20 rounded-[2.5rem] p-8 text-center backdrop-blur-sm"
          >
            <!-- Animated Red Pulse -->
            <div
              class="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl animate-pulse"
            ></div>
            <div
              class="absolute -bottom-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-700"
            ></div>

            <div class="relative z-10 flex flex-col items-center gap-4">
              <div
                class="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40 animate-bounce"
              >
                <component
                  :is="getBadgeComponent('shield-alert')"
                  class="w-10 h-10 text-white"
                />
              </div>
              <h2
                class="text-2xl sm:text-3xl font-black text-red-600 uppercase tracking-tighter"
              >
                BU HESAP ASKIYA ALINDI
              </h2>
              <p
                class="max-w-md text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed"
              >
                Topluluk kurallarını ciddi şekilde ihlal ettiği tespit edildiği
                için bu hesaba erişim kalıcı olarak sınırlandırılmıştır.
                <br /><br />
                <span
                  class="text-[10px] opacity-50 uppercase tracking-widest font-black"
                  >Güvenli bir kampüs ortamı için çalışıyoruz.</span
                >
              </p>
            </div>
          </div>
        </div>

        <template v-else>
          <div
            class="mt-1 space-y-4 border-t border-slate-50 dark:border-white/5 pt-2 text-left"
          >
            <p
              v-if="displayedUser.bio"
              class="mt-2 text-gray-700 dark:text-gray-300 text-xs sm:text-[15px] leading-relaxed whitespace-pre-wrap max-w-2xl"
            >
              {{ displayedUser.bio }}
            </p>
            <div
              class="grid grid-cols-3 gap-1 sm:flex sm:gap-8 justify-items-center sm:justify-start items-center"
            >
              <div
                class="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5"
              >
                <span
                  class="text-[15px] sm:text-base font-black text-gray-900 dark:text-white"
                  >{{ displayedUser._count?.posts || 0 }}</span
                >
                <span
                  class="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight"
                  >Paylaşım</span
                >
              </div>
              <div
                @click="openFollowModal('followers')"
                class="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 cursor-pointer group"
              >
                <span
                  class="text-[15px] sm:text-base font-black text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors"
                  >{{ displayedUser._count?.followers || 0 }}</span
                >
                <span
                  class="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight group-hover:text-blue-500 transition-colors"
                  >Takipçi</span
                >
              </div>
              <div
                @click="openFollowModal('following')"
                class="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 cursor-pointer group"
              >
                <span
                  class="text-[15px] sm:text-base font-black text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors"
                  >{{ displayedUser._count?.following || 0 }}</span
                >
                <span
                  class="text-[11px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight group-hover:text-blue-500 transition-colors"
                  >Takip</span
                >
              </div>
            </div>
          </div>

          <!-- CONTENT SECTION -->
          <template v-if="canViewContent">
            <div
              class="flex border-b border-slate-100 dark:border-gray-800 mt-6 sm:mt-8 mb-4 sm:mb-6 overflow-x-auto no-scrollbar"
            >
              <button
                v-for="tab in ['posts', 'replies', 'reposts', 'likes']"
                :key="tab"
                @click="activeTab = tab as any"
                :class="[
                  'flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap',
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600',
                ]"
              >
                {{
                  tab === "posts"
                    ? "Gönderiler"
                    : tab === "replies"
                      ? "Yanıtlar"
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
              v-else-if="!currentTabPosts || currentTabPosts.length === 0"
              class="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]"
            >
              Henüz içerik yok
            </div>
            <div v-else class="space-y-3 sm:space-y-4">
              <PostCard
                v-for="p in currentTabPosts"
                :key="p.id"
                :post="p"
                :is-profile-view="true"
                @delete="handleDeletePost"
                @showComments="handleShowComments"
              />
            </div>
          </template>

          <!-- BLOCKED BY ME NOTICE -->
          <div
            v-else-if="isBlockedByMe"
            class="mt-12 py-16 text-center bg-red-50/50 dark:bg-red-950/10 rounded-[2.5rem] border border-dashed border-red-200 dark:border-red-900/30 mx-4 sm:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div
              class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 border border-red-200 dark:border-red-800/20"
            >
              <component
                :is="getBadgeComponent('user-x')"
                class="w-6 h-6 text-red-600 dark:text-red-400"
              />
            </div>
            <h3
              class="text-base font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-1.5"
            >
              Bu Kullanıcıyı Engellediniz
            </h3>
            <p
              class="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.2em] opacity-50 mb-6"
            >
              İçeriği görmek için engeli kaldırmalısınız.
            </p>
            <button
              @click="handleBlockToggle"
              class="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              {{ followLoading ? "İşleniyor..." : "Engeli Kaldır" }}
            </button>
          </div>

          <!-- BLOCKED ME NOTICE (USER NOT FOUND FEEL) -->
          <div
            v-else-if="isBlockedMe"
            class="mt-12 py-16 text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 mx-4 sm:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div
              class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-4 border border-gray-200 dark:border-white/5"
            >
              <component
                :is="getBadgeComponent('search')"
                class="w-6 h-6 text-gray-400 dark:text-gray-500"
              />
            </div>
            <h3
              class="text-base font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-1.5"
            >
              Kullanıcıya Ulaşılamıyor
            </h3>
            <p
              class="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.2em] opacity-50"
            >
              Bu hesap artık mevcut değil veya erişiminiz kısıtlanmış.
            </p>
          </div>

          <!-- PRIVATE ACCOUNT NOTICE (MINIMALIST) -->
          <div
            v-else
            class="mt-12 py-16 text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 mx-4 sm:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div
              class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800/50 mb-4 border border-gray-200 dark:border-white/5"
            >
              <component
                :is="getBadgeComponent('lock')"
                class="w-6 h-6 text-gray-400 dark:text-gray-500"
              />
            </div>
            <h3
              class="text-base font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-1.5"
            >
              Bu Hesap Gizlidir
            </h3>
            <p
              class="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.2em] opacity-50"
            >
              Gönderileri ve aktiviteleri görmek için takip etmelisin.
            </p>
          </div>
        </template>
      </div>
    </template>

    <EditProfileModal
      :is-open="showEditModal"
      :user="displayedUser"
      @close="showEditModal = false"
      @save="handleSaveProfile"
    />
    <CommentsModal
      :is-open="commentsModalOpen"
      :post-id="selectedPostId"
      @close="commentsModalOpen = false"
    />
    <FollowListModal
      :is-open="showFollowModal"
      :user-id="displayedUser?.id || 0"
      :type="followModalType"
      @close="showFollowModal = false"
    />
    <DeleteConfirmModal
      :is-open="showDeleteModal"
      :loading="isDeleting"
      title="Gönderiyi Sil?"
      message="Bu işlem geri alınamaz. İçerik tamamen kaldırılacaktır."
      confirm-text="SİL"
      variant="danger"
      @confirm="handleConfirmDelete"
      @cancel="showDeleteModal = false"
    />
    <DeleteConfirmModal
      :is-open="showAdminDeleteModal"
      :loading="isAdminDeleting"
      title="Kullanıcıyı Sil?"
      message="DİKKAT: Bu işlem geri alınamaz! Kullanıcı ve tüm verileri kalıcı olarak silinecektir."
      confirm-text="KALICI OLARAK SİL"
      variant="danger"
      @confirm="executeAdminDelete"
      @cancel="showAdminDeleteModal = false"
    />

    <!-- AVATAR ZOOM MODAL -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="showAvatarZoom && displayedUser?.avatarUrl"
          class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-zoom-out"
          @click="showAvatarZoom = false"
        >
          <!-- Close Button - Fixed to Screen Corner -->
          <button
            @click="showAvatarZoom = false"
            class="fixed top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/10 z-[1010] shadow-2xl active:scale-90"
          >
            <component :is="getBadgeComponent('x')" class="w-6 h-6" />
          </button>

          <div
            class="relative max-w-2xl w-full flex items-center justify-center animate-in zoom-in-95 duration-300"
            @click.stop
          >
            <img
              :src="getImageUrl(displayedUser.avatarUrl)"
              class="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10 object-contain shadow-black/50"
            />
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- GLOBAL REPORT MODAL -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="showGlobalReport"
          class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          @click.self="showGlobalReport = false"
        >
          <div
            class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div
              class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5"
            >
              <button
                v-if="reportStep === 2"
                @click="reportStep = 1"
                class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-500"
              >
                <component
                  :is="getBadgeComponent('chevron-left')"
                  class="w-5 h-5"
                />
              </button>
              <div v-else class="w-9"></div>
              <h3
                class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter"
              >
                Şikayet Bildirimi
              </h3>
              <button
                @click="showGlobalReport = false"
                class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"
              >
                <component :is="getBadgeComponent('x')" class="w-5 h-5" />
              </button>
            </div>
            <div
              class="flex-1 overflow-y-auto p-4 space-y-1.5 max-h-[60vh] no-scrollbar"
            >
              <div v-if="reportStep === 1">
                <button
                  v-for="(subReasons, category) in reportCategories"
                  :key="category"
                  @click="selectReportCategory(category)"
                  class="w-full text-left p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-between group"
                >
                  <span
                    class="text-sm font-bold text-gray-700 dark:text-gray-300"
                    >{{ category }}</span
                  >
                  <component
                    :is="getBadgeComponent('chevron-right')"
                    class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
              <div v-else>
                <div
                  class="px-4 py-2 text-[10px] font-black text-blue-500 uppercase tracking-widest"
                >
                  {{ selectedReportCategory }}
                </div>
                <button
                  v-for="sub in reportCategories[selectedReportCategory]"
                  :key="sub"
                  @click="submitReport(sub)"
                  class="w-full text-left p-3.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 group"
                >
                  <span
                    class="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-red-600"
                    >{{ sub }}</span
                  >
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- BADGE MANAGEMENT MODAL -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="showBadgeModal"
          class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          @click.self="showBadgeModal = false"
        >
          <div
            class="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div
              class="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between"
            >
              <h3
                class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter"
              >
                Rozet Yönetimi
              </h3>
              <button
                @click="showBadgeModal = false"
                class="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400"
              >
                <component :is="getBadgeComponent('x')" class="w-5 h-5" />
              </button>
            </div>
            <div
              class="p-6 max-h-[60vh] overflow-y-auto no-scrollbar grid grid-cols-2 gap-3"
            >
              <button
                v-for="badge in allBadges"
                :key="badge.id"
                @click="handleToggleBadge(badge.id)"
                :class="[
                  'relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group',
                  hasBadge(badge.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent bg-slate-50 dark:bg-white/5 hover:border-slate-200 dark:hover:border-white/10',
                ]"
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                  :style="{ backgroundColor: badge.color, color: 'white' }"
                >
                  <component
                    :is="getBadgeComponent(badge.icon)"
                    class="w-5 h-5"
                  />
                </div>
                <span
                  class="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300"
                  >{{ badge.name }}</span
                >
                <div
                  v-if="hasBadge(badge.id)"
                  class="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm"
                >
                  <component
                    :is="getBadgeComponent('check')"
                    class="w-2.5 h-2.5 text-white"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePostsStore } from "@/stores/posts";
import { useProfileStore } from "@/stores/profile";
import { useFollowStore } from "@/stores/follow";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import PostCard from "@/components/PostCard.vue";
import EditProfileModal from "@/components/EditProfileModal.vue";
import CommentsModal from "@/components/CommentsModal.vue";
import FollowListModal from "@/components/FollowListModal.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import * as LucideIcons from "lucide-vue-next";
import UserAvatar from "@/components/UserAvatar.vue";

const authStore = useAuthStore();
const postsStore = usePostsStore();
const profileStore = useProfileStore();
const followStore = useFollowStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const error = ref("");
const followLoading = ref(false);
const showEditModal = ref(false);
const showAvatarZoom = ref(false);
const commentsModalOpen = ref(false);
const selectedPostId = ref<number | null>(null);
const activeTab = ref<"posts" | "replies" | "reposts" | "likes">("posts");

const showFollowModal = ref(false);
const followModalType = ref<"followers" | "following">("followers");

const showDeleteModal = ref(false);
const postIdToDelete = ref<number | null>(null);
const isDeleting = ref(false);

const showAdminDeleteModal = ref(false);
const isAdminDeleting = ref(false);

const showOptionsMenu = ref(false);
const showGlobalReport = ref(false);
const reportStep = ref(1);
const selectedReportCategory = ref("");
const showBadgeModal = ref(false);
const allBadges = ref<any[]>([]);

const reportCategories: Record<string, string[]> = {
  "Şiddet veya Tehdit": [
    "Şiddet eğilimi",
    "Tehdit edici dil",
    "Zarar verme teşviki",
  ],
  "Taciz ve Siber Zorbalık": [
    "Sürekli rahatsız etme",
    "Özel bilgi ifşası (Doxxing)",
    "Şantaj",
  ],
  "Nefret Söylemi": [
    "Irkçı söylemler",
    "Ayrımcılık",
    "Dini/Cinsel yönelim saldırısı",
  ],
  "Spam ve Yanıltıcı İçerik": [
    "Bot hesap",
    "Dolandırıcılık/Oltalama",
    "Yalan haber yayma",
  ],
  "Cinsellik ve Çıplaklık": [
    "Uygunsuz profil fotoğrafı",
    "Cinsel içerik paylaşımı",
    "İzinsiz mahrem görüntü",
  ],
  Diğer: [
    "Sahte hesap (Taklit)",
    "Topluluk kurallarını ihlal",
    "Yasadışı madde satışı",
  ],
};

const dropdownStyle = ref({ top: "-9999px", left: "-9999px" });

const displayedUser = computed(() => profileStore.profileUser);
const loading = computed(() => profileStore.loadingProfile);
const postsLoading = computed(() => profileStore.loadingPosts);

const currentTabPosts = computed(() => {
  if (activeTab.value === "posts") {
    return [...profileStore.userPosts].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }
  if (activeTab.value === "replies") return profileStore.userReplies;
  if (activeTab.value === "reposts") return profileStore.userReposts;
  return profileStore.userLikedPosts;
});

const isMyProfile = computed(() => {
  const myId = authStore.user?.id;
  const targetId = displayedUser.value?.id;
  if (!myId || !targetId) return false;
  return String(myId) === String(targetId);
});
const isFollowing = computed(() => displayedUser.value?.isFollowing);
const isBlockedByMe = computed(() => displayedUser.value?.isBlockedByMe);
const isBlockedMe = computed(() => displayedUser.value?.isBlockedMe);

const canViewContent = computed(
  () =>
    (isMyProfile.value ||
      (!displayedUser.value?.isPrivate &&
        !isBlockedMe.value &&
        !isBlockedByMe.value) ||
      (isFollowing.value && !isBlockedMe.value && !isBlockedByMe.value)) &&
    !displayedUser.value?.isBanned,
);
const userInitials = computed(() =>
  (displayedUser.value?.fullName || displayedUser.value?.username || "?")
    .charAt(0)
    .toUpperCase(),
);

watch(showOptionsMenu, async (val) => {
  if (val) {
    setTimeout(() => {
      const container = document.getElementById("profile-options-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        dropdownStyle.value = {
          top: `${rect.bottom + window.scrollY + 8}px`,
          left: `${rect.right - 224}px`,
        };
      }
    }, 0);
  }
});

const openFollowModal = (type: "followers" | "following") => {
  if (!canViewContent.value && !isMyProfile.value) {
    toast.info("Bu listeyi görmek için kullanıcıyı takip etmelisiniz.");
    return;
  }
  followModalType.value = type;
  showFollowModal.value = true;
};

const fetchProfile = async () => {
  const username = (route.params.id as string) || authStore.user?.username;
  if (!username) return;

  // F5 anında authStore'un localStorage'dan yüklenmesini bekle (çok kısa bir süre)
  if (!authStore.user && localStorage.getItem("access_token")) {
    let retryCount = 0;
    while (!authStore.user && retryCount < 10) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      retryCount++;
    }
  }

  profileStore.clearProfile();
  error.value = "";
  try {
    const fetchedUser = await profileStore.fetchProfileByUsername(username);
    if (fetchedUser && canViewContent.value) {
      await profileStore.fetchProfileContent(fetchedUser.id);
    }
    if (authStore.user?.role === "ADMIN") {
      allBadges.value = await profileStore.fetchAllBadges();
    }
  } catch (err) {
    error.value = "Kullanıcı bulunamadı.";
  }
};

const handleFollowToggle = async () => {
  if (!authStore.user || !displayedUser.value) return;
  followLoading.value = true;
  try {
    const res = await followStore.toggleFollow(displayedUser.value.id);
    profileStore.updateFollowStateLocally(
      res.status,
      displayedUser.value.isPrivate,
    );
    toast.success(res.message);
  } finally {
    followLoading.value = false;
  }
};

const handleBlockToggle = async () => {
  if (!displayedUser.value) return;
  try {
    await profileStore.blockUser(displayedUser.value.id);
    toast.success(
      displayedUser.value.isBlocked ? "Engellendi." : "Engel kaldırıldı.",
    );
    showOptionsMenu.value = false;
  } catch {
    toast.error("Hata!");
  }
};

const handleBanToggle = async () => {
  if (!displayedUser.value) return;
  try {
    await profileStore.banUser(displayedUser.value.id);
    toast.success(
      displayedUser.value.isBanned
        ? "Kullanıcı yasaklandı."
        : "Yasak kaldırıldı.",
    );
    showOptionsMenu.value = false;
  } catch {
    toast.error("Yetki hatası!");
  }
};

const handleAdminDeleteUser = () => {
  showAdminDeleteModal.value = true;
  showOptionsMenu.value = false;
};

const executeAdminDelete = async () => {
  if (!displayedUser.value) return;
  isAdminDeleting.value = true;
  try {
    await profileStore.deleteUser(displayedUser.value.id);
    toast.success("Kullanıcı silindi.");
    showAdminDeleteModal.value = false;
    router.push("/");
  } catch {
    toast.error("İşlem başarısız.");
  } finally {
    isAdminDeleting.value = false;
  }
};

const openUserReport = () => {
  showGlobalReport.value = true;
  reportStep.value = 1;
  showOptionsMenu.value = false;
};

const selectReportCategory = (category: string) => {
  selectedReportCategory.value = category;
  reportStep.value = 2;
};

const submitReport = async (sub: string) => {
  try {
    await profileStore.reportUser({
      reportedUserId: displayedUser.value!.id,
      reason: selectedReportCategory.value,
      subReason: sub,
    });
    toast.success("Şikayet bildirildi.");
    showGlobalReport.value = false;
  } catch {
    toast.error("Hata!");
  }
};

const hasBadge = (badgeId: number) =>
  displayedUser.value?.badges?.some((ub: any) => ub.badgeId === badgeId);

const handleToggleBadge = async (badgeId: number) => {
  try {
    await profileStore.toggleBadge(displayedUser.value!.id, badgeId);
    await fetchProfile();

    if (displayedUser.value) {
      postsStore.updateUserInPosts(displayedUser.value.id, {
        badges: displayedUser.value.badges,
        role: displayedUser.value.role,
      });
    }

    toast.success("Rozet güncellendi.");
  } catch {
    toast.error("Yetki hatası!");
  }
};

const handleSaveProfile = async (data: any) => {
  try {
    const res = await apiClient.patch(
      `/users/${displayedUser.value?.id}`,
      data,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    profileStore.profileUser = { ...profileStore.profileUser, ...res.data };
    if (isMyProfile.value) authStore.updateUser(res.data);

    postsStore.updateUserInPosts(res.data.id, {
      fullName: res.data.fullName,
      avatarUrl: res.data.avatarUrl,
      coverUrl: res.data.coverUrl,
    });

    showEditModal.value = false;
    toast.success("Profil güncellendi.");
  } catch {
    toast.error("Hata!");
  }
};

const handleDeletePost = (postId: number) => {
  postIdToDelete.value = postId;
  showDeleteModal.value = true;
};

const handleConfirmDelete = async () => {
  if (postIdToDelete.value === null) return;
  isDeleting.value = true;
  try {
    await postsStore.deletePost(postIdToDelete.value);
    toast.success("Silindi.");
    showDeleteModal.value = false;
  } catch {
    toast.error("Hata!");
  } finally {
    isDeleting.value = false;
    postIdToDelete.value = null;
  }
};

const handleShowComments = (id: number) => {
  selectedPostId.value = id;
  commentsModalOpen.value = true;
};

const handleMessageUser = () => {
  router.push(`/messages?userId=${displayedUser.value?.id}`);
};

const handleProfileOptions = () => {
  showOptionsMenu.value = !showOptionsMenu.value;
};

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return `${apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const getBadgeComponent = (name: string) => {
  if (!name) return LucideIcons.HelpCircle;
  const pascal = name
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  return (LucideIcons as any)[pascal] || LucideIcons.HelpCircle;
};

onMounted(fetchProfile);
watch(() => route.params.id, fetchProfile);
</script>

<style scoped>
.btn-primary {
  @apply px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
