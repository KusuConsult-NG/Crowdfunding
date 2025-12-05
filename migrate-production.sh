#!/bin/bash

# Migrate Production Database
# This script pushes the Prisma schema to the production Supabase database

echo "🔄 Pushing schema to production database..."

# Use the Supabase production URL
export DATABASE_URL="postgresql://postgres.wodrxeikgdjqnwzzvxpy:CrowdFunding2024!@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"

# Push the schema (without requiring a migration file)
npx prisma db push --accept-data-loss

echo "✅ Schema push complete!"
echo "🔄 Generating Prisma Client..."

# Regenerate the Prisma client
npx prisma generate

echo "✅ Done! Your production database schema is now in sync."
