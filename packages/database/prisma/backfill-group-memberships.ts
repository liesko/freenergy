import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting group memberships backfill...');
  
  // Find all groups (ownerId is required in the schema)
  const groups = await prisma.group.findMany();

  console.log(`Found ${groups.length} total groups.`);
  let addedCount = 0;

  for (const group of groups) {
    if (!group.ownerId) continue; // Just a safety check
    
    // Check if membership already exists for this exact pair
    const existing = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: group.ownerId,
          groupId: group.id,
        }
      }
    });

    if (!existing) {
      console.log(`Missing OWNER membership for Group [${group.id}] User [${group.ownerId}]. Creating...`);
      await prisma.membership.create({
        data: {
          userId: group.ownerId,
          groupId: group.id,
          role: 'OWNER',
        }
      });
      addedCount++;
    }
  }

  console.log(`Backfill complete. Added ${addedCount} missing OWNER memberships.`);
}

main()
  .catch((e) => {
    console.error('Error during backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
