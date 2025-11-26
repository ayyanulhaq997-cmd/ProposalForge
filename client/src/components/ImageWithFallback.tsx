import { useState } from "react";

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  showMessage?: boolean;
  message?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackClassName = "w-full h-full bg-gradient-to-br from-primary/5 via-primary/3 to-primary/5",
  showMessage = false,
  message = "Image Unavailable",
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(!src);
  const [isLoading, setIsLoading] = useState(!!src);

  if (!src || hasError) {
    return (
      <div 
        className={fallbackClassName}
        style={{
          background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.12) 0%, rgba(233, 30, 99, 0.08) 50%, rgba(233, 30, 99, 0.12) 100%)'
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        setHasError(true);
        setIsLoading(false);
      }}
      onLoad={() => setIsLoading(false)}
    />
  );
}

interface AvatarWithFallbackProps {
  src?: string | null;
  alt: string;
  initials?: string;
  className?: string;
}

export function AvatarWithFallback({
  src,
  alt,
  initials = "U",
  className = "h-10 w-10",
}: AvatarWithFallbackProps) {
  const [hasError, setHasError] = useState(!src);

  if (!src || hasError) {
    return (
      <div
        className={`${className} rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20`}
      >
        <span className="text-sm font-semibold text-primary">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} rounded-full object-cover`}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}
