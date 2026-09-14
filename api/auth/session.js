import { bearerToken, verifyToken } from '../_auth.js';

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ detail: 'Method not allowed' });
  }

  const session = verifyToken(bearerToken(request));
  if (!session) return response.status(401).json({ detail: 'Session หมดอายุหรือไม่ถูกต้อง' });

  return response.status(200).json({
    authenticated: true,
    user: { name: session.sub, role: 'Clinical Reviewer' },
  });
}
