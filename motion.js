const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const animatedSections = document.querySelectorAll('[data-reveal], .section-heading, .destination-grid, .journey-grid, .road-section, .philosophy');
const activeAnimations = new Set();
let revealObserver;
if ('IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      if (reducedMotion.matches || !entry.target.animate) return;
      const animation = entry.target.animate([{ opacity: 0.35, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 360, easing: 'ease-out' });
      activeAnimations.add(animation);
      animation.onfinish = () => activeAnimations.delete(animation);
    });
  }, { threshold: 0.1 });
  animatedSections.forEach(section => revealObserver.observe(section));
}
const tiltCards = document.querySelectorAll('[data-tilt], .destination-card');
tiltCards.forEach(card => {
  let frame;
  const reset = () => { cancelAnimationFrame(frame); card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y'); card.classList.remove('is-tilting'); };
  card.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      card.style.setProperty('--tilt-x', `${-y * 3}deg`);
      card.style.setProperty('--tilt-y', `${x * 3}deg`);
      card.classList.add('is-tilting');
    });
  });
  card.addEventListener('pointerleave', reset);
  card.addEventListener('pointercancel', reset);
  card.addEventListener('focusin', reset);
  reducedMotion.addEventListener('change', reset);
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) { activeAnimations.forEach(animation => animation.cancel()); activeAnimations.clear(); }
});
