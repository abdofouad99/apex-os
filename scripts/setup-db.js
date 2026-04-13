const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres.gukrhviolkjoabxtcsum:abdo770681605@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
      }
    }
  });

  try {
    // Test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ DB Connection OK:", result);

    // Create enums and tables via raw SQL
    const statements = [
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN CREATE TYPE "Role" AS ENUM ('ADMIN','MANAGER','CREATOR','SALES','VIEWER'); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ClientStatus') THEN CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE','PAUSED','CHURNED'); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeadStatus') THEN CREATE TYPE "LeadStatus" AS ENUM ('NEW','CONTACTED','QUALIFIED','CONVERTED','LOST'); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ContentStatus') THEN CREATE TYPE "ContentStatus" AS ENUM ('DRAFT','APPROVED','SCHEDULED','PUBLISHED'); END IF; END $$;`,
      `CREATE TABLE IF NOT EXISTS "Agency" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "name" TEXT NOT NULL, "logoUrl" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Agency_pkey" PRIMARY KEY ("id"));`,
      `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "email" TEXT NOT NULL, "name" TEXT, "role" "Role" NOT NULL DEFAULT 'VIEWER', "agencyId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_email_key') THEN ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email"); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_agencyId_fkey') THEN ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF; END $$;`,
      `CREATE TABLE IF NOT EXISTS "Setting" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "key" TEXT NOT NULL, "value" TEXT NOT NULL, "agencyId" TEXT NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Setting_pkey" PRIMARY KEY ("id"));`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Setting_key_key') THEN ALTER TABLE "Setting" ADD CONSTRAINT "Setting_key_key" UNIQUE ("key"); END IF; END $$;`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Setting_agencyId_fkey') THEN ALTER TABLE "Setting" ADD CONSTRAINT "Setting_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;`,
      `CREATE TABLE IF NOT EXISTS "Client" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "name" TEXT NOT NULL, "industry" TEXT, "websiteUrl" TEXT, "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE', "agencyId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Client_pkey" PRIMARY KEY ("id"));`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Client_agencyId_fkey') THEN ALTER TABLE "Client" ADD CONSTRAINT "Client_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;`,
      `CREATE TABLE IF NOT EXISTS "Lead" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "companyName" TEXT NOT NULL, "contactEmail" TEXT, "contactPhone" TEXT, "source" TEXT NOT NULL, "score" INTEGER NOT NULL DEFAULT 0, "status" "LeadStatus" NOT NULL DEFAULT 'NEW', "clientId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Lead_pkey" PRIMARY KEY ("id"));`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Lead_clientId_fkey') THEN ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;`,
      `CREATE TABLE IF NOT EXISTS "Competitor" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "name" TEXT NOT NULL, "platform" TEXT NOT NULL, "identifier" TEXT NOT NULL, "agencyId" TEXT NOT NULL, "lastScrapedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id"));`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Competitor_agencyId_fkey') THEN ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;`,
      `CREATE TABLE IF NOT EXISTS "CompetitorAd" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "competitorId" TEXT NOT NULL, "adCopy" TEXT, "imageUrl" TEXT, "startDate" TIMESTAMP(3), "status" TEXT NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CompetitorAd_pkey" PRIMARY KEY ("id"));`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CompetitorAd_competitorId_fkey') THEN ALTER TABLE "CompetitorAd" ADD CONSTRAINT "CompetitorAd_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF; END $$;`,
      `CREATE TABLE IF NOT EXISTS "ContentIdea" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "title" TEXT NOT NULL, "body" TEXT NOT NULL, "platform" TEXT NOT NULL, "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT', "agencyId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ContentIdea_pkey" PRIMARY KEY ("id"));`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContentIdea_agencyId_fkey') THEN ALTER TABLE "ContentIdea" ADD CONSTRAINT "ContentIdea_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;`,
    ];

    for (let i = 0; i < statements.length; i++) {
      try {
        await prisma.$executeRawUnsafe(statements[i]);
        console.log(`✅ Statement ${i + 1}/${statements.length} OK`);
      } catch (e) {
        console.log(`⚠️  Statement ${i + 1}: ${e.message.substring(0, 80)}`);
      }
    }

    console.log("\n🎉 All tables created successfully!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
