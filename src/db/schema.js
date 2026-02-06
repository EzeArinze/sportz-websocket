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

const match_status = pgEnum("match_status", ["scheduled", "live", "finished"]);

export const matchTable = pgTable("match", {
  id: text().primaryKey().$defaultFn(nanoid()).notNull(),
  homeTeam: text().notNull(),
  awayTeam: text().notNull(),
  status: match_status().default("scheduled").notNull(),
  homeScore: integer().default(0).notNull(),
  awayScore: integer().default(0).notNull(),
  startTime: timestamp(),
  endTime: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
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
