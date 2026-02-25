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

  // Kategorileri oluştur
  const categories = [
    {
      name: 'Duyuru',
      slug: 'duyuru',
      description: 'Önemli kampüs duyuruları',
      color: '#DC2626', // Red-600: Resmi, acil, dikkat çeker
      icon: '',
    },
    {
      name: 'Etkinlik',
      slug: 'etkinlik',
      description: 'Kulüp etkinlikleri ve aktiviteler',
      color: '#A855F7', // Purple-500: Eğlenceli, yaratıcı, pozitif
      icon: '',
    },
    {
      name: 'Soru-Cevap',
      slug: 'soru-cevap',
      description: 'Akademik ve genel sorular',
      color: '#3B82F6', // Blue-500: Akademik, güven, bilgi
      icon: '',
    },
    {
      name: 'Genel',
      slug: 'genel',
      description: 'Genel paylaşımlar',
      color: '#64748B', // Slate-700: Nötr, profesyonel
      icon: '',
    },
    {
      name: 'Arıza-Kayıp',
      slug: 'ariza-kayip',
      description: 'Arızalı veya kaybolan eşyalar',
      color: '#E11D48', // Rose-600: Dikkat çeken problem, acil yardım
      icon: '',
    },
    {
      name: 'Satılık',
      slug: 'satilik',
      description: 'Satılık ürünler',
      color: '#F59E0B', // Amber-500: Ticari, uyarı, altın/sarı
      icon: '',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
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
