import React, { useEffect, useRef, useState } from 'react';
import { getRootMargin } from '../lazy/NetworkProfile';
import { LazyConfig } from '../lazy/LazyConfig';
import { lazyAgent } from '../runtime/LazyAgent';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholder: string;
  rootMarginOverride?: string;
}

export function LazyImage({ src, placeholder, rootMarginOverride, ...props }: LazyImageProps) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
            lazyAgent.log({ type: 'IMAGE_VISIBLE', id: src });
            observer.disconnect();
          }
        },
        { rootMargin: margin, threshold: 0.01 }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    } catch (e) {
      lazyAgent.log({ type: 'OBSERVER_ERROR', error: String(e) });
      setVisible(true);
    }
  }, [rootMarginOverride, src]);

  const id = (props as any)['data-lazy-id'] ?? src;

  return (
    <img
      ref={ref}
      src={visible ? src : placeholder}
      data-lazy-id={id}
      data-full-src={src}
      onLoad={() => setLoaded(true)}
      onError={() => lazyAgent.log({ type: 'IMAGE_ERROR', id, error: 'load_error' })}
      style={{
        filter: visible && loaded ? 'blur(0px)' : 'blur(12px)',
        transition: 'filter 0.35s ease-out',
      }}
      {...props}
    />
  );
}

export default LazyImage;
