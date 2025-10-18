-- Migration: add visible boolean to product_option_values
-- Adds a column `visible` default true and attempts to migrate existing metadata.hidden values
BEGIN;

ALTER TABLE IF EXISTS product_option_values
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

-- If metadata contains a boolean 'hidden' we set visible = NOT hidden
-- metadata->>'hidden' yields text 'true'/'false' so we cast to boolean
UPDATE product_option_values
SET visible = NOT ((metadata->>'hidden')::boolean)
WHERE metadata ? 'hidden';

COMMIT;

-- Note: Apply this migration in your Supabase instance (SQL editor or psql).
-- After applying, consider removing metadata.hidden usage and relying on the new `visible` column.
