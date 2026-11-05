# WalkIn

Live wait times for cafes, breweries, restaurants and bowling in Hyderabad.
One Expo (React Native) codebase that runs as a website now and an iOS/Android app later.

## Run it

```bash
npm install
npm run web        # opens in the browser at http://localhost:8081
npm start          # scan the QR code with the Expo Go app to run it on your phone
```

With no `.env`, the app runs on made-up sample venues held in memory, so they reset on reload.

## Screens

| Route | What it is |
|---|---|
| `/` | Venue list: filter by group size, type and area, shortest wait first, "Try instead" for packed places |
| `/venue/<id>` | Wait for both group sizes, plus nearby places with shorter waits |
| `/update/<token>` | Staff page, opened from a private link or QR code. One tap updates the wait. No login |

Demo staff links: `/update/demo-c1`, `/update/demo-b1`, and so on (`demo-` + venue id from `src/lib/sampleData.ts`).

## Connect Supabase (real data)

1. Create a free project at supabase.com.
2. SQL Editor → paste `supabase/schema.sql` → Run.
3. Add venues in Table Editor → `venues`. Each venue gets a staff token automatically.
4. Copy `.env.example` to `.env`, then fill in the URL and anon key from Project Settings → API.
5. Restart `npm run web`.

Get each venue's staff link with:
```sql
select v.name, t.token from venues v join venue_tokens t on t.venue_id = v.id;
```

## How "live" works

- Every report has a group size (2–4 or 5+), a level, a source and a timestamp.
- Reports older than 45 minutes are shown as "may be out of date" and are never sorted or suggested as live (`STALE_AFTER_MINUTES` in `src/lib/status.ts`).
- The app refetches every minute and whenever a screen regains focus.

## Code map

- `src/app/`: screens (Expo Router: each file is a route)
- `src/lib/status.ts`: wait levels, staleness, distance, nearby alternatives
- `src/lib/api.ts`: data access (Supabase, or sample data when not configured)
- `supabase/schema.sql`: tables, security rules, staff-token functions
