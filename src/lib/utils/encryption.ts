import crypto from "crypto";

/**
 * Token Encryption Utilities using AES-256-GCM
 * Used for encrypting and decrypting sensitive Meta OAuth access tokens.
 * Key must be 32 bytes (64 hex characters or 32 raw bytes).
 */

function getEncryptionKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || "default_super_secret_token_encryption_key_32bytes!!";
  // Create deterministic 32-byte key using SHA-256 if raw length is not 32 bytes
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a plaintext token using AES-256-GCM
 * Returns string formatted as: iv:authTag:ciphertext (all hex encoded)
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return "";
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // Recommended 12 bytes for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted token string
 * Expects format: iv:authTag:ciphertext
 */
export function decryptToken(encryptedPayload: string): string {
  if (!encryptedPayload) return "";
  try {
    const parts = encryptedPayload.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted token format");
    }

    const [ivHex, authTagHex, encryptedData] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Token decryption failed:", message);
    throw new Error("Failed to decrypt secure token");
  }
}
