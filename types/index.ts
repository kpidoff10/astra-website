import { User, Subscription, Plan } from '@prisma/client';
import type { AIAgent } from '@prisma/client';

export type UserWithSubscription = User & {
  subscription: Subscription | null;
};

export type AIAgentWithOwner = AIAgent & {
  owner: User;
};

export type SubscriptionWithUser = Subscription & {
  user: User;
};

export interface PlanLimits {
  maxAgents: number;
  price: number; // in cents
  name: string;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  STARTER: {
    maxAgents: 3,
    price: 2000, // $20.00
    name: 'Starter',
  },
  PRO: {
    maxAgents: 8,
    price: 4900, // $49.00
    name: 'Pro',
  },
  ENTERPRISE: {
    maxAgents: 15,
    price: 9900, // $99.00
    name: 'Enterprise',
  },
};

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
