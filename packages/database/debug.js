import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  console.log("---- GROUPS ----");
  const groups = await prisma.group.findMany();
  console.log(groups);

  console.log("---- METERS ----");
  const meters = await prisma.meteringPoint.findMany();
  console.log(meters);

  console.log("---- REQUESTS ----");
  const requests = await prisma.groupJoinRequest.findMany();
  console.log(requests);
}

main().finally(() => prisma.$disconnect());
