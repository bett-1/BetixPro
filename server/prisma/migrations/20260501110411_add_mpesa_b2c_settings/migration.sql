-- AlterTable
ALTER TABLE "admin_settings" DROP COLUMN "commission_percent",
DROP COLUMN "deposit_tax_percent",
DROP COLUMN "rounding_rule",
DROP COLUMN "winnings_tax_percent",
ADD COLUMN "mpesa_b2c_command_id" TEXT NOT NULL DEFAULT 'BusinessPayment',
ADD COLUMN "mpesa_b2c_initiator_name" TEXT NOT NULL DEFAULT 'replace-with-initiator',
ADD COLUMN "mpesa_b2c_result_url" TEXT NOT NULL DEFAULT '',
ADD COLUMN "mpesa_b2c_security_credential" TEXT NOT NULL DEFAULT 'replace-with-credential',
ADD COLUMN "mpesa_b2c_shortcode" TEXT NOT NULL DEFAULT '174379',
ADD COLUMN "mpesa_b2c_timeout_url" TEXT NOT NULL DEFAULT '',
ADD COLUMN "mpesa_base_url" TEXT NOT NULL DEFAULT 'https://sandbox.safaricom.co.ke',
ALTER COLUMN "mpesa_transaction_fee_percent" SET DEFAULT 15;

-- AlterTable
ALTER TABLE "sport_categories" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "sport_events_odds_verified_idx" ON "sport_events"("odds_verified");
