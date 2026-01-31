import { z } from 'zod';
import { 
  insertAppUserSchema, 
  insertChoreSchema, 
  insertGoalSchema,
  onboardingSchema,
  insertDailyMoodSchema,
  appUsers,
  chores,
  goals,
  transactions,
  moduleProgress,
  dailyMoods
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
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
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  // User Management
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/me',
      responses: {
        200: z.custom<typeof appUsers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    onboard: {
      method: 'POST' as const,
      path: '/api/onboard',
      input: onboardingSchema,
      responses: {
        201: z.custom<typeof appUsers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    children: {
      method: 'GET' as const,
      path: '/api/children',
      responses: {
        200: z.array(z.custom<typeof appUsers.$inferSelect>()),
      },
    },
  },

  // Moods
  moods: {
    list: {
      method: 'GET' as const,
      path: '/api/moods',
      input: z.object({ userId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof dailyMoods.$inferSelect>()),
      },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/moods',
      input: insertDailyMoodSchema,
      responses: {
        201: z.custom<typeof dailyMoods.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  // Chores
  chores: {
    list: {
      method: 'GET' as const,
      path: '/api/chores',
      input: z.object({ assigneeId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof chores.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/chores',
      input: insertChoreSchema,
      responses: {
        201: z.custom<typeof chores.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/chores/:id/status',
      input: z.object({ status: z.enum(["pending", "completed", "approved", "declined"]) }),
      responses: {
        200: z.custom<typeof chores.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // Goals
  goals: {
    list: {
      method: 'GET' as const,
      path: '/api/goals',
      input: z.object({ userId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof goals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/goals',
      input: insertGoalSchema,
      responses: {
        201: z.custom<typeof goals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    contribute: {
      method: 'POST' as const,
      path: '/api/goals/:id/contribute',
      input: z.object({ amount: z.number().positive() }),
      responses: {
        200: z.custom<typeof goals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  // Education
  modules: {
    list: {
      method: 'GET' as const,
      path: '/api/modules',
      input: z.object({ userId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof moduleProgress.$inferSelect>()),
      },
    },
    complete: {
      method: 'POST' as const,
      path: '/api/modules/:id/complete',
      input: z.object({ score: z.number().optional() }),
      responses: {
        200: z.custom<typeof moduleProgress.$inferSelect>(),
      },
    },
  },

  // Transactions
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions',
      input: z.object({ userId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
  }
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
