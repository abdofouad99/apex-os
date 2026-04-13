const { PrismaClient } = require('@prisma/client');

async function main() {
  // Use DIRECT_URL for schema alterations if available, otherwise DATABASE_URL
  const connectionUrl = "postgresql://postgres.gukrhviolkjoabxtcsum:abdo770681605@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl
      }
    }
  });

  try {
    console.log("Connecting to DB to add new columns...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "reviewsCount" INTEGER;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "city" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "industry" TEXT;`);
    
    console.log("✅ Successfully added websiteUrl, rating, reviewsCount, city, and industry to Lead table.");
  } catch (err) {
    console.error("❌ Error adding columns:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
