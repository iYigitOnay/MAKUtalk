# MAKUtalk Güncelleme Geçmişi (Changelog)

Tüm zamanların en güncel ve havalı kampüs uygulamasının gelişim süreci.

## [v1.5.0] - 29-03-2026

### Eklendi

- **Profesyonel Post Atma:** Post atma süreci tamamen asenkron hale getirildi. Artık video ve büyük fotoğraflar arka planda işlenirken kullanıcı bekletilmiyor.
- **Client-side Optimizasyon:** Fotoğraflar sunucuya gitmeden tarayıcıda otomatik sıkıştırılıyor (Hızlı upload).
- **Aşamalı İlerleme:** Medya işleme süreci "Hazırlanıyor", "Optimize Ediliyor", "AI Analiz Ediliyor" gibi canlı aşamalarla takip edilebiliyor.
- **Canlı Güncelleme:** Socket.io entegrasyonu ile arka planda biten işlemler sayfayı yenilemeden (F5 gerekmeden) anında akışa yansıyor.

### Düzeltildi

- **Medya Önizleme:** Post atma alanındaki medya boyutları "object-contain" ile iyileştirildi, kırpılmalar önlendi.
- **Buton Kontrolü:** Sadece video veya döküman paylaşımlarında butonun aktif olmaması sorunu giderildi.
- **Mükerrer Post:** Kendi paylaştığımız postların socket üzerinden ikinci kez eklenmesi (duplication) engellendi.

## [v1.4.2] - 28-03-2026

### Eklendi

- **Akıllı Navigasyon:** Arama kutusu boş bırakıldığında veya temizlendiğinde anasayfaya hızlı dönüş özelliği eklendi.
- **Performans Optimizasyonu:** Hashtag senkronizasyonu ve arama indeksleme süreçleri hızlandırıldı.

### Düzeltildi

- **Navigasyon Akışı:** Arama sonuçlarından anasayfaya geçişlerdeki takılmalar giderildi.
- **Genel Kararlılık:** Snowflake ID sistemiyle ilgili uç durumlar (edge cases) için iyileştirmeler yapıldı.

## [v1.4.1] - 28-03-2026

### Eklendi

- **Profil Akademik Kimliği:** Kullanıcı profilinde Bölüm ve Sınıf bilgileri şık bir şekilde gösterilmeye başlandı.
- **Dinamik Favicon Bildirimleri:** Kullanıcı sekmeyi terk ettiğinde, gelen bildirimin türüne göre favicon üzerinde renkli noktalar ve bildirim sayısı görünür hale getirildi.
- **Güncelleme Notları Sayfası:** Artık yapılan her yeniliği Ayarlar -> Güncelleme Notları kısmından takip edebilirsiniz.

### Düzeltildi

- **Backend Tip Hataları:** Post etkileşimlerindeki kritik TypeScript tip uyuşmazlığı giderildi.
- **Profil Arayüzü:** Profil sayfasındaki yerleşim ve boşluklar (spacing) optimize edildi.

## [v1.4.0] - 27-03-2026

### Eklendi

- **Video Desteği:** Artık paylaşımlara video eklenebilir ve premium video oynatıcı ile izlenebilir.
- **Snowflake ID Geçişi:** Veritabanı kimlik sistemi 64-bit Snowflake mimarisine taşındı (Daha hızlı, daha güvenli).

## [v1.3.0] - 25-03-2026

### Eklendi

- **Hashtag & Trendler:** Paylaşımlarda hashtag kullanımı ve kampüs genelinde trend olan konuların takibi eklendi.
- **Gelişmiş Gizlilik:** Kullanıcı bazlı hashtag senkronizasyonu ve gizli hesap kontrolleri güçlendirildi.

## [v1.0.0] - 01-03-2026

### Eklendi

- **MAKUtalk Lansmanı:** Burdur MAKÜ öğrencileri için dijital kampüs kapılarını açtı!
