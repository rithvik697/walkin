-- Starter venues for WalkIn. Paste this whole file into Supabase -> SQL Editor and click Run.
-- Safe to run more than once: columns are only added if missing, and a venue whose
-- name already exists is skipped.

-- 1. New columns (your database was created before these existed).
alter table venues add column if not exists maps_url text;
alter table venues add column if not exists price_level smallint check (price_level between 1 and 4);

-- 2. Venues. Names and coordinates come from the Google Maps links.
--    category: cafe | brewery | restaurant | bowling
--    price_level: 1 = ₹ ... 4 = ₹₹₹₹ (null = not set yet)
insert into venues (name, category, area, lat, lng, maps_url, price_level)
select v.name, v.category, v.area, v.lat, v.lng, v.maps_url, v.price_level
from (values
  -- Jubilee Hills
  ('Broadway The Brewery', 'brewery', 'Jubilee Hills', 17.4288156, 78.4035214,
   'https://www.google.com/maps/place/Broadway+The+Brewery/@17.4288156,78.4035214,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb911da75b8bed:0x54dab5211d077d85!8m2!3d17.4288156!4d78.4035214!16s%2Fg%2F11gtz65pqx', null::smallint),
  ('Prost', 'brewery', 'Jubilee Hills', 17.4295601, 78.4029017,
   'https://www.google.com/maps/place/Prost/@17.4295601,78.4029017,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb914ed8c64f3d:0xe965f131754bdeb3!8m2!3d17.4295601!4d78.4029017!16s%2Fg%2F11clsjp_m3', null),
  ('Zero40 Brewing', 'brewery', 'Jubilee Hills', 17.4316841, 78.4002401,
   'https://www.google.com/maps/place/Zero40+Brewing/@17.4316841,78.4002401,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb913097e6fd67:0x25fccb49225dc735!8m2!3d17.4316841!4d78.4002401!16s%2Fg%2F11c2lpqhyb', null),
  ('LastHouse: By The Lake', 'cafe', 'Jubilee Hills', 17.4349158, 78.39184,
   'https://www.google.com/maps/place/LastHouse:+By+The+Lake/@17.4349158,78.39184,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb91f847c24c91:0x6cf78ed6f68bd7f5!8m2!3d17.4349158!4d78.39184!16s%2Fg%2F11t7szh_0v', null),
  ('Olive Bistro & Bar', 'restaurant', 'Jubilee Hills', 17.4295492, 78.3927274,
   'https://www.google.com/maps/place/Olive+Bistro+%26+Bar/@17.4295492,78.3927274,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb91510ac7d405:0x9978c4a55a524e8d!8m2!3d17.4295492!4d78.3927274!16s%2Fg%2F1pv5xxsky', null),
  ('The Spicy Venue', 'restaurant', 'Jubilee Hills', 17.4350957, 78.4110774,
   'https://www.google.com/maps/place/The+Spicy+Venue/@17.4350957,78.4110774,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb91376227cc9f:0x62adace64a83bde!8m2!3d17.4350957!4d78.4110774!16s%2Fg%2F1tgqgwlf', null),
  ('Theta Theta Telugu', 'restaurant', 'Jubilee Hills', 17.4352615, 78.4157404,
   'https://www.google.com/maps/place/Theta+Theta+Telugu/@17.4352615,78.4157404,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb91003118155f:0x84ada34149acf647!8m2!3d17.4352615!4d78.4157404!16s%2Fg%2F11xd1x91bv', null),
  ('Karafa', 'cafe', 'Jubilee Hills', 17.4272943, 78.40643,
   'https://www.google.com/maps/place/KARAFA/@17.4272943,78.40643,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb91e9a7e2cbdb:0x31d9dcabba8c2773!8m2!3d17.4272943!4d78.40643!16s%2Fg%2F11rhqt_7yd', null),
  ('True Black Speciality Coffee', 'cafe', 'Jubilee Hills', 17.4277035, 78.4051957,
   'https://www.google.com/maps/place/TRUE+BLACK+speciality+coffee+%7C+Jubilee+hills/@17.4277035,78.4051957,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb91cb15550c89:0x969fbc3660cc9f02!8m2!3d17.4277035!4d78.4051957!16s%2Fg%2F11t3gy2p_n', null),
  ('SVM Bowling & Gaming', 'bowling', 'Jubilee Hills', 17.4316211, 78.4066414,
   'https://www.google.com/maps/place/Svm+Bowling+%26+Gaming/@17.4316211,78.4066414,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb9136251cc233:0xf81a0a04409f85d4!8m2!3d17.4316211!4d78.4066414!16s%2Fg%2F11j0081dpx', null),

  -- Banjara Hills
  ('Roast CCX', 'cafe', 'Banjara Hills', 17.4235358, 78.4322506,
   'https://www.google.com/maps/place/Roast+CCX+-+Coffee+%26+Culinary+Xperience/@17.4235358,78.4322506,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb97831331def1:0xfe393a82d8c77be3!8m2!3d17.4235358!4d78.4322506!16s%2Fg%2F11vq2vwx96', null),

  -- Gachibowli
  ('The Nawaab''s Restaurant', 'restaurant', 'Gachibowli', 17.4489308, 78.3639949,
   'https://www.google.com/maps/place/The+Nawaab''s+Restaurant/@17.4489308,78.36142,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb93ab7d8bcc7f:0xf8de83173cd01211!8m2!3d17.4489308!4d78.3639949!16s%2Fg%2F11fswl28sz', null),
  ('Hotel Shadab', 'restaurant', 'Gachibowli', 17.4434361, 78.3675468,
   'https://www.google.com/maps/place/Hotel+Shadab/@17.4434361,78.3675468,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb93ab9de915dd:0x9ac6b54317030d5f!8m2!3d17.4434361!4d78.3675468!16s%2Fg%2F11z1__cwqq', null)
) as v(name, category, area, lat, lng, maps_url, price_level)
where not exists (select 1 from venues existing where existing.name = v.name);


-- 3. After the above succeeds, run this on its own to get each venue's staff link.
--    The link is:  <your app address>/update/<token>
--
-- select v.name, t.token
-- from venues v
-- join venue_tokens t on t.venue_id = v.id
-- order by v.name;
