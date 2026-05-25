// Central API configuration
// We use an empty string by default. This resolves requests relatively:
// - In dev: Vite proxies '/api' calls to http://localhost:5000.
// - In prod: Flask serves the frontend, so calls go to the same host directly.
const API_URL = import.meta.env.VITE_API_URL || '';

export default API_URL

