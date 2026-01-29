import { z } from 'zod';
import {
  insertWeightEntrySchema,
  weightEntries,
  insertDietEntrySchema,
  dietEntries,
  insertWorkoutSchema,
  workouts,
  insertRecoveryEntrySchema,
  recoveryEntries,
  insertSleepEntrySchema,
  sleepEntries,
  insertJournalEntrySchema,
  journalEntries,
  insertProgressPhotoSchema,
  progressPhotos,
  insertBudgetCategorySchema,
  budgetCategories,
  insertBudgetTransactionSchema,
  budgetTransactions,
  insertBudgetAccountSchema,
  budgetAccounts,
  insertBudgetScenarioSchema,
  budgetScenarios,
  insertTodoSchema,
  todos,
  insertCalendarEventSchema,
  calendarEvents,
  insertMotivationalQuoteSchema,
  motivationalQuotes,
  insertMartialArtsRecordSchema,
  martialArtsRecords,
  insertMartialArtsBeltSchema,
  martialArtsBelts,
  insertJobSchema,
  jobs,
  insertPaycheckHistorySchema,
  paycheckHistory,
  insertBudgetPlanEntrySchema,
  budgetPlanEntries
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  weight: {
    list: {
      method: 'GET' as const,
      path: '/api/weight',
      responses: {
        200: z.array(z.custom<typeof weightEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/weight',
      input: insertWeightEntrySchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof weightEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/weight/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  diet: {
    list: {
      method: 'GET' as const,
      path: '/api/diet',
      responses: {
        200: z.array(z.custom<typeof dietEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/diet',
      input: insertDietEntrySchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof dietEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/diet/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  workouts: {
    list: {
      method: 'GET' as const,
      path: '/api/workouts',
      responses: {
        200: z.array(z.custom<typeof workouts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/workouts',
      input: insertWorkoutSchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof workouts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/workouts/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  recovery: {
    list: {
      method: 'GET' as const,
      path: '/api/recovery',
      responses: {
        200: z.array(z.custom<typeof recoveryEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/recovery',
      input: insertRecoveryEntrySchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof recoveryEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/recovery/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  sleep: {
    list: {
      method: 'GET' as const,
      path: '/api/sleep',
      responses: {
        200: z.array(z.custom<typeof sleepEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sleep',
      input: insertSleepEntrySchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof sleepEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/sleep/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  journal: {
    list: {
      method: 'GET' as const,
      path: '/api/journal',
      responses: {
        200: z.array(z.custom<typeof journalEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/journal',
      input: insertJournalEntrySchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof journalEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/journal/:id',
      input: insertJournalEntrySchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof journalEntries.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/journal/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  progressPhotos: {
    list: {
      method: 'GET' as const,
      path: '/api/progress-photos',
      responses: {
        200: z.array(z.custom<typeof progressPhotos.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/progress-photos',
      input: insertProgressPhotoSchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof progressPhotos.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/progress-photos/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  budgetCategories: {
    list: {
      method: 'GET' as const,
      path: '/api/budget/categories',
      responses: {
        200: z.array(z.custom<typeof budgetCategories.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/budget/categories',
      input: insertBudgetCategorySchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof budgetCategories.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/budget/categories/:id',
      input: insertBudgetCategorySchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof budgetCategories.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/budget/categories/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  budgetTransactions: {
    list: {
      method: 'GET' as const,
      path: '/api/budget/transactions',
      responses: {
        200: z.array(z.custom<typeof budgetTransactions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/budget/transactions',
      input: insertBudgetTransactionSchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof budgetTransactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/budget/transactions/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  budgetAccounts: {
    list: {
      method: 'GET' as const,
      path: '/api/budget/accounts',
      responses: {
        200: z.array(z.custom<typeof budgetAccounts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/budget/accounts',
      input: insertBudgetAccountSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof budgetAccounts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/budget/accounts/:id',
      input: insertBudgetAccountSchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof budgetAccounts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/budget/accounts/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    transfer: {
      method: 'POST' as const,
      path: '/api/budget/accounts/transfer',
      input: z.object({
        fromAccountId: z.number(),
        toAccountId: z.number(),
        amount: z.string(),
        description: z.string().optional(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
      },
    }
  },
  budgetScenarios: {
    list: {
      method: 'GET' as const,
      path: '/api/budget/scenarios',
      responses: {
        200: z.array(z.custom<typeof budgetScenarios.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/budget/scenarios',
      input: insertBudgetScenarioSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof budgetScenarios.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/budget/scenarios/:id',
      input: insertBudgetScenarioSchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof budgetScenarios.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/budget/scenarios/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  calendar: {
    list: {
      method: 'GET' as const,
      path: '/api/calendar',
      responses: {
        200: z.array(z.custom<typeof calendarEvents.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/calendar',
      input: insertCalendarEventSchema.omit({ userId: true }).extend({
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional(),
      }),
      responses: {
        201: z.custom<typeof calendarEvents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/calendar/:id',
      input: insertCalendarEventSchema.omit({ userId: true }).extend({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
      }).partial(),
      responses: {
        200: z.custom<typeof calendarEvents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/calendar/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    import: {
      method: 'POST' as const,
      path: '/api/calendar/import',
      responses: {
        200: z.object({ imported: z.number() }),
        400: errorSchemas.validation,
      },
    },
    export: {
      method: 'GET' as const,
      path: '/api/calendar/export',
      responses: {
        200: z.string(),
      },
    }
  },
  todos: {
    list: {
      method: 'GET' as const,
      path: '/api/todos',
      responses: {
        200: z.array(z.custom<typeof todos.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/todos',
      input: insertTodoSchema.omit({ userId: true }).extend({
        dueDate: z.coerce.date().optional().nullable(),
      }),
      responses: {
        201: z.custom<typeof todos.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/todos/:id',
      input: insertTodoSchema.omit({ userId: true }).extend({
        dueDate: z.coerce.date().optional().nullable(),
      }).partial(),
      responses: {
        200: z.custom<typeof todos.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/todos/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  quotes: {
    list: {
      method: 'GET' as const,
      path: '/api/quotes',
      responses: {
        200: z.array(z.custom<typeof motivationalQuotes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/quotes',
      input: insertMotivationalQuoteSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof motivationalQuotes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/quotes/:id',
      input: insertMotivationalQuoteSchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof motivationalQuotes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/quotes/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  records: {
    list: {
      method: 'GET' as const,
      path: '/api/records',
      responses: {
        200: z.array(z.custom<typeof martialArtsRecords.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/records',
      input: insertMartialArtsRecordSchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof martialArtsRecords.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/records/:id',
      input: insertMartialArtsRecordSchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }).partial(),
      responses: {
        200: z.custom<typeof martialArtsRecords.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/records/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  belts: {
    list: {
      method: 'GET' as const,
      path: '/api/belts',
      responses: {
        200: z.array(z.custom<typeof martialArtsBelts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/belts',
      input: insertMartialArtsBeltSchema.omit({ userId: true }).extend({
        dateAchieved: z.coerce.date().optional().nullable(),
      }),
      responses: {
        201: z.custom<typeof martialArtsBelts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/belts/:id',
      input: insertMartialArtsBeltSchema.omit({ userId: true }).extend({
        dateAchieved: z.coerce.date().optional().nullable(),
      }).partial(),
      responses: {
        200: z.custom<typeof martialArtsBelts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/belts/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  jobs: {
    list: {
      method: 'GET' as const,
      path: '/api/jobs',
      responses: {
        200: z.array(z.custom<typeof jobs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/jobs',
      input: insertJobSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof jobs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/jobs/:id',
      input: insertJobSchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof jobs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/jobs/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  paycheckHistory: {
    list: {
      method: 'GET' as const,
      path: '/api/paycheck-history',
      responses: {
        200: z.array(z.custom<typeof paycheckHistory.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/paycheck-history',
      input: insertPaycheckHistorySchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof paycheckHistory.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/paycheck-history/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  budgetPlanEntries: {
    list: {
      method: 'GET' as const,
      path: '/api/budget-plan',
      responses: {
        200: z.array(z.custom<typeof budgetPlanEntries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/budget-plan',
      input: insertBudgetPlanEntrySchema.omit({ userId: true }).extend({
        date: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof budgetPlanEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/budget-plan/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
