import { useQuery } from '@tanstack/react-query';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: {
    name?: string;
    phone?: string;
    website?: string;
    'contact:website'?: string;
    'contact:phone'?: string;
    opening_hours?: string;
    shop?: string;
    amenity?: string;
    brand?: string;
    operator?: string;
    addr_street?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    'addr:postcode'?: string;
  };
}

interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

export interface EnrichedStoreData {
  phone?: string;
  website?: string;
  opening_hours?: string;
  shop_type?: string;
  brand?: string;
  operator?: string;
  full_address?: string;
  osm_id?: number;
  confidence_score: number;
}

interface UseOverpassDataProps {
  storeName: string;
  latitude: number;
  longitude: number;
  enabled?: boolean;
}

export const useOverpassData = ({
  storeName,
  latitude,
  longitude,
  enabled = true
}: UseOverpassDataProps) => {
  return useQuery({
    queryKey: ['overpass-data', storeName, latitude, longitude],
    queryFn: async (): Promise<EnrichedStoreData | null> => {
      if (!storeName || !latitude || !longitude) {
        return null;
      }

      const searchRadius = 500;
      
      const query = `
        [out:json][timeout:25];
        (
          node["name"~"${storeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}", i](around:${searchRadius},${latitude},${longitude});
          way["name"~"${storeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}", i](around:${searchRadius},${latitude},${longitude});
          relation["name"~"${storeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}", i](around:${searchRadius},${latitude},${longitude});
        );
        out geom;
      `;

      try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(query)}`
        });

        if (!response.ok) {
          console.warn('Overpass API response not ok:', response.status);
          return null;
        }

        const data: OverpassResponse = await response.json();

        if (!data.elements || data.elements.length === 0) {
          return null;
        }

        let bestMatch: OverpassElement | null = null;
        let highestScore = 0;

        for (const element of data.elements) {
          if (!element.tags?.name) continue;

          const elementName = element.tags.name.toLowerCase();
          const searchName = storeName.toLowerCase();
          
          let nameScore = 0;
          if (elementName === searchName) {
            nameScore = 1.0;
          } else if (elementName.includes(searchName) || searchName.includes(elementName)) {
            nameScore = 0.8;
          } else {
            const searchWords = searchName.split(/\s+/);
            const elementWords = elementName.split(/\s+/);
            const matchingWords = searchWords.filter(word => 
              elementWords.some(eWord => eWord.includes(word) || word.includes(eWord))
            );
            nameScore = matchingWords.length / Math.max(searchWords.length, elementWords.length);
          }

          let distanceScore = 1.0;
          if (element.lat && element.lon) {
            const distance = Math.sqrt(
              Math.pow(element.lat - latitude, 2) + Math.pow(element.lon - longitude, 2)
            ) * 111000;
            distanceScore = Math.max(0, 1 - (distance / searchRadius));
          }

          const totalScore = (nameScore * 0.7) + (distanceScore * 0.3);
          
          if (totalScore > highestScore && totalScore > 0.3) {
            highestScore = totalScore;
            bestMatch = element;
          }
        }

        if (!bestMatch) {
          return null;
        }

        const tags = bestMatch.tags!;
        const enrichedData: EnrichedStoreData = {
          confidence_score: highestScore,
          osm_id: bestMatch.id
        };

        if (tags.phone || tags['contact:phone']) {
          enrichedData.phone = tags.phone || tags['contact:phone'];
        }
        if (tags.website || tags['contact:website']) {
          enrichedData.website = tags.website || tags['contact:website'];
        }
        if (tags.opening_hours) {
          enrichedData.opening_hours = tags.opening_hours;
        }
        if (tags.shop || tags.amenity) {
          enrichedData.shop_type = tags.shop || tags.amenity;
        }
        if (tags.brand) {
          enrichedData.brand = tags.brand;
        }
        if (tags.operator) {
          enrichedData.operator = tags.operator;
        }

        const addressParts = [
          tags['addr:housenumber'],
          tags['addr:street'] || tags.addr_street,
          tags['addr:city'],
          tags['addr:postcode']
        ].filter(Boolean);

        if (addressParts.length > 0) {
          enrichedData.full_address = addressParts.join(', ');
        }

        return enrichedData;

      } catch (error) {
        console.error('Error fetching Overpass data:', error);
        return null;
      }
    },
    enabled: enabled && !!(storeName && latitude && longitude),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
};
