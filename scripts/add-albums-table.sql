-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add album_id column to gallery_images table
ALTER TABLE gallery_images 
ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES albums(id) ON DELETE SET NULL;

-- Create initial albums based on existing categories
INSERT INTO albums (title, description)
SELECT DISTINCT 
  INITCAP(category) AS title, 
  'Images from the ' || INITCAP(category) || ' category' AS description
FROM gallery_images
WHERE category IS NOT NULL;

-- Update gallery_images to link to the new albums
UPDATE gallery_images gi
SET album_id = (
  SELECT a.id 
  FROM albums a 
  WHERE LOWER(a.title) = gi.category
  LIMIT 1
)
WHERE category IS NOT NULL;
