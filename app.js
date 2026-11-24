const icons = { heart: 'heart', menu: 'menu', pin: 'map-pin', bed: 'bed-double', home: 'house', car: 'car-front', calendar: 'calendar-days', users: 'users', search: 'search', compass: 'compass', close: 'x' };
function renderIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    const name = icons[el.dataset.icon];
    if (name) el.style.setProperty('--icon', `url("public/icons/lucide-${name}-254e43.svg")`);
    el.setAttribute('aria-hidden', 'true');
  });
}
const destinations = [
  { name: 'Marrakech', image: 'marrakech-city.jpg', subtitle: 'Medina days & courtyard calm', label: 'THE RED CITY', description: 'Wander the medina, discover garden courtyards, and leave time for a slow afternoon over mint tea. Choose a riad for a courtyard setting or a hotel for a little more space.', type: 'Hotels & riads' },
  { name: 'Chefchaouen', image: 'blue-city.jpg', subtitle: 'Blue lanes & mountain air', label: 'A DIFFERENT SHADE OF MOROCCO', description: 'Take your time in the blue lanes of Chefchaouen. Set in the Rif Mountains, this is a destination for unhurried walks and a quieter change of pace.', type: 'Hotels & riads' },
  { name: 'Essaouira', image: 'essaouira-coast.jpg', subtitle: 'Salt air & a slower rhythm', label: 'BY THE ATLANTIC', description: 'Explore the harbor, stroll the medina, and enjoy the Atlantic breeze. A holiday home can give you space to settle in and explore the coast at your own pace.', type: 'Homes & villas' },
  { name: 'Merzouga', image: 'sahara-dunes.jpg', subtitle: 'Golden dunes & open skies', label: 'TOWARD THE SAHARA', description: 'Make space in your itinerary for the dunes around Merzouga. Plan travel times carefully and confirm transport, weather conditions, and activities directly with your host.', type: 'Hotels & riads' }
];
const extraDestinations = [
  { name: 'Fes', description: 'Explore the historic medina and look for a riad that suits your pace.', type: 'Hotels & riads' },
  { name: 'Agadir', description: 'Plan a coastal break with room for beach days and a home of your own.', type: 'Homes & villas' },
  { name: 'Casablanca', description: 'Start your road trip here. Confirm pickup location, insurance, deposit, and driving requirements with your rental provider.', type: 'Car rentals' }
];
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const storageKey = 'dar-dunes-collection-v1';
let collection = [];
let storageProblem = false;
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(stored)) throw new Error('Invalid collection');
  collection = stored.filter(item => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.summary === 'string');
} catch { storageProblem = true; }
const dialog = document.querySelector('#detail-dialog');
const dialogBody = document.querySelector('#dialog-body');
const form = document.querySelector('#search-form');
const error = document.querySelector('#form-error');
let tripType = 'Hotels & riads';
let activeTrip = null;
let searchTimer;
let toastTimer;
let returnFocus;
function notify(message) {
  const toast = document.querySelector('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
}
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(collection)); storageProblem = false; }
  catch { storageProblem = true; }
  updateCollection();
  if (storageProblem) notify('Browser storage is unavailable. Your collection will only last for this visit.');
}
function updateCollection() {
  const count = document.querySelector('#saved-count');
  count.textContent = collection.length;
  count.hidden = !collection.length;
  document.querySelectorAll('[data-save]').forEach(button => {
    const saved = collection.some(item => item.id === `destination:${button.dataset.save}`);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${button.dataset.save}${saved ? ' from collection' : ' to collection'}`);
  });
}
function openDialog(content) {
  dialogBody.innerHTML = content;
  renderIcons(dialogBody);
  if (!dialog.open) { returnFocus = document.activeElement; dialog.showModal(); }
  document.querySelector('.dialog-close').focus();
}
function closeDialog() { dialog.close(); }
dialog.addEventListener('close', () => {
  clearTimeout(searchTimer);
  form.querySelector('[type=submit]').disabled = false;
  returnFocus?.focus();
});
document.querySelector('.dialog-close').addEventListener('click', closeDialog);
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(); } });
function showCollection() {
  openDialog(`<p class="eyebrow">YOUR MOROCCO, IN THE MAKING</p><h2 id="dialog-title">My collection</h2>${storageProblem ? '<p role="status">Browser storage could not be read. New saves may only last for this visit.</p>' : ''}${collection.length ? `<p>Destinations and trip plans saved on this browser. These are not reservations.</p>${collection.map(item => `<div class="collection-item"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p></div><button data-remove="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.title)}">Remove</button></div>`).join('')}` : '<p>Your collection is waiting for a little inspiration. Save a destination with the heart, or plan a trip to keep your dates here.</p><button class="button" data-browse>Explore Morocco</button>'}`);
}
function showDestination(name) {
  const destination = [...destinations, ...extraDestinations].find(item => item.name === name);
  if (!destination) return;
  openDialog(`${destination.image ? `<img class="dialog-photo" src="public/stock/${destination.image}" width="600" height="220" alt="${escapeHtml(destination.name)} destination inspiration">` : ''}<p class="eyebrow">${destination.label || 'FIND YOUR OWN MOROCCO'}</p><h2 id="dialog-title">${destination.name}</h2><p>${destination.description}</p><p class="detail-meta">Destination guide only. Property availability, prices, and booking are not connected in this preview.</p><div class="dialog-actions"><button class="button" data-plan="${destination.name}">Plan a trip to ${destination.name}</button><button class="button secondary" data-save="${destination.name}">${collection.some(item => item.id === `destination:${destination.name}`) ? 'Remove from collection' : 'Save destination'}</button></div>`);
  updateCollection();
}
function setTripType(type) {
  tripType = type;
  document.querySelectorAll('[role=tab]').forEach(tab => {
    const active = tab.dataset.type === type;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active) form.setAttribute('aria-labelledby', tab.id);
  });
  const car = type === 'Car rentals';
  document.querySelector('#destination-label').textContent = car ? 'Pickup city' : 'Where to?';
  document.querySelector('#start-label').textContent = car ? 'Pickup date' : 'Check-in';
  document.querySelector('#end-label').textContent = car ? 'Return date' : 'Check-out';
  document.querySelector('#guests-label').textContent = car ? 'Passengers' : 'Travelers';
  form.elements.guests.setAttribute('aria-label', car ? 'Passengers' : 'Travelers');
  Array.from(form.elements.guests.options).forEach(option => { option.textContent = `${option.value} ${car ? (option.value === '1' ? 'passenger' : 'passengers') : (option.value === '1' ? 'traveler' : 'travelers')}`; });
  error.hidden = true;
}
function planDestination(name) {
  const destination = [...destinations, ...extraDestinations].find(item => item.name === name);
  if (destination) {
    const select = form.querySelector('select[name="destination"]');
    const option = Array.from(select.options).find(item => item.textContent.trim() === name);
    if (option) select.value = option.value;
    else select.add(new Option(name, name, true, true));
    setTripType(destination.type);
  }
  closeDialog();
  document.querySelector('#search').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  form.elements.start.focus({ preventScroll: true });
}
document.querySelector('#destination-grid').innerHTML = destinations.map(destination => `<article class="destination-card"><div class="destination-photo"><a href="#search" data-destination="${destination.name}" aria-label="Discover ${destination.name}"><img src="public/stock/${destination.image}" width="400" height="500" alt="${destination.name}, Morocco" loading="lazy"></a><button class="icon-button save-destination" data-save="${destination.name}" aria-label="Save ${destination.name} to collection" aria-pressed="false"><span data-icon="heart"></span></button></div><div class="destination-info"><div><h3>${destination.name}</h3><p>${destination.subtitle}</p></div><a href="#search" data-destination="${destination.name}" aria-label="Learn about ${destination.name}">↗</a></div></article>`).join('');
document.addEventListener('click', event => {
  const target = event.target.closest('button,a');
  if (!target) return;
  if (target.dataset.action === 'saved') showCollection();
  if (target.dataset.destination) { event.preventDefault(); showDestination(target.dataset.destination); }
  if (target.dataset.plan) planDestination(target.dataset.plan);
  if (target.hasAttribute('data-browse')) { closeDialog(); document.querySelector('#discover').scrollIntoView(); }
  if (target.dataset.save) {
    const name = target.dataset.save;
    const id = `destination:${name}`;
    const exists = collection.some(item => item.id === id);
    collection = exists ? collection.filter(item => item.id !== id) : [...collection, { id, title: name, summary: 'Destination inspiration' }];
    persist();
    if (!storageProblem) notify(exists ? `${name} removed from your collection.` : `${name} saved to your collection.`);
    if (dialog.open) showDestination(name);
  }
  if (target.dataset.remove) { collection = collection.filter(item => item.id !== target.dataset.remove); persist(); showCollection(); }
  if (target.dataset.trip) setTripType(target.dataset.trip);
  if (target.dataset.type) setTripType(target.dataset.type);
  if (target.hasAttribute('data-edit-search')) { closeDialog(); form.elements.destination.focus(); }
  if (target.hasAttribute('data-save-trip') && activeTrip) {
    if (!collection.some(item => item.id === activeTrip.id)) collection.push(activeTrip);
    persist();
    openDialog(`<p class="eyebrow">A LITTLE CLOSER</p><h2 id="dialog-title">Your trip plan is saved</h2><p>${escapeHtml(activeTrip.title)}</p><p class="detail-meta">${escapeHtml(activeTrip.summary)}</p><p>${storageProblem ? 'Saved for this visit only; browser storage is unavailable.' : 'Saved on this browser. You can find it in My collection.'} No reservation has been made and no payment has been taken.</p><button class="button" data-action="saved">View my collection</button>`);
  }
});
document.querySelectorAll('[role=tab]').forEach(tab => tab.addEventListener('keydown', event => {
  const tabs = [...document.querySelectorAll('[role=tab]')];
  let index = tabs.indexOf(tab);
  if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
  else if (event.key === 'ArrowLeft') index = (index + tabs.length - 1) % tabs.length;
  else if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = tabs.length - 1;
  else return;
  event.preventDefault(); setTripType(tabs[index].dataset.type); tabs[index].focus();
}));
const menu = document.querySelector('.menu-button');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open menu'); document.querySelector('#mobile-nav').hidden = true; }
menu.addEventListener('click', () => { const opening = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(opening)); menu.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu'); document.querySelector('#mobile-nav').hidden = !opening; });
document.querySelector('#mobile-nav').addEventListener('click', event => { if (event.target.closest('a,button')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.querySelector('#all-destinations').addEventListener('click', () => {
  openDialog(`<p class="eyebrow">FROM MEDINAS TO THE SEA</p><h2 id="dialog-title">Explore destinations</h2><p>Choose a starting point for your Morocco trip.</p>${[...destinations, ...extraDestinations].map(destination => `<div class="collection-item"><div><h3>${destination.name}</h3><p>${destination.subtitle || destination.description}</p></div><button data-plan="${destination.name}" aria-label="Plan ${destination.name}">Plan a trip ↗</button></div>`).join('')}`);
});
document.querySelector('#privacy-button').addEventListener('click', () => {
  openDialog('<p class="eyebrow">YOUR PLANS STAY WITH YOU</p><h2 id="dialog-title">Privacy & local storage</h2><p>Your collection is stored in this browser’s local storage. Trip dates, destination choices, and traveler counts are not sent to a booking service. There are no accounts or payments in this preview.</p><p>Remove individual plans in My collection. Clearing this site’s browser data also clears all saved plans. Your collection does not sync between devices.</p><button class="button" data-action="saved">Manage my collection</button>');
});
function localDate(offset = 0) { const date = new Date(); date.setDate(date.getDate() + offset); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
form.elements.start.min = localDate();
form.elements.end.min = localDate(1);
form.elements.start.value = localDate(1);
form.elements.end.value = localDate(4);
function nextDay(value) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + 1); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
form.noValidate = true;
form.addEventListener('input', () => { error.hidden = true; form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid')); });
form.addEventListener('submit', event => {
  event.preventDefault();
  const { start, end, destination, guests } = form.elements;
  error.hidden = true;
  let invalid;
  if (!start.value || start.value < localDate()) { error.textContent = 'Choose a start date today or later.'; invalid = start; }
  else if (!end.value || end.value <= start.value) { error.textContent = 'Choose an end date after your start date.'; invalid = end; }
  if (invalid) { error.hidden = false; invalid.setAttribute('aria-invalid', 'true'); invalid.setAttribute('aria-describedby', 'form-error'); invalid.focus(); return; }
  end.min = nextDay(start.value);
  const city = destination.value || 'Anywhere in Morocco';
  const formatDate = value => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
  const nights = Math.round((new Date(`${end.value}T12:00:00`) - new Date(`${start.value}T12:00:00`)) / 86400000);
  activeTrip = { id: `trip:${tripType}:${city}:${start.value}:${end.value}:${guests.value}`, title: `${tripType} · ${city}`, summary: `${formatDate(start.value)} – ${formatDate(end.value)} · ${nights} ${tripType === 'Car rentals' ? 'rental days' : nights === 1 ? 'night' : 'nights'} · ${guests.value} ${tripType === 'Car rentals' ? 'passengers' : 'travelers'}` };
  form.querySelector('[type=submit]').disabled = true;
  openDialog('<p class="eyebrow">YOUR MOROCCAN JOURNEY</p><h2 id="dialog-title">Preparing your trip plan</h2><div class="loading-bar" role="status" aria-label="Preparing your local trip summary"></div>');
  searchTimer = setTimeout(() => {
    form.querySelector('[type=submit]').disabled = false;
    openDialog(`<p class="eyebrow">YOUR MOROCCAN JOURNEY</p><h2 id="dialog-title">Your trip, taking shape</h2><p>${escapeHtml(activeTrip.title)}</p><p class="detail-meta">${escapeHtml(activeTrip.summary)}</p><h3>No live offers yet</h3><p>Our partner collection is still taking shape. We cannot show availability, quote prices, or request a reservation yet. Save your plan here, or change your destination and dates.</p><div class="dialog-actions"><button class="button" data-save-trip>Save trip plan</button><button class="button secondary" data-edit-search>Edit search</button></div>`);
  }, 300);
});
document.querySelector('#year').textContent = new Date().getFullYear();
renderIcons();
updateCollection();

const tripParameters = new URLSearchParams(location.search);
const requestedDestination = tripParameters.get('destination');
if ([...form.elements.destination.options].some(option => option.value === requestedDestination)) form.elements.destination.value = requestedDestination;
const requestedTypes = { hotels: 'Hotels & riads', homes: 'Homes & villas', cars: 'Car rentals' };
if (requestedTypes[tripParameters.get('type')]) setTripType(requestedTypes[tripParameters.get('type')]);
if (tripParameters.get('collection') === '1') showCollection();
if (tripParameters.get('privacy') === '1') document.querySelector('#privacy-button').click();
