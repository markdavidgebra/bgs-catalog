// src/api.js

// const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const BASE_URL = 'https://bioglowsolutions.com/api';

export async function fetchCatalog({ type = '', search = '', limit = 50, include = '' } = {}) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (search) params.set('search', search);
  if (include) params.set('include', include);
  params.set('limit', limit);

  const res = await fetch(`${BASE_URL}/catalog?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load catalog');
  return res.json();
}