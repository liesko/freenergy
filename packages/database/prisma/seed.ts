import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding minimal data...')
  
  const existingCheck = await prisma.systemVerification.findFirst();
  
  if (!existingCheck) {
    await prisma.systemVerification.create({
      data: {
        notes: "Initial seed verification check"
      }
    });
    console.log('Seed verification entity created.');
  } else {
    console.log('Seed verification entity already exists. Skipping...');
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
