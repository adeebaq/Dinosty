import { sql, relations } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth schemas
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  authId: text("auth_id").notNull().unique(), 
  username: text("username").notNull(),
  isParent: boolean("is_parent").default(false).notNull(),
  parentId: integer("parent_id"), 
  balance: integer("balance").default(0).notNull(), 
  displayName: text("display_name").notNull(),
  dinosaurColor: text("dinosaur_color").default("green").notNull(),
});

export const dailyMoods = pgTable("daily_moods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mood: text("mood").notNull(), // "angry" | "sad" | "neutral" | "happy" | "excited"
  date: date("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chores = pgTable("chores", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  rewardValue: integer("reward_value").notNull(), 
  status: text("status", { enum: ["pending", "completed", "approved", "declined"] }).default("pending").notNull(),
  assigneeId: integer("assignee_id").notNull(), 
  creatorId: integer("creator_id").notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  targetAmount: integer("target_amount").notNull(), 
  currentAmount: integer("current_amount").default(0).notNull(), 
  userId: integer("user_id").notNull(), 
  status: text("status", { enum: ["active", "reached"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(), 
  type: text("type", { enum: ["earned", "spent", "allowance", "goal_contribution"] }).notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moduleProgress = pgTable("module_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  moduleId: text("module_id").notNull(), 
  isCompleted: boolean("is_completed").default(false).notNull(),
  score: integer("score"), // Quiz score
  completedAt: timestamp("completed_at"),
});

// === RELATIONS ===

export const appUsersRelations = relations(appUsers, ({ one, many }) => ({
  parent: one(appUsers, {
    fields: [appUsers.parentId],
    references: [appUsers.id],
    relationName: "parent_children",
  }),
  children: many(appUsers, {
    relationName: "parent_children",
  }),
  chores: many(chores, { relationName: "assignee" }),
  createdChores: many(chores, { relationName: "creator" }),
  goals: many(goals),
  transactions: many(transactions),
  progress: many(moduleProgress),
  moods: many(dailyMoods),
}));

export const dailyMoodsRelations = relations(dailyMoods, ({ one }) => ({
  user: one(appUsers, {
    fields: [dailyMoods.userId],
    references: [appUsers.id],
  }),
}));

export const choresRelations = relations(chores, ({ one }) => ({
  assignee: one(appUsers, {
    fields: [chores.assigneeId],
    references: [appUsers.id],
    relationName: "assignee",
  }),
  creator: one(appUsers, {
    fields: [chores.creatorId],
    references: [appUsers.id],
    relationName: "creator",
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(appUsers, {
    fields: [goals.userId],
    references: [appUsers.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(appUsers, {
    fields: [transactions.userId],
    references: [appUsers.id],
  }),
}));

export const moduleProgressRelations = relations(moduleProgress, ({ one }) => ({
  user: one(appUsers, {
    fields: [moduleProgress.userId],
    references: [appUsers.id],
  }),
}));

// === INSERTS & TYPES ===

export const insertAppUserSchema = createInsertSchema(appUsers).omit({ id: true });
export const insertChoreSchema = createInsertSchema(chores).omit({ id: true, createdAt: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, currentAmount: true, status: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertModuleProgressSchema = createInsertSchema(moduleProgress).omit({ id: true, completedAt: true });
export const insertDailyMoodSchema = createInsertSchema(dailyMoods).omit({ id: true, createdAt: true });

export type AppUser = typeof appUsers.$inferSelect;
export type InsertAppUser = z.infer<typeof insertAppUserSchema>;

export type Chore = typeof chores.$inferSelect;
export type InsertChore = z.infer<typeof insertChoreSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type ModuleProgress = typeof moduleProgress.$inferSelect;
export type InsertModuleProgress = z.infer<typeof insertModuleProgressSchema>;

export type DailyMood = typeof dailyMoods.$inferSelect;
export type InsertDailyMood = z.infer<typeof insertDailyMoodSchema>;

// === API CONTRACT TYPES ===

export const onboardingSchema = z.object({
  username: z.string().min(3),
  displayName: z.string().min(1),
  isParent: z.boolean(),
  parentId: z.number().optional(), 
  dinosaurColor: z.string().optional(),
});
