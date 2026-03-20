import React, { useEffect, useRef, useState } from 'react';
import { getRootMargin } from '../lazy/NetworkProfile';
import { LazyConfig } from '../lazy/LazyConfig';

export interface LazyBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  placeholder: string;
  rootMarginOverride?: string;
}

export function LazyBackground({ src, placeholder, rootMarginOverride, style, ...props }: LazyBackgroundProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || !LazyConfig.enabled) {
      setVisible(true);
      return;
    }

    const margin = rootMarginOverride ?? getRootMargin(LazyConfig.networkProfile);

    try {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin: margin, threshold: 0.01 }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    } catch {
      setVisible(true);
    }
  }, [rootMarginOverride, src]);

  return (
    <div
      ref={ref}
      style={{
        backgroundImage: `url(${visible ? src : placeholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.35s ease-out',
        ...style,
      }}
      {...props}
    />
  );
}

export default LazyBackground;
