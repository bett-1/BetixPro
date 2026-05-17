-- AlterTable: add manual/auto featuring and prominence score
ALTER TABLE "sport_events" ADD COLUMN IF NOT EXISTS "featured_manual" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sport_events" ADD COLUMN IF NOT EXISTS "featured_auto" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sport_events" ADD COLUMN IF NOT EXISTS "prominence_score" INTEGER NOT NULL DEFAULT 0;

-- Backfill: existing manually featured events get featuredManual = true
UPDATE "sport_events" SET "featured_manual" = true WHERE "is_featured" = true;

-- Index for featured queries
CREATE INDEX IF NOT EXISTS "sport_events_is_featured_idx" ON "sport_events"("is_featured");
