// TOTP (Time-based One-Time Password) utilities for 2FA
import { authenticator } from "otplib";
import * as crypto from "crypto";

const ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY!; // 32-byte hex key
const ALGORITHM = "aes-256-gcm";

// Encrypt TOTP secret before storing in DB
export function encryptSecret(secret: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

// Decrypt TOTP secret from DB
export function decryptSecret(encrypted: string): string {
  const [ivHex, tagHex, encHex] = encrypted.split(":");
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encryptedData = Buffer.from(encHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encryptedData) + decipher.final("utf8");
}

// Generate a new TOTP secret for a user
export function generateTotpSecret(email: string): {
  secret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
} {
  const secret = authenticator.generateSecret(20);
  const otpauthUrl = authenticator.keyuri(email, "AIBUILD AGENTS", secret);
  // Use QR code service (no library needed)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
  return { secret, otpauthUrl, qrCodeUrl };
}

// Verify a TOTP token
export function verifyTotp(token: string, encryptedSecret: string): boolean {
  try {
    const secret = decryptSecret(encryptedSecret);
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

// Generate backup codes (10 codes, each 8 chars)
export async function generateBackupCodes(): Promise<{
  plain: string[];
  hashed: string[];
}> {
  const bcrypt = await import("bcryptjs");
  const plain = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );
  const hashed = await Promise.all(plain.map((c) => bcrypt.hash(c, 12)));
  return { plain, hashed };
}

// Verify a backup code against stored hashed codes
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; remaining: string[] }> {
  const bcrypt = await import("bcryptjs");
  for (let i = 0; i < hashedCodes.length; i++) {
    const match = await bcrypt.compare(code.toUpperCase(), hashedCodes[i]);
    if (match) {
      const remaining = hashedCodes.filter((_, idx) => idx !== i);
      return { valid: true, remaining };
    }
  }
  return { valid: false, remaining: hashedCodes };
}
