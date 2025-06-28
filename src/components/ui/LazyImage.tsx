import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  placeholder?: React.ReactNode;
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholder,
  fallback = '/images/placeholder.png',
  className,
  style,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer による遅延読み込み
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // 50px手前で読み込み開始
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const defaultPlaceholder = (
    <Skeleton
      variant="rectangular"
      width={width || '100%'}
      height={height || 200}
      animation="wave"
    />
  );

  return (
    <Box
      ref={imgRef}
      width={width}
      height={height}
      position="relative"
      overflow="hidden"
      className={className}
      style={style}
    >
      {!isVisible && (placeholder || defaultPlaceholder)}
      
      {isVisible && (
        <>
          {!isLoaded && !isError && (placeholder || defaultPlaceholder)}
          
          <img
            src={isError ? fallback : src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              position: isLoaded ? 'static' : 'absolute',
              top: 0,
              left: 0,
            }}
            loading="lazy"
          />
        </>
      )}
    </Box>
  );
};

export default LazyImage;