
import { pgTable, varchar, integer, uuid, jsonb } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  otp: varchar("otp", { length: 10 }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull(),
  dob: varchar("dob", { length: 50 }),
  age: integer("age"),
  weight: integer("weight"),
  parentName: varchar("parent_name", { length: 255 }),
  emergencyContact: varchar("emergency_contact", { length: 20 }),
  status: varchar("status", { length: 20 }).default("ACTIVE"),
  notifications: jsonb("notifications").default([]),
  createdAt: varchar("created_at", { length: 50 }).default(new Date().toISOString()),
  profilePicture: varchar("profile_picture", { length: 255 }),
  leaves: jsonb("leaves").default([]),
});

export const sessionTable = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  timing: varchar("timing", { length: 255 }).notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  joiningAmount: integer("joining_amount").notNull(),
  trainerId: uuid("trainers").notNull().references(() => trainerTable.id),
  horseId: uuid("horse").notNull().references(() => horseTable.id),
  participants: jsonb("participants").default([]),
  duration: varchar("duration", { length: 50 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  totalSeats: integer("total_seats").notNull(),
  note: varchar("note", { length: 500 }),
  status: varchar("status", { length: 50 }).default("ACTIVE"),
});

export const trainerTable = pgTable("trainers", {
  id: uuid("id").defaultRandom().primaryKey(),
  horseId: uuid("horseId").array().default([]),
  title: varchar("title", { length: 255 }).notNull(),
  sessions: uuid("sessions").array().default([]),
  pendingSessions: uuid("pendingSessions").array().default([]),
  leaveRequests: jsonb("leaveRequests").default([]),
  experience: varchar("experience", { length: 255 }).notNull(),
  certificates: jsonb("certificates").default([]),
  stableId: uuid("stable_id").references(() => stableTable.id),
  userId: uuid("user_id").notNull().references(() => userTable.id),
});

export const horseTable = pgTable("horse", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  weight: integer("weight").notNull(),
  speed: integer("speed").notNull(),
  shoeStatus: varchar("shoe_status", { length: 255 }).notNull(),
  diet: varchar("diet", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 1000 }),
  age: integer("age"),
  trainerId: uuid("trainer_id").references(() => userTable.id),
  vatId: uuid("vat_id").references(() => vetTable.id),
  scheduleSessions: uuid("sessions").array().default([]),
  lastVisit: varchar("last_visit", { length: 50 }),
  status: varchar("status", { length: 50 }).default("Available"), // Available, Resting, Competition, Medical, Training
  dewormingRecord: varchar("deworming_record", { length: 500 }),
  shoeingRemarks: varchar("shoeing_remarks", { length: 500 }),
  healthRemarks: varchar("health_remarks", { length: 500 }),
  vaccinationSummary: varchar("vaccination_summary", { length: 500 }),
  healthStatus: uuid("health_status").references(() => healthStatusTable.id),
  vaccinationRecords: uuid("vaccination_records").array(),
});

export const riderTable = pgTable("rider", {
  id: uuid("id").defaultRandom().primaryKey(),
  allergies: varchar("allergies", { length: 255 }),
  level: varchar("level", { length: 255 }).notNull(),
  instructions: varchar("instructions", { length: 500 }),
  plan: jsonb("plan").default([]),
  signature: varchar("signature", { length: 255 }),
  sessionCount: integer("session_count").default(0),
  joinedSessions: uuid("joined_sessions").array().default([]),
  safetyBriefing: jsonb("safety_briefing").default([]),
  trophies: jsonb("trophies").default([]),
  pendingSessions: uuid("pending_sessions").array().default([]),
  medical: varchar("medical", { length: 255 }),
  userId: uuid("user_id").notNull().references(() => userTable.id),
});

export const planTable = pgTable("plan", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sessionsCount: integer("sessions_count").notNull(),
  validity: varchar("validity", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  level: varchar("level", { length: 255 }).notNull(),
  rules: jsonb("rules").notNull().default([]),
});

export const vetTable = pgTable("vet", {
  id: uuid("id").defaultRandom().primaryKey(),
  medals: jsonb("medals").notNull().default([]),
  certificates: jsonb("certificates").notNull().default([]),
  patience: jsonb("patience").notNull().default([]),
  userId: uuid("user_id").notNull().references(() => userTable.id),
});

export const healthStatusTable = pgTable("health_status", {
  id: uuid("id").defaultRandom().primaryKey(),
  horseId: uuid("horse").notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  status: varchar("status", { length: 255 }).notNull(),
  notes: varchar("notes", { length: 500 }),
  title: varchar("title", { length: 255 }).notNull(),
  treatment: varchar("treatment", { length: 255 }).notNull(),
  medications: jsonb("medications").notNull().default([]),
});

export const vaccinationRecordsTable = pgTable("vaccination_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  horseId: uuid("horse").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  nextDate: varchar("next_date", { length: 50 }).notNull(),
  batchNumber: varchar("batch_number", { length: 255 }).notNull(),
  notes: varchar("notes", { length: 500 }),
});

export const inventoryTable = pgTable("inventory", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Feed, Medicines, Equipment, Consumables
  currentStock: integer("current_stock").notNull().default(0),
  unit: varchar("unit", { length: 50 }).notNull(), // Bales, Vials, Bottles, etc.
  minThreshold: integer("min_threshold").default(10),
  status: varchar("status", { length: 50 }).default("In Stock"), // In Stock, Low Stock, Out of Stock
  lastUpdated: varchar("last_updated", { length: 50 }).default(new Date().toISOString()),
});

export const stableTable = pgTable("stable", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  totalRevenue: integer("total_revenue").notNull().default(0),
  horses: uuid("horse").array().default([]),
  stocks: jsonb("stocks").notNull().default([]),
});