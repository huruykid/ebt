
import React from 'react';
import { useFarmersMarketAnalysis } from '@/hooks/useFarmersMarketAnalysis';
import { LoadingSpinner } from './LoadingSpinner';

export const FarmersMarketAnalyzer: React.FC = () => {
  const { data, isLoading, error } = useFarmersMarketAnalysis();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error analyzing farmers market data</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Farmers Market vs Grocery Store Analysis</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Farmers Markets */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-green-600">True Farmers Market Store Types:</h4>
            <ul className="list-disc list-inside text-sm">
              {data?.farmersMarketTypes.map(type => (
                <li key={type}>{type}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-green-600">Total Farmers Markets: {data?.totalFarmersMarkets}</h4>
          </div>

          <div>
            <h4 className="font-medium text-green-600">Sample Farmers Markets:</h4>
            <div className="text-sm space-y-1">
              {data?.sampleFarmersMarkets.slice(0, 5).map((store, index) => (
                <div key={index} className="border-l-2 border-green-200 pl-2">
                  <strong>{store.Store_Name}</strong> - {store.Store_Type} ({store.City}, {store.State})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grocery Stores */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-600">Grocery Store Types (with "Market"):</h4>
            <ul className="list-disc list-inside text-sm">
              {data?.groceryMarketTypes.slice(0, 10).map(type => (
                <li key={type}>{type}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-blue-600">Total Grocery "Markets": {data?.totalGroceryStores}</h4>
          </div>

          <div>
            <h4 className="font-medium text-blue-600">Sample Grocery Stores (should NOT be in farmers market):</h4>
            <div className="text-sm space-y-1">
              {data?.sampleGroceryStores.slice(0, 5).map((store, index) => (
                <div key={index} className="border-l-2 border-blue-200 pl-2">
                  <strong>{store.Store_Name}</strong> - {store.Store_Type} ({store.City}, {store.State})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
