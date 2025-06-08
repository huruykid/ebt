
import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Ex. Veggie Burger",
  className = "",
  initialValue = ""
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  // Update internal state when initialValue changes
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex w-full items-stretch gap-[5px] ${className}`}>
      <div className="bg-white flex items-stretch gap-2.5 grow shrink basis-auto pl-3 pr-[63px] py-2.5 rounded-[10px]">
        <div className="flex gap-2.5">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/dfcdb2ff55e023290e52ce46595241d8daec4458?placeholderIfAbsent=true"
            alt="Search icon"
            className="aspect-[1] object-contain w-5"
          />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="gap-2.5 text-sm text-[rgba(196,196,196,1)] font-normal bg-transparent border-none outline-none flex-1"
          aria-label="Search for food"
        />
      </div>
      <button
        type="submit"
        className="bg-[rgba(2,77,54,1)] flex min-h-[41px] items-center gap-2.5 w-[41px] justify-center h-[41px] px-[17px] rounded-[10px] hover:bg-[rgba(2,77,54,0.9)] transition-colors"
        aria-label="Search"
      >
        <div className="self-stretch flex w-[7px] items-center gap-2.5 justify-center my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/7f3ba8ffdfa1c176fee82ccd55841146e33e4993?placeholderIfAbsent=true"
            alt="Go arrow"
            className="aspect-[0.5] object-contain w-[7px] self-stretch my-auto"
          />
        </div>
      </button>
    </form>
  );
};
