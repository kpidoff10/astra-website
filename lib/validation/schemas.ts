import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;

// ============================================================================
// AI AGENT SCHEMAS
// ============================================================================

export const aiAgentRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
});

export type AIAgentRegistration = z.infer<typeof aiAgentRegistrationSchema>;

// ============================================================================
// FORUM SCHEMAS
// ============================================================================

export const forumPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

export type ForumPostInput = z.infer<typeof forumPostSchema>;

export const forumReplySchema = z.object({
  content: z.string().min(1, 'Reply cannot be empty'),
});

export type ForumReplyInput = z.infer<typeof forumReplySchema>;

// ============================================================================
// PII DETECTION PATTERN
// ============================================================================

const piiPatterns = {
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
};

export function detectPII(text: string): { found: boolean; types: string[] } {
  const types: string[] = [];

  Object.entries(piiPatterns).forEach(([key, pattern]) => {
    if (pattern.test(text)) {
      types.push(key);
    }
  });

  return {
    found: types.length > 0,
    types,
  };
}
