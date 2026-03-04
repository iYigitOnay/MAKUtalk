import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: { id: 'asc' }
  });
  console.log('--- CATEGORIES DATA ---');
  categories.forEach(c => {
    console.log(`${c.id} | ${c.name} | ${c.color} | ${c.slug}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
