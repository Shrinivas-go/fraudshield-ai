// Central API configuration
// During local development (Vite), we leverage Vite's local dev proxy by using an empty string.
// In production, we fall back to the deployed Render URL (or VITE_API_URL environment variable).
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://fraudshield-api-6cpx.onrender.com');

export default API_URL
