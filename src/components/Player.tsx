import { useState } from 'react';
import { DatoImage } from '~/components/DatoImage';
import type { ResponsiveImage } from '~/api/generated/types';

interface PlayerProps {
  title: string;
  video: string;
  poster?: ResponsiveImage | null;
  transitionName?: string;
}

function buildIframeSrc(video: string): string {
  const base = video.trim().replace(/\/$/, '');
  try {
    const u = new URL(base);
    u.searchParams.set('autoplay', '1');
    u.searchParams.set('loop', '1');
    u.searchParams.set('autopause', '0');
    if (u.hostname.includes('youtube.com') && u.pathname.includes('/embed/')) {
      const id = u.pathname.split('/').pop();
      if (id) {
        u.searchParams.set('playlist', id);
      }
    }
    return u.toString();
  } catch {
    return `${base}/?autoplay=1&loop=1&autopause=0`;
  }
}

export function Player({ title, video, poster, transitionName }: PlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="h-full">
      <div className="relative w-full overflow-hidden bg-black shadow-[0_10px_30px_rgba(0,0,0,0.75)]">
        {poster && (
          <div
            className="absolute inset-0 z-10 transition-opacity duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              opacity: isLoaded ? 0 : 1,
              pointerEvents: isLoaded ? 'none' : 'auto',
              viewTransitionName: transitionName,
            }}
          >
            <DatoImage
              data={{
                ...poster,
                alt: '',
              }}
              className="absolute inset-0"
              imgClassName="h-full w-full object-cover"
              priority
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
        <div className="w-full h-0 pb-[56.25%] relative">
          <iframe
            src={buildIframeSrc(video)}
            title={`${title} video`}
            allow="autoplay; fullscreen"
            onLoad={() => setIsLoaded(true)}
            className="absolute w-full h-full max-h-[calc(100vh-120px)] top-0 left-0 transition-opacity duration-[260ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ opacity: isLoaded || !poster ? 1 : 0, border: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
