-- Migration: 002_add_is_featured.sql
-- Description: Add is_featured column to products table for homepage showcase

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
