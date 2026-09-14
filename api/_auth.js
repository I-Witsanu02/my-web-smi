import crypto from 'node:crypto';

const TOKEN_TTL_SECONDS = 8 * 60 * 60;

function encode(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function configuredCredentials() {
  const username = process.env.BONEAGE_USERNAME || '';
  const password = process.env.BONEAGE_PASSWORD || '';
  const secret = process.env.BONEAGE_SESSION_SECRET || '';
  return { username, password, secret, configured: Boolean(username && password && secret) };
}

export function credentialsAreValid(username, password) {
  const configured = configuredCredentials();
  return configured.configured
    && safeEqual(username, configured.username)
    && safeEqual(password, configured.password);
}

export function issueToken(username) {
  const { secret } = configuredCredentials();
  const payload = encode(JSON.stringify({ sub: username, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS }));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyToken(token) {
  const { secret, configured } = configuredCredentials();
  if (!configured || !token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.', 2);
  if (!safeEqual(signature, sign(payload, secret))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.sub || Number(data.exp) <= Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function bearerToken(request) {
  const authorization = request.headers.authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
}

export { TOKEN_TTL_SECONDS };
