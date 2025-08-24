import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  lazy = true,
  className,
  width,
  height,
  onLoad: onLoadProp,
  onError: onErrorProp,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  const handleLoad = () => {
    setIsLoading(false);
    setIsError(false);
    onLoadProp?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
    onErrorProp?.();
  };

  const imageSrc = isError && fallbackSrc ? fallbackSrc : src;

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        isLoading && "animate-pulse bg-muted",
        className
      )}
    >
      {isVisible && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          {...props}
        />
      )}
      
      {isLoading && lazy && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
};