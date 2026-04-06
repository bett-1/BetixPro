DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BetAuditAction') THEN
    CREATE TYPE "BetAuditAction" AS ENUM (
      'UPDATE_BLOCKED',
      'CANCEL_ATTEMPT',
      'CANCEL_SUCCESS',
      'CANCEL_BLOCKED',
      'INTEGRITY_ERROR'
    );
  END IF;
END $$;

ALTER TABLE "bets"
  ADD COLUMN IF NOT EXISTS "bet_code" TEXT,
  ADD COLUMN IF NOT EXISTS "bet_type" TEXT NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN IF NOT EXISTS "is_promoted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "selections_snapshot" JSONB,
  ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cancel_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "last_status_change_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "bets"
SET "bet_code" = UPPER(SUBSTRING(REPLACE("id"::text, '-', '') FROM 1 FOR 6))
WHERE "bet_code" IS NULL;

ALTER TABLE "bets"
  ALTER COLUMN "bet_code" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "bets_bet_code_key" ON "bets"("bet_code");
CREATE INDEX IF NOT EXISTS "bets_user_id_placed_at_idx" ON "bets"("user_id", "placed_at" DESC);
CREATE INDEX IF NOT EXISTS "bets_user_id_bet_type_placed_at_idx" ON "bets"("user_id", "bet_type", "placed_at" DESC);

CREATE TABLE IF NOT EXISTS "bet_audit_log" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "bet_id" UUID NOT NULL,
  "action" "BetAuditAction" NOT NULL,
  "attempted_data" JSONB,
  "ip_address" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bet_audit_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "bet_audit_log_user_id_created_at_idx"
  ON "bet_audit_log"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "bet_audit_log_bet_id_created_at_idx"
  ON "bet_audit_log"("bet_id", "created_at" DESC);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bet_audit_log_user_id_fkey') THEN
    ALTER TABLE "bet_audit_log"
      ADD CONSTRAINT "bet_audit_log_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bet_audit_log_bet_id_fkey') THEN
    ALTER TABLE "bet_audit_log"
      ADD CONSTRAINT "bet_audit_log_bet_id_fkey"
      FOREIGN KEY ("bet_id") REFERENCES "bets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION prevent_immutable_bet_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."event_id" IS DISTINCT FROM OLD."event_id"
    OR NEW."market_type" IS DISTINCT FROM OLD."market_type"
    OR NEW."side" IS DISTINCT FROM OLD."side"
    OR NEW."stake" IS DISTINCT FROM OLD."stake"
    OR NEW."display_odds" IS DISTINCT FROM OLD."display_odds"
    OR NEW."placed_at" IS DISTINCT FROM OLD."placed_at"
    OR NEW."selections_snapshot" IS DISTINCT FROM OLD."selections_snapshot"
  THEN
    RAISE EXCEPTION 'Immutable bet fields cannot be modified';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bets_immutable_fields_guard ON "bets";

CREATE TRIGGER bets_immutable_fields_guard
BEFORE UPDATE ON "bets"
FOR EACH ROW
EXECUTE FUNCTION prevent_immutable_bet_updates();
