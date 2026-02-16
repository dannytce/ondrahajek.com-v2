interface PlayerProps {
  title: string;
  video: string;
}

export function Player({ title, video }: PlayerProps) {
  return (
    <div className="h-full">
      <div className="w-full h-0 pb-[56.25%] relative">
        <iframe
          src={`${video}/?autoplay=1&loop=1&autopause=0`}
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
