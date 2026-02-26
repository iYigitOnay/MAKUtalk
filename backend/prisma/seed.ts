import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Rozet sistemi senin istediğin 9 özel rozete göre sıfırlanıyor...');

  // 1. ESKİ ROZETLERİ TEMİZLE
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});

  // 2. KATEGORİLERİ SABİTLE (Renk uyumu için)
  const categories = [
    { id: 1, name: 'Genel', slug: 'genel', description: 'Genel paylaşımlar', color: '#64748B', icon: '🌍' },
    { id: 2, name: 'Duyuru', slug: 'duyuru', description: 'Önemli kampüs duyuruları', color: '#DC2626', icon: '📢' },
    { id: 3, name: 'Etkinlik', slug: 'etkinlik', description: 'Kulüp etkinlikleri ve aktiviteler', color: '#A855F7', icon: '🎉' },
    { id: 4, name: 'Arıza / Kayıp', slug: 'ariza-kayip', description: 'Arızalı veya kaybolan eşyalar', color: '#E11D48', icon: '🔍' },
    { id: 5, name: 'Satılık', slug: 'satilik', description: 'Satılık ürünler', color: '#F59E0B', icon: '💰' },
    { id: 6, name: 'Soru / Cevap', slug: 'soru-cevap', description: 'Akademik ve genel sorular', color: '#3B82F6', icon: '❓' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
  }

  // 3. SENİN İSTEDİĞİN 9 ÖZEL ROZET (Kurucu artık burada yok, o sistemsel bir statü olacak)
  const badges = [
    { name: 'Akademisyen', icon: 'academic', color: '#059669', description: 'Üniversite öğretim üyesi veya araştırmacı' },
    { name: 'Elçi', icon: 'herald', color: '#DC2626', description: 'Duyuru ve haberlerin güvenilir kaynağı' },
    { name: 'Organizatör', icon: 'social', color: '#A855F7', description: 'Etkinliklerin ve sosyal hayatın kalbi' },
    { name: 'Girişimci', icon: 'merchant', color: '#F59E0B', description: 'Dürüst ve aktif ticaretin adresi' },
    { name: 'Duyarlı', icon: 'observer', color: '#E11D48', description: 'Sorunları gören ve çözüm bildiren' },
    { name: 'Sosyal', icon: 'voice', color: '#3B82F6', description: 'Sorulara en iyi cevapları veren rehber' },
    { name: 'Sporcu', icon: 'athlete', color: '#EF4444', description: 'Kampüsün enerjik ve atletik ismi' },
    { name: 'Mucit', icon: 'inventor', color: '#FFFFFF', description: 'Yaratıcı fikirler ve teknolojik buluşlar' },
    { name: 'Sanatçı', icon: 'musician', color: '#EC4899', description: 'Kampüsün sanat ve müzik ruhlu üyesi' },
  ];

  for (const badge of badges) {
    await prisma.badge.create({ data: badge });
  }

  // 4. Admin Kullanıcıyı Ayarla
  await prisma.user.upsert({
    where: { email: '2312101063@ogr.mehmetakif.edu.tr' },
    update: { role: 'ADMIN', isVerified: true },
    create: {
      email: '2312101063@ogr.mehmetakif.edu.tr',
      username: 'ihsan',
      password: 'hashedPassword123',
      fullName: 'İhsan',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('İŞLEM TAMAM: 9 özel rozet yüklendi, Kurucu veritabanından kaldırıldı.');
}

main()
  .catch((e) => { console.error('Hata:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
