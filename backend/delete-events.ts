import { PrismaClient } from '@prisma/client';

// .env otomatik okunur
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Tüm etkinlikler ve katılımcılar siliniyor...');
  
  try {
    const pDeleted = await (prisma as any).eventParticipant.deleteMany({});
    console.log(`- ${pDeleted.count} katılımcı kaydı temizlendi.`);
    
    const eDeleted = await (prisma as any).event.deleteMany({});
    console.log(`- ${eDeleted.count} etkinlik kaydı temizlendi.`);
    
    console.log('✅ İşlem başarıyla tamamlandı.');
  } catch (err) {
    console.error('❌ Hata oluştu:', err.message);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
