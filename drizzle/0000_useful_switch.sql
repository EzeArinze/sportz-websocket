CREATE TYPE "public"."match_status" AS ENUM ('scheduled', 'live', 'finished');
--> statement-breakpoint
CREATE TABLE "commentary" (
	"id" text PRIMARY KEY NOT NULL,
	"matchId" text NOT NULL,
	"actor" text,
	"message" text,
	"team" text,
	"minutes" integer,
	"sequence" integer,
	"period" text,
	"eventType" text,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" text PRIMARY KEY NOT NULL,
	"homeTeam" text NOT NULL,
	"awayTeam" text NOT NULL,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"homeScore" integer DEFAULT 0 NOT NULL,
	"awayScore" integer DEFAULT 0 NOT NULL,
	"startTime" timestamp,
	"endTime" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commentary" ADD CONSTRAINT "commentary_matchId_match_id_fk" FOREIGN KEY ("matchId") REFERENCES "public"."match"("id") ON DELETE no action ON UPDATE no action;