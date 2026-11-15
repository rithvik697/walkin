-- Adds a cover photo to venues. Run once in Supabase -> SQL Editor.
alter table venues add column if not exists image_url text;

-- Set a photo for a venue (use a photo you took or the venue gave you, not one copied from Google):
-- update venues set image_url = 'https://...' where name = 'Prost';
