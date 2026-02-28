# 🎓 MAKUtalk

MAKUtalk, Burdur Mehmet Akif Ersoy Üniversitesi (MAKÜ) öğrencileri için özel olarak tasarlanmış, kampüs içi etkileşimi artıran modern bir dijital sosyal platformdur. Öğrencilerin duyuru yapabileceği, yardımlaşabileceği, eşyalarını alıp satabileceği ve kampüs hayatını paylaşabileceği güvenli bir ekosistem sunar.

![MAKUtalk Logo](frontend/public/makutalklogo.png)

## ✨ Özellikler

- **🤖 Yapay Zeka Destekli Duygu Analizi:** Paylaşımlarınızın tonu Gemini AI ile otomatik olarak analiz edilir ve kategorize edilir.
- **📱 Modern Sosyal Medya Deneyimi:** Beğeni, yorum, "Remakü" (repost) ve takip sistemi.
- **🔒 Gelişmiş Gizlilik & Güvenlik:** Açık ve Gizli hesap seçenekleri. Özel mesajlaşma altyapısı (Mesaj İstekleri ve Otomatik Onay mekanizmaları).
- **🛒 MAKÜ-Spot (Pazaryeri):** Öğrenciden öğrenciye ikinci el alım-satım, ev/yol arkadaşı bulma ve akademik fırsatlar.
- **💬 Gerçek Zamanlı Mesajlaşma:** Socket.io tabanlı, uçtan uca şifreli, "yazıyor..." bildirimli güvenli DM sistemi.
- **✉️ Güvenli Kimlik Doğrulama:** Üniversite e-posta doğrulama kodu (OTP) ile sadece gerçek öğrencilere ve akademisyenlere açık ağ.
- **🌓 Dark/Light Mode:** Göz yormayan, modern ve kullanıcı dostu arayüz.

## 🛠️ Teknoloji Yığını

### Backend
- **Framework:** [NestJS](https://nestjs.com/) (Node.js v20+)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Veritabanı:** [PostgreSQL](https://www.postgresql.org/) (v15)
- **Gerçek Zamanlı İletişim:** Socket.io
- **Güvenlik:** JWT, Bcryptjs, Rate Limiting

### Frontend
- **Framework:** [Vue 3](https://vuejs.org/) (Composition API)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **İkonlar:** [Lucide Vue Next](https://lucide.dev/)

### DevOps & Deployment
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx

---

## 🚀 Canlıya Alma (Production Deployment)

Bu proje, bir VPS (Örn: DigitalOcean Droplet, AWS EC2, Hetzner) üzerinde **Docker Compose** ile profesyonel bir şekilde çalıştırılmak üzere optimize edilmiştir.

### 1. Sunucu Hazırlığı
Sunucunuza (Droplet) SSH ile bağlanın ve gerekli araçların kurulu olduğundan emin olun:
```bash
# Docker ve Git kurulumu (Ubuntu/Debian için)
sudo apt update
sudo apt install -y git docker.io docker-compose
```

### 2. Projeyi Klonlama
```bash
git clone https://github.com/iYigitOnay/MAKUtalk.git
cd MAKUtalk
```

### 3. Çevre Değişkenleri (.env)
Proje kök dizininde bir `.env` dosyası oluşturun ve üretim (production) değişkenlerinizi tanımlayın:

```bash
nano .env
```

**.env İçeriği Örneği:**
```env
# Veritabanı Ayarları
DB_USERNAME=admin
DB_PASSWORD=cok_guclu_bir_sifre
DB_NAME=makutalk_prod

# Güvenlik Anahtarları
JWT_SECRET=super_gizli_ve_uzun_jwt_anahtariniz

# Mail Ayarları (Resend vb.)
RESEND_API_KEY=re_123456789_xxxxxxxx
SMTP_FROM="MAKUtalk <noreply@makutalk.com>"

# API URL Ayarları (Sunucunuzun IP adresi veya Domain'i olmalıdır)
# ÖNEMLİ: Sonunda '/' olmamalıdır ve localhost yazmamalıdır!
VITE_API_URL=http://167.X.X.X:3000
FRONTEND_URL=http://167.X.X.X
```

### 4. Docker ile Sistemi Ayağa Kaldırma
Sadece tek bir komutla Veritabanı, Backend ve Frontend'i üretim modunda ayağa kaldırın:

```bash
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### 5. Deployment Notları
- **Veritabanı Göçleri (Migrations):** Backend container'ı başlatıldığında `npx prisma migrate deploy` komutu otomatik olarak çalışır ve veritabanı şemasını günceller. Ekstra bir işlem yapmanıza gerek yoktur.
- **Portlar:** 
  - Frontend, sunucunun **80** portunda (HTTP) doğrudan yayın yapar.
  - Backend API, sunucunun **3000** portunda yayın yapar.
- **Güncellemeler:** Projede değişiklik yaptığınızda (yeni bir özellik eklediğinizde), sunucuda şu komutları çalıştırmanız yeterlidir:
  ```bash
  git pull origin main
  sudo docker-compose up -d --build
  ```

---

## 💻 Yerel Geliştirme (Local Development)

Projeyi kendi bilgisayarınızda geliştirmek istiyorsanız:

1. Depoyu klonlayın ve kök dizinde `npm install` çalıştırın (Opsiyonel ama araçlar için iyi olabilir).
2. PostgreSQL veritabanınızı başlatın (veya `docker-compose up db -d` ile sadece DB'yi ayağa kaldırın).
3. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run start:dev
   ```
4. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🤝 Katkıda Bulunma

1. Projeyi Fork'layın.
2. Yeni bir Feature Branch oluşturun (`git checkout -b feature/yeni-fikir`).
3. Değişikliklerinizi Commit edin (`git commit -m 'feat: Yeni özellik eklendi'`).
4. Branch'inizi Push edin (`git push origin feature/yeni-fikir`).
5. Pull Request açın.

## 📄 Lisans
Bu proje MIT lisansı altında lisanslanmıştır.
