import 'dotenv/config';
import { PrismaClient, BadgeType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Snowflake } from '@theinternetfolks/snowflake';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function getNextId(): bigint {
  return BigInt(Snowflake.generate());
}

async function main() {
  console.log(
    '🌱 Seed işlemi başlıyor (Snowflake ID uyumlu & ID Koruma Aktif)...',
  );

  // 1. KATEGORİLER
  const categories = [
    {
      name: 'Duyuru',
      slug: 'duyuru',
      description: 'Kampüs ve kulüp duyuruları',
      icon: 'Megaphone',
      color: '#DC2626',
    },
    {
      name: 'Arıza/Kayıp',
      slug: 'ariza-kayip',
      description: 'Kampüs içi teknik arızalar veya kayıp eşya duyuruları',
      icon: 'Wrench',
      color: '#F43F5E',
    },
    {
      name: 'Satılık',
      slug: 'satilik',
      description: 'İkinci el eşya, kitap vb. alım-satım',
      icon: 'ShoppingBag',
      color: '#D97706',
    },
    {
      name: 'Sanat',
      slug: 'sanat',
      description: 'Müzik, resim, tiyatro ve sanatsal paylaşımlar',
      icon: 'Palette',
      color: '#0D9488',
    },
    {
      name: 'Spor',
      slug: 'spor',
      description: 'Spor turnuvaları, takımlar ve aktivite eşleşmeleri',
      icon: 'Trophy',
      color: '#16A34A',
    },
    {
      name: 'Soru/Cevap',
      slug: 'soru-cevap',
      description: 'Yardımlaşma ve merak edilen sorular',
      icon: 'HelpCircle',
      color: '#1E3A8A',
    },
    {
      name: 'Genel',
      slug: 'genel',
      description: 'Genel paylaşımlar ve serbest kürsü',
      icon: 'Globe',
      color: '#6B7280',
    },
    {
      name: 'Etkinlik',
      slug: 'etkinlik',
      description: 'Kampüs içi sosyal ve akademik etkinlikler',
      icon: 'Calendar',
      color: '#7C3AED',
    },
  ];

  console.log('📁 Kategoriler güncelleniyor (ID Koruma Modu)...');
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color,
      },
      create: {
        id: getNextId(),
        ...c,
      },
    });
  }

  // 2. ROZETLER
  const badges = [
    {
      name: 'Elçi',
      icon: 'megaphone',
      color: '#DC2626',
      description: 'Duyuruların ve önemli haberlerin güçlü sesi.',
      type: BadgeType.USER,
    },
    {
      name: 'Organizatör',
      icon: 'calendar',
      color: '#A855F7',
      description: 'Kampüsteki etkinliklerin ve sosyal hayatın mimarı.',
      type: BadgeType.USER,
    },
    {
      name: 'Duyarlı',
      icon: 'eye',
      color: '#E11D48',
      description: 'Kampüse duyarlı, her detayı fark eden keskin göz.',
      type: BadgeType.USER,
    },
    {
      name: 'Girişimci',
      icon: 'briefcase',
      color: '#F59E0B',
      description: 'Spot pazarının girişimci ruhu.',
      type: BadgeType.USER,
    },
    {
      name: 'Rehber',
      icon: 'map',
      color: '#3B82F6',
      description: 'Sorulara verdiği cevaplarla topluluğa yol gösteren bilge.',
      type: BadgeType.USER,
    },
    {
      name: 'Sporcu',
      icon: 'zap',
      color: '#10B981',
      description: 'Kampüsün bitmek bilmeyen enerjisi ve hız sembolü.',
      type: BadgeType.USER,
    },
    {
      name: 'Müzisyen',
      icon: 'mic-2',
      color: '#F43F5E',
      description: 'Ritim ve melodileriyle kampüsün ruhunu besleyen yetenek.',
      type: BadgeType.USER,
    },
    {
      name: 'Sanatçı',
      icon: 'feather',
      color: '#06B6D4',
      description:
        'Estetik bakış açısı ve yaratıcılığıyla fark yaratan sanatçı.',
      type: BadgeType.USER,
    },
    {
      name: 'Gece Kuşu',
      icon: 'moon',
      color: '#4C1D95',
      description: 'Gecenin sessizliğini paylaşımlarıyla bozan kampüs sakini.',
      type: BadgeType.USER,
    },
    {
      name: 'Gurme',
      icon: 'coffee',
      color: '#BE185D',
      description: 'Lezzet duraklarının ve yemekhane menüsünün tadım uzmanı.',
      type: BadgeType.USER,
    },
    {
      name: 'Akademisyen',
      icon: 'graduation-cap',
      color: '#059669',
      description: 'MAKÜ Akademik Personeli.',
      type: BadgeType.USER,
    },
    {
      name: 'Mucit',
      icon: 'brain',
      color: '#FFFFFF',
      description: 'Üstün zeka, yaratıcı fikir ve teknik deha.',
      type: BadgeType.USER,
    },
    {
      name: 'Kurucu',
      icon: 'crown',
      color: '#1E3A8A',
      description: 'Platformun mimarı ve mülki amiri.',
      type: BadgeType.USER,
    },
  ];

  console.log('🛡️ Rozetler güncelleniyor (ID Koruma Modu)...');
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: {
        icon: b.icon,
        color: b.color,
        description: b.description,
        type: b.type,
      },
      create: {
        id: getNextId(),
        ...b,
      },
    });
  }

  console.log('✅ Seed işlemi başarıyla tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
