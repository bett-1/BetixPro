const { spawnSync } = require("node:child_process");

const MAX_ATTEMPTS = Number.parseInt(
  process.env.PRISMA_DEPLOY_MAX_ATTEMPTS || "5",
  10,
);
const BASE_DELAY_MS = Number.parseInt(
  process.env.PRISMA_DEPLOY_RETRY_DELAY_MS || "5000",
  10,
);

const STEPS = [
  {
    name: "Generate Prisma Client",
    command: "pnpm prisma:generate",
    retryConnectionFailures: false,
  },
  {
    name: "Resolve failed migration markers",
    command: "pnpm prisma:resolve-failed",
    retryConnectionFailures: true,
  },
  {
    name: "Deploy Prisma migrations",
    command: "pnpm exec prisma migrate deploy",
    retryConnectionFailures: true,
  },
  {
    name: "Seed database",
    command: "pnpm exec prisma db seed",
    retryConnectionFailures: true,
  },
];

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function runCommand(command) {
  return spawnSync(command, {
    stdio: "pipe",
    encoding: "utf8",
    shell: true,
  });
}

function getOutput(result) {
  return `${result.stdout || ""}${result.stderr || ""}`;
}

function isConnectionFailure(output) {
  return /P1000|P1001|P1002|P1017|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|Can't reach database server|Schema engine error/i.test(
    output,
  );
}

function runStep(step) {
  const attempts = step.retryConnectionFailures ? MAX_ATTEMPTS : 1;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    process.stdout.write(
      `[db-deploy] ${step.name} (${attempt}/${attempts})...\n`,
    );

    const result = runCommand(step.command);
    const output = getOutput(result);

    if (output) {
      process.stdout.write(output);
      if (!output.endsWith("\n")) {
        process.stdout.write("\n");
      }
    }

    if (result.error) {
      process.stderr.write(`[db-deploy] ${step.name} failed: ${result.error}\n`);
      process.exit(1);
    }

    if (result.status === 0) {
      return;
    }

    const canRetry =
      step.retryConnectionFailures &&
      attempt < attempts &&
      isConnectionFailure(output);

    if (!canRetry) {
      process.stderr.write(
        `[db-deploy] ${step.name} failed with exit code ${result.status}.`,
      );
      if (isConnectionFailure(output)) {
        process.stderr.write(
          " The database stayed unreachable after all retry attempts. Verify Render's DATABASE_URL, Neon status, and SSL settings.\n",
        );
      } else {
        process.stderr.write("\n");
      }
      process.exit(result.status || 1);
    }

    const delay = BASE_DELAY_MS * attempt;
    process.stdout.write(
      `[db-deploy] Database connection failed; retrying in ${Math.round(
        delay / 1000,
      )}s.\n`,
    );
    sleep(delay);
  }
}

for (const step of STEPS) {
  runStep(step);
}

process.stdout.write("[db-deploy] Database deployment complete.\n");
