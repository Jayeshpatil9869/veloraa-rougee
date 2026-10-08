import { createHash, randomBytes } from 'node:crypto';
import { argon2id, argon2Verify } from 'hash-wasm';

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  return argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 19456,
    hashLength: 32,
    outputType: 'encoded',
  });
}

export async function verifyPassword(password: string, encoded: string) {
  return argon2Verify({ password, hash: encoded });
}

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function randomToken() {
  return randomBytes(32).toString('base64url');
}
