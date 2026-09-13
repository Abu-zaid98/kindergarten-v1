async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password) {
  return sha256(password.trim());
}

export async function verifyPassword(password, hash) {
  if (!hash) return false;
  return (await hashPassword(password)) === hash;
}
