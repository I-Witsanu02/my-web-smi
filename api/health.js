export default function handler(_request, response) {
  return response.status(200).json({
    status: 'frontend-ready',
    authentication: 'vercel',
    inference_backend: process.env.VITE_API_BASE_URL ? 'configured' : 'not-configured',
  });
}
