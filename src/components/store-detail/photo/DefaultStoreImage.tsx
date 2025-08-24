// Default store image logic separated into its own component
export const getDefaultStoreImage = (storeType: string | null, storeName: string | null): string => {
  const name = storeName?.toLowerCase() || '';
  const type = storeType?.toLowerCase() || '';
  
  // Chain-specific images with more variety
  if (name.includes('pizza hut')) return 'photo-1513104890138-7c749659a591';
  if (name.includes('dominos') || name.includes("domino's")) return 'photo-1571066811602-716837d681de';
  if (name.includes('subway')) return 'photo-1555396273-367ea4eb4db5';
  if (name.includes('mcdonalds') || name.includes("mcdonald's")) return 'photo-1571091718767-18b5b1457add';
  if (name.includes('burger king')) return 'photo-1568901346375-23c9450c58cd';
  if (name.includes('starbucks')) return 'photo-1461023058943-07fcbe16d735';
  if (name.includes('dunkin')) return 'photo-1509042239860-f550ce710b93';
  if (name.includes('kfc')) return 'photo-1626645738196-c2a7c87a8f58';
  if (name.includes('taco bell')) return 'photo-1565299624946-b28f40a0ca4b';
  if (name.includes('chipotle')) return 'photo-1599974579688-8dbdd335c77f';
  if (name.includes('walmart')) return 'photo-1601598851547-4302969d0f8a';
  if (name.includes('target')) return 'photo-1441986300917-64674bd600d8';
  if (name.includes('cvs') || name.includes('walgreens')) return 'photo-1576671081837-49000212a370';
  if (name.includes('7-eleven') || name.includes('circle k')) return 'photo-1578662996442-48f60103fc96';
  
  // Store type based images with more variety
  if (type.includes('supermarket') || type.includes('super store')) {
    const supermarketImages = [
      'photo-1556909114-f6e7ad7d3136',
      'photo-1542838132-92c53300491e',
      'photo-1578662996442-48f60103fc96',
      'photo-1601598851547-4302969d0f8a'
    ];
    return supermarketImages[Math.floor(Math.abs(hashString(name)) % supermarketImages.length)];
  }
  
  if (type.includes('convenience')) {
    const convenienceImages = [
      'photo-1578662996442-48f60103fc96',
      'photo-1441986300917-64674bd600d8',
      'photo-1576671081837-49000212a370'
    ];
    return convenienceImages[Math.floor(Math.abs(hashString(name)) % convenienceImages.length)];
  }
  
  if (type.includes('restaurant') || type.includes('food')) {
    const restaurantImages = [
      'photo-1517248135467-4c7edcad34c4',
      'photo-1555396273-367ea4eb4db5',
      'photo-1513475382585-d06e58bcb0e0',
      'photo-1571091718767-18b5b1457add'
    ];
    return restaurantImages[Math.floor(Math.abs(hashString(name)) % restaurantImages.length)];
  }
  
  if (type.includes('pharmacy') || type.includes('drug')) {
    return 'photo-1576671081837-49000212a370';
  }
  
  if (type.includes('gas') || type.includes('fuel')) {
    return 'photo-1578662996442-48f60103fc96';
  }
  
  // Default fallback with variety
  const defaultImages = [
    'photo-1556909114-f6e7ad7d3136', // Grocery store
    'photo-1441986300917-64674bd600d8', // Retail
    'photo-1578662996442-48f60103fc96', // Store front
    'photo-1517248135467-4c7edcad34c4'  // Restaurant
  ];
  
  return defaultImages[Math.floor(Math.abs(hashString(name + type)) % defaultImages.length)];
};

// Simple hash function to ensure consistent image selection for the same store
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
};

export const getDefaultStoreImageUrl = (storeType: string | null, storeName: string | null): string => {
  const imageId = getDefaultStoreImage(storeType, storeName);
  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1200&h=400&q=80`;
};