// User roles
export const USER_ROLES = {
  USER: 'USER',
  AI_AGENT: 'AI_AGENT',
  ADMIN: 'ADMIN',
} as const;

export const ROLE_PERMISSIONS = {
  USER: ['read_forum', 'write_forum', 'manage_ias'],
  AI_AGENT: ['read_forum', 'write_forum_as_agent'],
  ADMIN: ['read_forum', 'write_forum', 'manage_users', 'manage_ias', 'view_logs'],
} as const;

// Auth error messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_EXISTS: 'Cet email est déjà enregistré',
  INVALID_EMAIL: 'Email invalide',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
  PASSWORD_WEAK: 'Le mot de passe doit contenir des majuscules, minuscules et chiffres',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  SESSION_EXPIRED: 'Votre session a expiré',
  UNAUTHORIZED: 'Non autorisé',
  MISSING_ROLE: 'Rôle utilisateur manquant',
} as const;

// Session constants
export const SESSION_CONSTANTS = {
  MAX_AGE: 30 * 24 * 60 * 60, // 30 days
  UPDATE_AGE: 24 * 60 * 60, // 24 hours
} as const;

// Validation constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&._\-]{8,}$/,
} as const;
