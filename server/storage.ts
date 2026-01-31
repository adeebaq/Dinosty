import { db } from "./db";
import { 
  appUsers, chores, goals, transactions, moduleProgress, dailyMoods,
  type InsertAppUser, type InsertChore, type InsertGoal, type InsertTransaction, type InsertModuleProgress, type InsertDailyMood,
  type AppUser, type Chore, type Goal, type Transaction, type ModuleProgress, type DailyMood
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User Profile
  getUserByAuthId(authId: string): Promise<AppUser | undefined>;
  getUserById(id: number): Promise<AppUser | undefined>;
  getUserByUsername(username: string): Promise<AppUser | undefined>;
  createAppUser(user: InsertAppUser): Promise<AppUser>;
  getChildren(parentId: number): Promise<AppUser[]>;
  updateBalance(userId: number, amountChange: number): Promise<AppUser>;

  // Moods
  getMoods(userId: number): Promise<DailyMood[]>;
  createMood(mood: InsertDailyMood): Promise<DailyMood>;

  // Chores
  getChores(assigneeId?: number, creatorId?: number): Promise<Chore[]>;
  getChore(id: number): Promise<Chore | undefined>;
  createChore(chore: InsertChore): Promise<Chore>;
  updateChoreStatus(id: number, status: string): Promise<Chore>;

  // Goals
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoalAmount(id: number, amount: number): Promise<Goal>;
  completeGoal(id: number): Promise<Goal>;

  // Transactions
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;

  // Modules
  getModuleProgress(userId: number): Promise<ModuleProgress[]>;
  completeModule(userId: number, moduleId: string, score?: number): Promise<ModuleProgress>;
}

export class DatabaseStorage implements IStorage {
  async getUserByAuthId(authId: string): Promise<AppUser | undefined> {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.authId, authId));
    return user;
  }
  async getUserById(id: number): Promise<AppUser | undefined> {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.id, id));
    return user;
  }
  async getUserByUsername(username: string): Promise<AppUser | undefined> {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.username, username));
    return user;
  }
  async createAppUser(user: InsertAppUser): Promise<AppUser> {
    const [newUser] = await db.insert(appUsers).values(user).returning();
    return newUser;
  }
  async getChildren(parentId: number): Promise<AppUser[]> {
    return db.select().from(appUsers).where(eq(appUsers.parentId, parentId));
  }
  async updateBalance(userId: number, amountChange: number): Promise<AppUser> {
    const user = await this.getUserById(userId);
    if (!user) throw new Error("User not found");
    const newBalance = user.balance + amountChange;
    const [updated] = await db.update(appUsers)
      .set({ balance: newBalance })
      .where(eq(appUsers.id, userId))
      .returning();
    return updated;
  }

  async getMoods(userId: number): Promise<DailyMood[]> {
    return db.select().from(dailyMoods).where(eq(dailyMoods.userId, userId)).orderBy(desc(dailyMoods.date));
  }
  async createMood(mood: InsertDailyMood): Promise<DailyMood> {
    const [newMood] = await db.insert(dailyMoods).values(mood).returning();
    return newMood;
  }

  async getChores(assigneeId?: number, creatorId?: number): Promise<Chore[]> {
    if (assigneeId) {
      return db.select().from(chores).where(eq(chores.assigneeId, assigneeId)).orderBy(desc(chores.createdAt));
    }
    if (creatorId) {
      return db.select().from(chores).where(eq(chores.creatorId, creatorId)).orderBy(desc(chores.createdAt));
    }
    return db.select().from(chores).orderBy(desc(chores.createdAt));
  }
  async getChore(id: number): Promise<Chore | undefined> {
    const [chore] = await db.select().from(chores).where(eq(chores.id, id));
    return chore;
  }
  async createChore(chore: InsertChore): Promise<Chore> {
    const [newChore] = await db.insert(chores).values(chore).returning();
    return newChore;
  }
  async updateChoreStatus(id: number, status: string): Promise<Chore> {
    const [updated] = await db.update(chores)
      .set({ status })
      .where(eq(chores.id, id))
      .returning();
    return updated;
  }

  async getGoals(userId: number): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.userId, userId));
  }
  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }
  async updateGoalAmount(id: number, amount: number): Promise<Goal> {
    const [updated] = await db.update(goals)
      .set({ currentAmount: amount })
      .where(eq(goals.id, id))
      .returning();
    return updated;
  }
  async completeGoal(id: number): Promise<Goal> {
    const [updated] = await db.update(goals)
      .set({ status: "reached" })
      .where(eq(goals.id, id))
      .returning();
    return updated;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }
  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [newTx] = await db.insert(transactions).values(tx).returning();
    return newTx;
  }

  async getModuleProgress(userId: number): Promise<ModuleProgress[]> {
    return db.select().from(moduleProgress).where(eq(moduleProgress.userId, userId));
  }
  async completeModule(userId: number, moduleId: string, score?: number): Promise<ModuleProgress> {
    const [existing] = await db.select().from(moduleProgress)
      .where(and(eq(moduleProgress.userId, userId), eq(moduleProgress.moduleId, moduleId)));
    
    if (existing) {
      const [updated] = await db.update(moduleProgress)
        .set({ isCompleted: true, score: score ?? existing.score, completedAt: new Date() })
        .where(eq(moduleProgress.id, existing.id))
        .returning();
      return updated;
    }

    const [newProgress] = await db.insert(moduleProgress).values({
      userId,
      moduleId,
      isCompleted: true,
      score,
      completedAt: new Date()
    }).returning();
    return newProgress;
  }
}

export const storage = new DatabaseStorage();
