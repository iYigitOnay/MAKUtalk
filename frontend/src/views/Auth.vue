<!-- src/views/Auth.vue -->
<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-[#0f1117] dark:to-[#161b27] md:px-4 overflow-x-hidden transition-colors duration-500"
  >
    <!-- Decorative background elements -->
    <div
      class="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20"
    >
      <div
        class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px]"
      ></div>
      <div
        class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[100px]"
      ></div>
    </div>

    <div
      class="relative w-full max-w-4xl bg-white dark:bg-[#161b27] md:rounded-[32px] shadow-2xl border-y md:border border-slate-200/60 dark:border-white/[0.06] min-h-screen md:min-h-[600px] overflow-hidden transition-colors duration-500 flex flex-col md:block z-10"
    >
      <!-- Brand Panel -->
      <div
        class="relative md:absolute top-0 left-0 w-full md:w-1/2 h-auto md:h-full z-20 transition-all duration-700 ease-in-out md:pointer-events-none"
        :class="[
          activeTab === 'register' ? 'md:translate-x-full' : 'md:translate-x-0',
          showForgotModal || showVerification ? 'hidden md:block' : 'block',
        ]"
      >
        <div
          class="relative md:absolute inset-0 m-0 md:m-2 md:rounded-[26px] flex flex-col items-center justify-center text-center p-8 md:p-12 md:pointer-events-auto transition-all duration-500 bg-slate-50 dark:bg-gradient-to-br dark:from-[#0f1117] dark:to-[#1a1f2e] border-b md:border border-slate-100 dark:border-white/[0.05]"
        >
          <div class="relative z-10">
            <div class="mb-4 md:mb-6 flex justify-center">
              <img
                src="/makutalklogo.png"
                alt="MAKUtalk"
                class="w-24 h-24 md:w-36 md:h-36 object-contain transition-all duration-700 ease-in-out"
                :class="
                  activeTab === 'register'
                    ? '-scale-x-100 rotate-y-180 opacity-80'
                    : 'scale-x-100'
                "
              />
            </div>
            <h1
              class="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4 md:mb-6"
            >
              MAKU<span
                class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                >talk</span
              >
            </h1>
            <div class="h-12 flex items-center justify-center">
              <Transition
                mode="out-in"
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-2"
              >
                <p
                  :key="activeTab"
                  class="text-slate-500 dark:text-white/60 text-sm leading-relaxed max-w-[250px] font-medium mx-auto italic"
                >
                  {{
                    activeTab === "login"
                      ? "Dijital Kampüs dünyasına hoş geldin!"
                      : "Topluluğun bir parçası olmaya hazır mısın?"
                  }}
                </p>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Forms Container -->
      <div
        class="relative flex-1 md:w-full min-h-[450px] md:min-h-[600px] flex overflow-hidden"
      >
        <!-- Verification Step -->
        <div
          v-if="showVerification"
          class="absolute inset-0 z-30 bg-white/98 dark:bg-[#161b27]/98 backdrop-blur-md flex items-center justify-center p-6 transition-all duration-500"
        >
          <div class="w-full max-w-[340px] text-center pb-20 md:pb-0">
            <div
              class="mb-6 inline-flex p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">
              E-postanı Doğrula
            </h2>
            <p class="text-slate-500 dark:text-gray-400 text-sm mb-8">
              <span class="font-black text-blue-600">{{
                registerForm.email
              }}</span>
              adresine gelen kodu gir.
            </p>
            <form @submit.prevent="handleVerify" class="space-y-6">
              <input
                v-model="verificationCode"
                type="text"
                maxlength="6"
                placeholder="000000"
                class="w-full text-center text-3xl tracking-[8px] font-mono py-4 rounded-2xl bg-slate-50 dark:bg-[#1a1f2e] border border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white outline-none"
              />
              <button type="submit" :disabled="verifyLoading" class="auth-btn">
                {{ verifyLoading ? "Doğrulanıyor..." : "Onayla" }}
              </button>
              <button
                type="button"
                @click="showVerification = false"
                class="text-slate-400 text-sm font-bold block w-full mt-4 hover:text-blue-500 transition-colors"
              >
                Geri Dön
              </button>
            </form>
          </div>
        </div>

        <!-- Forgot Password Step -->
        <div
          v-if="showForgotModal"
          class="absolute inset-0 z-40 bg-white/98 dark:bg-[#161b27]/98 backdrop-blur-md flex items-center justify-center p-6 transition-all duration-500"
        >
          <div class="w-full max-w-[340px] text-center pb-20 md:pb-0">
            <div
              class="mb-6 inline-flex p-4 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600"
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2
              class="text-2xl font-black text-slate-900 dark:text-white mb-2 italic tracking-tighter uppercase"
            >
              Şifre Kurtarma
            </h2>
            <p class="text-slate-500 dark:text-gray-400 text-sm mb-8">
              {{
                forgotStep === 1
                  ? "E-posta adresini gir."
                  : "Kodu ve yeni şifreni gir."
              }}
            </p>

            <form
              v-if="forgotStep === 1"
              @submit.prevent="handleSendResetCode"
              class="space-y-4"
            >
              <input
                v-model="forgotForm.email"
                type="email"
                placeholder="E-posta"
                class="auth-input shadow-inner"
              />
              <button type="submit" :disabled="forgotLoading" class="auth-btn">
                {{ forgotLoading ? "Gönderiliyor..." : "Kod Gönder" }}
              </button>
              <button
                type="button"
                @click="showForgotModal = false"
                class="text-slate-400 text-sm font-bold block w-full mt-4"
              >
                Geri Dön
              </button>
            </form>

            <form
              v-else
              @submit.prevent="handleResetPassword"
              class="space-y-4 text-left"
            >
              <input
                v-model="forgotForm.code"
                type="text"
                maxlength="6"
                placeholder="KOD"
                class="w-full text-center text-2xl tracking-[8px] font-mono py-3 rounded-xl bg-slate-50 dark:bg-[#1a1f2e] border border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white outline-none"
              />
              <input
                v-model="forgotForm.newPassword"
                type="password"
                placeholder="Yeni Şifre"
                class="auth-input shadow-inner"
              />
              <input
                v-model="forgotForm.confirmPassword"
                type="password"
                placeholder="Tekrar"
                class="auth-input shadow-inner"
              />
              <button
                type="submit"
                :disabled="forgotLoading || !isResetValid"
                class="auth-btn"
              >
                Güncelle
              </button>
              <button
                type="button"
                @click="forgotStep = 1"
                class="text-slate-400 text-sm font-bold block w-full text-center mt-4"
              >
                E-posta Değiştir
              </button>
            </form>
          </div>
        </div>

        <!-- Register Form -->
        <div
          class="w-full md:w-1/2 flex flex-col items-center justify-center px-8 md:px-12 py-8 md:py-0 transition-all duration-700"
          :class="[
            activeTab === 'login'
              ? 'md:opacity-0 md:invisible md:translate-y-4 hidden md:flex'
              : 'opacity-100 visible translate-y-0 flex',
          ]"
        >
          <div class="w-full max-w-[360px] pb-24 md:pb-0">
            <Transition
              mode="out-in"
              enter-active-class="transition duration-500 ease-out"
              enter-from-class="opacity-0 translate-x-12"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition duration-400 ease-in"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-12"
            >
              <!-- STEP 1: Registration Form -->
              <div v-if="!isReviewing" key="inputs" class="space-y-6">
                <div class="text-center">
                  <h2
                    class="text-2xl font-black text-gray-900 dark:text-white mb-2 italic tracking-tighter uppercase"
                  >
                    Aramıza Katıl
                  </h2>
                  <p
                    class="text-slate-500 dark:text-white/30 text-[10px] font-bold uppercase tracking-widest italic"
                  >
                    Dijital kampüs seni bekliyor
                  </p>
                </div>

                <form @submit.prevent="isReviewing = true" class="space-y-4">
                  <div
                    class="flex p-1 bg-slate-100 dark:bg-[#1a1f2e] rounded-2xl border border-slate-200/50 dark:border-white/[0.05]"
                  >
                    <button
                      type="button"
                      @click="registerType = 'student'"
                      class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      :class="
                        registerType === 'student'
                          ? 'bg-white dark:bg-[#252b3d] text-blue-600 shadow-sm'
                          : 'text-slate-400'
                      "
                    >
                      Öğrenci
                    </button>
                    <button
                      type="button"
                      @click="registerType = 'academic'"
                      class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      :class="
                        registerType === 'academic'
                          ? 'bg-white dark:bg-[#252b3d] text-emerald-600 shadow-sm'
                          : 'text-slate-400'
                      "
                    >
                      Akademisyen
                    </button>
                  </div>

                  <input
                    v-model="registerForm.fullName"
                    type="text"
                    placeholder="Ad Soyad"
                    class="auth-input shadow-inner"
                  />

                  <div class="space-y-1">
                    <input
                      v-model="registerForm.username"
                      @input="checkUsername"
                      type="text"
                      placeholder="Kullanıcı Adı"
                      class="auth-input shadow-inner"
                    />
                    <p
                      v-if="usernameError"
                      class="text-[9px] font-black text-red-500 uppercase px-1"
                    >
                      {{ usernameError }}
                    </p>
                  </div>

                  <div class="relative flex items-center group">
                    <input
                      v-model="emailPrefix"
                      type="text"
                      placeholder="MAKÜ E-Posta"
                      class="auth-input pr-32"
                    />
                    <span
                      class="absolute right-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter pointer-events-none select-none"
                    >
                      {{
                        registerType === "student"
                          ? "@ogr.mehmetakif.edu.tr"
                          : "@mehmetakif.edu.tr"
                      }}
                    </span>
                  </div>

                  <div class="relative group">
                    <input
                      v-model="registerForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Şifre"
                      class="auth-input shadow-inner"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-all"
                    >
                      <svg
                        v-if="showPassword"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>

                  <!-- Pass Checks (Simetrik ve Hata Durumlu) -->
                  <div class="grid grid-cols-2 gap-x-2 gap-y-1.5 px-1 py-1">
                    <div
                      class="flex items-center gap-1.5 justify-start text-left"
                    >
                      <div
                        class="w-1.5 h-1.5 rounded-full transition-colors"
                        :class="
                          passChecks['8+ Karakter']
                            ? 'bg-emerald-500'
                            : 'bg-gray-300 dark:bg-gray-700'
                        "
                      ></div>
                      <span
                        class="text-[8px] font-black uppercase tracking-tighter"
                        :class="
                          passChecks['8+ Karakter']
                            ? 'text-emerald-500'
                            : 'text-gray-400'
                        "
                        >8+ Karakter</span
                      >
                    </div>
                    <div
                      class="flex items-center gap-1.5 justify-end text-right"
                    >
                      <span
                        class="text-[8px] font-black uppercase tracking-tighter"
                        :class="
                          passChecks['Büyük Harf']
                            ? 'text-emerald-500'
                            : 'text-gray-400'
                        "
                        >Büyük Harf</span
                      >
                      <div
                        class="w-1.5 h-1.5 rounded-full transition-colors"
                        :class="
                          passChecks['Büyük Harf']
                            ? 'bg-emerald-500'
                            : 'bg-gray-300 dark:bg-gray-700'
                        "
                      ></div>
                    </div>
                    <div
                      class="flex items-center gap-1.5 justify-start text-left"
                    >
                      <div
                        class="w-1.5 h-1.5 rounded-full transition-colors"
                        :class="
                          passChecks['Özel/Rakam']
                            ? 'bg-emerald-500'
                            : 'bg-gray-300 dark:bg-gray-700'
                        "
                      ></div>
                      <span
                        class="text-[8px] font-black uppercase tracking-tighter"
                        :class="
                          passChecks['Özel/Rakam']
                            ? 'text-emerald-500'
                            : 'text-gray-400'
                        "
                        >Özel/Rakam</span
                      >
                    </div>
                    <div
                      class="flex items-center gap-1.5 justify-end text-right"
                    >
                      <span
                        class="text-[8px] font-black uppercase tracking-tighter"
                        :class="
                          passChecks['Kullanıcı Adı İçeremez']
                            ? 'text-emerald-500'
                            : registerForm.password
                              ? 'text-red-500'
                              : 'text-gray-400'
                        "
                        >Kullanıcı Adı İçeremez</span
                      >
                      <div
                        class="w-1.5 h-1.5 rounded-full transition-colors"
                        :class="
                          passChecks['Kullanıcı Adı İçeremez']
                            ? 'bg-emerald-500'
                            : registerForm.password
                              ? 'bg-red-500'
                              : 'bg-gray-300 dark:bg-gray-700'
                        "
                      ></div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    :disabled="registerLoading || hasErrors"
                    class="auth-btn mt-2 shadow-blue-500/10"
                  >
                    Hesap Oluştur
                  </button>
                  <p
                    class="text-center text-gray-500 dark:text-white/30 text-xs mt-4"
                  >
                    Zaten üye misin?
                    <button
                      type="button"
                      @click="activeTab = 'login'"
                      class="text-blue-600 font-black hover:underline transition-all"
                    >
                      Giriş Yap
                    </button>
                  </p>
                </form>
              </div>

              <!-- STEP 2: Milestone Journey -->
              <div
                v-else
                key="review"
                class="space-y-10 py-4 text-left px-2 relative"
              >
                <div class="space-y-1 mb-8">
                  <h2
                    class="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic whitespace-nowrap leading-none"
                  >
                    Yolculuk Başlıyor
                  </h2>
                  <p
                    class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]"
                  >
                    Sisteme giriş için son adımlar
                  </p>
                </div>

                <div class="relative space-y-12 ml-4">
                  <!-- Dynamic Line -->
                  <div
                    class="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-100 dark:bg-white/5 overflow-hidden"
                  >
                    <div
                      class="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-500 transition-all duration-700"
                      :style="{
                        height:
                          28 +
                          (agreementsAccepted ? 36 : 0) +
                          (marketingConsent ? 36 : 0) +
                          '%',
                      }"
                    ></div>
                  </div>

                  <div class="relative flex items-center gap-6">
                    <div
                      class="z-10 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-[#161b27] shadow-lg flex items-center justify-center"
                    >
                      <svg
                        class="w-3 h-3 text-white"
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
                    </div>
                    <div>
                      <h4
                        class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter"
                      >
                        Profil Hazır
                      </h4>
                      <p
                        class="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate"
                      >
                        @{{ registerForm.username }} Hoş Geldin!
                      </p>
                    </div>
                  </div>

                  <div class="relative flex items-center gap-6">
                    <div
                      class="z-10 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-[#161b27] shadow-lg flex items-center justify-center"
                    >
                      <svg
                        class="w-3 h-3 text-white"
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
                    </div>
                    <div>
                      <h4
                        class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter"
                      >
                        Güvenlik Katmanı
                      </h4>
                      <p
                        class="text-[10px] text-slate-400 font-bold uppercase tracking-widest"
                      >
                        Şifre doğrulandı
                      </p>
                    </div>
                  </div>

                  <div
                    class="relative flex items-start gap-6 cursor-pointer group"
                    @click="agreementsAccepted = !agreementsAccepted"
                  >
                    <div
                      class="z-10 mt-1 w-6 h-6 rounded-full transition-all duration-500 flex items-center justify-center border-4 border-white dark:border-[#161b27] shadow-lg"
                      :class="
                        agreementsAccepted
                          ? 'bg-blue-600 shadow-blue-500/20'
                          : 'bg-slate-200 dark:bg-white/10'
                      "
                    >
                      <svg
                        class="w-3 h-3 text-white"
                        v-if="agreementsAccepted"
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
                    </div>
                    <div class="flex-1">
                      <h4
                        class="text-sm font-black transition-colors"
                        :class="
                          agreementsAccepted
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400'
                        "
                      >
                        Yasal Protokoller
                      </h4>
                      <p
                        class="text-[11px] leading-relaxed font-bold mt-1"
                        :class="
                          agreementsAccepted
                            ? 'text-slate-700 dark:text-white/80'
                            : 'text-slate-400/60'
                        "
                      >
                        <button
                          type="button"
                          @click.stop="openLegal('terms')"
                          class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:underline"
                        >
                          Şartlar</button
                        >,
                        <button
                          type="button"
                          @click.stop="openLegal('privacy')"
                          class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:underline"
                        >
                          Gizlilik
                        </button>
                        ve
                        <button
                          type="button"
                          @click.stop="openLegal('kvkk')"
                          class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:underline"
                        >
                          KVKK
                        </button>
                        onayları.
                      </p>
                    </div>
                  </div>

                  <div
                    class="relative flex items-start gap-6 cursor-pointer group"
                    @click="marketingConsent = !marketingConsent"
                  >
                    <div
                      class="z-10 mt-1 w-6 h-6 rounded-full transition-all duration-500 flex items-center justify-center border-4 border-white dark:border-[#161b27] shadow-lg"
                      :class="
                        marketingConsent
                          ? 'bg-purple-600 shadow-purple-500/20'
                          : 'bg-slate-200 dark:bg-white/10'
                      "
                    >
                      <svg
                        class="w-3 h-3 text-white"
                        v-if="marketingConsent"
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
                    </div>
                    <div class="flex-1">
                      <h4
                        class="text-sm font-black transition-colors"
                        :class="
                          marketingConsent
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-slate-400'
                        "
                      >
                        İletişim Tercihi
                      </h4>
                      <p
                        class="text-[11px] font-bold mt-1"
                        :class="
                          marketingConsent
                            ? 'text-slate-700 dark:text-white/80'
                            : 'text-slate-400/60'
                        "
                      >
                        Kampüs yenilikleri için
                        <button
                          type="button"
                          @click.stop="openLegal('etk')"
                          class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:underline"
                        >
                          E-İleti
                        </button>
                        almayı kabul ediyorum.
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-4 pt-8 text-center">
                  <button
                    @click="handleRegister"
                    :disabled="registerLoading || !agreementsAccepted"
                    class="auth-btn py-4 shadow-xl overflow-hidden group"
                  >
                    <span class="relative z-10">{{
                      registerLoading
                        ? "Sisteme Sızılıyor..."
                        : "Yolculuğu Başlat"
                    }}</span>
                    <div
                      class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                    ></div>
                  </button>
                  <button
                    @click="isReviewing = false"
                    class="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-[0.3em] italic"
                  >
                    ← Bilgileri Düzenle
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Login Form -->
        <div
          class="w-full md:w-1/2 flex flex-col items-center justify-center px-8 md:px-12 py-10 transition-all duration-700 md:ml-auto"
          :class="[
            activeTab === 'register'
              ? 'md:opacity-0 md:invisible hidden md:flex'
              : 'opacity-100 visible flex',
          ]"
        >
          <div class="w-full max-w-[340px]">
            <h2
              class="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center italic tracking-tighter uppercase leading-none"
            >
              Tekrar Hoş Geldin
            </h2>
            <form @submit.prevent="handleLogin" class="space-y-4">
              <!-- Login Type Selection -->
              <div
                class="flex p-1 bg-slate-100 dark:bg-[#1a1f2e] rounded-2xl border border-slate-200/50 dark:border-white/[0.05]"
              >
                <button
                  type="button"
                  @click="loginType = 'student'"
                  class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  :class="
                    loginType === 'student'
                      ? 'bg-white dark:bg-[#252b3d] text-blue-600 shadow-sm'
                      : 'text-slate-400'
                  "
                >
                  Öğrenci
                </button>
                <button
                  type="button"
                  @click="loginType = 'academic'"
                  class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  :class="
                    loginType === 'academic'
                      ? 'bg-white dark:bg-[#252b3d] text-emerald-600 shadow-sm'
                      : 'text-slate-400'
                  "
                >
                  Akademisyen
                </button>
              </div>

              <div class="relative flex items-center group">
                <input
                  v-model="loginEmailPrefix"
                  type="text"
                  placeholder="Öğrenci No"
                  class="auth-input pr-32 shadow-inner"
                />
                <span
                  class="absolute right-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter pointer-events-none select-none"
                >
                  {{
                    loginType === "student"
                      ? "@ogr.mehmetakif.edu.tr"
                      : "@mehmetakif.edu.tr"
                  }}
                </span>
              </div>
              <div class="relative group">
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Şifre"
                  class="auth-input shadow-inner"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-all"
                >
                  <svg
                    v-if="showPassword"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      stroke-width="2"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      stroke-width="2"
                    />
                  </svg>
                </button>
              </div>
              <button
                type="submit"
                :disabled="loginLoading || !loginEmailPrefix"
                class="auth-btn mt-2"
              >
                Giriş Yap
              </button>
              <div class="flex justify-between mt-4 px-1">
                <button
                  type="button"
                  @click="
                    showForgotModal = true;
                    forgotStep = 1;
                  "
                  class="text-xs font-black text-slate-400 hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text hover:text-transparent transition-all duration-300"
                >
                  Şifremi Unuttum
                </button>
                <button
                  type="button"
                  @click="activeTab = 'register'"
                  class="text-blue-600 text-xs font-black hover:underline transition-all"
                >
                  Kayıt Ol
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Legal Modals -->
    <LegalModal
      :is-open="legalModal.isOpen"
      :title="legalModal.title"
      :type="legalModal.type"
      @close="legalModal.isOpen = false"
    />
  </div>
</template>

<style scoped>
.auth-input {
  @apply w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/[0.07] text-gray-900 dark:text-white outline-none focus:border-blue-500/50 transition-all text-sm placeholder-gray-400;
}
.auth-btn {
  @apply relative w-full py-3.5 rounded-xl text-white text-sm font-black bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg active:scale-95 transition-all disabled:opacity-50;
}
</style>

<script setup lang="ts">
import { ref, computed, watch, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import apiClient from "@/api/client";
import LegalModal from "@/components/LegalModal.vue";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const activeTab = ref<"login" | "register">("login");
const loginLoading = ref(false);
const registerLoading = ref(false);
const showPassword = ref(false);
const showVerification = ref(false);
const verifyLoading = ref(false);
const verificationCode = ref("");
const showForgotModal = ref(false);
const forgotStep = ref(1);
const forgotForm = ref({
  email: "",
  code: "",
  newPassword: "",
  confirmPassword: "",
});
const forgotLoading = ref(false);

// REVEIW & LEGAL STATE
const isReviewing = ref(false);
const agreementsAccepted = ref(false);
const marketingConsent = ref(false);
const legalModal = reactive({ isOpen: false, title: "", type: "terms" as any });

const openLegal = (type: any) => {
  const titles = {
    terms: "Kullanım Koşulları",
    privacy: "Gizlilik Politikası",
    kvkk: "KVKK Aydınlatma Metni",
    etk: "Elektronik İleti İzni",
  };
  legalModal.type = type;
  legalModal.title = (titles as any)[type];
  legalModal.isOpen = true;
};

// FORM STATE
const loginForm = ref({ email: "", password: "" });
const loginType = ref<"student" | "academic">("student");
const loginEmailPrefix = ref("");

const registerForm = ref({
  fullName: "",
  username: "",
  email: "",
  password: "",
});
const registerType = ref<"student" | "academic">("student");
const emailPrefix = ref("");

// WATCHERS
watch([loginEmailPrefix, loginType], () => {
  const suffix =
    loginType.value === "student"
      ? "@ogr.mehmetakif.edu.tr"
      : "@mehmetakif.edu.tr";
  loginForm.value.email = loginEmailPrefix.value.trim()
    ? `${loginEmailPrefix.value.trim()}${suffix}`
    : "";
});

watch([emailPrefix, registerType], () => {
  const suffix =
    registerType.value === "student"
      ? "@ogr.mehmetakif.edu.tr"
      : "@mehmetakif.edu.tr";
  registerForm.value.email = emailPrefix.value.trim()
    ? `${emailPrefix.value.trim()}${suffix}`
    : "";
});

// COMPUTED
const passChecks = computed(() => ({
  "8+ Karakter": registerForm.value.password.length >= 8,
  "Büyük Harf": /[A-Z]/.test(registerForm.value.password),
  "Özel/Rakam": /((?=.*\d)|(?=.*\W+))/.test(registerForm.value.password),
  "Kullanıcı Adı İçeremez": registerForm.value.username
    ? !registerForm.value.password
        .toLowerCase()
        .includes(registerForm.value.username.toLowerCase())
    : true,
}));

const isResetValid = computed(
  () =>
    forgotForm.value.newPassword.length >= 8 &&
    forgotForm.value.newPassword === forgotForm.value.confirmPassword,
);

const isUsernameTaken = ref(false);
let usernameCheckTimeout: any = null;
const checkUsername = async () => {
  if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);
  usernameCheckTimeout = setTimeout(async () => {
    if (!registerForm.value.username || registerForm.value.username.length < 3)
      return;
    try {
      const res = await apiClient.get(
        `/auth/check-username/${registerForm.value.username}`,
      );
      isUsernameTaken.value = !res.data.available;
    } catch {
      isUsernameTaken.value = false;
    }
  }, 500);
};

const usernameError = computed(() =>
  isUsernameTaken.value ? "Bu kullanıcı adı alınmış!" : null,
);
const hasErrors = computed(
  () =>
    !registerForm.value.fullName ||
    !!usernameError.value ||
    !Object.values(passChecks.value).every((v) => v),
);

// HANDLERS
const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    toast.info("Lütfen tüm alanları doldurun.");
    return;
  }
  loginLoading.value = true;
  try {
    await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password,
    });
    toast.success("Hoş geldin! 👋");
    router.push("/");
  } catch (error: any) {
    if (error.type === "BANNED") {
      router.push("/banned");
    } else {
      toast.error(error.message || "Giriş başarısız.");
    }
  } finally {
    loginLoading.value = false;
  }
};

const handleRegister = async () => {
  registerLoading.value = true;
  try {
    // authStore.register'ı kullanmak daha tutarlı olur
    await authStore.register(registerForm.value);
    toast.success("Kayıt başarılı! Mailini kontrol et. 📬");
    showVerification.value = true;
  } catch (error: any) {
    toast.error(error.message || "Kayıt başarısız.");
  } finally {
    registerLoading.value = false;
  }
};

const handleVerify = async () => {
  verifyLoading.value = true;
  try {
    await apiClient.post("/auth/verify-email", {
      email: registerForm.value.email,
      code: verificationCode.value,
    });
    toast.success("Hesabın doğrulandı!");
    showVerification.value = false;
    activeTab.value = "login";
  } catch {
    toast.error("Kod hatalı.");
  } finally {
    verifyLoading.value = false;
  }
};

const handleSendResetCode = async () => {
  if (!forgotForm.value.email) {
    toast.info("MAKÜ E-posta adresi girin.");
    return;
  }
  forgotLoading.value = true;
  try {
    await apiClient.post("/auth/forgot-password", {
      email: forgotForm.value.email,
    });
    toast.success("Sıfırlama kodu gönderildi!");
    forgotStep.value = 2;
  } catch {
    toast.error("Kod gönderilemedi.");
  } finally {
    forgotLoading.value = false;
  }
};

const handleResetPassword = async () => {
  forgotLoading.value = true;
  try {
    await apiClient.post("/auth/reset-password", {
      email: forgotForm.value.email,
      code: forgotForm.value.code,
      newPassword: forgotForm.value.newPassword,
    });
    toast.success("Şifren güncellendi!");
    showForgotModal.value = false;
    activeTab.value = "login";
  } catch {
    toast.error("Hata oluştu.");
  } finally {
    forgotLoading.value = false;
  }
};
</script>
