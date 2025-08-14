import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("operator"), // admin, operator
});

export const screens = pgTable("screens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  alias: text("alias").notNull(),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  online: boolean("online").notNull().default(true),
  brightness: integer("brightness").notNull().default(185),
  temperature: integer("temperature").notNull().default(42),
});

export const ads = pgTable("ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // image, video
  duration: integer("duration").notNull(),
  countLimit: integer("count_limit").notNull(),
  playCount: integer("play_count").notNull().default(0),
  status: text("status").notNull().default("scheduled"), // active, scheduled, ended
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  timeWindows: jsonb("time_windows").notNull(),
  asset: jsonb("asset"), // file metadata
});

export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  screenId: text("screen_id").notNull(),
  adId: text("ad_id").notNull(),
  time: text("time").notNull(),
  day: text("day").notNull(),
});

export const logs = pgTable("logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: text("timestamp").notNull(),
  type: text("type").notNull(), // ad_play, screenshot, system, error
  screen: text("screen").notNull(),
  details: text("details").notNull(),
  status: text("status").notNull(), // success, error, warning
});

export const fixedPoints = pgTable("fixed_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  radius: integer("radius").notNull().default(200),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  path: text("path").notNull(), // SVG path data
  coordinates: jsonb("coordinates").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertScreenSchema = createInsertSchema(screens).omit({
  id: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  playCount: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
});

export const insertFixedPointSchema = createInsertSchema(fixedPoints).omit({
  id: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertScreen = z.infer<typeof insertScreenSchema>;
export type Screen = typeof screens.$inferSelect;

export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof ads.$inferSelect;

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;

export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;

export type InsertFixedPoint = z.infer<typeof insertFixedPointSchema>;
export type FixedPoint = typeof fixedPoints.$inferSelect;

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;
