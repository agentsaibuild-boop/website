// TOTP (Time-based One-Time Password) utilities for 2FA
// Pure Node.js implementation — no external dependencies
import * as crypto from "crypto";

const ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY!; // 32-byte hex key
const ALGORITHM = "aes-256-gcm";

// ─── Encryption ───────────────────────────────────────────────────────────────

export function encryptSecret(secret: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const tag = (cipher as crypto.CipherGCM).getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(encrypted: string): string {
  const [ivHex, tagHex, encHex] = encrypted.split(":");
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encryptedData = Buffer.from(encHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv) as crypto.DecipherGCM;
  decipher.setAuthTag(tag);
  return decipher.update(encryptedData).toString("utf8") + decipher.final("utf8");
}

// ─── TOTP core (RFC 6238) ─────────────────────────────────────────────────────

function base32Decode(encoded: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const str = encoded.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const char of str) {
    const idx = alphabet.indexOf(char);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

function hotp(secret: Buffer, counter: bigint): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(counter);
  const hmac = crypto.createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}


function totpVerify(token: string, base32Secret: string, window = 1): boolean {
  const secret = base32Decode(base32Secret);
  const counter = BigInt(Math.floor(Date.now() / 1000 / 30));
  for (let i = -window; i <= window; i++) {
    if (hotp(secret, counter + BigInt(i)) === token) return true;
  }
  return false;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateTotpSecret(email: string): {
  secret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
} {
  const secret = base32Encode(crypto.randomBytes(20));
  const otpauthUrl = `otpauth://totp/${encodeURIComponent("AIBUILD AGENTS")}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent("AIBUILD AGENTS")}&algorithm=SHA1&digits=6&period=30`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
  return { secret, otpauthUrl, qrCodeUrl };
}

export function verifyTotp(token: string, encryptedSecret: string): boolean {
  try {
    const secret = decryptSecret(encryptedSecret);
    return totpVerify(token, secret);
  } catch {
    return false;
  }
}

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
