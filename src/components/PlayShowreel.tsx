import { useState } from 'react';
import { Modal } from '~/components/Modal';
import { Player } from '~/components/Player';

function useModal() {
  const [isShown, setIsShown] = useState(false);
  const toggle = (event: unknown) => {
    if (event && typeof event === 'object' && 'preventDefault' in event) {
      (event as { preventDefault: () => void }).preventDefault();
    }
    setIsShown((prev) => !prev);
  };
  return { isShown, toggle };
}

export function PlayShowreel() {
  const { isShown, toggle } = useModal();

  return (
    <div className="flex items-center justify-center my-[125px] -mb-[125px] md:flex-1 md:my-0">
      <a
        href="https://vimeo.com/245268560"
        onClick={toggle}
        title="Play Showreel"
        className="text-white font-teko font-bold uppercase no-underline flex items-center justify-center outline-none p-0 md:p-[50px] link-animation hover:[&_.play-circle]:border-white/80 group"
      >
        <span className="relative flex text-center w-[70px] h-[70px] mr-[25px] pr-0.5 rounded-full bg-white border-[8px] border-white/20 bg-clip-padding transition-all duration-[0.8s] items-center justify-center play-circle">
          <span className="absolute top-1/2 left-1/2 rounded-full bg-white/10 h-10 w-10 -ml-5 -mt-5 -z-10 md:h-20 md:w-20 md:-ml-10 md:-mt-10 md:opacity-0 md:animate-circleExpand" />
          <span className="absolute top-1/2 left-1/2 rounded-full bg-white/10 h-10 w-10 -ml-5 -mt-5 -z-10 md:h-20 md:w-20 md:-ml-10 md:-mt-10 md:opacity-0 md:animate-circleExpand md:[animation-delay:2s]" />
          <svg
            className="ml-[5px]"
            width="14"
            height="16"
            viewBox="0 0 14 16"
            fill="none"
          >
            <path
              d="M1.50389526,0.136099186 L13.5032156,7.13615397 L13.5032156,7.13615397 C13.9802597,7.41444764 14.1413788,8.02676989 13.8630851,8.50381399 C13.7761718,8.65279876 13.6522004,8.77677011 13.5032156,8.8636835 L1.50389526,15.8637383 L1.50389526,15.8637383 C1.02685115,16.1420319 0.414528904,15.9809129 0.136235236,15.5038688 C0.0470134485,15.350927 -5.14889621e-16,15.1770377 -2.22044605e-16,14.9999735 L0,0.99986395 L-4.4408921e-16,0.99986395 C-2.66460887e-16,0.4475792 0.44771525,-0.000136050417 1,-0.000136050417 C1.17706415,-0.000136050417 1.35095348,0.0468773981 1.50389526,0.136099186 Z"
              fill="#212327"
              fillRule="evenodd"
            />
          </svg>
        </span>
        Play Showreel
      </a>
      <Modal isOpen={isShown} onRequestClose={toggle}>
        <Player video="https://player.vimeo.com/video/435073664" title="Showreel" />
      </Modal>
    </div>
  );
}
