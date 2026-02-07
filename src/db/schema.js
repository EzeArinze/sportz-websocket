import { sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);

export const matchTable = pgTable("match", {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid())
    .notNull(),
  sport: text().notNull(),
  homeTeam: text().notNull(),
  awayTeam: text().notNull(),
  status: matchStatusEnum().notNull().default("scheduled"),
  startTime: timestamp(),
  endTime: timestamp(),
  homeScore: integer().notNull().default(0),
  awayScore: integer().notNull().default(0),
  createdAt: timestamp().notNull().defaultNow(),
});

export const commentary = pgTable("commentary", {
  id: text().primaryKey().$defaultFn(nanoid()).notNull(),
  matchId: text()
    .references(() => matchTable.id)
    .notNull(),
  actor: text(),
  message: text(),
  team: text(),
  minutes: integer(),
  sequence: integer(),
  period: text(),
  eventType: text(),
  tags: text()
    .array()
    .default(sql`ARRAY[]::text[]`)
    .notNull(),
  metadata: jsonb().default({}),
  createdAt: timestamp().defaultNow().notNull(),
});
