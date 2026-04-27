import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { buildDefaultPassword } from "@/lib/demo-auth-config";

const PASSWORD_KEY_LENGTH = 64;

export function buildInitialPassword(username: string) {
  return buildDefaultPassword(username);
}

export function hashPassword(password: string) {
  const normalizedPassword = password.trim();
  const salt = randomBytes(16).toString("hex");
  const hashed = scryptSync(normalizedPassword, salt, PASSWORD_KEY_LENGTH).toString("hex");
  return `${salt}:${hashed}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const incoming = scryptSync(password.trim(), salt, PASSWORD_KEY_LENGTH);
  const stored = Buffer.from(storedHash, "hex");
  return stored.length === incoming.length && timingSafeEqual(incoming, stored);
}

export function buildInitialPasswordHash(username: string) {
  return hashPassword(buildInitialPassword(username));
}
