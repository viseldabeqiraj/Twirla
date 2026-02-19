import { ShopConfig } from '../types/ShopConfig';

const API_BASE_URL = '/api';

export async function fetchShopConfig(shopId: string, mode?: string, language?: string): Promise<ShopConfig> {
  const baseUrl = mode 
    ? `${API_BASE_URL}/config/${shopId}/${mode}`
    : `${API_BASE_URL}/config/${shopId}`;
  
  // Add language parameter if provided
  const url = language 
    ? `${baseUrl}?lang=${language}`
    : baseUrl;
  
  console.log('Fetching from:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    if (response.status === 404) {
      throw new Error(`Shop configuration not found for: ${shopId}${mode ? ` (mode: ${mode})` : ''}`);
    }
    throw new Error(`Failed to fetch shop configuration: ${response.status}`);
  }
  
  return response.json();
}

