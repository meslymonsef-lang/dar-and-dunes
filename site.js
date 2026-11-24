const sitePages = [
  ['index.html', 'Home'],
  ['discover.html', 'Discover'],
  ['stays.html', 'Stays'],
  ['road-trips.html', 'Road trips'],
  ['stories.html', 'Stories & history']
];
const currentPage = location.pathname.split('/').pop() || 'index.html';
const pageLinks = () => sitePages.map(([url, label]) => `<a href="${url}"${currentPage === url ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('');
const sharedHeader = document.querySelector('[data-site-header]');
if (sharedHeader) {
  sharedHeader.innerHTML = `<a class="brand" href="index.html" aria-label="Dar and Dunes home"><img class="brand-mark" src="public/favicon.svg" width="32" height="40" alt=""><span>dar <i>&</i> dunes<small>A LITTLE CLOSER TO MOROCCO</small></span></a><nav class="desktop-nav" aria-label="Main navigation">${pageLinks()}</nav><div class="header-actions"><a class="saved-button" href="index.html?collection=1" aria-label="My collection"><span aria-hidden="true">♡</span><span class="saved-label">My collection</span></a><a class="button small" href="index.html#search">Plan your trip ↗</a><button class="menu-button icon-button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav"><span aria-hidden="true">☰</span></button></div><nav id="mobile-nav" class="mobile-nav" hidden aria-label="Mobile navigation">${pageLinks()}<a href="index.html?collection=1">My collection</a></nav>`;
  const button = sharedHeader.querySelector('.menu-button');
  const nav = sharedHeader.querySelector('#mobile-nav');
  const close = () => { nav.hidden = true; button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Open menu'); };
  button.addEventListener('click', () => { const open = nav.hidden; nav.hidden = !open; button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !nav.hidden) { close(); button.focus(); } });
  document.addEventListener('click', event => { if (!sharedHeader.contains(event.target)) close(); });
} else {
  document.querySelector('.desktop-nav').innerHTML = pageLinks();
  document.querySelector('#mobile-nav').innerHTML = `${pageLinks()}<button data-action="saved">My collection</button>`;
  document.querySelector('.site-header .brand').href = 'index.html';
}
const sharedFooter = document.querySelector('[data-site-footer]');
if (sharedFooter) sharedFooter.innerHTML = `<div class="footer-top"><a class="brand footer-brand" href="index.html">dar <i>&</i> dunes</a><p>Morocco, a little closer.</p><a href="index.html#search">Your next chapter ↗</a></div><nav class="footer-nav" aria-label="Footer navigation">${pageLinks()}</nav><div class="footer-bottom"><span>© ${new Date().getFullYear()} Dar & Dunes</span><span>Independent travel concept · No live bookings</span><a href="index.html?privacy=1">Privacy & local storage</a></div>`;
else document.querySelector('footer .footer-top').insertAdjacentHTML('afterend', `<nav class="footer-nav" aria-label="Footer navigation">${pageLinks()}</nav>`);
const filters = document.querySelectorAll('[data-filter]');
if (filters.length) {
  const cards = document.querySelectorAll('[data-region]');
  const search = document.querySelector('#destination-search');
  let selected = 'all';
  const filter = () => {
    let visible = 0;
    cards.forEach(card => { const match = (selected === 'all' || card.dataset.region === selected) && card.textContent.toLowerCase().includes(search.value.trim().toLowerCase()); card.hidden = !match; if (match) visible++; });
    document.querySelector('#filter-status').textContent = `${visible} ${visible === 1 ? 'destination' : 'destinations'} to explore`;
    document.querySelector('#no-destinations').hidden = visible !== 0;
  };
  filters.forEach(button => button.addEventListener('click', () => { selected = button.dataset.filter; filters.forEach(item => item.setAttribute('aria-pressed', String(item === button))); filter(); }));
  search.addEventListener('input', filter);
  document.querySelector('#reset-destinations').addEventListener('click', () => { search.value = ''; filters[0].click(); search.focus(); });
  filter();
}
const routeChoices = document.querySelectorAll('[data-route-choice]');
routeChoices.forEach(button => button.addEventListener('click', () => {
  routeChoices.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelectorAll('[data-route-panel]').forEach(panel => { panel.hidden = panel.dataset.routePanel !== button.dataset.routeChoice; });
}));
const flipButton = document.querySelector('[data-flip]');
if (flipButton) flipButton.addEventListener('click', () => {
  const postcard = document.querySelector('.postcard');
  const flipped = postcard.classList.toggle('is-flipped');
  flipButton.setAttribute('aria-expanded', String(flipped));
  flipButton.textContent = flipped ? 'Turn back to the photograph ↶' : 'Turn the postcard ↗';
  document.querySelector('.postcard-front').setAttribute('aria-hidden', String(flipped));
  document.querySelector('.postcard-back').setAttribute('aria-hidden', String(!flipped));
});
