
import React from 'react';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <header className={`flex w-full items-stretch gap-5 justify-between ${className}`}>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/c5565a0c0e361c929aa9c0ea77256d2e5da7afc7?placeholderIfAbsent=true"
        alt="Primary logo"
        className="aspect-[5.29] object-contain w-[53px] shrink-0 my-auto"
      />
      <div className="flex items-center gap-4">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/10f51803ec573fd3f1642bc0f05dd1b964decf64?placeholderIfAbsent=true"
          alt="Secondary logo"
          className="aspect-[5.15] object-contain w-[67px] shrink-0"
        />
        <UserMenu />
      </div>
    </header>
  );
};
