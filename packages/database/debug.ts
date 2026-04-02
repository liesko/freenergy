import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.groupJoinRequest.findMany();
  console.log(JSON.stringify(requests, null, 2));
}

main().finally(() => prisma.$disconnect());
