function normalize(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase();
}

function initPortfolioFilters() {
  const grids = document.querySelectorAll<HTMLElement>('[data-portfolio-grid]');

  grids.forEach((grid) => {
    if (grid.dataset.bound === 'true') return;

    const subcategoryButtons = Array.from(
      grid.querySelectorAll<HTMLButtonElement>('[data-filter-subcategory]')
    );
    const yearSelect = grid.querySelector<HTMLSelectElement>('[data-filter-year]');
    const locationSelect = grid.querySelector<HTMLSelectElement>('[data-filter-location]');
    const searchInput = grid.querySelector<HTMLInputElement>('[data-filter-search]');
    const clearButton = grid.querySelector<HTMLButtonElement>('[data-filter-clear]');
    const resultCount = grid.querySelector<HTMLElement>('[data-filter-result-count]');
    const noResults = grid.querySelector<HTMLElement>('[data-filter-empty]');
    const items = Array.from(grid.querySelectorAll<HTMLElement>('[data-portfolio-item]'));

    if (!resultCount || !searchInput) return;

    const applyFilters = () => {
      const activeSubcategory =
        subcategoryButtons.find((button) => button.dataset.active === 'true')?.dataset
          .filterSubcategory ?? '';
      const activeYear = yearSelect?.value ?? '';
      const activeLocation = normalize(locationSelect?.value);
      const query = normalize(searchInput.value);

      let visibleCount = 0;

      subcategoryButtons.forEach((button) => {
        button.dataset.active = button.dataset.filterSubcategory === activeSubcategory ? 'true' : 'false';
      });

      items.forEach((item) => {
        const subcategories = item.dataset.subcategories?.split(',').filter(Boolean) ?? [];
        const year = item.dataset.year ?? '';
        const location = normalize(item.dataset.location);
        const haystack = item.dataset.search ?? '';

        const matchesSubcategory = !activeSubcategory || subcategories.includes(activeSubcategory);
        const matchesYear = !activeYear || year === activeYear;
        const matchesLocation = !activeLocation || location === activeLocation;
        const matchesQuery = !query || haystack.includes(query);

        const visible = matchesSubcategory && matchesYear && matchesLocation && matchesQuery;

        item.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      resultCount.textContent = String(visibleCount);
      if (clearButton) {
        clearButton.hidden = !(activeSubcategory || activeYear || activeLocation || query);
      }
      if (noResults) {
        noResults.hidden = visibleCount !== 0;
      }
    };

    subcategoryButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextValue = button.dataset.filterSubcategory ?? '';
        const isActive = button.dataset.active === 'true';

        subcategoryButtons.forEach((candidate) => {
          candidate.dataset.active = 'false';
        });

        const resetButton = subcategoryButtons.find(
          (candidate) => (candidate.dataset.filterSubcategory ?? '') === ''
        );

        if (isActive || nextValue === '') {
          if (resetButton) resetButton.dataset.active = 'true';
        } else {
          button.dataset.active = 'true';
        }

        applyFilters();
      });
    });

    yearSelect?.addEventListener('change', applyFilters);
    locationSelect?.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    clearButton?.addEventListener('click', () => {
      if (yearSelect) yearSelect.value = '';
      if (locationSelect) locationSelect.value = '';
      searchInput.value = '';

      subcategoryButtons.forEach((button) => {
        button.dataset.active = button.dataset.filterSubcategory === '' ? 'true' : 'false';
      });

      applyFilters();
    });

    applyFilters();
    grid.dataset.bound = 'true';
  });
}

document.addEventListener('astro:page-load', initPortfolioFilters);
if (document.readyState !== 'loading') {
  initPortfolioFilters();
} else {
  document.addEventListener('DOMContentLoaded', initPortfolioFilters, { once: true });
}
