-- Check what columns exist in Campaign table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Campaign'
ORDER BY ordinal_position;
