import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

interface LocationSelectorProps {
  onLocationSelect: (city: string, state: string) => void;
  selectedCity?: string;
  selectedState?: string;
  className?: string;
}

interface CityState {
  city: string;
  state: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  selectedCity = '',
  selectedState = '',
  className = ''
}) => {
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<CityState[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityState[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all states on component mount
  useEffect(() => {
    const loadStates = async () => {
      const { data } = await supabase
        .from('snap_stores')
        .select('State')
        .not('State', 'is', null)
        .order('State');
      
      if (data) {
        const uniqueStates = [...new Set(data.map(row => row.State))].filter(Boolean);
        setStates(uniqueStates);
      }
    };
    
    loadStates();
  }, []);

  // Load cities when state is selected
  useEffect(() => {
    if (selectedState) {
      const loadCities = async () => {
        setLoading(true);
        const { data } = await supabase
          .from('snap_stores')
          .select('City, State')
          .eq('State', selectedState)
          .not('City', 'is', null)
          .order('City');
        
        if (data) {
          // Clean and normalize city names
          const uniqueCities = [...new Set(
            data
              .map(row => row.City?.trim())
              .filter(Boolean)
              .filter(city => !/^\d+$/.test(city)) // Filter out ZIP codes that appear as cities
          )].map(city => ({
            city,
            state: selectedState
          }));
          
          setCities(uniqueCities);
          setFilteredCities(uniqueCities);
        }
        setLoading(false);
      };
      
      loadCities();
    } else {
      setCities([]);
      setFilteredCities([]);
    }
  }, [selectedState]);

  const handleStateSelect = (state: string) => {
    setStateOpen(false);
    if (selectedCity && selectedState !== state) {
      // Clear city selection if state changes
      onLocationSelect('', state);
    } else {
      onLocationSelect(selectedCity, state);
    }
  };

  const handleCitySelect = (city: string) => {
    setCityOpen(false);
    onLocationSelect(city, selectedState);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* State Selector */}
      <Popover open={stateOpen} onOpenChange={setStateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={stateOpen}
            className="w-[120px] justify-between bg-background"
          >
            {selectedState || "State"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 bg-background border shadow-md z-50">
          <Command>
            <CommandInput placeholder="Search states..." />
            <CommandList>
              <CommandEmpty>No states found.</CommandEmpty>
              <CommandGroup>
                {states.map((state) => (
                  <CommandItem
                    key={state}
                    value={state}
                    onSelect={() => handleStateSelect(state)}
                    className="hover:bg-muted cursor-pointer"
                  >
                    {state}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* City Selector */}
      <Popover open={cityOpen} onOpenChange={setCityOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={cityOpen}
            disabled={!selectedState || loading}
            className="w-[200px] justify-between bg-background"
          >
            <MapPin className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">
              {loading ? "Loading..." : selectedCity || "Select city"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0 bg-background border shadow-md z-50">
          <Command>
            <CommandInput placeholder="Search cities..." />
            <CommandList>
              <CommandEmpty>
                {selectedState ? "No cities found." : "Select a state first"}
              </CommandEmpty>
              <CommandGroup>
                {filteredCities.map((cityData) => (
                  <CommandItem
                    key={`${cityData.city}-${cityData.state}`}
                    value={cityData.city}
                    onSelect={() => handleCitySelect(cityData.city)}
                    className="hover:bg-muted cursor-pointer"
                  >
                    {cityData.city}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};