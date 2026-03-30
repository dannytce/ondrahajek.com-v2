interface PlayerProps {
  title: string;
  video: string;
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

export function Player({ title, video }: PlayerProps) {
  return (
    <div className="h-full">
      <div className="w-full h-0 pb-[56.25%] relative">
        <iframe
          src={buildIframeSrc(video)}
          title={`${title} video`}
          style={{ border: 0 }}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="absolute w-full h-full max-h-[calc(100vh-120px)] top-0 left-0 shadow-[0_10px_30px_rgba(0,0,0,0.75)]"
        />
      </div>
    </div>
  );
}
