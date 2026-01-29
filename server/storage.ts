import { 
  users, type User, type InsertUser,
  weightEntries, type WeightEntry, type InsertWeightEntry,
  dietEntries, type DietEntry, type InsertDietEntry,
  workouts, type Workout, type InsertWorkout,
  recoveryEntries, type RecoveryEntry, type InsertRecoveryEntry,
  sleepEntries, type SleepEntry, type InsertSleepEntry,
  journalEntries, type JournalEntry, type InsertJournalEntry,
  progressPhotos, type ProgressPhoto, type InsertProgressPhoto,
  budgetCategories, type BudgetCategory, type InsertBudgetCategory,
  budgetTransactions, type BudgetTransaction, type InsertBudgetTransaction,
  budgetAccounts, type BudgetAccount, type InsertBudgetAccount,
  budgetScenarios, type BudgetScenario, type InsertBudgetScenario,
  calendarEvents, type CalendarEvent, type InsertCalendarEvent,
  todos, type Todo, type InsertTodo,
  motivationalQuotes, type MotivationalQuote, type InsertMotivationalQuote,
  martialArtsRecords, type MartialArtsRecord, type InsertMartialArtsRecord,
  martialArtsBelts, type MartialArtsBelt, type InsertMartialArtsBelt,
  jobs, type Job, type InsertJob,
  paycheckHistory, type PaycheckHistory, type InsertPaycheckHistory,
  paycheckDailyHours, type PaycheckDailyHours, type InsertPaycheckDailyHours,
  budgetPlanEntries, type BudgetPlanEntry, type InsertBudgetPlanEntry
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Weight
  getWeightEntries(userId: string): Promise<WeightEntry[]>;
  createWeightEntry(userId: string, entry: InsertWeightEntry): Promise<WeightEntry>;
  deleteWeightEntry(id: number): Promise<void>;

  // Diet
  getDietEntries(userId: string): Promise<DietEntry[]>;
  createDietEntry(userId: string, entry: InsertDietEntry): Promise<DietEntry>;
  deleteDietEntry(id: number): Promise<void>;

  // Workouts
  getWorkouts(userId: string): Promise<Workout[]>;
  createWorkout(userId: string, entry: InsertWorkout): Promise<Workout>;
  deleteWorkout(id: number): Promise<void>;

  // Recovery
  getRecoveryEntries(userId: string): Promise<RecoveryEntry[]>;
  createRecoveryEntry(userId: string, entry: InsertRecoveryEntry): Promise<RecoveryEntry>;
  deleteRecoveryEntry(id: number): Promise<void>;

  // Sleep
  getSleepEntries(userId: string): Promise<SleepEntry[]>;
  createSleepEntry(userId: string, entry: InsertSleepEntry): Promise<SleepEntry>;
  deleteSleepEntry(id: number): Promise<void>;

  // Journal
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry>;
  deleteJournalEntry(id: number): Promise<void>;

  // Progress Photos
  getProgressPhotos(userId: string): Promise<ProgressPhoto[]>;
  createProgressPhoto(userId: string, entry: InsertProgressPhoto): Promise<ProgressPhoto>;
  deleteProgressPhoto(id: number): Promise<void>;

  // Budget Categories
  getBudgetCategories(userId: string): Promise<BudgetCategory[]>;
  createBudgetCategory(userId: string, entry: InsertBudgetCategory): Promise<BudgetCategory>;
  updateBudgetCategory(id: number, entry: Partial<InsertBudgetCategory>): Promise<BudgetCategory>;
  deleteBudgetCategory(id: number): Promise<void>;

  // Budget Transactions
  getBudgetTransactions(userId: string): Promise<BudgetTransaction[]>;
  createBudgetTransaction(userId: string, entry: InsertBudgetTransaction): Promise<BudgetTransaction>;
  deleteBudgetTransaction(id: number): Promise<void>;

  // Budget Accounts
  getBudgetAccounts(userId: string): Promise<BudgetAccount[]>;
  createBudgetAccount(userId: string, entry: InsertBudgetAccount): Promise<BudgetAccount>;
  updateBudgetAccount(id: number, entry: Partial<InsertBudgetAccount>): Promise<BudgetAccount>;
  deleteBudgetAccount(id: number): Promise<void>;

  // Budget Scenarios
  getBudgetScenarios(userId: string): Promise<BudgetScenario[]>;
  createBudgetScenario(userId: string, entry: InsertBudgetScenario): Promise<BudgetScenario>;
  updateBudgetScenario(id: number, entry: Partial<InsertBudgetScenario>): Promise<BudgetScenario>;
  deleteBudgetScenario(id: number): Promise<void>;

  // Calendar
  getCalendarEvents(userId: string): Promise<CalendarEvent[]>;
  createCalendarEvent(userId: string, entry: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, entry: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: number): Promise<void>;

  // Todos
  getTodos(userId: string): Promise<Todo[]>;
  createTodo(userId: string, entry: InsertTodo): Promise<Todo>;
  updateTodo(id: number, entry: Partial<InsertTodo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;

  // Motivational Quotes
  getMotivationalQuotes(userId: string): Promise<MotivationalQuote[]>;
  createMotivationalQuote(userId: string, entry: InsertMotivationalQuote): Promise<MotivationalQuote>;
  updateMotivationalQuote(id: number, entry: Partial<InsertMotivationalQuote>): Promise<MotivationalQuote>;
  deleteMotivationalQuote(id: number): Promise<void>;

  // Martial Arts Records
  getMartialArtsRecords(userId: string): Promise<MartialArtsRecord[]>;
  createMartialArtsRecord(userId: string, entry: InsertMartialArtsRecord): Promise<MartialArtsRecord>;
  updateMartialArtsRecord(id: number, entry: Partial<InsertMartialArtsRecord>): Promise<MartialArtsRecord>;
  deleteMartialArtsRecord(id: number): Promise<void>;

  // Martial Arts Belts
  getMartialArtsBelts(userId: string): Promise<MartialArtsBelt[]>;
  createMartialArtsBelt(userId: string, entry: InsertMartialArtsBelt): Promise<MartialArtsBelt>;
  updateMartialArtsBelt(id: number, entry: Partial<InsertMartialArtsBelt>): Promise<MartialArtsBelt>;
  deleteMartialArtsBelt(id: number): Promise<void>;

  // Jobs
  getJobs(userId: string): Promise<Job[]>;
  createJob(userId: string, entry: InsertJob): Promise<Job>;
  updateJob(id: number, entry: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  
  getPaycheckHistory(userId: string): Promise<PaycheckHistory[]>;
  createPaycheckHistory(userId: string, entry: InsertPaycheckHistory): Promise<PaycheckHistory>;
  deletePaycheckHistory(id: number): Promise<void>;
  
  // Paycheck Daily Hours
  getPaycheckDailyHours(userId: string, weekStart: string): Promise<PaycheckDailyHours[]>;
  upsertPaycheckDailyHours(userId: string, entry: InsertPaycheckDailyHours): Promise<PaycheckDailyHours>;
  clearPaycheckDailyHours(userId: string, weekStart: string): Promise<void>;
  
  // Budget Plan Entries
  getBudgetPlanEntries(userId: string): Promise<BudgetPlanEntry[]>;
  createBudgetPlanEntry(userId: string, entry: InsertBudgetPlanEntry): Promise<BudgetPlanEntry>;
  deleteBudgetPlanEntry(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Weight
  async getWeightEntries(userId: string): Promise<WeightEntry[]> {
    return await db.select().from(weightEntries).where(eq(weightEntries.userId, userId)).orderBy(desc(weightEntries.date));
  }
  async createWeightEntry(userId: string, entry: InsertWeightEntry): Promise<WeightEntry> {
    const [item] = await db.insert(weightEntries).values({ ...entry, userId }).returning();
    return item;
  }
  async deleteWeightEntry(id: number): Promise<void> {
    await db.delete(weightEntries).where(eq(weightEntries.id, id));
  }

  // Diet
  async getDietEntries(userId: string): Promise<DietEntry[]> {
    return await db.select().from(dietEntries).where(eq(dietEntries.userId, userId)).orderBy(desc(dietEntries.date));
  }
  async createDietEntry(userId: string, entry: InsertDietEntry): Promise<DietEntry> {
    const [item] = await db.insert(dietEntries).values({ ...entry, userId }).returning();
    return item;
  }
  async deleteDietEntry(id: number): Promise<void> {
    await db.delete(dietEntries).where(eq(dietEntries.id, id));
  }

  // Workouts
  async getWorkouts(userId: string): Promise<Workout[]> {
    return await db.select().from(workouts).where(eq(workouts.userId, userId)).orderBy(desc(workouts.date));
  }
  async createWorkout(userId: string, entry: InsertWorkout): Promise<Workout> {
    const [item] = await db.insert(workouts).values({ ...entry, userId }).returning();
    return item;
  }
  async deleteWorkout(id: number): Promise<void> {
    await db.delete(workouts).where(eq(workouts.id, id));
  }

  // Recovery
  async getRecoveryEntries(userId: string): Promise<RecoveryEntry[]> {
    return await db.select().from(recoveryEntries).where(eq(recoveryEntries.userId, userId)).orderBy(desc(recoveryEntries.date));
  }
  async createRecoveryEntry(userId: string, entry: InsertRecoveryEntry): Promise<RecoveryEntry> {
    const [item] = await db.insert(recoveryEntries).values({ ...entry, userId }).returning();
    return item;
  }
  async deleteRecoveryEntry(id: number): Promise<void> {
    await db.delete(recoveryEntries).where(eq(recoveryEntries.id, id));
  }

  // Sleep
  async getSleepEntries(userId: string): Promise<SleepEntry[]> {
    return await db.select().from(sleepEntries).where(eq(sleepEntries.userId, userId)).orderBy(desc(sleepEntries.date));
  }
  async createSleepEntry(userId: string, entry: InsertSleepEntry): Promise<SleepEntry> {
    const [item] = await db.insert(sleepEntries).values({ ...entry, userId }).returning();
    return item;
  }
  async deleteSleepEntry(id: number): Promise<void> {
    await db.delete(sleepEntries).where(eq(sleepEntries.id, id));
  }

  // Journal
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.date));
  }
  async createJournalEntry(userId: string, entry: InsertJournalEntry): Promise<JournalEntry> {
    const [item] = await db.insert(journalEntries).values({ ...entry, userId }).returning();
    return item;
  }
  async updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry> {
    const [item] = await db.update(journalEntries).set(entry).where(eq(journalEntries.id, id)).returning();
    return item;
  }
  async deleteJournalEntry(id: number): Promise<void> {
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
  }

  // Progress Photos
  async getProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
    return await db.select().from(progressPhotos).where(eq(progressPhotos.userId, userId)).orderBy(desc(progressPhotos.date));
  }
  async createProgressPhoto(userId: string, entry: InsertProgressPhoto): Promise<ProgressPhoto> {
    const [item] = await db.insert(progressPhotos).values({ ...entry, userId }).returning();
    return item;
  }
  async deleteProgressPhoto(id: number): Promise<void> {
    await db.delete(progressPhotos).where(eq(progressPhotos.id, id));
  }

  // Budget Categories
  async getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
    return await db.select().from(budgetCategories).where(eq(budgetCategories.userId, userId));
  }
  async createBudgetCategory(userId: string, entry: InsertBudgetCategory): Promise<BudgetCategory> {
    const [item] = await db.insert(budgetCategories).values({ ...entry, userId }).returning();
    return item;
  }
  async updateBudgetCategory(id: number, entry: Partial<InsertBudgetCategory>): Promise<BudgetCategory> {
    const [item] = await db.update(budgetCategories).set(entry).where(eq(budgetCategories.id, id)).returning();
    return item;
  }
  async deleteBudgetCategory(id: number): Promise<void> {
    await db.delete(budgetCategories).where(eq(budgetCategories.id, id));
  }

  // Budget Transactions
  async getBudgetTransactions(userId: string): Promise<BudgetTransaction[]> {
    return await db.select().from(budgetTransactions).where(eq(budgetTransactions.userId, userId)).orderBy(desc(budgetTransactions.date));
  }
  async createBudgetTransaction(userId: string, entry: InsertBudgetTransaction): Promise<BudgetTransaction> {
    const [item] = await db.insert(budgetTransactions).values({ ...entry, userId }).returning();
    
    // Update account balance if accountId is provided
    if (entry.accountId) {
      const [account] = await db.select().from(budgetAccounts).where(eq(budgetAccounts.id, entry.accountId));
      if (account) {
        const currentBalance = parseFloat(account.balance);
        const amount = parseFloat(entry.amount as string);
        const newBalance = entry.type === 'income' 
          ? currentBalance + amount 
          : currentBalance - amount;
        await db.update(budgetAccounts).set({ balance: newBalance.toString() }).where(eq(budgetAccounts.id, entry.accountId));
      }
    }
    
    return item;
  }
  async deleteBudgetTransaction(id: number): Promise<void> {
    // Get transaction first to reverse balance
    const [transaction] = await db.select().from(budgetTransactions).where(eq(budgetTransactions.id, id));
    if (transaction?.accountId) {
      const [account] = await db.select().from(budgetAccounts).where(eq(budgetAccounts.id, transaction.accountId));
      if (account) {
        const currentBalance = parseFloat(account.balance);
        const amount = parseFloat(transaction.amount);
        const newBalance = transaction.type === 'income' 
          ? currentBalance - amount 
          : currentBalance + amount;
        await db.update(budgetAccounts).set({ balance: newBalance.toString() }).where(eq(budgetAccounts.id, transaction.accountId));
      }
    }
    await db.delete(budgetTransactions).where(eq(budgetTransactions.id, id));
  }

  // Budget Accounts
  async getBudgetAccounts(userId: string): Promise<BudgetAccount[]> {
    return await db.select().from(budgetAccounts).where(eq(budgetAccounts.userId, userId));
  }
  async createBudgetAccount(userId: string, entry: InsertBudgetAccount): Promise<BudgetAccount> {
    const [item] = await db.insert(budgetAccounts).values({ ...entry, userId }).returning();
    return item;
  }
  async updateBudgetAccount(id: number, entry: Partial<InsertBudgetAccount>): Promise<BudgetAccount> {
    const [item] = await db.update(budgetAccounts).set(entry).where(eq(budgetAccounts.id, id)).returning();
    return item;
  }
  async deleteBudgetAccount(id: number): Promise<void> {
    await db.delete(budgetAccounts).where(eq(budgetAccounts.id, id));
  }

  // Budget Scenarios
  async getBudgetScenarios(userId: string): Promise<BudgetScenario[]> {
    return await db.select().from(budgetScenarios).where(eq(budgetScenarios.userId, userId));
  }
  async createBudgetScenario(userId: string, entry: InsertBudgetScenario): Promise<BudgetScenario> {
    const [item] = await db.insert(budgetScenarios).values({ ...entry, userId }).returning();
    return item;
  }
  async updateBudgetScenario(id: number, entry: Partial<InsertBudgetScenario>): Promise<BudgetScenario> {
    const [item] = await db.update(budgetScenarios).set(entry).where(eq(budgetScenarios.id, id)).returning();
    return item;
  }
  async deleteBudgetScenario(id: number): Promise<void> {
    await db.delete(budgetScenarios).where(eq(budgetScenarios.id, id));
  }

  // Calendar
  async getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId)).orderBy(desc(calendarEvents.startDate));
  }
  async createCalendarEvent(userId: string, entry: InsertCalendarEvent): Promise<CalendarEvent> {
    const [item] = await db.insert(calendarEvents).values({ ...entry, userId }).returning();
    return item;
  }
  async updateCalendarEvent(id: number, entry: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [item] = await db.update(calendarEvents).set(entry).where(eq(calendarEvents.id, id)).returning();
    return item;
  }
  async deleteCalendarEvent(id: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Todos
  async getTodos(userId: string): Promise<Todo[]> {
    return await db.select().from(todos).where(eq(todos.userId, userId)).orderBy(desc(todos.createdAt));
  }
  async createTodo(userId: string, entry: InsertTodo): Promise<Todo> {
    const [item] = await db.insert(todos).values({ ...entry, userId }).returning();
    return item;
  }
  async updateTodo(id: number, entry: Partial<InsertTodo>): Promise<Todo> {
    const [item] = await db.update(todos).set(entry).where(eq(todos.id, id)).returning();
    return item;
  }
  async deleteTodo(id: number): Promise<void> {
    await db.delete(todos).where(eq(todos.id, id));
  }

  // Motivational Quotes
  async getMotivationalQuotes(userId: string): Promise<MotivationalQuote[]> {
    return await db.select().from(motivationalQuotes).where(eq(motivationalQuotes.userId, userId)).orderBy(desc(motivationalQuotes.createdAt));
  }
  async createMotivationalQuote(userId: string, entry: InsertMotivationalQuote): Promise<MotivationalQuote> {
    const [item] = await db.insert(motivationalQuotes).values({ ...entry, userId }).returning();
    return item;
  }
  async updateMotivationalQuote(id: number, entry: Partial<InsertMotivationalQuote>): Promise<MotivationalQuote> {
    const [item] = await db.update(motivationalQuotes).set(entry).where(eq(motivationalQuotes.id, id)).returning();
    return item;
  }
  async deleteMotivationalQuote(id: number): Promise<void> {
    await db.delete(motivationalQuotes).where(eq(motivationalQuotes.id, id));
  }

  // Martial Arts Records
  async getMartialArtsRecords(userId: string): Promise<MartialArtsRecord[]> {
    return await db.select().from(martialArtsRecords).where(eq(martialArtsRecords.userId, userId)).orderBy(desc(martialArtsRecords.date));
  }
  async createMartialArtsRecord(userId: string, entry: InsertMartialArtsRecord): Promise<MartialArtsRecord> {
    const [item] = await db.insert(martialArtsRecords).values({ ...entry, userId }).returning();
    return item;
  }
  async updateMartialArtsRecord(id: number, entry: Partial<InsertMartialArtsRecord>): Promise<MartialArtsRecord> {
    const [item] = await db.update(martialArtsRecords).set(entry).where(eq(martialArtsRecords.id, id)).returning();
    return item;
  }
  async deleteMartialArtsRecord(id: number): Promise<void> {
    await db.delete(martialArtsRecords).where(eq(martialArtsRecords.id, id));
  }

  // Martial Arts Belts
  async getMartialArtsBelts(userId: string): Promise<MartialArtsBelt[]> {
    return await db.select().from(martialArtsBelts).where(eq(martialArtsBelts.userId, userId)).orderBy(desc(martialArtsBelts.createdAt));
  }
  async createMartialArtsBelt(userId: string, entry: InsertMartialArtsBelt): Promise<MartialArtsBelt> {
    const [item] = await db.insert(martialArtsBelts).values({ ...entry, userId }).returning();
    return item;
  }
  async updateMartialArtsBelt(id: number, entry: Partial<InsertMartialArtsBelt>): Promise<MartialArtsBelt> {
    const [item] = await db.update(martialArtsBelts).set(entry).where(eq(martialArtsBelts.id, id)).returning();
    return item;
  }
  async deleteMartialArtsBelt(id: number): Promise<void> {
    await db.delete(martialArtsBelts).where(eq(martialArtsBelts.id, id));
  }

  // Jobs
  async getJobs(userId: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.userId, userId)).orderBy(desc(jobs.createdAt));
  }
  async createJob(userId: string, entry: InsertJob): Promise<Job> {
    const [item] = await db.insert(jobs).values({ ...entry, userId }).returning();
    return item;
  }
  async updateJob(id: number, entry: Partial<InsertJob>): Promise<Job> {
    const [item] = await db.update(jobs).set(entry).where(eq(jobs.id, id)).returning();
    return item;
  }
  async deleteJob(id: number): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async getPaycheckHistory(userId: string): Promise<PaycheckHistory[]> {
    return await db.select().from(paycheckHistory).where(eq(paycheckHistory.userId, userId)).orderBy(desc(paycheckHistory.weekStart));
  }
  async createPaycheckHistory(userId: string, entry: InsertPaycheckHistory): Promise<PaycheckHistory> {
    const [item] = await db.insert(paycheckHistory).values({ ...entry, userId }).returning();
    return item;
  }
  async deletePaycheckHistory(id: number): Promise<void> {
    await db.delete(paycheckHistory).where(eq(paycheckHistory.id, id));
  }

  // Paycheck Daily Hours
  async getPaycheckDailyHours(userId: string, weekStart: string): Promise<PaycheckDailyHours[]> {
    return await db.select().from(paycheckDailyHours)
      .where(and(eq(paycheckDailyHours.userId, userId), eq(paycheckDailyHours.weekStart, weekStart)));
  }

  async upsertPaycheckDailyHours(userId: string, entry: InsertPaycheckDailyHours): Promise<PaycheckDailyHours> {
    const existing = await db.select().from(paycheckDailyHours)
      .where(and(
        eq(paycheckDailyHours.userId, userId),
        eq(paycheckDailyHours.jobId, entry.jobId),
        eq(paycheckDailyHours.weekStart, entry.weekStart),
        eq(paycheckDailyHours.day, entry.day)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db.update(paycheckDailyHours)
        .set({ hours: entry.hours, updatedAt: new Date() })
        .where(eq(paycheckDailyHours.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [item] = await db.insert(paycheckDailyHours)
        .values({ ...entry, userId })
        .returning();
      return item;
    }
  }

  async clearPaycheckDailyHours(userId: string, weekStart: string): Promise<void> {
    await db.delete(paycheckDailyHours)
      .where(and(eq(paycheckDailyHours.userId, userId), eq(paycheckDailyHours.weekStart, weekStart)));
  }

  async getBudgetPlanEntries(userId: string): Promise<BudgetPlanEntry[]> {
    return db.select().from(budgetPlanEntries)
      .where(eq(budgetPlanEntries.userId, userId))
      .orderBy(desc(budgetPlanEntries.date));
  }

  async createBudgetPlanEntry(userId: string, entry: InsertBudgetPlanEntry): Promise<BudgetPlanEntry> {
    const [item] = await db.insert(budgetPlanEntries)
      .values({ ...entry, userId })
      .returning();
    return item;
  }

  async deleteBudgetPlanEntry(id: number): Promise<void> {
    await db.delete(budgetPlanEntries).where(eq(budgetPlanEntries.id, id));
  }
}

export const storage = new DatabaseStorage();
