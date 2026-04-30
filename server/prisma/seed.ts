/// <reference types="node" />

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

const SPORT_CATEGORIES = [
  { sportKey: "soccer", displayName: "Football", icon: "⚽", apiSportId: "soccer", sortOrder: 1 },
  { sportKey: "basketball", displayName: "Basketball", icon: "🏀", apiSportId: "basketball", sortOrder: 2 },
  { sportKey: "tennis", displayName: "Tennis", icon: "🎾", apiSportId: "tennis", sortOrder: 3 },
  { sportKey: "americanfootball", displayName: "American Football", icon: "🏈", apiSportId: "americanfootball", sortOrder: 4 },
  { sportKey: "cricket", displayName: "Cricket", icon: "🏏", apiSportId: "cricket", sortOrder: 5 },
  { sportKey: "icehockey", displayName: "Ice Hockey", icon: "🏒", apiSportId: "icehockey", sortOrder: 6 },
  { sportKey: "rugbyunion", displayName: "Rugby Union", icon: "🏉", apiSportId: "rugbyleague", sortOrder: 7 },
  { sportKey: "boxing_mma", displayName: "Boxing / MMA", icon: "🥊", apiSportId: "mma", sortOrder: 8 },
  { sportKey: "baseball", displayName: "Baseball", icon: "⚾", apiSportId: "baseball", sortOrder: 9 },
  { sportKey: "volleyball", displayName: "Volleyball", icon: "🏐", apiSportId: "volleyball", sortOrder: 10 },
  { sportKey: "tabletennis", displayName: "Table Tennis", icon: "🏓", apiSportId: "tabletennis", sortOrder: 11 },
  { sportKey: "golf", displayName: "Golf", icon: "⛳", apiSportId: "golf", sortOrder: 12 },
  { sportKey: "snooker", displayName: "Snooker", icon: "🎱", apiSportId: "snooker", sortOrder: 13 },
  { sportKey: "darts", displayName: "Darts", icon: "🎯", apiSportId: "darts", sortOrder: 14 },
];

async function upsertSeedUser(args: {
  email: string;
  phone: string;
  passwordHash: string;
}) {
  const byEmail = await prisma.user.findUnique({
    where: { email: args.email },
    select: { id: true },
  });

  const byPhone = await prisma.user.findUnique({
    where: { phone: args.phone },
    select: { id: true },
  });

  if (byEmail && byPhone && byEmail.id !== byPhone.id) {
    throw new Error(
      `Seed conflict: email ${args.email} and phone ${args.phone} belong to different users.`,
    );
  }

  const existingUserId = byEmail?.id ?? byPhone?.id;

  if (existingUserId) {
    return prisma.user.update({
      where: { id: existingUserId },
      data: {
        email: args.email,
        phone: args.phone,
        passwordHash: args.passwordHash,
        role: "USER",
        mustChangePassword: false,
        isVerified: true,
      },
    });
  }

  return prisma.user.create({
    data: {
      email: args.email,
      phone: args.phone,
      passwordHash: args.passwordHash,
      role: "USER",
      mustChangePassword: false,
      isVerified: true,
    },
  });
}

async function upsertSeedAdmin(args: {
  email: string;
  phone: string;
  passwordHash: string;
}) {
  return prisma.user.upsert({
    where: { email: args.email },
    update: {
      phone: args.phone,
      passwordHash: args.passwordHash,
      role: "ADMIN",
      mustChangePassword: false,
      isVerified: true,
    },
    create: {
      email: args.email,
      phone: args.phone,
      passwordHash: args.passwordHash,
      role: "ADMIN",
      mustChangePassword: false,
      isVerified: true,
    },
  });
}

function parseCommaSeparatedEnv(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAdminSeedInputs() {
  const emails = parseCommaSeparatedEnv(process.env.ADMIN_EMAIL);
  const passwords = parseCommaSeparatedEnv(process.env.ADMIN_PASSWORD);
  const phones = parseCommaSeparatedEnv(process.env.ADMIN_PHONE);
  const hasAdminEnv = emails.length > 0 || passwords.length > 0 || phones.length > 0;

  if (!hasAdminEnv && process.env.NODE_ENV !== "production") {
    return [
      {
        email: "admin@betwise.local",
        password: "Admin@Betixpro123!",
        phone: "+254700000001",
      },
    ];
  }

  if (!hasAdminEnv) {
    return [];
  }

  if (emails.length !== passwords.length || emails.length !== phones.length) {
    throw new Error(
      "ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_PHONE must contain the same number of comma-separated values.",
    );
  }

  return emails.map((email, index) => ({
    email,
    password: passwords[index],
    phone: phones[index],
  }));
}

async function seedSportCategories() {
  for (const category of SPORT_CATEGORIES) {
    await prisma.sportCategory.upsert({
      where: { sportKey: category.sportKey },
      update: {
        displayName: category.displayName,
        icon: category.icon,
        apiSportId: category.apiSportId,
        sortOrder: category.sortOrder,
        showInNav: true,
      },
      create: {
        sportKey: category.sportKey,
        displayName: category.displayName,
        icon: category.icon,
        apiSportId: category.apiSportId,
        sortOrder: category.sortOrder,
        isActive: false,
        showInNav: true,
        eventCount: 0,
      },
    });
  }
}

async function seedAdmins() {
  const admins = getAdminSeedInputs();

  if (admins.length === 0) {
    console.log("No admin users configured for seeding.");
    return;
  }

  for (const adminInput of admins) {
    const passwordHash = await bcrypt.hash(adminInput.password, 12);

    await upsertSeedAdmin({
      email: adminInput.email,
      phone: adminInput.phone,
      passwordHash,
    });

    console.log(`Seeded admin user: ${adminInput.email}`);
  }
}

async function syncSportsApiKey() {
  const apiSportsKey = process.env.API_SPORTS_KEY?.trim();

  if (!apiSportsKey) {
    console.log("No API_SPORTS_KEY configured; skipping API key sync.");
    return;
  }

  await prisma.adminSettings.upsert({
    where: { key: "global" },
    update: {
      sportsApiKey: apiSportsKey,
    },
    create: {
      key: "global",
      sportsApiKey: apiSportsKey,
    },
  });

  console.log("Synced API_SPORTS_KEY into admin settings.");
}

async function main() {
  try {
    console.log("Seeding database...");

    const isProduction = process.env.NODE_ENV === "production";

    const createStrongDevPassword = () => {
      const randomSegment = randomBytes(12).toString("base64url");
      return `Seed@${randomSegment}9!`;
    };

    if (!isProduction) {
      console.log("Seeding demo user account...");

      const userEmail = process.env.USER_EMAIL || "user@betwise.local";
      const userPhone = process.env.USER_PHONE || "+254701234567";
      const userPassword = process.env.USER_PASSWORD || createStrongDevPassword();

      const userPasswordHash = await bcrypt.hash(userPassword, 12);

      const user = await upsertSeedUser({
        email: userEmail,
        phone: userPhone,
        passwordHash: userPasswordHash,
      });

      console.log(`USER:  ${user.phone} / ${userPassword}`);
    }

    await seedAdmins();
    await syncSportsApiKey();
    await seedSportCategories();

    console.log("Seed complete.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
