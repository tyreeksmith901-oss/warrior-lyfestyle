import { pgTable, text, serial, integer, boolean, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

// Export auth and chat models
export * from "./models/auth";
export * from "./models/chat";

// === TABLE DEFINITIONS ===

export const weightEntries = pgTable("weight_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  weight: numeric("weight").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  note: text("note"),
});

export const dietEntries = pgTable("diet_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  foodName: text("food_name").notNull(),
  servingSize: numeric("serving_size"),
  servingUnit: text("serving_unit"),
  calories: integer("calories").notNull(),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fats: integer("fats"),
  fiber: integer("fiber"),
  sugar: integer("sugar"),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  exerciseName: text("exercise_name").notNull(),
  category: text("category").notNull(), // cardio, strength, martial_arts, flexibility, etc.
  duration: integer("duration").notNull(), // in minutes
  caloriesBurned: integer("calories_burned"),
  intensity: text("intensity"), // low, medium, high
  sets: integer("sets"),
  reps: integer("reps"),
  weight: numeric("weight"), // for strength training
  notes: text("notes"),
});

export const recoveryEntries = pgTable("recovery_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  type: text("type").notNull(), // stretching, meditation, massage
  duration: integer("duration").notNull(), // in minutes
  notes: text("notes"),
});

export const sleepEntries = pgTable("sleep_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  duration: numeric("duration").notNull(), // in hours
  quality: integer("quality"), // 1-10
  notes: text("notes"),
});

// === NEW TABLES ===

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  title: text("title"),
  content: text("content").notNull(),
  mood: text("mood"), // great, good, okay, bad, terrible
  tags: text("tags"), // comma-separated tags
});

export const progressPhotos = pgTable("progress_photos", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  imageUrl: text("image_url").notNull(),
  weight: numeric("weight"),
  notes: text("notes"),
});

export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // income, expense
  color: text("color"),
  icon: text("icon"),
});

export const budgetTransactions = pgTable("budget_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  amount: numeric("amount").notNull(),
  type: text("type").notNull(), // income, expense
  categoryId: integer("category_id"),
  accountId: integer("account_id"),
  description: text("description"),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: text("recurring_frequency"), // weekly, monthly, yearly
});

export const budgetAccounts = pgTable("budget_accounts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // checking, savings, credit, cash
  balance: numeric("balance").notNull().default("0"),
  color: text("color"),
});

export const budgetScenarios = pgTable("budget_scenarios", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  projectedIncome: numeric("projected_income").notNull(),
  projectedExpenses: numeric("projected_expenses").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  priority: text("priority").default("medium"), // low, medium, high
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const motivationalQuotes = pgTable("motivational_quotes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  text: text("text").notNull(),
  author: text("author"),
  isCustom: boolean("is_custom").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const martialArtsRecords = pgTable("martial_arts_records", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  sport: text("sport").notNull(), // Boxing, MMA, BJJ, Muay Thai, etc.
  result: text("result").notNull(), // win, loss, draw
  method: text("method"), // KO, TKO, Submission, Decision, Points, DQ
  opponent: text("opponent"),
  event: text("event"), // tournament/event name
  location: text("location"),
  round: integer("round"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const martialArtsBelts = pgTable("martial_arts_belts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  sport: text("sport").notNull(), // BJJ, Karate, Taekwondo, Judo, etc.
  belt: text("belt").notNull(), // white, blue, purple, brown, black, etc.
  stripes: integer("stripes").default(0),
  dateAchieved: timestamp("date_achieved"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  allDay: boolean("all_day").default(false),
  location: text("location"),
  color: text("color").default("#D4AF37"), // Gold default
  category: text("category"), // work, personal, health, fitness, etc.
  reminder: text("reminder"), // 15min, 30min, 1hour, 1day, none
  recurring: text("recurring"), // none, daily, weekly, monthly, yearly
  recurringEndDate: timestamp("recurring_end_date"),
  externalId: text("external_id"), // For .ics sync
  sourceCalendar: text("source_calendar"), // google, outlook, ics
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  hourlyRate: numeric("hourly_rate").notNull(),
  color: text("color"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paycheckHistory = pgTable("paycheck_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  weekStart: date("week_start").notNull(),
  totalHours: numeric("total_hours").notNull(),
  totalGross: numeric("total_gross").notNull(),
  jobBreakdown: text("job_breakdown").notNull(), // JSON string of job details
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paycheckDailyHours = pgTable("paycheck_daily_hours", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  jobId: integer("job_id").notNull(),
  weekStart: date("week_start").notNull(), // Start of the week (Monday)
  day: text("day").notNull(), // Monday, Tuesday, etc.
  hours: numeric("hours").notNull().default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const budgetPlanEntries = pgTable("budget_plan_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: date("date").notNull(), // The planned date for this entry
  type: text("type").notNull(), // income or expense
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  isFromPaycheck: boolean("is_from_paycheck").default(false), // Linked from paycheck predictor
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// === RELATIONS ===
export const weightEntriesRelations = relations(weightEntries, ({ one }) => ({
  user: one(users, {
    fields: [weightEntries.userId],
    references: [users.id],
  }),
}));

export const dietEntriesRelations = relations(dietEntries, ({ one }) => ({
  user: one(users, {
    fields: [dietEntries.userId],
    references: [users.id],
  }),
}));

export const workoutsRelations = relations(workouts, ({ one }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
}));

export const recoveryEntriesRelations = relations(recoveryEntries, ({ one }) => ({
  user: one(users, {
    fields: [recoveryEntries.userId],
    references: [users.id],
  }),
}));

export const sleepEntriesRelations = relations(sleepEntries, ({ one }) => ({
  user: one(users, {
    fields: [sleepEntries.userId],
    references: [users.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

export const progressPhotosRelations = relations(progressPhotos, ({ one }) => ({
  user: one(users, {
    fields: [progressPhotos.userId],
    references: [users.id],
  }),
}));

export const budgetCategoriesRelations = relations(budgetCategories, ({ one }) => ({
  user: one(users, {
    fields: [budgetCategories.userId],
    references: [users.id],
  }),
}));

export const budgetTransactionsRelations = relations(budgetTransactions, ({ one }) => ({
  user: one(users, {
    fields: [budgetTransactions.userId],
    references: [users.id],
  }),
  category: one(budgetCategories, {
    fields: [budgetTransactions.categoryId],
    references: [budgetCategories.id],
  }),
  account: one(budgetAccounts, {
    fields: [budgetTransactions.accountId],
    references: [budgetAccounts.id],
  }),
}));

export const budgetAccountsRelations = relations(budgetAccounts, ({ one }) => ({
  user: one(users, {
    fields: [budgetAccounts.userId],
    references: [users.id],
  }),
}));

export const budgetScenariosRelations = relations(budgetScenarios, ({ one }) => ({
  user: one(users, {
    fields: [budgetScenarios.userId],
    references: [users.id],
  }),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, {
    fields: [calendarEvents.userId],
    references: [users.id],
  }),
}));

export const motivationalQuotesRelations = relations(motivationalQuotes, ({ one }) => ({
  user: one(users, {
    fields: [motivationalQuotes.userId],
    references: [users.id],
  }),
}));

export const martialArtsRecordsRelations = relations(martialArtsRecords, ({ one }) => ({
  user: one(users, {
    fields: [martialArtsRecords.userId],
    references: [users.id],
  }),
}));

export const martialArtsBeltsRelations = relations(martialArtsBelts, ({ one }) => ({
  user: one(users, {
    fields: [martialArtsBelts.userId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  user: one(users, {
    fields: [jobs.userId],
    references: [users.id],
  }),
}));

export const paycheckHistoryRelations = relations(paycheckHistory, ({ one }) => ({
  user: one(users, {
    fields: [paycheckHistory.userId],
    references: [users.id],
  }),
}));

export const budgetPlanEntriesRelations = relations(budgetPlanEntries, ({ one }) => ({
  user: one(users, {
    fields: [budgetPlanEntries.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertWeightEntrySchema = createInsertSchema(weightEntries).omit({ id: true });
export const insertDietEntrySchema = createInsertSchema(dietEntries).omit({ id: true });
export const insertWorkoutSchema = createInsertSchema(workouts).omit({ id: true });
export const insertRecoveryEntrySchema = createInsertSchema(recoveryEntries).omit({ id: true });
export const insertSleepEntrySchema = createInsertSchema(sleepEntries).omit({ id: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true });
export const insertProgressPhotoSchema = createInsertSchema(progressPhotos).omit({ id: true });
export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).omit({ id: true });
export const insertBudgetTransactionSchema = createInsertSchema(budgetTransactions).omit({ id: true });
export const insertBudgetAccountSchema = createInsertSchema(budgetAccounts).omit({ id: true });
export const insertBudgetScenarioSchema = createInsertSchema(budgetScenarios).omit({ id: true });
export const insertTodoSchema = createInsertSchema(todos).omit({ id: true });
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true });
export const insertMotivationalQuoteSchema = createInsertSchema(motivationalQuotes).omit({ id: true });
export const insertMartialArtsRecordSchema = createInsertSchema(martialArtsRecords).omit({ id: true });
export const insertMartialArtsBeltSchema = createInsertSchema(martialArtsBelts).omit({ id: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true });
export const insertPaycheckHistorySchema = createInsertSchema(paycheckHistory).omit({ id: true });
export const insertPaycheckDailyHoursSchema = createInsertSchema(paycheckDailyHours).omit({ id: true });
export const insertBudgetPlanEntrySchema = createInsertSchema(budgetPlanEntries).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;

export type DietEntry = typeof dietEntries.$inferSelect;
export type InsertDietEntry = z.infer<typeof insertDietEntrySchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type RecoveryEntry = typeof recoveryEntries.$inferSelect;
export type InsertRecoveryEntry = z.infer<typeof insertRecoveryEntrySchema>;

export type SleepEntry = typeof sleepEntries.$inferSelect;
export type InsertSleepEntry = z.infer<typeof insertSleepEntrySchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type InsertProgressPhoto = z.infer<typeof insertProgressPhotoSchema>;

export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;

export type BudgetTransaction = typeof budgetTransactions.$inferSelect;
export type InsertBudgetTransaction = z.infer<typeof insertBudgetTransactionSchema>;

export type BudgetAccount = typeof budgetAccounts.$inferSelect;
export type InsertBudgetAccount = z.infer<typeof insertBudgetAccountSchema>;

export type BudgetScenario = typeof budgetScenarios.$inferSelect;
export type InsertBudgetScenario = z.infer<typeof insertBudgetScenarioSchema>;

export type Todo = typeof todos.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type MotivationalQuote = typeof motivationalQuotes.$inferSelect;
export type InsertMotivationalQuote = z.infer<typeof insertMotivationalQuoteSchema>;

export type MartialArtsRecord = typeof martialArtsRecords.$inferSelect;
export type InsertMartialArtsRecord = z.infer<typeof insertMartialArtsRecordSchema>;

export type MartialArtsBelt = typeof martialArtsBelts.$inferSelect;
export type InsertMartialArtsBelt = z.infer<typeof insertMartialArtsBeltSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type PaycheckHistory = typeof paycheckHistory.$inferSelect;
export type InsertPaycheckHistory = z.infer<typeof insertPaycheckHistorySchema>;

export type PaycheckDailyHours = typeof paycheckDailyHours.$inferSelect;
export type InsertPaycheckDailyHours = z.infer<typeof insertPaycheckDailyHoursSchema>;

export type BudgetPlanEntry = typeof budgetPlanEntries.$inferSelect;
export type InsertBudgetPlanEntry = z.infer<typeof insertBudgetPlanEntrySchema>;
