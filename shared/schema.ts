import { sql, relations } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users as authUsers } from "./models/auth";

// Re-export auth schemas
export * from "./models/auth";

// === TABLE DEFINITIONS ===

// Extend users with app-specific fields
// Note: We're using the Replit Auth 'users' table but adding our app-specific fields to a profile table
// linked by the auth user ID, OR we can just rely on metadata storage if simple.
// For a robust app, let's create a profiles table or just use the users table if we can extend it.
// Since we can't easily modify the auth blueprint's table definition in 'models/auth.ts' without breaking it,
// we'll create a 'user_profiles' table or similar, OR just store everything in a separate 'app_users' table linked by auth ID.
// Let's go with 'app_users' linked to the auth ID for cleaner separation.

export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  authId: text("auth_id").notNull().unique(), // Links to Replit Auth user.id
  username: text("username").notNull(),
  isParent: boolean("is_parent").default(false).notNull(),
  parentId: integer("parent_id"), // Self-reference for kids
  balance: integer("balance").default(0).notNull(), // Stored in cents
  displayName: text("display_name").notNull(),
  dinosaurColor: text("dinosaur_color").default("green").notNull(),
});

export const chores = pgTable("chores", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  rewardValue: integer("reward_value").notNull(), // In cents
  status: text("status", { enum: ["pending", "completed", "approved", "declined"] }).default("pending").notNull(),
  assigneeId: integer("assignee_id").notNull(), // Kid
  creatorId: integer("creator_id").notNull(), // Parent
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  targetAmount: integer("target_amount").notNull(), // In cents
  currentAmount: integer("current_amount").default(0).notNull(), // In cents
  userId: integer("user_id").notNull(), // Kid
  status: text("status", { enum: ["active", "reached"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(), // In cents
  type: text("type", { enum: ["earned", "spent", "allowance", "goal_contribution"] }).notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moduleProgress = pgTable("module_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  moduleId: text("module_id").notNull(), // e.g., "safety-101", "savings-basics"
  isCompleted: boolean("is_completed").default(false).notNull(),
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

// === API CONTRACT TYPES ===

// Onboarding
export const onboardingSchema = z.object({
  username: z.string().min(3),
  displayName: z.string().min(1),
  isParent: z.boolean(),
  parentId: z.number().optional(), // If kid
  dinosaurColor: z.string().optional(),
});

// Chores
export type CreateChoreRequest = InsertChore;
export type UpdateChoreRequest = Partial<InsertChore>;
export type ChoreResponse = Chore & { assignee?: AppUser }; // Include assignee details sometimes

// Goals
export type CreateGoalRequest = InsertGoal;
export type ContributeGoalRequest = { amount: number }; // Amount to move from balance to goal

// Education
export type CompleteModuleRequest = { moduleId: string };

