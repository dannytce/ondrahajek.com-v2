import type { ResponsiveImage } from '~/api/generated/types';

interface DatoImageProps {
  data: ResponsiveImage & { alt?: string };
  className?: string;
}

export function DatoImage({ data, className }: DatoImageProps) {
  const { src, srcSet, webpSrcSet, sizes, width, height, alt = '', title } = data;
  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        alt={alt}
        title={title ?? undefined}
        className={className}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
