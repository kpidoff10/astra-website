import { db } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

/**
 * PII patterns to detect sensitive data
 */
const PII_PATTERNS = {
  credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/gi,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/gi,
  passport: /[A-Z]{1,2}\d{6,9}/gi,
  phone: /(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/gi,
  ssn_nospace: /\b\d{9}\b/gi,
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
} as const;

export type PIIType = keyof typeof PII_PATTERNS;

export interface PIIDetectionResult {
  hasPII: boolean;
  violations: Array<{
    type: PIIType;
    matches: string[];
  }>;
}

/**
 * Scan text for PII patterns
 */
export function scanForPII(text: string): PIIDetectionResult {
  const violations: Array<{ type: PIIType; matches: string[] }> = [];

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const matches = text.match(pattern as RegExp);

    if (matches && matches.length > 0) {
      violations.push({
        type: type as PIIType,
        matches: [...new Set(matches)], // deduplicate
      });
    }
  }

  return {
    hasPII: violations.length > 0,
    violations,
  };
}

/**
 * Log a PII violation
 */
export async function logPIIViolation(
  piiType: PIIType,
  endpoint: string,
  agentId?: string,
  ipAddress?: string,
  attemptedData?: string
): Promise<void> {
  try {
    await db.pIIViolationLog.create({
      data: {
        piiType,
        endpoint,
        agentId: agentId || null,
        ipAddress: ipAddress || null,
        attemptedData: attemptedData || '',
      },
    });

    logger.warn(
      {
        piiType,
        endpoint,
        agentId,
        ipAddress,
      },
      'PII violation detected'
    );
  } catch (error) {
    logger.error(
      {
        error,
        piiType,
        endpoint,
      },
      'Failed to log PII violation'
    );
  }
}

/**
 * Validate endpoint input for PII
 * Returns { isValid: true } if no PII found
 * Returns { isValid: false, violations } if PII is detected
 */
export async function validateInput(
  text: string,
  endpoint: string,
  agentId?: string,
  ipAddress?: string
): Promise<{
  isValid: boolean;
  violations?: Array<{ type: PIIType; matches: string[] }>;
}> {
  const detection = scanForPII(text);

  if (detection.hasPII) {
    // Log each violation
    for (const violation of detection.violations) {
      await logPIIViolation(
        violation.type,
        endpoint,
        agentId,
        ipAddress,
        text
      );
    }

    return {
      isValid: false,
      violations: detection.violations,
    };
  }

  return { isValid: true };
}

/**
 * Mask sensitive PII in text (for logging/debugging)
 */
export function maskPII(text: string): string {
  let masked = text;

  masked = masked.replace(PII_PATTERNS.credit_card, 'XXXX-XXXX-XXXX-XXXX');
  masked = masked.replace(PII_PATTERNS.ssn, 'XXX-XX-XXXX');
  masked = masked.replace(PII_PATTERNS.passport, 'XXXXX');
  masked = masked.replace(PII_PATTERNS.phone, 'XXX-XXX-XXXX');
  masked = masked.replace(PII_PATTERNS.ipv4, 'X.X.X.X');

  return masked;
}
