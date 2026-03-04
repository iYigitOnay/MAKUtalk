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
  console.log('🛡️ Rozetler Lucide standartlarına göre mühürleniyor...');

  const badges = [
    { name: "Elçi", icon: "megaphone", color: "#DC2626", description: "Duyuruların ve önemli haberlerin güçlü sesi.", type: 'USER' },
    { name: "Organizatör", icon: "calendar", color: "#A855F7", description: "Kampüsteki etkinliklerin ve sosyal hayatın mimarı.", type: 'USER' },
    { name: "Duyarlı", icon: "eye", color: "#E11D48", description: "Kampüse duyarlı, her detayı fark eden keskin göz.", type: 'USER' },
    { name: "Girişimci", icon: "briefcase", color: "#F59E0B", description: "Spot pazarının girişimci ruhu.", type: 'USER' },
    { name: "Rehber", icon: "map", color: "#3B82F6", description: "Sorulara verdiği cevaplarla topluluğa yol gösteren bilge.", type: 'USER' },
    { name: "Sporcu", icon: "zap", color: "#10B981", description: "Kampüsün bitmek bilmeyen enerjisi ve hız sembolü.", type: 'USER' },
    { name: "Müzisyen", icon: "mic-2", color: "#F43F5E", description: "Ritim ve melodileriyle kampüsün ruhunu besleyen yetenek.", type: 'USER' },
    { name: "Sanatçı", icon: "feather", color: "#06B6D4", description: "Estetik bakış açısı ve yaratıcılığıyla fark yaratan sanatçı.", type: 'USER' },
    { name: "Gece Kuşu", icon: "moon", color: "#4C1D95", description: "Gecenin sessizliğini paylaşımlarıyla bozan kampüs sakini.", type: 'USER' },
    { name: "Gurme", icon: "coffee", color: "#BE185D", description: "Lezzet duraklarının ve yemekhane menüsünün tadım uzmanı.", type: 'USER' },
    { name: "Akademisyen", icon: "graduation-cap", color: "#059669", description: "MAKÜ Akademik Personeli.", type: 'USER' },
    { name: "Mucit", icon: "brain", color: "#FFFFFF", description: "Üstün zeka, yaratıcı fikir ve teknik deha.", type: 'USER' },
    { name: "Kurucu", icon: "crown", color: "#1E3A8A", description: "Platformun mimarı ve mülki amiri.", type: 'USER' }
  ];

  await (prisma as any).userBadge.deleteMany({});
  await (prisma as any).badge.deleteMany({ where: { type: 'USER' } });

  for (const b of badges) {
    await (prisma as any).badge.create({ data: b as any });
  }

  console.log('✅ 13 Elit Rozet Lucide isimleriyle mühürlendi!');
}

main()
  .catch((e) => { console.error('❌ Hata:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
