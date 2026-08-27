### 1. Varsayılan Plan Modu

- Basit olmayan HER görev için plan moduna gir (3+ adım veya mimari kararlar)
- Bir şey ters giderse DUR ve yeniden planla – körü körüne devam etme
- Plan modunu sadece inşa için değil, doğrulama adımları için de kullan
- Belirsizliği azaltmak için baştan detaylı spesifikasyon yaz

### 2. Alt-Ajan Stratejisi

- Ana bağlam penceresini temiz tutmak için alt-ajanları bol bol kullan
- Araştırma, keşif ve paralel analizi alt-ajanlara yükle
- Karmaşık problemlerde alt-ajanlarla daha fazla işlem gücü harca
- Odaklı yürütme için her alt-ajana tek bir görev ver

### 3. Kendini Geliştirme Döngüsü

- Kullanıcıdan HERHANGİ bir düzeltme sonrası: `tasks/lessons.md`yi güncelle
- Aynı hatanın tekrarını önleyen kurallar yaz
- Hata oranı düşene kadar bu dersleri acımasızca geliştir
- Her oturum başında ilgili projenin derslerini gözden geçir

### 4. Tamamlanmadan Önce Doğrulama

- Çalıştığını kanıtlamadan bir görevi asla tamamlandı olarak işaretleme
- Gerektiğinde ana dal ile değişikliklerin arasındaki farkı kontrol et
- Kendine sor: "Kıdemli bir mühendis bunu onaylar mıydı?"
- Testleri çalıştır, logları kontrol et, doğruluğu kanıtla

### 5. Zarafet Talep Et (Dengeli)

- Basit olmayan değişikliklerde dur ve sor: "Daha zarif bir yol var mı?"
- Çözüm yamalı hissediyorsa: "Şu an bildiklerimle zarif çözümü uygula"
- Basit, bariz düzeltmelerde bunu atla – aşırı mühendislik yapma
- Sunmadan önce kendi işini sorgula

### 6. Otonom Hata Düzeltme

- Hata raporu verildiğinde: direkt düzelt. El tutulmasını bekleme
- Loglara, hatalara, başarısız testlere bak – sonra çöz
- Kullanıcıdan sıfır bağlam değişikliği gereksin
- CI testleri başarısız olunca nasıl yapılacağı söylenmeden git düzelt

## Görev Yönetimi

1. Plan Önce: `tasks/todo.md`ye işaretlenebilir maddelerle plan yaz
2. Planı Doğrula: Uygulamaya başlamadan önce onayla
3. İlerlemeyi Takip Et: İlerledikçe maddeleri tamamlandı işaretle
4. Değişiklikleri Açıkla: Her adımda üst düzey özet sun
5. Sonuçları Belgele: `tasks/todo.md`ye inceleme bölümü ekle
6. Dersleri Kaydet: Düzeltmelerden sonra `tasks/lessons.md`yi güncelle

## Temel İlkeler

- Önce Sadelik: Her değişikliği olabildiğince basit yap. Minimal kod etkisi.
- Tembellik Yok: Kök nedeni bul. Geçici çözüm yok. Kıdemli standartlar.
