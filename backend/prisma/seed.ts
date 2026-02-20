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
  console.log('🌱 Seeding database...');

  // Kategorileri oluştur
  const categories = [
    {
      name: 'Duyuru',
      slug: 'duyuru',
      description: 'Önemli kampüs duyuruları',
      color: '#EF4444',
      icon: '📢',
    },
    {
      name: 'Etkinlik',
      slug: 'etkinlik',
      description: 'Kulüp etkinlikleri ve aktiviteler',
      color: '#8B5CF6',
      icon: '🎉',
    },
    {
      name: 'Soru-Cevap',
      slug: 'soru-cevap',
      description: 'Akademik ve genel sorular',
      color: '#3B82F6',
      icon: '❓',
    },
    {
      name: 'Genel',
      slug: 'genel',
      description: 'Genel paylaşımlar',
      color: '#6B7280',
      icon: '💬',
    },
    {
      name: 'Kayıp-Buluntu',
      slug: 'kayip-buluntu',
      description: 'Kaybolan veya bulunan eşyalar',
      color: '#F59E0B',
      icon: '🔍',
    },
    {
      name: 'Satılık',
      slug: 'satilik',
      description: 'Satılık ürünler',
      color: '#10B981',
      icon: '🛍️',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
