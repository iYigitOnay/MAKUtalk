# 🎓 MAKUtalk

MAKUtalk, Burdur Mehmet Akif Ersoy Üniversitesi (MAKÜ) öğrencileri için özel olarak tasarlanmış, kampüs içi etkileşimi artıran modern bir dijital sosyal platformdur. Öğrencilerin duyuru yapabileceği, yardımlaşabileceği ve kampüs hayatını paylaşabileceği güvenli bir ekosistem sunar.

![MAKUtalk Logo](frontend/public/makutalklogo.png)

## ✨ Özellikler

- **🤖 Yapay Zeka Destekli Duygu Analizi:** Paylaşımlarınızın tonu otomatik olarak analiz edilir (Pozitif, Negatif, Nötr).
- **📱 Modern Sosyal Medya Deneyimi:** Beğeni, yorum, "Remakü" (repost) ve takip sistemi.
- **🏷️ Kategorize Edilmiş İçerik:** Genel, Duyuru, Etkinlik, Arıza/Kayıp, Satılık ve Soru-Cevap kategorileri.
- **🔍 Gelişmiş Arama:** Kullanıcı, hashtag ve içerik bazlı dinamik arama motoru.
- **✉️ Güvenli Kimlik Doğrulama:** E-posta doğrulama kodu (OTP) ve şifre sıfırlama sistemi.
- **🌓 Dark/Light Mode:** Göz yormayan, modern ve kullanıcı dostu arayüz.
- **🔔 Anlık Bildirimler:** Etkileşimlerden anında haberdar olma.

## 🛠️ Teknoloji Yığını

### Backend

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Veritabanı:** [PostgreSQL](https://www.postgresql.org/)
- **Güvenlik:** JWT (JSON Web Tokens) & Bcryptjs
- **E-posta:** Nodemailer (Gmail SMTP)

### Frontend

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **İkonlar:** [Lucide Vue Next](https://lucide.dev/)

### DevOps & Deployment

- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Web Server:** Nginx (Frontend için)

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

- Node.js (v18+)
- Docker & Docker Compose (Opsiyonel)
- PostgreSQL

### Yerel Geliştirme (Docker Olmadan)

1.  **Depoyu Klonlayın:**

    ```bash
    git clone https://github.com/kullaniciadi/MAKUtalk.git
    cd MAKUtalk
    ```

2.  **Backend Kurulumu:**

    ```bash
    cd backend
    npm install
    # .env dosyasını oluşturun ve veritabanı bilgilerinizi girin
    npx prisma migrate dev
    npm run start:dev
    ```

3.  **Frontend Kurulumu:**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

### Docker ile Çalıştırma (Önerilen)

Sadece tek bir komutla tüm sistemi (DB, Backend, Frontend) ayağa kaldırın:

```bash
docker-compose up --build -d
```

Sistem şu adreslerde hazır olacaktır:

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:3001/api`

## 🔒 Ortam Değişkenleri

Uygulamanın çalışması için aşağıdaki değişkenlerin `.env` dosyasında tanımlı olması gerekir:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
JWT_SECRET="gizli_anahtar"
SMTP_USER="makutalk.iletisim@gmail.com"
SMTP_PASS="uygulama_sifresi"
```

## 📈 Deployment

Bu proje GitHub Actions ile entegre edilmiştir. `main` branch'ine yapılan her push işlemi:

1.  Docker imajlarını build eder.
2.  GitHub Container Registry (GHCR)'ye yükler.
3.  Sunucunuzdaki (`self-hosted runner`) konteynırları otomatik günceller.

## 🤝 Katkıda Bulunma

1.  Projeyi Fork'layın.
2.  Yeni bir Feature Branch oluşturun (`git checkout -b feature/yeniOzellik`).
3.  Değişikliklerinizi Commit edin (`git commit -m 'Yeni özellik eklendi'`).
4.  Branch'inizi Push edin (`git push origin feature/yeniOzellik`).
5.  Pull Request açın.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına göz atın.

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
