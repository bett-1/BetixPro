import { PrismaClient } from "@prisma/client";

const createPrismaClient = () =>
  new PrismaClient({
    log: [
      { level: "warn", emit: "event" },
      { level: "error", emit: "event" },
    ],
  });

type PrismaClientWithLogEvents = ReturnType<typeof createPrismaClient>;

declare global {
  var prisma: PrismaClientWithLogEvents | undefined;
}

export const prisma = globalThis.prisma ?? createPrismaClient();

prisma.$on("warn", (event) => {
  console.warn("prisma:warn", event);
});

prisma.$on("error", (event) => {
  if (event.message?.includes("P2021") || event.message?.includes("does not exist")) {
    return;
  }
  console.error("prisma:error", event);
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
