import { prisma } from "../config/database";

const dayStatusSelect = {
  id: true,
  date: true,
  content: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function findByDate(date: Date) {
  return prisma.dayStatus.findUnique({
    where: { date },
    select: dayStatusSelect,
  });
}

export function findByMonth(startDate: Date, endDate: Date) {
  return prisma.dayStatus.findMany({
    where: { date: { gte: startDate, lt: endDate } },
    orderBy: { date: "asc" },
    select: dayStatusSelect,
  });
}

export function upsertByDate(date: Date, content: string, createdById: string) {
  return prisma.dayStatus.upsert({
    where: { date },
    create: { date, content, createdById },
    update: { content, createdById },
    select: dayStatusSelect,
  });
}
