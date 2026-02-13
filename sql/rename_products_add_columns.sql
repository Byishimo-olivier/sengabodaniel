-- SQL script to rename spare_parts table to products and add new columns
-- This script should be run on your MySQL database

-- First, rename the table from spare_parts to products
ALTER TABLE spare_parts RENAME TO products;

-- Add the new columns to the products table
ALTER TABLE products 
ADD COLUMN manufacturer_id INT NULL AFTER Category,
ADD COLUMN buying_price DECIMAL(10,2) NULL AFTER UnitPrice,
ADD COLUMN selling_price DECIMAL(10,2) NULL AFTER buying_price;

-- Add foreign key constraint for manufacturer_id (if manufacturers table exists)
-- ALTER TABLE products 
-- ADD CONSTRAINT fk_products_manufacturers
-- FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id);

-- Update existing records if needed (set default values or migrate data)
-- For example, if you want to set default values:
-- UPDATE products SET buying_price = UnitPrice WHERE buying_price IS NULL;
-- UPDATE products SET selling_price = UnitPrice WHERE selling_price IS NULL;

-- Optional: If you want to make the new columns NOT NULL after populating them
-- ALTER TABLE products 
-- MODIFY COLUMN buying_price DECIMAL(10,2) NOT NULL,
-- MODIFY COLUMN selling_price DECIMAL(10,2) NOT NULL;

-- Show the new table structure
DESCRIBE products;
