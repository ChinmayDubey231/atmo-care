CREATE TYPE "public"."log_kind" AS ENUM('activity', 'care');--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" text NOT NULL,
	"plant_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_plant_key_pk" PRIMARY KEY("user_id","plant_key")
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"kind" "log_kind" NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"emoji" text NOT NULL,
	"points" integer NOT NULL,
	"aqi_level" smallint,
	"logged_at" timestamp with time zone DEFAULT now() NOT NULL,
	"local_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text DEFAULT 'Eco Explorer' NOT NULL,
	"image_url" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"units" text DEFAULT 'metric' NOT NULL,
	"aqi_alerts" boolean DEFAULT true NOT NULL,
	"plant_reminders" boolean DEFAULT false NOT NULL,
	"community_messages" boolean DEFAULT true NOT NULL,
	"show_on_leaderboard" boolean DEFAULT true NOT NULL,
	"last_lat" double precision,
	"last_lon" double precision,
	"last_aqi_alert_at" timestamp with time zone,
	"last_plant_reminder_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "logs_user_logged_at_idx" ON "logs" USING btree ("user_id","logged_at");--> statement-breakpoint
CREATE INDEX "logs_logged_at_idx" ON "logs" USING btree ("logged_at");--> statement-breakpoint
CREATE UNIQUE INDEX "logs_points_once_per_day" ON "logs" USING btree ("user_id","key","local_date") WHERE "logs"."points" > 0;--> statement-breakpoint
CREATE INDEX "push_tokens_user_idx" ON "push_tokens" USING btree ("user_id");