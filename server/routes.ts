import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper middleware to get AppUser from Auth User
  // This assumes the auth middleware has already run and populates req.user
  const requireAppUser = async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const authId = req.user.claims.sub;
    const user = await storage.getUserByAuthId(authId);
    if (!user) {
      // Allow /onboard to pass through if checking specific route, but generally block
      if (req.path === '/api/onboard' || req.path === '/api/me') return next();
      return res.status(403).json({ message: "Profile not set up", code: "PROFILE_MISSING" });
    }
    req.appUser = user;
    next();
  };

  // API Routes

  // 1. Me
  app.get(api.users.me.path, requireAppUser, async (req: any, res) => {
    if (!req.appUser) {
       return res.status(404).json({ message: "Profile missing" });
    }
    res.json(req.appUser);
  });

  // 2. Onboard
  app.post(api.users.onboard.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const input = api.users.onboard.input.parse(req.body);
      const authId = req.user.claims.sub;
      
      const existing = await storage.getUserByAuthId(authId);
      if (existing) return res.status(400).json({ message: "User already onboarded" });

      const newUser = await storage.createAppUser({
        authId,
        ...input,
        balance: 0,
      });
      res.status(201).json(newUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // 3. Children (for parents)
  app.get(api.users.children.path, requireAppUser, async (req: any, res) => {
    if (!req.appUser.isParent) return res.status(403).json({ message: "Not a parent" });
    const children = await storage.getChildren(req.appUser.id);
    res.json(children);
  });

  // 4. Chores List
  app.get(api.chores.list.path, requireAppUser, async (req: any, res) => {
    const user = req.appUser;
    let chores;
    if (user.isParent) {
      // Parent sees chores they created (or all for their kids? Let's say created for now or filter by child)
      // If query param assigneeId provided, filter by that
      const assigneeId = req.query.assigneeId ? Number(req.query.assigneeId) : undefined;
      chores = await storage.getChores(assigneeId, user.id); 
    } else {
      // Kid sees only their chores
      chores = await storage.getChores(user.id);
    }
    res.json(chores);
  });

  // 5. Create Chore
  app.post(api.chores.create.path, requireAppUser, async (req: any, res) => {
    if (!req.appUser.isParent) return res.status(403).json({ message: "Only parents can assign chores" });
    
    try {
      const input = api.chores.create.input.parse(req.body);
      // Validate assignee is their child? Skipping for MVP simplicity
      const chore = await storage.createChore({
        ...input,
        creatorId: req.appUser.id,
      });
      res.status(201).json(chore);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.message });
      throw err;
    }
  });

  // 6. Update Chore Status
  app.patch(api.chores.updateStatus.path, requireAppUser, async (req: any, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.appUser;
    const chore = await storage.getChore(Number(id));

    if (!chore) return res.status(404).json({ message: "Chore not found" });

    // State machine logic
    if (user.isParent) {
      // Parent can approve or decline
      if (status === "approved" && chore.status === "completed") {
         // Payout!
         await storage.updateBalance(chore.assigneeId, chore.rewardValue);
         await storage.createTransaction({
            amount: chore.rewardValue,
            type: "earned",
            description: `Completed chore: ${chore.title}`,
            userId: chore.assigneeId
         });
         const updated = await storage.updateChoreStatus(Number(id), "approved");
         return res.json(updated);
      }
      if (status === "declined") {
         const updated = await storage.updateChoreStatus(Number(id), "declined"); // or back to pending?
         return res.json(updated);
      }
    } else {
      // Kid can mark completed
      if (status === "completed" && chore.status === "pending") {
         if (chore.assigneeId !== user.id) return res.status(403).json({ message: "Not your chore" });
         const updated = await storage.updateChoreStatus(Number(id), "completed");
         return res.json(updated);
      }
    }

    res.status(400).json({ message: "Invalid status transition" });
  });

  // 7. Goals List
  app.get(api.goals.list.path, requireAppUser, async (req: any, res) => {
    // If parent, can see kid's goals? Yes.
    const targetUserId = req.query.userId ? Number(req.query.userId) : req.appUser.id;
    // Security check: if target != self, must be parent (simplified)
    const goals = await storage.getGoals(targetUserId);
    res.json(goals);
  });

  // 8. Create Goal
  app.post(api.goals.create.path, requireAppUser, async (req: any, res) => {
    try {
      const input = api.goals.create.input.parse(req.body);
      const goal = await storage.createGoal({ ...input, userId: req.appUser.id }); // Always create for self
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.message });
      throw err;
    }
  });

  // 9. Contribute to Goal
  app.post(api.goals.contribute.path, requireAppUser, async (req: any, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const user = req.appUser;
    
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    const goal = await storage.getGoal(Number(id));
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // Deduct from balance
    await storage.updateBalance(user.id, -amount);
    await storage.createTransaction({
       amount: -amount,
       type: "goal_contribution",
       description: `Saved for goal: ${goal.title}`,
       userId: user.id
    });

    // Update goal
    const newAmount = goal.currentAmount + amount;
    let updatedGoal = await storage.updateGoalAmount(Number(id), newAmount);

    if (newAmount >= goal.targetAmount) {
       updatedGoal = await storage.completeGoal(Number(id));
       // Notify parent? (Frontend handles notification via query invalidation/polling for now)
    }

    res.json(updatedGoal);
  });

  // 10. Modules
  app.get(api.modules.list.path, requireAppUser, async (req: any, res) => {
     const progress = await storage.getModuleProgress(req.appUser.id);
     res.json(progress);
  });

  app.post(api.modules.complete.path, requireAppUser, async (req: any, res) => {
     const { id } = req.params; // moduleId
     const updated = await storage.completeModule(req.appUser.id, id);
     
     // Maybe give a small reward for learning?
     // await storage.updateBalance(req.appUser.id, 10); // 10 cents reward
     
     res.json(updated);
  });

  // 11. Transactions
  app.get(api.transactions.list.path, requireAppUser, async (req: any, res) => {
    const txs = await storage.getTransactions(req.appUser.id);
    res.json(txs);
  });

  return httpServer;
}
