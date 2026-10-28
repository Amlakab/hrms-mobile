import { CURRENT_API_BASE_URL } from '../config/api';

/**
 * Safely extracts arrays of objects from diverse backend response envelopes:
 * - res.data.data.houses or res.data.data.users etc.
 * - res.data.houses or res.data.users etc.
 * - res.data.data (if array)
 * - res.data (if array)
 * - searches object values for candidate arrays
 */
export function extractArray<T = any>(response: any, preferredKey?: string): T[] {
  if (!response) return [];
  const body = response.data !== undefined ? response.data : response;

  if (Array.isArray(body)) return body;

  const innerData = body?.data;
  if (Array.isArray(innerData)) return innerData;

  if (preferredKey) {
    if (Array.isArray(innerData?.[preferredKey])) return innerData[preferredKey];
    if (Array.isArray(body?.[preferredKey])) return body[preferredKey];
  }

  // Scan common known keys
  const candidateKeys = [
    'houses',
    'users',
    'applications',
    'transactions',
    'appointments',
    'leases',
    'offers',
    'maintenance',
    'tickets',
    'feedbacks',
    'loans',
    'items',
    'results',
    'data',
  ];

  for (const k of candidateKeys) {
    if (Array.isArray(innerData?.[k])) return innerData[k];
    if (Array.isArray(body?.[k])) return body[k];
  }

  return [];
}

const FALLBACK_HOUSE_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';

/**
 * Resolves a reliable image URL for a house.
 */
export function getHouseImageUrl(house: any, imageIndex: number = 0): string {
  if (!house) return FALLBACK_HOUSE_IMG;

  // If primary image contains a direct external http or base64 data string
  if (house.images && house.images.length > 0) {
    const imgObj = house.images[imageIndex] || house.images[0];
    if (imgObj?.data) {
      if (imgObj.data.startsWith('http') || imgObj.data.startsWith('data:')) {
        return imgObj.data;
      }
      const contentType = imgObj.contentType || 'image/jpeg';
      return `data:${contentType};base64,${imgObj.data}`;
    }
  }

  // Otherwise point to backend image endpoint
  if (house._id) {
    return `${CURRENT_API_BASE_URL}/public/houses/${house._id}/image?index=${imageIndex}`;
  }

  return FALLBACK_HOUSE_IMG;
}
