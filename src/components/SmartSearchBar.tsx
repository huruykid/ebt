import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StoreQueryInput } from './StoreQueryInput';
import { LocationQueryInput } from './LocationQueryInput';
import { SmartSearchPills } from './SmartSearchPills';
import { useToast } from "@/components/ui/use-toast";

// US States (abbr, name)
const US_STATES = [
  { abbr: "AL", name: "Alabama" },   { abbr: "AK", name: "Alaska" },    { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" },  { abbr: "CA", name: "California" },{ abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" },{ abbr: "DE", name: "Delaware" }, { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" },   { abbr: "HI", name: "Hawaii" },    { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" },  { abbr: "IN", name: "Indiana" },   { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" },    { abbr: "KY", name: "Kentucky" },  { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" },     { abbr: "MD", name: "Maryland" },  { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" },  { abbr: "MN", name: "Minnesota" }, { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" },  { abbr: "MT", name: "Montana" },   { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" },    { abbr: "NH", name: "New Hampshire" },{ abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" },{ abbr: "NY", name: "New York" },  { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" },{ abbr: "OH", name: "Ohio" },    { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" },    { abbr: "PA", name: "Pennsylvania" },{ abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" },{ abbr: "SD", name: "South Dakota" },{ abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" },     { abbr: "UT", name: "Utah" },      { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" },  { abbr: "WA", name: "Washington" },{ abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" }, { abbr: "WY", name: "Wyoming" }
];

interface SmartSearchBarProps {
  onSearch: (searchText: string, city?: string, zipCode?: string, state?: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  initialSearchText?: string;
  initialCity?: string;
  initialZip?: string;
  initialState?: string;
}

const popularStoreTypes = [
  'Domino\'s', 'McDonald\'s', 'Walmart', 'Target', 'Subway', 'Pizza Hut',
  'Bakery', 'Corner Store', 'Dollar Store', 'Grocery Store', 'Taco Bell'
];

const popularLocations = [
  'Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fresno', 'Sacramento', 'Oakland', 'Long Beach'
];

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onSearch,
  onClear,
  className = "",
  initialSearchText = "",
  initialCity = "",
  initialZip = "",
  initialState = ""
}) => {
  // Helper: parse "city, state" from input and auto-select state
  const getInitialState = () => {
    if (initialState) return initialState;
    const searchParams = new URLSearchParams(window.location.search);
    const urlState = searchParams.get('state');
    return urlState || "CA";
  };

  const [storeQuery, setStoreQuery] = useState(initialSearchText);
  const [locationQuery, setLocationQuery] = useState(initialCity || initialZip);
  const [stateQuery, setStateQuery] = useState(getInitialState());
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const { toast } = useToast();

  // auto-split city,state inputs
  const handleLocationChange = (value: string) => {
    // Match "city, state" or "city, ST"
    const match = value.match(/^(.+),\s*([A-Za-z]{2})$/);
    if (match) {
      setLocationQuery(match[1].trim());
      // Ensure valid state
      const found = US_STATES.find(
        st => st.abbr.toLowerCase() === match[2].trim().toLowerCase()
      );
      if (found) {
        setStateQuery(found.abbr);
      }
    } else {
      setLocationQuery(value);
    }
    setShowLocationSuggestions(value.length > 0);
  };

  const filteredStoreTypes = popularStoreTypes.filter(type =>
    storeQuery && type.toLowerCase().includes(storeQuery.toLowerCase())
  ).slice(0, 5);

  const filteredLocations = popularLocations.filter(location =>
    locationQuery && location.toLowerCase().includes(locationQuery.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isZipCode = /^\d{5}(-\d{4})?$/.test(locationQuery.trim());
    const city = isZipCode ? undefined : locationQuery.trim() || undefined;
    const zipCode = isZipCode ? locationQuery.trim() : undefined;
    // Require state when city or zip is present
    if ((city || zipCode) && !stateQuery) {
      toast({
        variant: "destructive",
        title: "State required",
        description: "Please select a state when searching by city or zip code."
      });
      return;
    }
    onSearch(storeQuery.trim(), city, zipCode, stateQuery);
    setShowStoreSuggestions(false);
    setShowLocationSuggestions(false);
  };

  const handleClear = () => {
    setStoreQuery('');
    setLocationQuery('');
    setStateQuery(getInitialState());
    setShowStoreSuggestions(false);
    setShowLocationSuggestions(false);
    onClear?.();
  };

  const hasContent = storeQuery.trim() || locationQuery.trim();

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <StoreQueryInput
            value={storeQuery}
            onChange={setStoreQuery}
            onSuggestionClick={(s) => { setStoreQuery(s); setShowStoreSuggestions(false); }}
            suggestions={filteredStoreTypes}
            showSuggestions={showStoreSuggestions}
            setShowSuggestions={setShowStoreSuggestions}
          />
          <div className="flex w-full flex-1 gap-2">
            <LocationQueryInput
              value={locationQuery}
              onChange={handleLocationChange}
              onSuggestionClick={(s) => { setLocationQuery(s); setShowLocationSuggestions(false); }}
              suggestions={filteredLocations}
              showSuggestions={showLocationSuggestions}
              setShowSuggestions={setShowLocationSuggestions}
              state={stateQuery}
              setState={setStateQuery}
              placeholder="City or ZIP (ex: Fresno or 91301)"
            />

            {/* US State Dropdown - always shown */}
            <select
              value={stateQuery}
              onChange={(e) => setStateQuery(e.target.value)}
              className="border border-input rounded-md px-1.5 py-2 bg-background text-sm w-24 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="State"
              required={!!locationQuery}
              style={{ minWidth: 90 }}
            >
              <option value="">State</option>
              {US_STATES.map((st) => (
                <option value={st.abbr} key={st.abbr}>{st.abbr}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 sm:w-auto w-full">
            {hasContent && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClear}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" className="sm:w-auto w-full">
              Search
            </Button>
          </div>
        </div>
        <SmartSearchPills setStoreQuery={setStoreQuery} setLocationQuery={setLocationQuery} />
      </form>
    </div>
  );
};
