/**
 * Client behaviour for the wiki shell. Everything is idempotent and keyed off
 * `astro:page-load`, so it survives <ClientRouter /> navigations.
 */

const THEME_KEY = 'wiki-theme';
type Theme = 'dark' | 'light';

const root = document.documentElement;

/** UI strings are rendered server-side into `<body data-*>` so the script stays locale-agnostic. */
const uiText = (key: 'copy' | 'copied' | 'copyAria' | 'copyFail' | 'anchor', fallback: string) =>
  document.body.dataset[key] ?? fallback;

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme, persist = false) {
  root.dataset.theme = theme;
  if (!persist) return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage unavailable: the choice just won't persist */
  }
}

/* ---------- Theme ------------------------------------------------------ */

// Carry the resolved theme into the incoming document so there is no flash.
document.addEventListener('astro:before-swap', (event) => {
  const swap = event as Event & { newDocument: Document };
  swap.newDocument.documentElement.dataset.theme = root.dataset.theme ?? systemTheme();
});

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;

  if (target?.closest('[data-theme-toggle]')) {
    applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true);
    return;
  }

  if (target?.closest('[data-nav-toggle]')) {
    setNavOpen(!document.body.hasAttribute('data-nav-open'));
    return;
  }

  if (target?.closest('[data-nav-close]') || target?.closest('.nav-link')) {
    setNavOpen(false);
  }
});

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (!storedTheme()) applyTheme(systemTheme());
});

/* ---------- Mobile drawer --------------------------------------------- */

function setNavOpen(open: boolean) {
  document.body.toggleAttribute('data-nav-open', open);
  document
    .querySelector('[data-nav-toggle]')
    ?.setAttribute('aria-expanded', String(open));
}

/* ---------- Global shortcuts ------------------------------------------ */

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setNavOpen(false);

  const el = event.target as HTMLElement | null;
  const typing = el?.matches('input, textarea, select, [contenteditable]');
  if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) {
    const filter = document.querySelector<HTMLInputElement>('[data-nav-filter]');
    if (filter) {
      event.preventDefault();
      if (!document.body.hasAttribute('data-nav-open') && window.innerWidth < 900) setNavOpen(true);
      filter.focus();
      filter.select();
    }
  }
});

/* ---------- Sidebar: scroll memory + filter --------------------------- */

let sidebarScroll = 0;

document.addEventListener('astro:before-preparation', () => {
  sidebarScroll = document.querySelector('.sidebar')?.scrollTop ?? 0;
});

function initSidebar() {
  const sidebar = document.querySelector<HTMLElement>('.sidebar');
  if (sidebar) sidebar.scrollTop = sidebarScroll;
  document.querySelector('.nav-link.active')?.scrollIntoView({ block: 'nearest' });

  const filter = document.querySelector<HTMLInputElement>('[data-nav-filter]');
  if (!filter) return;

  const groups = [...document.querySelectorAll<HTMLElement>('.nav-group')];
  const empty = document.querySelector<HTMLElement>('[data-nav-empty]');

  const run = () => {
    const query = filter.value.trim().toLowerCase();
    let anyVisible = false;

    for (const group of groups) {
      let groupVisible = false;
      group.querySelectorAll<HTMLElement>('.nav-item').forEach((item) => {
        const match = !query || (item.textContent ?? '').toLowerCase().includes(query);
        item.hidden = !match;
        groupVisible ||= match;
      });
      group.hidden = !groupVisible;
      if (query && groupVisible) group.setAttribute('open', '');
      anyVisible ||= groupVisible;
    }
    if (empty) empty.hidden = anyVisible;
  };

  filter.addEventListener('input', run);
  filter.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      filter.value = '';
      run();
      filter.blur();
    } else if (event.key === 'Enter') {
      document.querySelector<HTMLAnchorElement>('.nav-item:not([hidden]) .nav-link')?.click();
    }
  });
}

/* ---------- Doc page: anchors, code blocks, TOC spy ------------------- */

const COPY_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
const CHECK_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>';

function initAnchors(article: HTMLElement) {
  article.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]').forEach((heading) => {
    if (heading.querySelector('.anchor')) return;
    const link = document.createElement('a');
    link.className = 'anchor';
    link.href = `#${heading.id}`;
    link.textContent = '#';
    link.setAttribute('aria-label', `${uiText('anchor', 'Link to section')}: ${heading.textContent}`);
    heading.append(link);
  });
}

function initCodeBlocks(article: HTMLElement) {
  article.querySelectorAll<HTMLPreElement>('pre.astro-code').forEach((pre) => {
    if (pre.parentElement?.classList.contains('code-block')) return;

    const lang = pre.dataset.language && pre.dataset.language !== 'plaintext' ? pre.dataset.language : '';
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';

    const bar = document.createElement('div');
    bar.className = 'code-bar';

    const label = document.createElement('span');
    label.className = 'code-lang';
    label.textContent = lang;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.innerHTML = `${COPY_ICON}<span>${uiText('copy', 'Copy')}</span>`;
    button.setAttribute('aria-label', uiText('copyAria', 'Copy code to clipboard'));

    let timer: number | undefined;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent ?? '');
        button.innerHTML = `${CHECK_ICON}<span>${uiText('copied', 'Copied')}</span>`;
        button.dataset.state = 'copied';
      } catch {
        button.innerHTML = `<span>${uiText('copyFail', 'Press Ctrl+C')}</span>`;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.innerHTML = `${COPY_ICON}<span>${uiText('copy', 'Copy')}</span>`;
        delete button.dataset.state;
      }, 1800);
    });

    bar.append(label, button);
    pre.replaceWith(wrapper);
    wrapper.append(bar, pre);
  });
}

let tocObserver: IntersectionObserver | undefined;

function initToc(article: HTMLElement) {
  tocObserver?.disconnect();
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc-link')];
  const scroller = document.querySelector<HTMLElement>('.content');
  if (!links.length || !scroller) return;

  const byId = new Map(links.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
  const headings = [...article.querySelectorAll<HTMLElement>('h2[id], h3[id]')].filter((h) =>
    byId.has(h.id),
  );

  const activate = (id: string) => {
    links.forEach((a) => {
      const on = a === byId.get(id);
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };

  tocObserver = new IntersectionObserver(
    (entries) => {
      // The topmost heading that crossed into the reading band wins.
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length) {
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        activate(visible[0].target.id);
      }
    },
    { root: scroller, rootMargin: '0px 0px -75% 0px', threshold: 0 },
  );
  headings.forEach((h) => tocObserver!.observe(h));
  if (headings[0]) activate(headings[0].id);
}

function initProgress() {
  const scroller = document.querySelector<HTMLElement>('.content');
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  if (!scroller || !bar) return;

  const update = () => {
    const max = scroller.scrollHeight - scroller.clientHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(scroller.scrollTop / max, 1) : 0})`;
  };
  scroller.addEventListener('scroll', update, { passive: true });
  update();
}

document.addEventListener('astro:page-load', () => {
  // The inline head script runs before first paint; this covers the swap case.
  applyTheme(root.dataset.theme === 'light' || root.dataset.theme === 'dark' ? (root.dataset.theme as Theme) : (storedTheme() ?? systemTheme()));

  setNavOpen(false);
  initSidebar();
  initProgress();

  const article = document.querySelector<HTMLElement>('.prose');
  if (article) {
    initAnchors(article);
    initCodeBlocks(article);
    initToc(article);
  }
});
