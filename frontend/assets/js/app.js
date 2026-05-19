(function () {
  const state = {
    user: null,
    genres: [],
    authors: [],
    books: [],
    heroBooks: [],
    homeSections: null,
    explorePage: 1,
    exploreTotalPages: 1,
    exploreQuery: '',
    exploreFilters: {},
    searchSuggestions: [],
    searchHistory: [],
    heroTimer: null,
    loading: false,
    adminData: null
  };

  const els = {
    pageContent: document.getElementById('pageContent'),
    filtersPanel: document.getElementById('filtersPanel'),
    toastRoot: document.getElementById('toastRoot'),
    modalRoot: document.getElementById('modalRoot'),
    loadingBar: document.getElementById('loadingBar'),
    searchInput: document.getElementById('globalSearch'),
    searchSuggestions: document.getElementById('searchSuggestions'),
    logoutButton: document.getElementById('logoutButton'),
    adminNavLink: document.getElementById('adminNavLink'),
    searchButton: document.getElementById('searchButton')
  };

  const genreOrder = [
    'Fiction', 'Mystery', 'Romance', 'Thriller', 'Self-help', 'Biography', 'History', 'Fantasy',
    'Science Fiction', 'Spiritual', 'Poetry', 'Hindi Literature', 'Philosophy', 'Motivation', 'Business'
  ];

  const authGenres = genreOrder;

  const resolveRoute = (name) => {
    const map = {
      home: renderHomePage,
      explore: renderExplorePage,
      wishlist: renderWishlistPage,
      profile: renderProfilePage,
      admin: renderAdminPage,
      login: renderLoginPage,
      signup: renderSignupPage,
      book: renderBookPage,
      author: renderAuthorPage
    };
    return map[name];
  };

  const escapeHtml = (value = '') =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const fallbackBookCover = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2440"/><stop offset="1" stop-color="#0e1429"/></linearGradient></defs><rect width="600" height="900" fill="url(#g)"/><rect x="54" y="80" width="492" height="740" rx="36" fill="none" stroke="#7cf0cc" stroke-opacity="0.35" stroke-width="4"/><text x="300" y="420" text-anchor="middle" fill="#f5f7ff" font-size="54" font-family="Segoe UI,Arial,sans-serif" font-weight="700">BookVerse</text><text x="300" y="490" text-anchor="middle" fill="#c7d4ff" font-size="34" font-family="Segoe UI,Arial,sans-serif">No Cover Available</text></svg>'
  )}`;

  const safeCoverSrc = (coverImage) => {
    const src = String(coverImage || '').trim();
    if (!src) return fallbackBookCover;
    if (/^data:image\//i.test(src) || src.startsWith('/')) return src;
    try {
      const url = new URL(src, window.location.origin);
      const trustedHosts = new Set(['picsum.photos', 'images.unsplash.com']);
      const isSameOrigin = url.origin === window.location.origin;
      const isTrustedHost = trustedHosts.has(url.hostname);
      return isSameOrigin || isTrustedHost ? url.href : fallbackBookCover;
    } catch (_error) {
      return fallbackBookCover;
    }
  };

  const coverImgTag = (coverImage, title, className = '') =>
    `<img ${className ? `class="${className}" ` : ''}src="${escapeHtml(safeCoverSrc(coverImage))}" alt="${escapeHtml(title)}" loading="lazy" data-book-cover="1" />`;

  const bindCoverFallbacks = (root = document) => {
    root.querySelectorAll('img[data-book-cover]').forEach((img) => {
      if (img.dataset.fallbackBound) return;
      img.dataset.fallbackBound = '1';
      img.addEventListener('error', () => {
        img.src = fallbackBookCover;
      }, { once: true });
      if (img.complete && img.naturalWidth === 0) {
        img.src = fallbackBookCover;
      }
    });
  };

  const forceScrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    ['.content-shell', '.layout-shell', '#pageContent'].forEach((selector) => {
      const node = document.querySelector(selector);
      if (node) node.scrollTop = 0;
    });
  };

  const toast = (message, kind = 'success') => {
    const node = document.createElement('div');
    node.className = `toast toast-${kind}`;
    node.textContent = message;
    els.toastRoot.appendChild(node);
    requestAnimationFrame(() => node.classList.add('show'));
    setTimeout(() => {
      node.classList.remove('show');
      setTimeout(() => node.remove(), 220);
    }, 2600);
  };

  const setLoading = (loading) => {
    state.loading = loading;
    els.loadingBar.classList.toggle('hidden', !loading);
  };

  const openModal = (title, bodyHtml, actionsHtml = '') => {
    els.modalRoot.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal glass">
          <div class="modal-header">
            <h3>${escapeHtml(title)}</h3>
            <button class="icon-btn" data-close-modal>Close</button>
          </div>
          <div class="modal-body">${bodyHtml}</div>
          <div class="modal-actions">${actionsHtml}</div>
        </div>
      </div>
    `;
    els.modalRoot.querySelector('[data-close-modal]').addEventListener('click', closeModal);
    els.modalRoot.querySelector('.modal-backdrop').addEventListener('click', (event) => {
      if (event.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    });
  };

  const closeModal = () => {
    els.modalRoot.innerHTML = '';
  };

  const parseRoute = () => {
    const hash = (location.hash || '#/home').replace(/^#\/?/, '');
    const [path, queryString] = hash.split('?');
    const [segment, id] = path.split('/');
    return { segment: segment || 'home', id, query: new URLSearchParams(queryString || '') };
  };

  const setSessionFromStored = () => {
    const session = BookVerseAPI.getStoredSession();
    state.user = session.user;
  };

  const updateTopbar = () => {
    const loggedIn = Boolean(state.user);
    els.logoutButton.classList.toggle('hidden', !loggedIn);
    els.adminNavLink.classList.toggle('hidden', !(loggedIn && state.user.role === 'admin'));
  };

  const renderStarRating = (rating = 0) => {
    const full = Math.round(rating);
    return `
      <span class="stars" aria-label="Rating ${rating}">
        ${Array.from({ length: 5 })
          .map((_, index) => `<i class="star ${index < full ? 'active' : ''}">★</i>`)
          .join('')}
      </span>
    `;
  };

  const isLiked = (bookId) => Boolean(state.user?.likedBooks?.some((item) => String(item._id || item) === String(bookId)));
  const isWished = (bookId) => Boolean(state.user?.wishlist?.some((item) => String(item._id || item) === String(bookId)));

  const authRequired = () => {
    if (!state.user) {
      toast('Please sign in to continue.', 'info');
      location.hash = '#/login';
      return false;
    }
    return true;
  };

  const renderBookCard = (book, compact = false) => {
    const liked = isLiked(book._id);
    const wished = isWished(book._id);
    const adminView = Boolean(state.user?.role === 'admin' && location.hash.startsWith('#/admin'));
    return `
      <article class="book-card glass ${compact ? 'compact' : ''}">
        <div class="book-cover-wrap">
          ${coverImgTag(book.coverImage, book.title, 'book-cover')}
          <div class="card-overlay"></div>
        </div>
        <div class="book-meta">
          <div class="book-topline">
            <span class="pill">${escapeHtml(book.genre)}</span>
            <span class="rating-badge">${book.rating.toFixed(1)}</span>
          </div>
          <h3>${escapeHtml(book.title)}</h3>
          <p class="muted">by ${escapeHtml(book.author)}</p>
          <div class="rating-row">${renderStarRating(book.rating)}</div>
          <p class="description">${escapeHtml(book.description).slice(0, compact ? 84 : 118)}${book.description.length > (compact ? 84 : 118) ? '...' : ''}</p>
          <div class="card-actions">
            <button class="ghost-btn small ${liked ? 'active' : ''}" data-like-book="${book._id}">${liked ? 'Liked' : 'Like'}</button>
            <button class="ghost-btn small ${wished ? 'active' : ''}" data-wishlist-book="${book._id}">${wished ? 'Saved' : 'Wishlist'}</button>
            <a class="primary-btn small" href="#/book/${book._id}">View details</a>
            ${adminView ? `<button class="ghost-btn small" data-admin-edit-book="${book._id}">Edit</button><button class="ghost-btn small" data-delete-book="${book._id}">Delete</button>` : ''}
          </div>
        </div>
      </article>
    `;
  };

  const renderAuthorGrid = (authors) => `
    <div class="author-grid">
      ${(authors || []).map((author) => `
        <a class="author-card glass" href="#/author/${author._id}">
          <img src="${escapeHtml(author.image)}" alt="${escapeHtml(author.name)}" />
          <strong>${escapeHtml(author.name)}</strong>
          <span>${escapeHtml(author.nationality)}</span>
        </a>
      `).join('')}
    </div>
  `;

  const renderBookGrid = (books, compact = false) => {
    if (!books || !books.length) {
      return `<div class="empty-state glass"><h3>No books found</h3><p>Try a different search or loosen your filters.</p></div>`;
    }
    return `<div class="books-grid ${compact ? 'compact' : ''}">${books.map((book) => renderBookCard(book, compact)).join('')}</div>`;
  };

  const sectionBlock = (title, books, subtitle = '') => `
    <section class="content-section">
      <div class="section-header">
        <div>
          <h2>${escapeHtml(title)}</h2>
          ${subtitle ? `<p class="muted">${escapeHtml(subtitle)}</p>` : ''}
        </div>
        <a class="section-link" href="#/explore">Browse all</a>
      </div>
      ${renderBookGrid(books || [], true)}
    </section>
  `;

  const renderSkeletons = (count = 8) => `
    <div class="books-grid compact">
      ${Array.from({ length: count }).map(() => '<div class="skeleton-card glass shimmer"></div>').join('')}
    </div>
  `;

  const renderFilters = () => {
    els.filtersPanel.innerHTML = `
      <div class="sidebar-head">
        <h3>Discover</h3>
        <button id="resetFilters" class="ghost-btn small">Reset</button>
      </div>
      <div class="filter-group">
        <label>Genres</label>
        <div class="chip-list" id="genreChipList">
          ${genreOrder.map((genre) => `<button type="button" class="chip ${state.exploreFilters.genre === genre ? 'active' : ''}" data-filter-genre="${escapeHtml(genre)}">${escapeHtml(genre)}</button>`).join('')}
        </div>
      </div>
      <div class="filter-group">
        <label>Language</label>
        <select id="languageFilter">
          <option value="">All languages</option>
          <option value="Hindi">Hindi</option>
          <option value="English">English</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Rating</label>
        <select id="ratingFilter">
          <option value="">Any rating</option>
          <option value="4">4.0+</option>
          <option value="4.5">4.5+</option>
          <option value="4.7">4.7+</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Signals</label>
        <label class="check"><input type="checkbox" id="trendingFilter" /> Trending</label>
        <label class="check"><input type="checkbox" id="newReleaseFilter" /> New releases</label>
        <label class="check"><input type="checkbox" id="bestsellerFilter" /> Bestseller</label>
      </div>
      <div class="filter-group">
        <label>Popular authors</label>
        <div class="author-mini-list" id="authorFilterList">
          ${state.authors.slice(0, 10).map((author) => `<button type="button" class="mini-item" data-filter-author="${author.name}">${escapeHtml(author.name)}</button>`).join('')}
        </div>
      </div>
      <div class="filter-group">
        <label>Search history</label>
        <div class="history-list">
          ${(state.searchHistory || []).slice(0, 6).map((item) => `<button type="button" class="history-chip" data-history-query="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('') || '<p class="muted">No history yet.</p>'}
        </div>
      </div>
    `;

    const goToExplore = (updates = {}) => {
      const params = new URLSearchParams();
      const nextFilters = {
        genre: state.exploreFilters.genre || '',
        author: state.exploreFilters.author || '',
        language: state.exploreFilters.language || '',
        minRating: state.exploreFilters.minRating || '',
        trending: state.exploreFilters.trending || '',
        newRelease: state.exploreFilters.newRelease || '',
        bestseller: state.exploreFilters.bestseller || '',
        q: state.exploreQuery || ''
      };

      Object.assign(nextFilters, updates);

      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      location.hash = `#/explore${params.toString() ? `?${params.toString()}` : ''}`;
    };

    const languageFilter = document.getElementById('languageFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const trendingFilter = document.getElementById('trendingFilter');
    const newReleaseFilter = document.getElementById('newReleaseFilter');
    const bestsellerFilter = document.getElementById('bestsellerFilter');

    languageFilter.value = state.exploreFilters.language || '';
    ratingFilter.value = state.exploreFilters.minRating || '';
    trendingFilter.checked = state.exploreFilters.trending === 'true';
    newReleaseFilter.checked = state.exploreFilters.newRelease === 'true';
    bestsellerFilter.checked = state.exploreFilters.bestseller === 'true';

    languageFilter.addEventListener('change', (event) => {
      state.exploreFilters.language = event.target.value;
      goToExplore();
    });
    ratingFilter.addEventListener('change', (event) => {
      state.exploreFilters.minRating = event.target.value;
      goToExplore();
    });
    [trendingFilter, newReleaseFilter, bestsellerFilter].forEach((filter) => {
      filter.addEventListener('change', () => {
        state.exploreFilters.trending = trendingFilter.checked ? 'true' : '';
        state.exploreFilters.newRelease = newReleaseFilter.checked ? 'true' : '';
        state.exploreFilters.bestseller = bestsellerFilter.checked ? 'true' : '';
        goToExplore();
      });
    });

    document.querySelectorAll('[data-filter-genre]').forEach((button) => {
      button.addEventListener('click', () => {
        state.exploreFilters.genre = button.dataset.filterGenre;
        goToExplore();
      });
    });

    document.querySelectorAll('[data-filter-author]').forEach((button) => {
      button.addEventListener('click', () => {
        state.exploreFilters.author = button.dataset.filterAuthor;
        goToExplore();
      });
    });

    document.querySelectorAll('[data-history-query]').forEach((button) => {
      button.addEventListener('click', () => {
        els.searchInput.value = button.dataset.historyQuery;
        runGlobalSearch(button.dataset.historyQuery);
      });
    });

    document.getElementById('resetFilters').addEventListener('click', () => {
      state.exploreFilters = {};
      els.searchInput.value = '';
      goToExplore({ q: '' });
    });
  };

  const renderHomePage = async () => {
    setLoading(true);
    const sections = state.user
      ? await BookVerseAPI.request('/api/recommendations/home').catch(() => null)
      : null;

    if (sections) {
      state.homeSections = sections;
      state.heroBooks = sections.trending.length ? sections.trending : sections.personalized;
    } else {
      const trending = await BookVerseAPI.request('/api/books?trending=true&limit=12').catch(() => ({ items: [] }));
      const topRated = await BookVerseAPI.request('/api/books?limit=12&sort=-rating').catch(() => ({ items: [] }));
      state.homeSections = {
        trending: trending.items,
        topRated: topRated.items,
        hindi: topRated.items.filter((book) => /Hindi/i.test(book.language)),
        international: topRated.items.filter((book) => !/Hindi/i.test(book.language)),
        newArrivals: topRated.items.slice(0, 12),
        personalized: trending.items,
        similar: topRated.items
      };
      state.heroBooks = trending.items.length ? trending.items : topRated.items;
    }

    setLoading(false);
    const hero = state.heroBooks.slice(0, 5);
    const active = hero.length ? hero[0] : null;
    els.pageContent.innerHTML = `
      <section class="hero glass">
        <div class="hero-copy">
          <span class="eyebrow">Premium reading discovery</span>
          <h1>Find your next favorite book, from Hindi classics to global bestsellers.</h1>
          <p>BookVerse blends Netflix-style discovery, Goodreads depth, Amazon-style browsing, and Spotify-like personalization.</p>
          <div class="hero-actions">
            <a class="primary-btn" href="#/explore">Explore books</a>
            <a class="ghost-btn" href="#/profile">Open profile</a>
          </div>
        </div>
        <div class="hero-showcase" id="heroShowcase">
          ${active ? renderHeroCard(active) : '<div class="empty-state">Loading featured books...</div>'}
        </div>
      </section>
      <div class="hero-track" id="heroTrack">
        ${hero.map((book, index) => `<button class="hero-mini ${index === 0 ? 'active' : ''}" data-hero-index="${index}">${escapeHtml(book.title)}</button>`).join('')}
      </div>
      ${sectionBlock('Trending Books', state.homeSections.trending, 'Books that are surging right now.')}
      ${sectionBlock('Recommended For You', state.homeSections.personalized, 'Personalized picks based on your activity and preferences.')}
      ${sectionBlock('Hindi Literature', state.homeSections.hindi, 'Contemporary and classic Hindi voices.')}
      ${sectionBlock('International Bestsellers', state.homeSections.international, 'Popular stories from around the world.')}
      <section class="content-section">
        <div class="section-header">
          <div>
            <h2>Popular Authors</h2>
            <p class="muted">Writers worth following next.</p>
          </div>
          <a class="section-link" href="#/explore">Browse all</a>
        </div>
        ${renderAuthorGrid(state.authors.slice(0, 10))}
      </section>
      ${sectionBlock('New Arrivals', state.homeSections.newArrivals, 'Recently added books and fresh editions.')}
      ${sectionBlock('Top Rated Books', state.homeSections.topRated, 'Highest rated books on BookVerse.')}
    `;

    bindBookActions();
    bindHeroActions(hero);
  };

  const renderHeroCard = (book) => `
    <article class="hero-card">
      ${coverImgTag(book.coverImage, book.title)}
      <div class="hero-card-info">
        <span class="pill accent">Featured</span>
        <h2>${escapeHtml(book.title)}</h2>
        <p>${escapeHtml(book.author)} · ${escapeHtml(book.genre)}</p>
        <div class="hero-card-actions">
          <a class="primary-btn small" href="#/book/${book._id}">View details</a>
          <button class="ghost-btn small" data-like-book="${book._id}">${isLiked(book._id) ? 'Liked' : 'Like'}</button>
        </div>
      </div>
    </article>
  `;

  const bindHeroActions = (heroBooks) => {
    const showcase = document.getElementById('heroShowcase');
    const buttons = [...document.querySelectorAll('[data-hero-index]')];
    if (!showcase || !buttons.length) return;

    const updateHero = (index) => {
      const book = heroBooks[index];
      if (!book) return;
      showcase.innerHTML = renderHeroCard(book);
      buttons.forEach((button) => button.classList.toggle('active', Number(button.dataset.heroIndex) === index));
      bindBookActions();
    };

    buttons.forEach((button) => button.addEventListener('click', () => updateHero(Number(button.dataset.heroIndex))));

    clearInterval(state.heroTimer);
    state.heroTimer = setInterval(() => {
      const currentIndex = buttons.findIndex((button) => button.classList.contains('active'));
      const nextIndex = heroBooks.length ? (currentIndex + 1) % heroBooks.length : 0;
      updateHero(nextIndex);
    }, 5200);
  };

  const refreshExplore = async (reset = false) => {
    if (reset) {
      state.explorePage = 1;
      state.books = [];
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (state.exploreQuery) params.set('q', state.exploreQuery);
    Object.entries(state.exploreFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', String(state.explorePage));
    params.set('limit', '12');

    const response = await BookVerseAPI.request(`/api/books?${params.toString()}`).catch((error) => {
      toast(error.message, 'error');
      return { items: [], totalPages: 1, page: 1 };
    });

    state.exploreTotalPages = response.totalPages || 1;
    state.books = reset ? response.items : [...state.books, ...response.items];

    els.pageContent.innerHTML = `
      <section class="page-head glass">
        <div>
          <span class="eyebrow">Explore</span>
          <h1>Search, filter, and discover books that match your mood.</h1>
          <p class="muted">Use live search, genre filters, ratings, language, and bestseller signals to narrow the catalog.</p>
        </div>
        <div class="page-head-actions">
          <span class="pill">${response.total || 0} books</span>
          <span class="pill">Page ${state.explorePage}/${state.exploreTotalPages}</span>
        </div>
      </section>
      ${renderBookGrid(state.books)}
      <div class="load-more-wrap">
        ${state.explorePage < state.exploreTotalPages ? '<button id="loadMoreBooks" class="primary-btn">Load more</button>' : '<div class="empty-state glass compact"><p>You have reached the end of the catalog.</p></div>'}
      </div>
      <div id="exploreSentinel"></div>
    `;

    renderFilters();
    bindBookActions();

    const loadMore = document.getElementById('loadMoreBooks');
    if (loadMore) {
      loadMore.addEventListener('click', () => {
        if (state.explorePage < state.exploreTotalPages) {
          state.explorePage += 1;
          refreshExplore(false);
        }
      });
    }

    const sentinel = document.getElementById('exploreSentinel');
    if (sentinel && state.explorePage < state.exploreTotalPages) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          if (state.explorePage < state.exploreTotalPages) {
            state.explorePage += 1;
            refreshExplore(false);
          }
        }
      });
      observer.observe(sentinel);
    }

    setLoading(false);
  };

  const renderExplorePage = async (route) => {
    state.exploreQuery = route.query.get('q') || els.searchInput.value || '';
    state.exploreFilters = {
      genre: route.query.get('genre') || state.exploreFilters.genre || '',
      author: route.query.get('author') || state.exploreFilters.author || '',
      language: route.query.get('language') || state.exploreFilters.language || '',
      minRating: route.query.get('minRating') || state.exploreFilters.minRating || '',
      trending: route.query.get('trending') || state.exploreFilters.trending || '',
      newRelease: route.query.get('newRelease') || state.exploreFilters.newRelease || '',
      bestseller: route.query.get('bestseller') || state.exploreFilters.bestseller || ''
    };
    await refreshExplore(true);
  };

  const renderBookPage = async (route) => {
    setLoading(true);
    const data = await BookVerseAPI.request(`/api/books/${route.id}`).catch((error) => {
      toast(error.message, 'error');
      return null;
    });
    if (!data) return;
    await BookVerseAPI.request(`/api/books/${route.id}/view`, { method: 'POST' }).catch(() => null);
    const recs = await BookVerseAPI.request(`/api/recommendations/book/${route.id}`).catch(() => ({ similar: [], popularInGenre: [] }));
    setLoading(false);

    const book = data.book;
    els.pageContent.innerHTML = `
      <section class="book-hero glass">
        ${coverImgTag(book.coverImage, book.title, 'book-hero-cover')}
        <div class="book-hero-copy">
          <span class="pill accent">${escapeHtml(book.genre)}</span>
          <h1>${escapeHtml(book.title)}</h1>
          <p class="muted">by ${escapeHtml(book.author)} · ${escapeHtml(book.language)} · ${book.publicationYear}</p>
          <div class="rating-row">${renderStarRating(book.rating)} <strong>${book.rating.toFixed(1)}</strong></div>
          <p class="description large">${escapeHtml(book.description)}</p>
          <div class="book-stats">
            <span class="pill">${book.pages} pages</span>
            <span class="pill">ISBN ${escapeHtml(book.isbn)}</span>
            <span class="pill">Likes ${book.likesCount}</span>
          </div>
          <div class="hero-actions">
            <button class="primary-btn" data-like-book="${book._id}">${isLiked(book._id) ? 'Unlike' : 'Like'}</button>
            <button class="ghost-btn" data-wishlist-book="${book._id}">${isWished(book._id) ? 'Remove from wishlist' : 'Add to wishlist'}</button>
          </div>
        </div>
      </section>
      <section class="content-section">
        <div class="section-header"><h2>Related books</h2></div>
        ${renderBookGrid(data.related || [], true)}
      </section>
      <section class="content-section">
        <div class="section-header"><h2>Similar recommendations</h2></div>
        ${renderBookGrid(recs.similar || [], true)}
      </section>
      <section class="content-section">
        <div class="section-header"><h2>Popular in this genre</h2></div>
        ${renderBookGrid(recs.popularInGenre || [], true)}
      </section>
    `;

    bindBookActions();
  };

  const renderAuthorPage = async (route) => {
    setLoading(true);
    const data = await BookVerseAPI.request(`/api/authors/${route.id}`).catch((error) => {
      toast(error.message, 'error');
      return null;
    });
    setLoading(false);
    if (!data) return;

    const author = data.author;
    els.pageContent.innerHTML = `
      <section class="author-hero glass">
        <img class="author-avatar" src="${escapeHtml(author.image)}" alt="${escapeHtml(author.name)}" />
        <div>
          <span class="pill accent">${escapeHtml(author.nationality)}</span>
          <h1>${escapeHtml(author.name)}</h1>
          <p class="description large">${escapeHtml(author.bio)}</p>
          <div class="book-stats">
            ${author.famousBooks.map((book) => `<span class="pill">${escapeHtml(book)}</span>`).join('')}
          </div>
        </div>
      </section>
      <section class="content-section">
        <div class="section-header"><h2>Books by ${escapeHtml(author.name)}</h2></div>
        ${renderBookGrid(data.books || [], true)}
      </section>
      <section class="content-section">
        <div class="section-header"><h2>Related authors</h2></div>
        <div class="author-grid">
          ${(data.relatedAuthors || []).map((related) => `
            <a class="author-card glass" href="#/author/${related._id}">
              <img src="${escapeHtml(related.image)}" alt="${escapeHtml(related.name)}" />
              <strong>${escapeHtml(related.name)}</strong>
              <span>${escapeHtml(related.nationality)}</span>
            </a>
          `).join('')}
        </div>
      </section>
    `;
  };

  const renderWishlistPage = async () => {
    if (!authRequired()) return;
    setLoading(true);
    await syncCurrentUser();
    setLoading(false);
    const wishlist = state.user?.wishlist || [];

    els.pageContent.innerHTML = `
      <section class="page-head glass">
        <div>
          <span class="eyebrow">Wishlist</span>
          <h1>Your saved books</h1>
          <p class="muted">Books in your MongoDB wishlist sync across sessions and devices.</p>
        </div>
      </section>
      ${renderBookGrid(wishlist, true)}
    `;
    bindBookActions();
  };

  const renderProfilePage = async () => {
    if (!authRequired()) return;
    setLoading(true);
    await syncCurrentUser();
    setLoading(false);

    const user = state.user;
    const favoriteGenres = user?.favoriteGenres || [];
    const likedBooks = user?.likedBooks || [];
    const recentBooks = (user?.recentlyViewed || []).map((entry) => entry.book).filter(Boolean);
    const history = user?.searchHistory || [];

    els.pageContent.innerHTML = `
      <section class="profile-hero glass">
        <img class="avatar-xl" src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" />
        <div class="profile-copy">
          <span class="pill accent">${escapeHtml(user.role)}</span>
          <h1>${escapeHtml(user.name)}</h1>
          <p class="muted">${escapeHtml(user.email)}</p>
          <div class="book-stats">
            <span class="pill">${favoriteGenres.length} favorite genres</span>
            <span class="pill">${likedBooks.length} liked books</span>
            <span class="pill">${(user.wishlist || []).length} wishlist books</span>
          </div>
        </div>
      </section>
      <section class="content-section profile-grid">
        <form id="profileForm" class="glass form-card">
          <h2>Edit profile</h2>
          <label>Name<input name="name" value="${escapeHtml(user.name)}" /></label>
          <label>Avatar URL<input name="avatar" value="${escapeHtml(user.avatar)}" /></label>
          <label>Favorite genres</label>
          <div class="chip-list multi" id="profileGenres">
            ${authGenres.map((genre) => `<button type="button" class="chip ${favoriteGenres.includes(genre) ? 'active' : ''}" data-profile-genre="${escapeHtml(genre)}">${escapeHtml(genre)}</button>`).join('')}
          </div>
          <button class="primary-btn" type="submit">Save profile</button>
        </form>
        <div class="glass panel-card">
          <h2>Search history</h2>
          <div class="history-list">
            ${history.length ? history.map((item) => `<span class="history-chip">${escapeHtml(item)}</span>`).join('') : '<p class="muted">No searches yet.</p>'}
          </div>
        </div>
      </section>
      <section class="content-section">
        <div class="section-header"><h2>Liked books</h2></div>
        ${renderBookGrid(likedBooks, true)}
      </section>
      <section class="content-section">
        <div class="section-header"><h2>Recently viewed</h2></div>
        ${renderBookGrid(recentBooks, true)}
      </section>
    `;

    const selectedGenres = new Set(favoriteGenres);
    document.querySelectorAll('[data-profile-genre]').forEach((button) => {
      button.addEventListener('click', () => {
        const genre = button.dataset.profileGenre;
        if (selectedGenres.has(genre)) {
          selectedGenres.delete(genre);
          button.classList.remove('active');
        } else {
          selectedGenres.add(genre);
          button.classList.add('active');
        }
      });
    });

    document.getElementById('profileForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      setLoading(true);
      try {
        const response = await BookVerseAPI.request('/api/auth/me', {
          method: 'PUT',
          body: {
            name: form.get('name'),
            avatar: form.get('avatar'),
            favoriteGenres: [...selectedGenres]
          }
        });
        state.user = response.user;
        BookVerseAPI.setSession({ token: BookVerseAPI.getStoredSession().token, user: response.user, rememberMe: Boolean(localStorage.getItem('bookverse_token')) });
        toast('Profile updated successfully.');
        updateTopbar();
      } catch (error) {
        toast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    });

    bindBookActions();
  };

  const adminForms = {
    book: (book = {}) => `
      <form class="admin-form" data-admin-form="book" data-id="${book._id || ''}">
        <h3>${book._id ? 'Edit book' : 'Add book'}</h3>
        ${textInput('title', 'Title', book.title || '')}
        ${textInput('author', 'Author', book.author || '')}
        ${textInput('genre', 'Genre', book.genre || '')}
        ${textInput('language', 'Language', book.language || '')}
        ${textInput('rating', 'Rating', book.rating || '4.5', 'number', '0', '5', '0.1')}
        ${textInput('coverImage', 'Cover image URL', book.coverImage || '')}
        <label>Upload cover image<input name="imageFile" type="file" accept="image/*" /></label>
        ${textInput('publicationYear', 'Publication year', book.publicationYear || '')}
        ${textInput('pages', 'Pages', book.pages || '')}
        ${textInput('isbn', 'ISBN', book.isbn || '')}
        <label>Description<textarea name="description" rows="4">${escapeHtml(book.description || '')}</textarea></label>
        <label>Tags<input name="tags" value="${escapeHtml(Array.isArray(book.tags) ? book.tags.join(', ') : book.tags || '')}" placeholder="comma, separated, tags" /></label>
        <div class="inline-checks">
          <label class="check"><input name="isTrending" type="checkbox" ${book.isTrending ? 'checked' : ''} /> Trending</label>
          <label class="check"><input name="isNewRelease" type="checkbox" ${book.isNewRelease ? 'checked' : ''} /> New release</label>
          <label class="check"><input name="isBestseller" type="checkbox" ${book.isBestseller ? 'checked' : ''} /> Bestseller</label>
        </div>
        <button class="primary-btn" type="submit">Save book</button>
      </form>
    `,
    author: (author = {}) => `
      <form class="admin-form" data-admin-form="author" data-id="${author._id || ''}">
        <h3>${author._id ? 'Edit author' : 'Add author'}</h3>
        ${textInput('name', 'Name', author.name || '')}
        ${textInput('image', 'Image URL', author.image || '')}
        <label>Upload author image<input name="imageFile" type="file" accept="image/*" /></label>
        ${textInput('nationality', 'Nationality', author.nationality || '')}
        <label>Bio<textarea name="bio" rows="4">${escapeHtml(author.bio || '')}</textarea></label>
        <label>Famous books<input name="famousBooks" value="${escapeHtml(Array.isArray(author.famousBooks) ? author.famousBooks.join(', ') : author.famousBooks || '')}" /></label>
        <label>Genres<input name="genres" value="${escapeHtml(Array.isArray(author.genres) ? author.genres.join(', ') : author.genres || '')}" /></label>
        <button class="primary-btn" type="submit">Save author</button>
      </form>
    `,
    genre: (genre = {}) => `
      <form class="admin-form" data-admin-form="genre" data-id="${genre._id || ''}">
        <h3>${genre._id ? 'Edit genre' : 'Add genre'}</h3>
        ${textInput('name', 'Name', genre.name || '')}
        <label>Description<textarea name="description" rows="3">${escapeHtml(genre.description || '')}</textarea></label>
        <button class="primary-btn" type="submit">Save genre</button>
      </form>
    `
  };

  const textInput = (name, label, value, type = 'text', min = '', max = '', step = '') => `
    <label>${label}<input name="${name}" type="${type}" value="${escapeHtml(value)}" ${min !== '' ? `min="${min}"` : ''} ${max !== '' ? `max="${max}"` : ''} ${step !== '' ? `step="${step}"` : ''} /></label>
  `;

  const renderAdminPage = async () => {
    if (!authRequired()) return;
    if (state.user.role !== 'admin') {
      els.pageContent.innerHTML = `<section class="empty-state glass"><h2>Admin access required</h2><p>You do not have permission to view this dashboard.</p></section>`;
      return;
    }

    setLoading(true);
    const [stats, users, books, authors, genres] = await Promise.all([
      BookVerseAPI.request('/api/admin/stats').catch(() => null),
      BookVerseAPI.request('/api/admin/users').catch(() => ({ items: [] })),
      BookVerseAPI.request('/api/books?limit=48').catch(() => ({ items: [] })),
      BookVerseAPI.request('/api/authors').catch(() => ({ items: [] })),
      BookVerseAPI.request('/api/genres').catch(() => ({ items: [] }))
    ]);
    state.adminData = { stats, users: users.items || [], books: books.items || [], authors: authors.items || [], genres: genres.items || [] };
    setLoading(false);

    els.pageContent.innerHTML = `
      <section class="page-head glass">
        <div>
          <span class="eyebrow">Admin</span>
          <h1>BookVerse management console</h1>
          <p class="muted">Manage books, authors, genres, and users from one dashboard.</p>
        </div>
      </section>
      <section class="stats-grid">
        <div class="stat-card glass"><strong>${stats?.books ?? 0}</strong><span>Books</span></div>
        <div class="stat-card glass"><strong>${stats?.authors ?? 0}</strong><span>Authors</span></div>
        <div class="stat-card glass"><strong>${stats?.genres ?? 0}</strong><span>Genres</span></div>
        <div class="stat-card glass"><strong>${stats?.users ?? 0}</strong><span>Users</span></div>
      </section>
      <section class="admin-grid">
        <div class="glass admin-panel">${adminForms.book()}</div>
        <div class="glass admin-panel">${adminForms.author()}</div>
        <div class="glass admin-panel">${adminForms.genre()}</div>
        <div class="glass admin-panel">
          <h3>Manage users</h3>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                ${(state.adminData.users || []).map((user) => `
                  <tr>
                    <td>${escapeHtml(user.name)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>
                      <select data-user-role="${user._id}">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>user</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
                      </select>
                    </td>
                    <td>
                      <button class="ghost-btn small" data-delete-user="${user._id}">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section class="content-section">
        <div class="section-header"><h2>Books inventory</h2></div>
        ${renderBookGrid(state.adminData.books || [], true)}
      </section>
      <section class="content-section">
        <div class="section-header"><h2>Authors</h2></div>
        <div class="author-grid">
          ${(state.adminData.authors || []).map((author) => `
            <article class="author-card glass">
              <img src="${escapeHtml(author.image)}" alt="${escapeHtml(author.name)}" />
              <strong>${escapeHtml(author.name)}</strong>
              <span>${escapeHtml(author.nationality)}</span>
              <button class="ghost-btn small" data-admin-edit-author="${author._id}">Edit</button>
            </article>
          `).join('')}
        </div>
      </section>
      <section class="content-section">
        <div class="section-header"><h2>Genres</h2></div>
        <div class="chip-list">
          ${(state.adminData.genres || []).map((genre) => `<button class="chip" data-admin-edit-genre="${genre._id}">${escapeHtml(genre.name)}</button>`).join('')}
        </div>
      </section>
    `;

    bindBookActions();
    bindAdminActions();
  };

  const renderAuthShell = (mode) => `
    <section class="auth-shell">
      <div class="auth-copy glass">
        <span class="eyebrow">Welcome to BookVerse</span>
        <h1>${mode === 'login' ? 'Sign in to resume your reading journey.' : 'Create your BookVerse profile.'}</h1>
        <p>Track likes, save books, personalize recommendations, and keep a living wishlist synced to MongoDB Atlas.</p>
      </div>
      <div class="auth-form-card glass">
        ${mode === 'login' ? renderLoginForm() : renderSignupForm()}
      </div>
    </section>
  `;

  const renderLoginForm = () => `
    <form id="loginForm" class="form-stack">
      <h2>Login</h2>
      <label>Email<input name="email" type="email" required /></label>
      <label>Password<input name="password" type="password" required /></label>
      <label class="check"><input name="rememberMe" type="checkbox" /> Remember me</label>
      <button class="primary-btn" type="submit">Sign in</button>
      <p class="muted">No account yet? <a href="#/signup">Create one</a></p>
    </form>
  `;

  const renderSignupForm = () => `
    <form id="signupForm" class="form-stack">
      <h2>Sign up</h2>
      <label>Name<input name="name" type="text" required /></label>
      <label>Email<input name="email" type="email" required /></label>
      <label>Password<input name="password" type="password" required minlength="6" /></label>
      <label>Avatar URL<input name="avatar" type="url" placeholder="https://..." /></label>
      <label>Favorite genres</label>
      <div class="chip-list multi">
        ${authGenres.map((genre) => `<button type="button" class="chip" data-signup-genre="${escapeHtml(genre)}">${escapeHtml(genre)}</button>`).join('')}
      </div>
      <label class="check"><input name="rememberMe" type="checkbox" checked /> Remember me</label>
      <button class="primary-btn" type="submit">Create account</button>
      <p class="muted">Already have an account? <a href="#/login">Sign in</a></p>
    </form>
  `;

  const renderLoginPage = () => {
    els.pageContent.innerHTML = renderAuthShell('login');
    bindAuthForms('login');
  };

  const renderSignupPage = () => {
    els.pageContent.innerHTML = renderAuthShell('signup');
    bindAuthForms('signup');
  };

  const bindAuthForms = (mode) => {
    if (mode === 'signup') {
      const selectedGenres = new Set();
      document.querySelectorAll('[data-signup-genre]').forEach((button) => {
        button.addEventListener('click', () => {
          const genre = button.dataset.signupGenre;
          if (selectedGenres.has(genre)) {
            selectedGenres.delete(genre);
            button.classList.remove('active');
          } else {
            selectedGenres.add(genre);
            button.classList.add('active');
          }
        });
      });

      document.getElementById('signupForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        try {
          setLoading(true);
          const response = await BookVerseAPI.request('/api/auth/signup', {
            method: 'POST',
            body: {
              name: form.get('name'),
              email: form.get('email'),
              password: form.get('password'),
              avatar: form.get('avatar'),
              favoriteGenres: [...selectedGenres],
              rememberMe: form.get('rememberMe') === 'on'
            }
          });
          BookVerseAPI.setSession({ ...response, rememberMe: form.get('rememberMe') === 'on' });
          state.user = response.user;
          updateTopbar();
          toast('Account created successfully.');
          location.hash = '#/home';
        } catch (error) {
          toast(error.message, 'error');
        } finally {
          setLoading(false);
        }
      });
    }

    if (mode === 'login') {
      document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        try {
          setLoading(true);
          const response = await BookVerseAPI.request('/api/auth/login', {
            method: 'POST',
            body: {
              email: form.get('email'),
              password: form.get('password'),
              rememberMe: form.get('rememberMe') === 'on'
            }
          });
          BookVerseAPI.setSession({ ...response, rememberMe: form.get('rememberMe') === 'on' });
          state.user = response.user;
          updateTopbar();
          toast('Welcome back to BookVerse.');
          location.hash = '#/home';
        } catch (error) {
          toast(error.message, 'error');
        } finally {
          setLoading(false);
        }
      });
    }
  };

  const bindAdminActions = () => {
    document.querySelectorAll('[data-admin-form]').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const target = event.currentTarget;
        const formData = new FormData(target);
        const entity = target.dataset.adminForm;
        const id = target.dataset.id;

        const payload = {};
        [...formData.entries()].forEach(([key, value]) => {
          if (key === 'imageFile' || key === 'id') return;
          payload[key] = value;
        });

        ['isTrending', 'isNewRelease', 'isBestseller'].forEach((flag) => {
          payload[flag] = Boolean(formData.get(flag));
        });

        ['rating', 'publicationYear', 'pages'].forEach((key) => {
          if (payload[key] !== undefined && payload[key] !== '') {
            payload[key] = Number(payload[key]);
          }
        });

        if (payload.tags) payload.tags = payload.tags.split(',').map((item) => item.trim()).filter(Boolean);
        if (payload.famousBooks) payload.famousBooks = payload.famousBooks.split(',').map((item) => item.trim()).filter(Boolean);
        if (payload.genres && entity === 'author') payload.genres = payload.genres.split(',').map((item) => item.trim()).filter(Boolean);

        const imageFile = formData.get('imageFile');
        if (imageFile && imageFile.name) {
          const uploadData = new FormData();
          uploadData.append('image', imageFile);
          const uploadResult = await BookVerseAPI.request('/api/upload', {
            method: 'POST',
            body: uploadData
          });

          if (entity === 'book') {
            payload.coverImage = uploadResult.url;
          }

          if (entity === 'author') {
            payload.image = uploadResult.url;
          }
        }

        try {
          setLoading(true);
          const method = id ? 'PUT' : 'POST';
          const url = entity === 'book' ? `/api/books${id ? `/${id}` : ''}` : entity === 'author' ? `/api/authors${id ? `/${id}` : ''}` : `/api/genres${id ? `/${id}` : ''}`;
          await BookVerseAPI.request(url, { method, body: payload });
          toast(`${entity} saved successfully.`);
          await renderAdminPage();
        } catch (error) {
          toast(error.message, 'error');
        } finally {
          setLoading(false);
        }
      });
    });

    document.querySelectorAll('[data-user-role]').forEach((select) => {
      select.addEventListener('change', async () => {
        try {
          await BookVerseAPI.request(`/api/admin/users/${select.dataset.userRole}/role`, {
            method: 'PUT',
            body: { role: select.value }
          });
          toast('User role updated.');
        } catch (error) {
          toast(error.message, 'error');
        }
      });
    });

    document.querySelectorAll('[data-delete-user]').forEach((button) => {
      button.addEventListener('click', () => {
        openModal('Delete user', '<p>Are you sure you want to delete this user?</p>', `
          <button class="ghost-btn" data-modal-cancel>Cancel</button>
          <button class="primary-btn" data-modal-confirm>Delete</button>
        `);
        els.modalRoot.querySelector('[data-modal-cancel]').addEventListener('click', closeModal);
        els.modalRoot.querySelector('[data-modal-confirm]').addEventListener('click', async () => {
          try {
            await BookVerseAPI.request(`/api/admin/users/${button.dataset.deleteUser}`, { method: 'DELETE' });
            toast('User deleted.');
            closeModal();
            await renderAdminPage();
          } catch (error) {
            toast(error.message, 'error');
          }
        });
      });
    });

    document.querySelectorAll('[data-admin-edit-book]').forEach((button) => {
      button.addEventListener('click', () => {
        const book = state.adminData.books.find((item) => item._id === button.dataset.adminEditBook);
        fillAdminForm('book', book);
      });
    });

    document.querySelectorAll('[data-admin-edit-author]').forEach((button) => {
      button.addEventListener('click', () => {
        const author = state.adminData.authors.find((item) => item._id === button.dataset.adminEditAuthor);
        fillAdminForm('author', author);
      });
    });

    document.querySelectorAll('[data-admin-edit-genre]').forEach((button) => {
      button.addEventListener('click', () => {
        const genre = state.adminData.genres.find((item) => item._id === button.dataset.adminEditGenre);
        fillAdminForm('genre', genre);
      });
    });

    document.querySelectorAll('[data-delete-book]').forEach((button) => {
      button.addEventListener('click', () => {
        openModal('Delete book', '<p>This removes the book from the catalog.</p>', `
          <button class="ghost-btn" data-modal-cancel>Cancel</button>
          <button class="primary-btn" data-modal-confirm>Delete</button>
        `);
        els.modalRoot.querySelector('[data-modal-cancel]').addEventListener('click', closeModal);
        els.modalRoot.querySelector('[data-modal-confirm]').addEventListener('click', async () => {
          try {
            await BookVerseAPI.request(`/api/books/${button.dataset.deleteBook}`, { method: 'DELETE' });
            toast('Book deleted.');
            closeModal();
            await renderAdminPage();
          } catch (error) {
            toast(error.message, 'error');
          }
        });
      });
    });
  };

  const fillAdminForm = (entity, item) => {
    if (!item) return;
    const form = document.querySelector(`[data-admin-form="${entity}"]`);
    if (!form) return;

    form.dataset.id = item._id || '';
    Object.entries(item).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (!field) return;
      if (field.type === 'checkbox') {
        field.checked = Boolean(value);
      } else if (Array.isArray(value)) {
        field.value = value.join(', ');
      } else {
        field.value = value ?? '';
      }
    });

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast(`Loaded ${entity} into the editor.`, 'info');
  };

  const bindBookActions = () => {
    document.querySelectorAll('[data-like-book]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!authRequired()) return;
        try {
          await BookVerseAPI.request(`/api/books/${button.dataset.likeBook}/like`, { method: 'POST' });
          await syncCurrentUser();
          toast('Updated likes.');
          rerenderCurrentRoute();
        } catch (error) {
          toast(error.message, 'error');
        }
      });
    });

    document.querySelectorAll('[data-wishlist-book]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!authRequired()) return;
        try {
          await BookVerseAPI.request(`/api/books/${button.dataset.wishlistBook}/wishlist`, { method: 'POST' });
          await syncCurrentUser();
          toast('Wishlist updated.');
          rerenderCurrentRoute();
        } catch (error) {
          toast(error.message, 'error');
        }
      });
    });
  };

  const rerenderCurrentRoute = () => {
    const route = parseRoute();
    renderRoute(route);
  };

  const runGlobalSearch = (value) => {
    const query = value.trim();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    location.hash = `#/explore${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const syncCurrentUser = async () => {
    const session = BookVerseAPI.getStoredSession();
    if (!session.token) {
      state.user = null;
      updateTopbar();
      return;
    }

    try {
      const response = await BookVerseAPI.request('/api/auth/me');
      state.user = response.user;
      state.searchHistory = response.user.searchHistory || [];
      updateTopbar();
      BookVerseAPI.setSession({ token: session.token, user: response.user, rememberMe: Boolean(localStorage.getItem('bookverse_token')) });
    } catch (error) {
      BookVerseAPI.clearSession();
      state.user = null;
      updateTopbar();
    }
  };

  const loadLookupData = async () => {
    const [genresRes, authorsRes] = await Promise.all([
      BookVerseAPI.request('/api/genres').catch(() => ({ items: [] })),
      BookVerseAPI.request('/api/authors').catch(() => ({ items: [] }))
    ]);
    state.genres = genresRes.items || [];
    state.authors = authorsRes.items || [];
  };

  const renderRoute = async (route) => {
    els.searchSuggestions.classList.remove('open');
    forceScrollTop();
    const handler = resolveRoute(route.segment);
    if (handler) {
      await handler(route);
      bindCoverFallbacks();
      forceScrollTop();
      requestAnimationFrame(forceScrollTop);
      return;
    }
    await renderHomePage();
    bindCoverFallbacks();
    forceScrollTop();
    requestAnimationFrame(forceScrollTop);
  };

  const handleSearchSuggestions = async (value) => {
    const query = value.trim();
    if (!query) {
      els.searchSuggestions.innerHTML = '';
      els.searchSuggestions.classList.remove('open');
      return;
    }

    const response = await BookVerseAPI.request(`/api/books/suggestions?q=${encodeURIComponent(query)}`).catch(() => ({ items: [] }));
    state.searchSuggestions = response.items || [];

    els.searchSuggestions.innerHTML = state.searchSuggestions.length
      ? state.searchSuggestions.map((book) => `
        <button class="suggestion-item" data-suggestion-book="${book._id}">
          ${coverImgTag(book.coverImage, book.title)}
          <span>
            <strong>${escapeHtml(book.title)}</strong>
            <small>${escapeHtml(book.author)} · ${escapeHtml(book.genre)}</small>
          </span>
        </button>
      `).join('')
      : '<div class="suggestion-empty">No suggestions found.</div>';

    els.searchSuggestions.classList.add('open');
    bindCoverFallbacks(els.searchSuggestions);
    document.querySelectorAll('[data-suggestion-book]').forEach((button) => {
      button.addEventListener('click', () => {
        location.hash = `#/book/${button.dataset.suggestionBook}`;
      });
    });
  };

  const bindGlobalEvents = () => {
    window.addEventListener('hashchange', async () => {
      await renderRoute(parseRoute());
    });

    els.logoutButton.addEventListener('click', async () => {
      try {
        await BookVerseAPI.request('/api/auth/logout', { method: 'POST' }).catch(() => null);
      } finally {
        BookVerseAPI.clearSession();
        state.user = null;
        updateTopbar();
        toast('Logged out.');
        location.hash = '#/home';
      }
    });

    els.searchInput.addEventListener('input', (event) => handleSearchSuggestions(event.target.value));
    els.searchInput.addEventListener('focus', (event) => handleSearchSuggestions(event.target.value));
    els.searchButton.addEventListener('click', () => runGlobalSearch(els.searchInput.value));
    els.searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        runGlobalSearch(els.searchInput.value);
      }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.search-shell')) {
        els.searchSuggestions.classList.remove('open');
      }
    });
  };

  const init = async () => {
    setSessionFromStored();
    updateTopbar();
    bindGlobalEvents();
    await loadLookupData();
    await syncCurrentUser();
    if (!location.hash) {
      location.hash = '#/home';
      return;
    }
    await renderRoute(parseRoute());
  };

  init();
})();
