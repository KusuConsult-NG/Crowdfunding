# Production Database Fix - Checklist

## Issue
The deployment on Vercel is failing because:
1. Vercel is connecting to a Neon database (wrong database)
2. The Neon database doesn't have the `categoryId` column
3. We've already synced the Supabase database with the correct schema

## Solution Steps

### ✅ Step 1: Schema Sync (COMPLETED)
- [x] Pushed the Prisma schema to Supabase production database
- [x] Prisma client regenerated
- [x] `categoryId` column now exists in Supabase

### 🔄 Step 2: Update Vercel Environment Variables

You need to update your Vercel project settings:

1. Go to: https://vercel.com/stephens-projects-80d58b81/crowdfunding/settings/environment-variables

2. Find the `DATABASE_URL` variable and update it to:
   ```
   postgresql://postgres.wodrxeikgdjqnwzzvxpy:CrowdFunding2024!@aws-1-eu-west-2.pooler.supabase.com:6543/postgres
   ```

3. Make sure it's set for these environments:
   - [x] Production
   - [x] Preview  
   - [x] Development

### 🚀 Step 3: Trigger Redeploy

After updating the environment variable:

1. Go to: https://vercel.com/stephens-projects-80d58b81/crowdfunding

2. Click **"Deployments"** tab

3. Find the latest deployment and click the **three dots menu** (⋯)

4. Select **"Redeploy"**

   OR

   Simply push a new commit to your repository

### 📋 Step 4: Verify

After deployment:

1. Check deployment logs for any errors
2. Visit your production URL: crowdfunding-35nmvg9u6-stephens-projects-80d58b81.vercel.app
3. Verify that the homepage loads without errors

## Alternative: Use Neon Database Instead

If you prefer to use Neon database, you need to push the schema to Neon:

```bash
export DATABASE_URL="postgresql://neondb_owner:npg_YrB9ZNETvc4b@ep-autumn-moon-ahnvr3c4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
npx prisma db push
```

Then ensure Vercel is using the Neon DATABASE_URL.

## Current Status

- ✅ Supabase database: Schema up to date
- ⚠️ Neon database: Missing `categoryId` column
- ❌ Vercel: Using Neon database (wrong one)

**Recommended Action:** Update Vercel to use Supabase DATABASE_URL and redeploy.
