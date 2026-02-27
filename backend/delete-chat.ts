import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const deleted = await prisma.conversation.delete({
      where: { id: 1 }
    });
    console.log('✅ Sohbet ID 1 başarıyla silindi:', deleted.id);
  } catch (error) {
    console.error('❌ Silme hatası (Muhtemelen zaten silindi):', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
