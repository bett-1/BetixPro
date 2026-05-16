CREATE TABLE IF NOT EXISTS "api_credit_logs" (
    "id" SERIAL NOT NULL,
    "used" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "last_request_cost" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_credit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "odds_cache" (
    "id" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "odds_cache_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "api_credit_logs_timestamp_idx" ON "api_credit_logs"("timestamp");
CREATE INDEX IF NOT EXISTS "odds_cache_sport_idx" ON "odds_cache"("sport");
CREATE INDEX IF NOT EXISTS "odds_cache_expires_at_idx" ON "odds_cache"("expires_at");
