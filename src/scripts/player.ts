function initPlayers() {
  const players = document.querySelectorAll<HTMLElement>('[data-player-root]');

  players.forEach((player) => {
    if (player.dataset.bound === 'true') return;

    const iframe = player.querySelector<HTMLIFrameElement>('iframe');
    if (!iframe) return;

    const onLoad = () => {
      player.dataset.loaded = 'true';
    };

    iframe.addEventListener('load', onLoad);

    if (iframe.src) {
      player.dataset.loading = 'true';
    }

    player.dataset.bound = 'true';
  });
}

document.addEventListener('astro:page-load', initPlayers);
if (document.readyState !== 'loading') {
  initPlayers();
} else {
  document.addEventListener('DOMContentLoaded', initPlayers, { once: true });
}
