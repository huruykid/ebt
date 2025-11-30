// Image optimization utilities for better performance

export const optimizeImage = (url: string, width?: number, quality = 80): string => {
  // For Unsplash images, use their optimization params
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    params.set('auto', 'format');
    params.set('fit', 'crop');
    return `${url}?${params.toString()}`;
  }
  return url;
};

export const getImageSrcSet = (url: string, sizes: number[]): string => {
  return sizes.map(size => `${optimizeImage(url, size)} ${size}w`).join(', ');
};

export const lazyLoadImage = (img: HTMLImageElement) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        if (target.dataset.src) {
          target.src = target.dataset.src;
          target.removeAttribute('data-src');
        }
        observer.unobserve(target);
      }
    });
  }, {
    rootMargin: '50px',
  });

  observer.observe(img);
};

// Preload critical images
export const preloadCriticalImages = (urls: string[]) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};
