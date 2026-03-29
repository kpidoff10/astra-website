import crypto from 'crypto';

// Lazy-load encryption key to allow tests to set it
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error(
      'ENCRYPTION_KEY must be defined and at least 32 characters long'
    );
  }
  return key;
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // AES-GCM needs 16-byte IV
const AUTH_TAG_LENGTH = 16; // GCM authentication tag

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plaintext Data to encrypt
 * @returns Base64 encoded: iv:authTag:encryptedData
 */
export function encryptData(plaintext: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.createHash('sha256').update(getEncryptionKey()).digest();

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData (all hex-encoded)
    const result = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    return result;
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Decrypt data encrypted by encryptData()
 * @param encryptedString Format: iv:authTag:encryptedData
 * @returns Decrypted plaintext
 */
export function decryptData(encryptedString: string): string {
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];

    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }

    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid auth tag length');
    }

    const key = crypto.createHash('sha256').update(getEncryptionKey()).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if a string is encrypted (has valid format)
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return (
    parts.length === 3 &&
    parts[0].length === IV_LENGTH * 2 && // hex-encoded
    parts[1].length === AUTH_TAG_LENGTH * 2 && // hex-encoded
    /^[a-f0-9:]+$/.test(value)
  );
}

/**
 * Safely encrypt field if not already encrypted
 */
export function encryptIfNeeded(value: string): string {
  if (isEncrypted(value)) {
    return value;
  }
  return encryptData(value);
}

/**
 * Safely decrypt field if encrypted
 */
export function decryptIfNeeded(value: string): string {
  if (!isEncrypted(value)) {
    return value;
  }
  try {
    return decryptData(value);
  } catch {
    // If decryption fails, return original (might not be encrypted)
    return value;
  }
}
