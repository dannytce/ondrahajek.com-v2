const logos: Array<
  | { src: string; alt: string }
  | { src: string; srcSet: string; width: number; height: number; alt: string }
> = [
  { src: '/logos/jagermaister.svg', alt: 'Jagermaister' },
  { src: '/logos/lexus.svg', alt: 'Lexus' },
  { src: '/logos/vans.svg', alt: 'Vans' },
  { src: '/logos/jameson.svg', alt: 'Jameson' },
  { src: '/logos/skoda.svg', alt: 'Škoda Auto' },
  {
    src: '/logos/dawson.png',
    srcSet: '/logos/dawson.png 1x, /logos/dawson@2x.png 2x',
    width: 108,
    height: 32,
    alt: 'Dawson',
  },
  {
    src: '/logos/bubble.png',
    srcSet: '/logos/bubble.png 1x, /logos/bubble@2x.png 2x',
    width: 67,
    height: 67,
    alt: 'Bubble',
  },
  {
    src: '/logos/etnetera.png',
    srcSet: '/logos/etnetera.png 1x, /logos/etnetera@2x.png 2x',
    width: 89,
    height: 44,
    alt: 'Etnetera & Motion',
  },
  { src: '/logos/cd.svg', alt: 'České dráhy' },
];

export function TrustedBy() {
  return (
    <div className="absolute w-full bottom-[30px] z-trustedBy">
      <div className="w-full max-w-container mx-auto px-[15px] xl:px-0 flex flex-wrap">
        <h3 className="w-full text-secondary uppercase text-[1.4rem] font-normal tracking-widest m-0 mb-4 p-0">
          Trusted by
        </h3>
        <ul className="w-full overflow-auto p-0 list-none flex items-center justify-between">
          {logos.map((logo, i) => (
            <li
              key={logo.alt}
              className="mx-5 first:ml-0 last:mr-0 opacity-0 animate-fadeIn"
              style={{ animationDelay: `${i * 0.09}s` }}
            >
              {'srcSet' in logo ? (
                <img
                  src={logo.src}
                  srcSet={logo.srcSet}
                  width={logo.width}
                  height={logo.height}
                  alt={logo.alt}
                />
              ) : (
                <img src={logo.src} alt={logo.alt} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
