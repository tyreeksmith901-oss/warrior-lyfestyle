import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Setup Chat
  registerChatRoutes(app);

  // === Weight Routes ===
  app.get(api.weight.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getWeightEntries(userId);
    res.json(entries);
  });

  app.post(api.weight.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.weight.create.input.parse(req.body);
      const entry = await storage.createWeightEntry(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.weight.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteWeightEntry(id);
    res.status(204).send();
  });

  // === Diet Routes ===
  app.get(api.diet.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getDietEntries(userId);
    res.json(entries);
  });

  app.post(api.diet.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.diet.create.input.parse(req.body);
      const entry = await storage.createDietEntry(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.diet.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteDietEntry(id);
    res.status(204).send();
  });

  // === Workouts Routes ===
  app.get(api.workouts.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getWorkouts(userId);
    res.json(entries);
  });

  app.post(api.workouts.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.workouts.create.input.parse(req.body);
      const entry = await storage.createWorkout(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.workouts.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteWorkout(id);
    res.status(204).send();
  });

  // === Recovery Routes ===
  app.get(api.recovery.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getRecoveryEntries(userId);
    res.json(entries);
  });

  app.post(api.recovery.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.recovery.create.input.parse(req.body);
      const entry = await storage.createRecoveryEntry(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.recovery.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteRecoveryEntry(id);
    res.status(204).send();
  });

  // === Sleep Routes ===
  app.get(api.sleep.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getSleepEntries(userId);
    res.json(entries);
  });

  app.post(api.sleep.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.sleep.create.input.parse(req.body);
      const entry = await storage.createSleepEntry(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.sleep.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteSleepEntry(id);
    res.status(204).send();
  });

  // === Journal Routes ===
  app.get(api.journal.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getJournalEntries(userId);
    res.json(entries);
  });

  app.post(api.journal.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.journal.create.input.parse(req.body);
      const entry = await storage.createJournalEntry(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.journal.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.journal.update.input.parse(req.body);
      const entry = await storage.updateJournalEntry(id, input);
      res.json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.journal.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteJournalEntry(id);
    res.status(204).send();
  });

  // === Progress Photos Routes ===
  app.get(api.progressPhotos.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getProgressPhotos(userId);
    res.json(entries);
  });

  app.post(api.progressPhotos.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.progressPhotos.create.input.parse(req.body);
      const entry = await storage.createProgressPhoto(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.progressPhotos.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProgressPhoto(id);
    res.status(204).send();
  });

  // === Budget Categories Routes ===
  app.get(api.budgetCategories.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getBudgetCategories(userId);
    res.json(entries);
  });

  app.post(api.budgetCategories.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.budgetCategories.create.input.parse(req.body);
      const entry = await storage.createBudgetCategory(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.budgetCategories.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.budgetCategories.update.input.parse(req.body);
      const entry = await storage.updateBudgetCategory(id, input);
      res.json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.budgetCategories.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteBudgetCategory(id);
    res.status(204).send();
  });

  // === Budget Transactions Routes ===
  app.get(api.budgetTransactions.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getBudgetTransactions(userId);
    res.json(entries);
  });

  app.post(api.budgetTransactions.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.budgetTransactions.create.input.parse(req.body);
      const entry = await storage.createBudgetTransaction(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.budgetTransactions.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteBudgetTransaction(id);
    res.status(204).send();
  });

  // === Budget Accounts Routes ===
  app.get(api.budgetAccounts.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getBudgetAccounts(userId);
    res.json(entries);
  });

  app.post(api.budgetAccounts.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.budgetAccounts.create.input.parse(req.body);
      const entry = await storage.createBudgetAccount(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.budgetAccounts.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.budgetAccounts.update.input.parse(req.body);
      const entry = await storage.updateBudgetAccount(id, input);
      res.json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.budgetAccounts.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteBudgetAccount(id);
    res.status(204).send();
  });

  // Transfer between accounts
  app.post(api.budgetAccounts.transfer.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.budgetAccounts.transfer.input.parse(req.body);
      
      // Get both accounts
      const accounts = await storage.getBudgetAccounts(userId);
      const fromAccount = accounts.find(a => a.id === input.fromAccountId);
      const toAccount = accounts.find(a => a.id === input.toAccountId);
      
      if (!fromAccount || !toAccount) {
        return res.status(400).json({ message: "Account not found" });
      }
      
      const amount = parseFloat(input.amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Update from account (subtract)
      const newFromBalance = (parseFloat(fromAccount.balance) - amount).toFixed(2);
      await storage.updateBudgetAccount(input.fromAccountId, { balance: newFromBalance });
      
      // Update to account (add)
      const newToBalance = (parseFloat(toAccount.balance) + amount).toFixed(2);
      await storage.updateBudgetAccount(input.toAccountId, { balance: newToBalance });
      
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === Budget Scenarios Routes ===
  app.get(api.budgetScenarios.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getBudgetScenarios(userId);
    res.json(entries);
  });

  app.post(api.budgetScenarios.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.budgetScenarios.create.input.parse(req.body);
      const entry = await storage.createBudgetScenario(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.budgetScenarios.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.budgetScenarios.update.input.parse(req.body);
      const entry = await storage.updateBudgetScenario(id, input);
      res.json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.budgetScenarios.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteBudgetScenario(id);
    res.status(204).send();
  });

  // === Calendar Routes ===
  app.get(api.calendar.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getCalendarEvents(userId);
    res.json(entries);
  });

  app.post(api.calendar.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.calendar.create.input.parse(req.body);
      const entry = await storage.createCalendarEvent(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.calendar.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.calendar.update.input.parse(req.body);
      const entry = await storage.updateCalendarEvent(id, input);
      res.json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.calendar.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCalendarEvent(id);
    res.status(204).send();
  });

  // Calendar Import (.ics file)
  app.post(api.calendar.import.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const { icsData, sourceCalendar } = req.body;
      
      if (!icsData) {
        return res.status(400).json({ message: "Missing icsData" });
      }
      
      const events = parseICS(icsData);
      let imported = 0;
      
      for (const event of events) {
        await storage.createCalendarEvent(userId, {
          ...event,
          sourceCalendar: sourceCalendar || "ics"
        });
        imported++;
      }
      
      res.json({ imported });
    } catch (err) {
      res.status(400).json({ message: "Failed to parse ICS file" });
    }
  });

  // Calendar Export (.ics file)
  app.get(api.calendar.export.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const events = await storage.getCalendarEvents(userId);
    const icsContent = generateICS(events);
    
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="warrior-calendar.ics"');
    res.send(icsContent);
  });

  // === Todos Routes ===
  app.get(api.todos.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const items = await storage.getTodos(userId);
    res.json(items);
  });

  app.post(api.todos.create.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.todos.create.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid todo data", field: parsed.error.issues[0]?.path[0] });
    }
    const item = await storage.createTodo(userId, parsed.data as any);
    res.status(201).json(item);
  });

  app.put("/api/todos/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = api.todos.update.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid todo data" });
    }
    const item = await storage.updateTodo(id, parsed.data as any);
    res.json(item);
  });

  app.delete("/api/todos/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteTodo(id);
    res.status(204).send();
  });

  // === Motivational Quotes Routes ===
  app.get(api.quotes.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const items = await storage.getMotivationalQuotes(userId);
    res.json(items);
  });

  app.post(api.quotes.create.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.quotes.create.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid quote data", field: parsed.error.issues[0]?.path[0] });
    }
    const item = await storage.createMotivationalQuote(userId, parsed.data as any);
    res.status(201).json(item);
  });

  app.put("/api/quotes/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = api.quotes.update.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid quote data" });
    }
    const item = await storage.updateMotivationalQuote(id, parsed.data as any);
    res.json(item);
  });

  app.delete("/api/quotes/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteMotivationalQuote(id);
    res.status(204).send();
  });

  // === Martial Arts Records ===
  app.get(api.records.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const items = await storage.getMartialArtsRecords(userId);
    res.json(items);
  });

  app.post(api.records.create.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.records.create.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid record data" });
    }
    const item = await storage.createMartialArtsRecord(userId, parsed.data as any);
    res.status(201).json(item);
  });

  app.put("/api/records/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = api.records.update.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid record data" });
    }
    const item = await storage.updateMartialArtsRecord(id, parsed.data as any);
    res.json(item);
  });

  app.delete("/api/records/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteMartialArtsRecord(id);
    res.status(204).send();
  });

  // === Martial Arts Belts ===
  app.get(api.belts.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const items = await storage.getMartialArtsBelts(userId);
    res.json(items);
  });

  app.post(api.belts.create.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.belts.create.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid belt data" });
    }
    const item = await storage.createMartialArtsBelt(userId, parsed.data as any);
    res.status(201).json(item);
  });

  app.put("/api/belts/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = api.belts.update.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid belt data" });
    }
    const item = await storage.updateMartialArtsBelt(id, parsed.data as any);
    res.json(item);
  });

  app.delete("/api/belts/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteMartialArtsBelt(id);
    res.status(204).send();
  });

  // === Jobs ===
  app.get(api.jobs.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const items = await storage.getJobs(userId);
    res.json(items);
  });

  app.post(api.jobs.create.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.jobs.create.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid job data" });
    }
    const item = await storage.createJob(userId, parsed.data as any);
    res.status(201).json(item);
  });

  app.put("/api/jobs/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = api.jobs.update.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid job data" });
    }
    const item = await storage.updateJob(id, parsed.data as any);
    res.json(item);
  });

  app.delete("/api/jobs/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteJob(id);
    res.status(204).send();
  });

  // === Paycheck History Routes ===
  app.get(api.paycheckHistory.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const items = await storage.getPaycheckHistory(userId);
    res.json(items);
  });

  app.post(api.paycheckHistory.create.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = api.paycheckHistory.create.input.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid paycheck data" });
    }
    const item = await storage.createPaycheckHistory(userId, parsed.data as any);
    res.status(201).json(item);
  });

  app.delete(api.paycheckHistory.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deletePaycheckHistory(id);
    res.status(204).send();
  });

  // === Paycheck Daily Hours Routes ===
  app.get("/api/paycheck-daily-hours/:weekStart", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const weekStart = req.params.weekStart;
    const items = await storage.getPaycheckDailyHours(userId, weekStart);
    res.json(items);
  });

  app.post("/api/paycheck-daily-hours", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const { jobId, weekStart, day, hours } = req.body;
    if (!jobId || !weekStart || !day) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const item = await storage.upsertPaycheckDailyHours(userId, {
      userId,
      jobId,
      weekStart,
      day,
      hours: hours || "0"
    });
    res.status(201).json(item);
  });

  app.post("/api/paycheck-daily-hours/save-day", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const { weekStart, day, hoursData } = req.body;
    if (!weekStart || !day || !hoursData) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const results = [];
    for (const entry of hoursData) {
      const item = await storage.upsertPaycheckDailyHours(userId, {
        userId,
        jobId: entry.jobId,
        weekStart,
        day,
        hours: entry.hours || "0"
      });
      results.push(item);
    }
    res.status(201).json(results);
  });

  app.delete("/api/paycheck-daily-hours/:weekStart", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const weekStart = req.params.weekStart;
    await storage.clearPaycheckDailyHours(userId, weekStart);
    res.status(204).send();
  });

  // === Budget Plan Routes ===
  app.get(api.budgetPlanEntries.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const entries = await storage.getBudgetPlanEntries(userId);
    res.json(entries);
  });

  app.post(api.budgetPlanEntries.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.budgetPlanEntries.create.input.parse(req.body);
      const entry = await storage.createBudgetPlanEntry(userId, input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.budgetPlanEntries.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteBudgetPlanEntry(id);
    res.status(204).send();
  });

  // === Image Upload Route ===
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve uploaded files statically
  app.use("/uploads", (req, res, next) => {
    const express = require("express");
    express.static(uploadsDir)(req, res, next);
  });
  
  app.post("/api/upload-image", isAuthenticated, async (req, res) => {
    try {
      const { base64Data, fileName } = req.body;
      
      if (!base64Data) {
        return res.status(400).json({ message: "No image data provided" });
      }
      
      // Validate MIME type from data URL
      const mimeMatch = base64Data.match(/^data:(image\/(jpeg|jpg|png|gif|webp));base64,/);
      if (!mimeMatch) {
        return res.status(400).json({ message: "Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed." });
      }
      
      // Extract the base64 content (remove data URL prefix)
      const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Content, "base64");
      
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return res.status(400).json({ message: "Image too large. Maximum size is 100MB." });
      }
      
      // Validate magic bytes to ensure it's actually an image
      const header = buffer.slice(0, 8);
      const isJpeg = header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF;
      const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
      const isGif = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46;
      const isWebp = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;
      
      if (!isJpeg && !isPng && !isGif && !isWebp) {
        return res.status(400).json({ message: "Invalid image file content." });
      }
      
      // Determine extension from actual content
      let ext = "jpg";
      if (isPng) ext = "png";
      else if (isGif) ext = "gif";
      else if (isWebp) ext = "webp";
      
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = path.join(uploadsDir, uniqueName);
      
      writeFileSync(filePath, buffer);
      
      const imageUrl = `/uploads/${uniqueName}`;
      res.json({ imageUrl });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  return httpServer;
}

// ICS Parser helper
function parseICS(icsData: string): any[] {
  const events: any[] = [];
  const lines = icsData.split(/\r?\n/);
  let currentEvent: any = null;
  
  for (let line of lines) {
    line = line.trim();
    
    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
    } else if (line === "END:VEVENT" && currentEvent) {
      if (currentEvent.title && currentEvent.startDate) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith("SUMMARY:")) {
        currentEvent.title = line.substring(8);
      } else if (line.startsWith("DESCRIPTION:")) {
        currentEvent.description = line.substring(12).replace(/\\n/g, "\n");
      } else if (line.startsWith("LOCATION:")) {
        currentEvent.location = line.substring(9);
      } else if (line.startsWith("UID:")) {
        currentEvent.externalId = line.substring(4);
      } else if (line.startsWith("DTSTART")) {
        const dateStr = line.split(":")[1];
        currentEvent.startDate = parseICSDate(dateStr);
        currentEvent.allDay = !line.includes("T");
      } else if (line.startsWith("DTEND")) {
        const dateStr = line.split(":")[1];
        currentEvent.endDate = parseICSDate(dateStr);
      }
    }
  }
  
  return events;
}

function parseICSDate(dateStr: string): Date {
  if (dateStr.length === 8) {
    // All day event: YYYYMMDD
    return new Date(
      parseInt(dateStr.substring(0, 4)),
      parseInt(dateStr.substring(4, 6)) - 1,
      parseInt(dateStr.substring(6, 8))
    );
  } else {
    // DateTime: YYYYMMDDTHHmmssZ or YYYYMMDDTHHmmss
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11)) || 0;
    const minute = parseInt(dateStr.substring(11, 13)) || 0;
    return new Date(year, month, day, hour, minute);
  }
}

function generateICS(events: any[]): string {
  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Warrior Lyfestyle//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  for (const event of events) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const formatDate = (d: Date, allDay?: boolean) => {
      if (allDay) {
        return d.toISOString().slice(0, 10).replace(/-/g, "");
      }
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };
    
    ics += `BEGIN:VEVENT
UID:${event.externalId || `warrior-${event.id}@warrior-lyfestyle.app`}
DTSTART${event.allDay ? ";VALUE=DATE" : ""}:${formatDate(startDate, event.allDay)}
DTEND${event.allDay ? ";VALUE=DATE" : ""}:${formatDate(endDate, event.allDay)}
SUMMARY:${event.title}
${event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}` : ""}
${event.location ? `LOCATION:${event.location}` : ""}
${event.category ? `CATEGORIES:${event.category}` : ""}
END:VEVENT
`;
  }

  ics += "END:VCALENDAR";
  return ics;
}
