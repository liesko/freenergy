const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.groupJoinRequest.findMany({
    include: {
      group: { select: { name: true, id: true } },
      meteringPoint: { select: { eic: true, id: true } }
    }
  });

  console.log("ALL JOIN REQUESTS:");
  console.log(JSON.stringify(requests, null, 2));
}

main().finally(() => prisma.$disconnect());
