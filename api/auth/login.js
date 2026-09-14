import { credentialsAreValid, issueToken, TOKEN_TTL_SECONDS } from '../_auth.js';

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ detail: 'Method not allowed' });
  }

  const { username = '', password = '' } = request.body || {};
  if (!credentialsAreValid(String(username), String(password))) {
    return response.status(401).json({ detail: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }

  return response.status(200).json({
    authenticated: true,
    token: issueToken(String(username)),
    expires_in_seconds: TOKEN_TTL_SECONDS,
    user: { name: String(username), role: 'Clinical Reviewer' },
  });
}
