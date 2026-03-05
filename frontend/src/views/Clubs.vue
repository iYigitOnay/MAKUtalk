<!-- src/views/Clubs.vue -->
<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-6 pb-32 bg-[#fafafa] dark:bg-[#0b0f19] min-h-screen font-sans">
    <!-- HEADER -->
    <header class="mb-12 text-center pt-4">
      <button @click="$router.push('/campus')" class="inline-flex items-center gap-2 text-gray-400 hover:text-rose-500 transition-colors font-black uppercase text-[10px] tracking-widest mb-4 outline-none group">
        <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
        Rehbere Dön
      </button>
      <h1 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
        KAMPÜS <span class="text-rose-600">HUB</span>
      </h1>
    </header>

    <section class="max-w-4xl mx-auto mb-12 space-y-8 text-center flex flex-col items-center">
      <!-- SEARCH BAR -->
      <div class="relative w-full max-w-md group">
        <input v-model="searchQuery" type="text" placeholder="HUB'da ara..." class="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 transition-all outline-none text-gray-900 dark:text-white font-bold shadow-sm" />
        <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div class="flex flex-col items-center gap-6 w-full">
        <!-- MAIN CAROUSEL (DIGITAL, PROJECT, SOCIAL) -->
        <div class="relative w-full overflow-hidden h-20 flex items-center justify-center">
          <div ref="mainTypeNavRef" @scroll="handleMainCarouselScroll" class="flex items-center gap-4 overflow-x-auto px-[35%] scrollbar-hide snap-x snap-mandatory scroll-smooth w-full h-16">
            <div v-for="(type, index) in centeredMainTypes" :key="type.value" class="flex-shrink-0 snap-center main-carousel-item">
              <button @click.prevent="selectedMainType = type.value; selectedCategory = 'TÜMÜ'; centerMainCarouselItem(index); resetSubCarousel()" :class="['w-32 h-11 rounded-xl flex items-center justify-center transition-all duration-500 border-2 px-4', selectedMainType === type.value ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400 scale-90 opacity-60']">
                <span class="text-[10px] font-black uppercase tracking-widest">{{ type.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- SUB CAROUSEL (CATEGORIES) -->
        <div class="relative w-full overflow-hidden h-14 flex items-center justify-center">
          <div ref="categoryNavRef" @scroll="handleSubCarouselScroll" class="flex items-center gap-3 overflow-x-auto px-[40%] scrollbar-hide no-scrollbar scroll-smooth h-12">
            <div v-for="(cat, index) in currentSubCategories" :key="cat" class="flex-shrink-0 snap-center sub-carousel-item">
              <button @click.prevent="selectedCategory = cat; centerSubCarouselItem(index)" :class="['px-6 h-9 rounded-full flex items-center justify-center transition-all duration-500 border', selectedCategory === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg scale-105' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 opacity-50 scale-95']">
                <span class="text-[9px] font-black uppercase tracking-widest">{{ cat }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CLUBS GRID (PREMIUM & FERAH) -->
    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
      <div v-for="club in filteredClubs" :key="club.id" 
        @click="$router.push(`/campus/clubs/${club.slug}`)"
        class="group relative bg-white dark:bg-gray-900 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-slate-50 dark:border-white/5 overflow-hidden"
      >
        <!-- Sol Renk Vurgusu -->
        <div class="absolute left-0 top-0 bottom-0 w-1.5 opacity-40 group-hover:opacity-100 transition-opacity" :style="{ backgroundColor: club.color }"></div>

        <div class="flex flex-col h-full space-y-5">
          <!-- Üst Kısım -->
          <div class="flex items-start justify-between">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-transform group-hover:rotate-3 duration-500 border border-slate-50 dark:border-white/5" :style="{ backgroundColor: club.color + '10', color: club.color }">
              <span v-if="isEmoji(club.emoji)">{{ club.emoji }}</span>
              <span v-else class="text-lg font-black uppercase tracking-tighter">{{ club.emoji }}</span>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 text-[7px] font-black uppercase tracking-widest rounded-full border border-slate-200/50 dark:border-white/5">{{ club.category }}</span>
              <span v-if="club.mainType === 'DIGITAL'" class="text-[6px] font-black text-emerald-500 uppercase tracking-[0.2em]">RESMİ TOPLULUK</span>
              <span v-else-if="club.mainType === 'PROJECT'" class="text-[6px] font-black text-blue-500 uppercase tracking-[0.2em]">PROJE TAKIMI</span>
              <span v-else class="text-[6px] font-black text-amber-500 uppercase tracking-[0.2em]">SOSYAL GRUP</span>
            </div>
          </div>

          <!-- Başlık ve Mikro Veri -->
          <div class="flex-1">
            <h3 class="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic leading-tight group-hover:text-rose-600 transition-colors mb-3" :style="{ groupHoverColor: club.color }">{{ club.name }}</h3>
            
            <!-- Dinamik Mikro Rozetler -->
            <div class="flex flex-wrap gap-2">
              <!-- Halı Saha -->
              <div v-if="club.category === 'HALISAHA' && club.metadata?.position" class="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-1.5">
                <div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[7px] font-black text-emerald-600 uppercase">{{ club.metadata.position }} ARANIYOR</span>
              </div>
              <!-- Oyun -->
              <div v-if="club.category === 'OYUN' && club.metadata?.missingPlayers" class="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-1.5">
                <span class="text-[7px] font-black text-blue-600 uppercase">{{ (club.metadata.lobbySize || 4) - club.metadata.missingPlayers }}/{{ club.metadata.lobbySize || 4 }} LOBİ</span>
              </div>
              <!-- Gezi -->
              <div v-if="club.category === 'GEZİ' && club.metadata?.tripTo" class="px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-1.5">
                <span class="text-[7px] font-black text-rose-600 uppercase tracking-tighter truncate max-w-[80px]">{{ club.metadata.tripTo }}</span>
              </div>
              <!-- Aktivite -->
              <div v-if="club.category === 'AKTİVİTE' && club.metadata?.activityVibe" class="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-1.5">
                <span class="text-[7px] font-black text-amber-600 uppercase">{{ club.metadata.activityVibe }} VIBE</span>
              </div>
            </div>
          </div>

          <!-- Alt Kısım: Kontenjan -->
          <div class="pt-4 border-t border-slate-50 dark:border-white/5 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">{{ club.memberCount }} ÜYE</span>
              </div>
              <div v-if="club.maxMembers" class="text-[8px] font-black text-slate-400 uppercase">{{ club.memberCount }}/{{ club.maxMembers }}</div>
            </div>
            <div v-if="club.maxMembers" class="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div class="h-full transition-all duration-1000" :style="{ width: (club.memberCount / club.maxMembers * 100) + '%', backgroundColor: club.color }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="py-40 text-center flex flex-col items-center">
      <div class="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-xs font-black uppercase tracking-widest text-slate-400">Hub Yükleniyor</p>
    </div>

    <!-- FLOATING ACTION BUTTON (Daha Premium) -->
    <button v-if="authStore.isAuthenticated" @click="showCreateModal = true" class="fixed bottom-10 right-10 w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 hover:-rotate-12 transition-all z-[100] group">
      <svg class="w-8 h-8 group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>

    <!-- CREATE MODAL (ESKİ FORM KORUNDU) -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-white/40 dark:bg-gray-950/70 backdrop-blur-xl" @click="showCreateModal = false"></div>
      <div class="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 relative flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div class="p-8 pb-4 text-center w-full border-b border-gray-50 dark:border-white/5">
          <h3 class="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">Hub'a <span class="text-rose-600">Katıl</span></h3>
          <p class="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Yeni Bir Topluluk Başlat</p>
        </div>

        <form @submit.prevent="handleCreateClub" class="p-8 pt-6 space-y-6 overflow-y-auto custom-scrollbar relative">
          <!-- ANA TİP SEÇİMİ -->
          <div class="grid grid-cols-3 gap-2">
            <button v-for="type in mainTypesList" :key="type.value" type="button" @click="form.mainType = type.value; form.category = categoryMap[type.value][0]" :class="['py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border-2', form.mainType === type.value ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-slate-50 dark:bg-gray-800 text-gray-400 border-transparent hover:border-gray-200 dark:hover:border-gray-700']">
              {{ type.label }}
            </button>
          </div>

          <div class="space-y-4">
            <div class="space-y-1 text-left">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Topluluk Adı</label>
              <input v-model="form.name" required type="text" placeholder="Örn: Teknofest İHA Takımı..." class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none outline-none text-sm font-bold shadow-inner transition-all border-2 border-transparent focus:border-rose-500/20" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1 text-left relative">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori</label>
                <button type="button" @click="showCategoryDropdown = !showCategoryDropdown" class="w-full h-14 px-5 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-gray-700 shadow-inner border-2 border-transparent" :class="{ 'border-rose-500/20': showCategoryDropdown }">
                  <span class="text-[10px] font-black uppercase tracking-tight text-gray-900 dark:text-white">{{ form.category }}</span>
                  <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': showCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <transition name="fade">
                  <div v-if="showCategoryDropdown" class="absolute z-[180] left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border rounded-2xl shadow-2xl overflow-hidden">
                    <button v-for="cat in categoryMap[form.mainType]" :key="cat" @click="form.category = cat; showCategoryDropdown = false;" type="button" class="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors border-b last:border-0">{{ cat }}</button>
                  </div>
                </transition>
              </div>

              <div class="space-y-1 text-left relative">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Stil</label>
                <div class="flex gap-2">
                  <button type="button" @click="showEmojiGrid = !showEmojiGrid; showColorPicker = false;" class="flex-1 h-14 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-700 shadow-inner">
                    <span v-if="form.emoji" :class="isEmoji(form.emoji) ? 'text-2xl' : 'text-[10px] font-black uppercase'" :style="{ color: isEmoji(form.emoji) ? '' : form.color }">{{ form.emoji }}</span>
                    <span v-else class="text-[8px] font-black text-gray-400 uppercase">İkon</span>
                  </button>
                  <button type="button" @click="showColorPicker = !showColorPicker; showEmojiGrid = false;" class="w-14 h-14 rounded-2xl shadow-lg border-4 border-white dark:border-gray-800 transition-transform" :style="{ backgroundColor: form.color }"></button>
                </div>
                
                <!-- Emoji Grid -->
                <transition name="fade">
                  <div v-if="showEmojiGrid" class="absolute z-[180] left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border rounded-2xl p-4 shadow-2xl grid grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    <button v-for="e in ['🚀','💻','🛡️','⚽','🎮','📸','🎨','🧬','🌍','🍕','🎸','🏆','📚','🎪','🪁']" :key="e" @click="form.emoji = e; showEmojiGrid = false" type="button" class="text-2xl hover:bg-slate-100 dark:hover:bg-gray-700 p-2 rounded-xl transition-colors">{{ e }}</button>
                    <input v-model="form.emoji" placeholder="Ya da harf..." maxlength="2" class="col-span-5 mt-2 w-full p-2 bg-slate-50 dark:bg-gray-900 border-none outline-none rounded-lg text-center text-xs font-black uppercase tracking-widest" />
                  </div>
                </transition>

                <!-- Color Picker -->
                <transition name="fade">
                  <div v-if="showColorPicker" class="absolute z-[180] right-0 top-full mt-2 bg-white dark:bg-gray-800 border rounded-2xl p-4 shadow-2xl flex flex-wrap gap-2 w-48">
                    <button v-for="c in ['#e11d48','#3b82f6','#10b981','#f59e0b','#8b5cf6','#6366f1','#06b6d4','#ec4899']" :key="c" @click="form.color = c; showColorPicker = false" type="button" class="w-8 h-8 rounded-lg transition-transform hover:scale-110" :style="{ backgroundColor: c }"></button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- DINAMIK KATEGORI INPUTLARI -->
            <template v-if="form.mainType === 'SOCIAL'">
              <div v-if="form.category === 'HALISAHA'" class="space-y-6 pt-4 border-t border-slate-50 dark:border-white/5 animate-in slide-in-from-top-2">
                <!-- Taktik Tahtası (Oluşturma) -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between px-1">
                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Eksik Mevki</label>
                    <span class="text-[8px] font-black text-rose-600 uppercase">{{ form.metadata.position }} SEÇİLDİ</span>
                  </div>
                  <div class="relative w-full aspect-[21/9] bg-emerald-600 rounded-2xl border-4 border-emerald-500/30 overflow-hidden flex items-center justify-around px-8">
                    <div v-for="p in ['KL', 'DF', 'OS', 'FV']" :key="p" @click="form.metadata.position = p" :class="['w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black cursor-pointer transition-all', form.metadata.position === p ? 'bg-white text-emerald-600 scale-125 shadow-lg' : 'bg-white/20 text-white/50']">{{ p }}</div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Maç Formatı</label>
                    <select v-model="form.metadata.matchType" class="w-full h-14 px-4 bg-slate-50 dark:bg-gray-800 rounded-2xl text-xs font-bold outline-none shadow-inner border-none"><option v-for="m in ['6v6','7v7','8v8']" :key="m" :value="m">{{m}}</option></select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Maç Saati</label>
                    <input v-model="form.metadata.matchTime" type="text" placeholder="21:00 - 22:00" class="w-full h-14 px-5 bg-slate-50 dark:bg-gray-800 rounded-2xl text-xs font-bold border-none outline-none shadow-inner" />
                  </div>
                </div>
              </div>

              <div v-if="form.category === 'GEZİ'" class="space-y-6 pt-4 border-t border-slate-50 dark:border-white/5 animate-in slide-in-from-top-2">
                <div class="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                  <div class="space-y-1">
                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nereden</label>
                    <input v-model="form.metadata.tripFrom" type="text" placeholder="Başlangıç" class="w-full h-14 px-5 bg-slate-50 dark:bg-gray-800 rounded-2xl text-xs font-bold border-none outline-none shadow-inner" />
                  </div>
                  <div class="h-6 w-10 flex items-center justify-center pt-4">
                    <div class="w-full h-[2px] bg-rose-500/20 relative"><div class="absolute inset-0 bg-rose-500 animate-energy-pulse"></div></div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nereye</label>
                    <input v-model="form.metadata.tripTo" type="text" placeholder="Varış" class="w-full h-14 px-5 bg-slate-50 dark:bg-gray-800 rounded-2xl text-xs font-bold border-none outline-none shadow-inner" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Ulaşım</label>
                    <select v-model="form.metadata.transport" class="w-full h-14 px-4 bg-slate-50 dark:bg-gray-800 rounded-2xl text-xs font-bold outline-none border-none shadow-inner"><option v-for="t in ['OTOBÜS','ARAÇ','YÜRÜYÜŞ']" :key="t" :value="t">{{t}}</option></select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Bütçe</label>
                    <input v-model="form.metadata.budget" type="text" placeholder="Örn: 500" class="w-full h-14 px-5 bg-slate-50 dark:bg-gray-800 rounded-2xl text-xs font-bold border-none outline-none shadow-inner" />
                  </div>
                </div>
              </div>

              <div v-if="form.category === 'OYUN'" class="space-y-6 pt-4 border-t border-slate-50 dark:border-white/5 animate-in slide-in-from-top-2">
                <div class="space-y-3">
                  <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Lobi Durumu</label>
                  <div class="flex justify-center gap-3 py-4 bg-slate-100/50 dark:bg-gray-800/50 rounded-2xl shadow-inner">
                    <div v-for="i in form.metadata.lobbySize" :key="i" @click="form.metadata.missingPlayers = (form.metadata.lobbySize - i + 1)" :class="['w-10 h-10 rounded-xl border-4 flex items-center justify-center cursor-pointer transition-all', i > (form.metadata.lobbySize - form.metadata.missingPlayers) ? 'border-rose-500 bg-rose-500/10' : 'border-white dark:border-gray-700 bg-white dark:bg-gray-900']">
                      <span v-if="i > (form.metadata.lobbySize - form.metadata.missingPlayers)" class="text-rose-600 font-black">?</span>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Lobi Boyutu</label>
                    <select v-model="form.metadata.lobbySize" class="w-full h-14 px-4 bg-slate-50 dark:bg-gray-800 rounded-2xl text-xs font-bold outline-none border-none shadow-inner"><option v-for="n in [2,3,4,5]" :key="n" :value="n">{{n}} KİŞİLİK</option></select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Platform</label>
                    <select v-model="form.metadata.gamePlatform" class="w-full h-14 px-4 bg-slate-50 dark:bg-gray-800 rounded-2xl text-xs font-bold outline-none border-none shadow-inner"><option v-for="p in ['PC','KONSOL','MOBİL','MASA']" :key="p" :value="p">{{p}}</option></select>
                  </div>
                </div>
              </div>

              <div v-if="form.category === 'AKTİVİTE'" class="space-y-6 pt-4 border-t border-slate-50 dark:border-white/5 animate-in slide-in-from-top-2">
                <div class="space-y-3">
                  <div class="flex items-center justify-between px-1">
                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Atmosfer Seviyesi</label>
                    <span class="text-[8px] font-black text-rose-600 uppercase">{{ form.metadata.activityVibe }}</span>
                  </div>
                  <div class="relative h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-rose-600 transition-all duration-500" :style="{ width: form.metadata.activityVibe === 'SESSİZ' ? '25%' : form.metadata.activityVibe === 'CHILL' ? '50%' : form.metadata.activityVibe === 'ENERJİK' ? '75%' : '100%' }"></div>
                  </div>
                  <div class="flex justify-between">
                    <button v-for="v in ['SESSİZ','CHILL','ENERJİK','PARTY']" :key="v" type="button" @click="form.metadata.activityVibe = v" :class="['text-[7px] font-black tracking-widest', form.metadata.activityVibe === v ? 'text-rose-600' : 'text-gray-400']">{{ v }}</button>
                  </div>
                </div>
              </div>
            </template>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1 text-left">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kontenjan</label>
                <input v-model="form.maxMembers" type="number" placeholder="Sınırsız" class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl outline-none text-xs font-bold shadow-inner no-arrows" />
              </div>
              <div class="space-y-1 text-left">
                <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{{ form.mainType === 'PROJECT' ? 'Son Başvuru' : 'Etkinlik Tarihi' }}</label>
                <VueDatePicker v-model="form.deadline" :dark="true" :enable-time-picker="false" auto-apply format="dd/MM/yyyy" placeholder="Tarih Seç" class="hub-datepicker" />
              </div>
            </div>

            <div v-if="form.mainType === 'DIGITAL'" class="space-y-1 relative text-left">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Akademik Danışman</label>
              <div class="relative group">
                <input v-model="advisorSearchQuery" @input="handleAdvisorSearch" type="text" placeholder="@hoca_adi ile ara..." class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none outline-none text-sm font-bold shadow-inner transition-all focus:ring-2 focus:ring-emerald-500/20" />
                <div v-if="selectedAdvisor" class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-in zoom-in duration-300"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                </div>
              </div>
              <transition name="fade">
                <div v-if="showAdvisorSuggestions" class="absolute z-[160] left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border rounded-3xl shadow-2xl overflow-hidden">
                  <div v-for="u in advisorSuggestions" :key="u.id" @click="selectAdvisor(u)" class="w-full p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer border-b last:border-0 text-left"><p class="text-xs font-black text-emerald-600">@{{ u.username }}</p><p class="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase">{{ u.fullName }}</p></div>
                </div>
              </transition>
              <div v-if="selectedAdvisor" class="mt-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between animate-in slide-in-from-top-2">
                <div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-sm">{{ selectedAdvisor.username.charAt(0).toUpperCase() }}</div><span class="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase truncate">{{ selectedAdvisor.fullName || selectedAdvisor.username }}</span></div>
                <button type="button" @click="selectedAdvisor = null; form.advisorEmail = '';" class="text-gray-400 hover:text-red-500 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            </div>

            <div class="space-y-1 text-left">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Açıklama</label>
              <textarea v-model="form.description" required rows="4" placeholder="Topluluk amacını ve hedefleri belirtin..." class="w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 rounded-2xl border-none outline-none text-sm font-medium resize-none shadow-inner"></textarea>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="button" @click="showCreateModal = false" class="flex-1 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest outline-none">Vazgeç</button>
            <button type="submit" :disabled="submitting" class="flex-[2] py-4 bg-rose-600 text-white text-[10px] font-black rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-500/30 uppercase tracking-widest active:scale-95 transition-all">BAŞVURUYU GÖNDER</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const mainTypeNavRef = ref<HTMLElement | null>(null);
const categoryNavRef = ref<HTMLElement | null>(null);
const searchQuery = ref("");
const selectedMainType = ref("ALL");
const selectedCategory = ref("TÜMÜ");
const clubs = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showCreateModal = ref(false);

const mainTypesList = [
  { label: 'DİJİTAL TOPLULUK', value: 'DIGITAL' },
  { label: 'PROJE TAKIMI', value: 'PROJECT' },
  { label: 'SOSYAL GRUP', value: 'SOCIAL' }
];

const centeredMainTypes = computed(() => {
  const list = [...mainTypesList];
  const mid = Math.ceil(list.length / 2);
  return [...list.slice(0, mid), { label: 'TÜMÜ', value: 'ALL' }, ...list.slice(mid)];
});

const categoryMap: Record<string, string[]> = {
  DIGITAL: ["KÜLTÜR", "SPOR", "BİLİM", "SANAT", "SOSYAL"],
  PROJECT: ["TÜBİTAK", "TEKNOFEST", "STARTUP", "FREELANCE"],
  SOCIAL: ["GEZİ", "HALISAHA", "OYUN", "AKTİVİTE"]
};

const currentSubCategories = computed(() => {
  if (selectedMainType.value === 'ALL') return ["TÜMÜ"];
  const subCats = categoryMap[selectedMainType.value] || [];
  const mid = Math.ceil(subCats.length / 2);
  return [...subCats.slice(0, mid), "TÜMÜ", ...subCats.slice(mid)];
});

const filteredClubs = computed(() => {
  return clubs.value.filter(c => {
    const typeMatch = selectedMainType.value === 'ALL' || c.mainType === selectedMainType.value;
    const catMatch = selectedCategory.value === 'TÜMÜ' || c.category === selectedCategory.value;
    const searchMatch = !searchQuery.value || c.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return typeMatch && catMatch && searchMatch;
  });
});

const handleMainCarouselScroll = () => {
  const el = mainTypeNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll(".main-carousel-item");
  const centerX = el.getBoundingClientRect().left + el.clientWidth / 2;
  items.forEach((item: any) => {
    const factor = Math.min(Math.abs(centerX - (item.getBoundingClientRect().left + item.clientWidth / 2)) / (el.clientWidth / 2.5), 1);
    const btn = item.querySelector("button");
    if (btn) { btn.style.transform = `scale(${1.15 - factor * 0.3})`; btn.style.opacity = (1 - factor * 0.7).toString(); }
  });
};

const handleSubCarouselScroll = () => {
  const el = categoryNavRef.value;
  if (!el) return;
  const items = el.querySelectorAll(".sub-carousel-item");
  const centerX = el.getBoundingClientRect().left + el.clientWidth / 2;
  items.forEach((item: any) => {
    const factor = Math.min(Math.abs(centerX - (item.getBoundingClientRect().left + item.clientWidth / 2)) / (el.clientWidth / 2.5), 1);
    const btn = item.querySelector("button");
    if (btn) { btn.style.transform = `scale(${1.15 - factor * 0.3})`; btn.style.opacity = (1 - factor * 0.7).toString(); }
  });
};

const centerMainCarouselItem = (index: number) => {
  const el = mainTypeNavRef.value;
  if (!el) return;
  const target = el.querySelectorAll(".main-carousel-item")[index] as HTMLElement;
  if (target) el.scrollTo({ left: target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2, behavior: "smooth" });
};

const centerSubCarouselItem = (index: number) => {
  const el = categoryNavRef.value;
  if (!el) return;
  const target = el.querySelectorAll(".sub-carousel-item")[index] as HTMLElement;
  if (target) el.scrollTo({ left: target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2, behavior: "smooth" });
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

const form = ref<any>({
  name: "",
  mainType: "DIGITAL",
  category: "KÜLTÜR",
  emoji: "🛡️",
  color: "#e11d48",
  description: "",
  advisorEmail: "",
  maxMembers: null,
  deadline: null,
  requiredSkills: "",
  metadata: {
    programCode: "",
    competitionCategory: "",
    position: "FV",
    matchTime: "",
    gameDetails: "",
    tripFrom: "",
    tripTo: "",
    transport: "OTOBÜS",
    accommodation: "GÜNÜBİRLİK",
    budget: "",
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
    activityRequirement: ""
  }
});

const advisorSearchQuery = ref("");
const advisorSuggestions = ref<any[]>([]);
const selectedAdvisor = ref<any>(null);

const handleAdvisorSearch = async () => {
  if (advisorSearchQuery.value.length < 2) {
    advisorSuggestions.value = [];
    showAdvisorSuggestions.value = false;
    return;
  }
  try {
    const res = await apiClient.get('/users/search-mentions', { params: { query: advisorSearchQuery.value } });
    advisorSuggestions.value = res.data.filter((u: any) => u.role === 'ACADEMIC');
    showAdvisorSuggestions.value = true;
  } catch {
    toast.error("Hoca aranırken hata oluştu.");
  }
};

const selectAdvisor = (u: any) => {
  selectedAdvisor.value = u;
  form.value.advisorName = u.fullName || u.username;
  form.value.advisorEmail = u.email;
  advisorSearchQuery.value = `@${u.username}`;
  showAdvisorSuggestions.value = false;
  console.log("Seçilen Danışman:", form.value.advisorEmail);
};

const isEmoji = (str: string) => str && /\p{Emoji}/u.test(str) && str.length <= 2;

const fetchClubs = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get('/clubs', { params: { userId: authStore.user?.id } });
    clubs.value = res.data;
    console.log("HUB DATA:", clubs.value); // DEBUG
  } catch {
    toast.error("İlanlar yüklenemedi.");
  } finally {
    loading.value = false;
    setTimeout(() => {
      centerMainCarouselItem(Math.floor(centeredMainTypes.value.length / 2));
      handleMainCarouselScroll();
      centerSubCarouselItem(Math.floor(currentSubCategories.value.length / 2));
      handleSubCarouselScroll();
    }, 300);
  }
};

const handleCreateClub = async () => {
  if (form.value.mainType === 'DIGITAL' && !form.value.advisorEmail) {
    toast.error("Dijital topluluklar için bir akademik danışman seçilmelidir.");
    return;
  }
  submitting.value = true;
  try {
    await apiClient.post('/clubs', form.value);
    toast.success("Başvurunuz alındı! Yönetim onayından sonra yayına girecektir. ✨");
    showCreateModal.value = false;
    fetchClubs();
  } catch (err: any) { 
    const msg = err.response?.data?.message;
    toast.error(Array.isArray(msg) ? msg[0] : (msg || "Hata oluştu!")); 
  } finally {
    submitting.value = false;
  }
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

onMounted(fetchClubs);
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
.hub-datepicker :deep(.dp__input) {
  background: #f8fafc;
  border: none;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}
.dark .hub-datepicker :deep(.dp__input) {
  background: #1f2937;
  color: white;
}
.animate-energy-pulse { animation: energy-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes energy-pulse { 0% { transform: translateX(-150%); } 100% { transform: translateX(150%); } }
</style>
