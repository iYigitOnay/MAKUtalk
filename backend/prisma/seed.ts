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
  console.log('Seeding database...');

  // Kategorileri oluştur - İstenen sıralama: Genel, Duyuru, Etkinlik, Arıza / Kayıp, Satılık, Soru / Cevap
  const categories = [
    {
      name: 'Genel',
      slug: 'genel',
      description: 'Genel paylaşımlar',
      color: '#64748B', // Slate
      icon: '🌍',
    },
    {
      name: 'Duyuru',
      slug: 'duyuru',
      description: 'Önemli kampüs duyuruları',
      color: '#DC2626', // Kırmızı
      icon: '📢',
    },
    {
      name: 'Etkinlik',
      slug: 'etkinlik',
      description: 'Kulüp etkinlikleri ve aktiviteler',
      color: '#A855F7', // Mor
      icon: '🎉',
    },
    {
      name: 'Arıza / Kayıp',
      slug: 'ariza-kayip',
      description: 'Arızalı veya kaybolan eşyalar',
      color: '#E11D48', // Rose
      icon: '🔍',
    },
    {
      name: 'Satılık',
      slug: 'satilik',
      description: 'Satılık ürünler',
      color: '#F59E0B', // Amber
      icon: '💰',
    },
    {
      name: 'Soru / Cevap',
      slug: 'soru-cevap',
      description: 'Akademik ve genel sorular',
      color: '#3B82F6', // Mavi
      icon: '❓',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log('Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
