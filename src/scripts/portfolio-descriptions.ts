function initPortfolioDescriptions() {
  const roots = document.querySelectorAll<HTMLElement>('[data-portfolio-descriptions]');

  roots.forEach((root) => {
    if (root.dataset.bound === 'true') return;

    const toggle = root.querySelector<HTMLButtonElement>('[data-description-toggle]');
    const content = root.querySelector<HTMLElement>('[data-description-secondary]');
    const collapsedLabel = toggle?.dataset.labelCollapsed ?? '';
    const expandedLabel = toggle?.dataset.labelExpanded ?? '';

    if (!toggle || !content) return;

    const sync = () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      content.hidden = !expanded;
      toggle.textContent = expanded ? expandedLabel : collapsedLabel;
    };

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      sync();
    });

    sync();
    root.dataset.bound = 'true';
  });
}

document.addEventListener('astro:page-load', initPortfolioDescriptions);
if (document.readyState !== 'loading') {
  initPortfolioDescriptions();
} else {
  document.addEventListener('DOMContentLoaded', initPortfolioDescriptions, { once: true });
}
