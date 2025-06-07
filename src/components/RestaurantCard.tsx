import React from 'react';

interface RestaurantCardProps {
  id: string;
  name: string;
  address: string;
  category: string;
  rating: number;
  imageUrl: string;
  onViewDetails?: (id: string) => void;
  className?: string;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  address,
  category,
  rating,
  imageUrl,
  onViewDetails,
  className = ""
}) => {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(id);
    }
  };

  return (
    <article className={`bg-white w-full py-0.5 rounded-lg ${className}`}>
      <img
        src={imageUrl}
        alt={`${name} restaurant`}
        className="aspect-[1.39] object-contain w-full"
      />
      <div className="flex w-full flex-col items-stretch mt-[13px] px-[9px]">
        <div className="text-[rgba(52,168,83,1)] text-[10px] uppercase">
          {category}
        </div>
        <div className="flex items-stretch gap-5 justify-between">
          <div className="flex flex-col text-[#484848]">
            <h3 className="text-[#484848] text-base font-bold">
              {name}
            </h3>
            <address className="text-[#484848] text-sm font-light leading-[21px] self-stretch not-italic">
              {address.split(', ').map((line, index, array) => (
                <React.Fragment key={index}>
                  {line}
                  {index < array.length - 1 && <br />}
                </React.Fragment>
              ))}
            </address>
            <div className="flex items-stretch gap-1 text-xs text-[#008489] whitespace-nowrap">
              <span className="text-[#008489]">{rating}</span>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/bf796e69e3c3544899e5d10dcc6909f4dc57c7b0?placeholderIfAbsent=true"
                alt="Star rating"
                className="aspect-[1.14] object-contain w-2 fill-[#008489] shrink-0 my-auto"
              />
            </div>
          </div>
          <button
            onClick={handleViewDetails}
            className="bg-[rgba(2,77,54,1)] text-[10px] text-white text-center uppercase mt-[41px] px-[29px] py-[11px] rounded-lg hover:bg-[rgba(2,77,54,0.9)] transition-colors"
            aria-label={`View details for ${name}`}
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
};
