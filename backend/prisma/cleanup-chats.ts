import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Veritabanı temizliği başlatılıyor...');
  
  try {
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`✅ ${deletedMessages.count} mesaj silindi.`);

    const deletedParticipants = await prisma.conversationParticipant.deleteMany({});
    console.log(`✅ ${deletedParticipants.count} katılımcı kaydı silindi.`);

    const deletedConversations = await prisma.conversation.deleteMany({});
    console.log(`✅ ${deletedConversations.count} sohbet silindi.`);

    console.log('✨ Tüm sohbet geçmişi başarıyla temizlendi.');
  } catch (err) {
    console.error('❌ Temizlik sırasında hata oluştu:', err);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
