-- Migration: add product options, option values and variants

-- 1) product_options: e.g. Size, Color
CREATE TABLE IF NOT EXISTS product_options (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  name text NOT NULL,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2) product_option_values: e.g. S, M, L or Red, Blue
CREATE TABLE IF NOT EXISTS product_option_values (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id uuid NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value text NOT NULL,
  position int DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3) product_variants: combination of option values with own price/stock/sku
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  sku text,
  price numeric(12,2),
  stock int DEFAULT 0,
  is_active boolean DEFAULT true,
  attributes jsonb NOT NULL,
  option_value_ids uuid[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes to help lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_option_value_ids ON product_variants USING GIN (option_value_ids);

-- Note: later we will enforce uniqueness or constraints in application logic when generating variants
