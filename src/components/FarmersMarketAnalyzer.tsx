
import React from 'react';
import { useFarmersMarketAnalysis } from '@/hooks/useFarmersMarketAnalysis';
import { LoadingSpinner } from './LoadingSpinner';

export const FarmersMarketAnalyzer: React.FC = () => {
  const { data, isLoading, error } = useFarmersMarketAnalysis();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error analyzing farmers market data</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Farmers Market Analysis</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Potential Store Types for Farmers Markets:</h4>
          <ul className="list-disc list-inside text-sm">
            {data?.potentialStoreTypes.map(type => (
              <li key={type}>{type}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium">Total Stores with Market/Farm/Produce in Name: {data?.totalMarketStores}</h4>
        </div>

        <div>
          <h4 className="font-medium">Sample Market Stores:</h4>
          <div className="text-sm space-y-1">
            {data?.sampleStores.slice(0, 10).map((store, index) => (
              <div key={index} className="border-l-2 border-green-200 pl-2">
                <strong>{store.Store_Name}</strong> - {store.Store_Type} ({store.City}, {store.State})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
