
import React from 'react';

interface SmartSearchPillsProps {
  setStoreQuery: (store: string) => void;
  setLocationQuery: (loc: string) => void;
}

export const SmartSearchPills: React.FC<SmartSearchPillsProps> = ({
  setStoreQuery,
  setLocationQuery,
}) => (
  <div className="space-y-2">
    <p className="text-xs text-muted-foreground text-center">Try these examples:</p>
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        type="button"
        onClick={() => {
          setStoreQuery('domino');
          setLocationQuery('fresno');
        }}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
      >
        domino fresno
      </button>
      <button
        type="button"
        onClick={() => {
          setStoreQuery('chickn');
          setLocationQuery('90015');
        }}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
      >
        chickn 90015
      </button>
      <button
        type="button"
        onClick={() => {
          setStoreQuery('tacc bell');
          setLocationQuery('');
        }}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
      >
        tacc bell
      </button>
      <button
        type="button"
        onClick={() => {
          setStoreQuery('bakery');
          setLocationQuery('los angeles');
        }}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
      >
        bakery los angeles
      </button>
    </div>
  </div>
);
