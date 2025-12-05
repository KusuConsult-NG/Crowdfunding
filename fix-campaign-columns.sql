-- Add missing columns to Campaign table if they don't exist

-- Check and add categoryId
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Campaign' AND column_name = 'categoryId'
    ) THEN
        ALTER TABLE "Campaign" ADD COLUMN "categoryId" TEXT;
    END IF;
END $$;

-- Check and add branchId
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Campaign' AND column_name = 'branchId'
    ) THEN
        ALTER TABLE "Campaign" ADD COLUMN "branchId" TEXT;
    END IF;
END $$;

-- Check and add currency
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Campaign' AND column_name = 'currency'
    ) THEN
        ALTER TABLE "Campaign" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'NGN';
    END IF;
END $$;

-- Check and add startDate
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Campaign' AND column_name = 'startDate'
    ) THEN
        ALTER TABLE "Campaign" ADD COLUMN "startDate" TIMESTAMP(3);
    END IF;
END $$;

-- Check and add endDate
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Campaign' AND column_name = 'endDate'
    ) THEN
        ALTER TABLE "Campaign" ADD COLUMN "endDate" TIMESTAMP(3);
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Campaign_categoryId_fkey'
    ) THEN
        ALTER TABLE "Campaign" 
        ADD CONSTRAINT "Campaign_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "CampaignCategory"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Campaign_branchId_fkey'
    ) THEN
        ALTER TABLE "Campaign" 
        ADD CONSTRAINT "Campaign_branchId_fkey" 
        FOREIGN KEY ("branchId") REFERENCES "Branch"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
