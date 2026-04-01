import type { CSSProperties } from 'react';
import type { ResponsiveImage } from '~/api/generated/types';

interface DatoImageProps {
  data: ResponsiveImage & { alt?: string };
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  layout?: 'intrinsic' | 'fixed' | 'responsive' | 'fill';
  objectFit?: CSSProperties['objectFit'];
  objectPosition?: CSSProperties['objectPosition'];
}

export function DatoImage({
  data,
  className,
  imgClassName,
  priority = false,
  sizes,
  layout = 'responsive',
  objectFit,
  objectPosition,
}: DatoImageProps) {
  const placeholderStyle: CSSProperties | undefined = data.base64
    ? {
        backgroundImage: `url("${data.base64}")`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '50% 50%',
        color: 'transparent',
      }
    : data.bgColor
      ? {
          backgroundColor: data.bgColor,
          color: 'transparent',
        }
      : undefined;

  const imgStyle: CSSProperties =
    layout === 'fill'
      ? {
          width: '100%',
          height: '100%',
          objectFit,
          objectPosition,
        }
      : {
          width: '100%',
          height: 'auto',
          objectFit,
          objectPosition,
        };

  return (
    <picture className={className}>
      {data.webpSrcSet && <source type="image/webp" srcSet={data.webpSrcSet} sizes={sizes ?? data.sizes ?? undefined} />}
      {data.srcSet && <source srcSet={data.srcSet} sizes={sizes ?? data.sizes ?? undefined} />}
      <img
        src={data.src ?? undefined}
        srcSet={data.srcSet ?? undefined}
        sizes={sizes ?? data.sizes ?? undefined}
        width={layout === 'fill' ? undefined : data.width ?? undefined}
        height={layout === 'fill' ? undefined : data.height ?? undefined}
        alt={data.alt ?? ''}
        title={data.title ?? undefined}
        className={imgClassName}
        style={{ ...placeholderStyle, ...imgStyle }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </picture>
  );
}
