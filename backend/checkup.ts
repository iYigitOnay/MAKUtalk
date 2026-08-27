
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function checkup() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("🔍 MAKUtalk Sohbet Checkup Başlatıldı...\n");

  try {
    const userCount = await prisma.user.count();
    const convCount = await prisma.conversation.count();
    const partCount = await prisma.conversationParticipant.count();
    const msgCount = await prisma.message.count();

    console.log(`📊 Genel İstatistikler:`);
    console.log(`- Kullanıcılar: ${userCount}`);
    console.log(`- Sohbetler: ${convCount}`);
    console.log(`- Katılımcı Kayıtları: ${partCount}`);
    console.log(`- Toplam Mesaj: ${msgCount}\n`);

    console.log(`🧪 Son 5 Sohbet ve Katılımcıları:`);
    const recentConvs = await prisma.conversation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true } }
          }
        }
      }
    });

    recentConvs.forEach(c => {
      const parts = c.participants.map(p => `${p.user.username} (ID: ${p.userId})`).join(", ");
      console.log(`[Conv ${c.id}] Katılımcılar: ${parts}`);
    });

  } catch (error) {
    console.error("❌ Checkup sırasında hata oluştu:", error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkup();
