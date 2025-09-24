'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SEOImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export function SEOImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  loading = 'lazy',
  onLoad,
  onError,
}: SEOImageProps) {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  const handleLoad = () => {
    onLoad?.();
  };

  if (imageError) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          Image failed to load
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes={sizes}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      // SEO optimizations
      fetchPriority={priority ? 'high' : 'auto'}
      // Ensure proper aspect ratio for CLS prevention
      style={{
        width: '100%',
        height: 'auto',
      }}
    />
  );
}

// Pre-built image components for common use cases
export function HeroImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <SEOImage
      src={src}
      alt={alt}
      width={1200}
      height={630}
      priority={true}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      quality={90}
    />
  );
}

export function FeatureImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <SEOImage
      src={src}
      alt={alt}
      width={600}
      height={400}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
      quality={85}
    />
  );
}

export function AvatarImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <SEOImage
      src={src}
      alt={alt}
      width={100}
      height={100}
      className={`rounded-full ${className}`}
      sizes="(max-width: 768px) 80px, 100px"
      quality={90}
    />
  );
}

export function LogoImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <SEOImage
      src={src}
      alt={alt}
      width={200}
      height={60}
      priority={true}
      className={className}
      sizes="(max-width: 768px) 150px, 200px"
      quality={95}
    />
  );
}
