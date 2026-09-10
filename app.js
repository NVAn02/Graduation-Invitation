(() => {
  'use strict';
  const config = window.invitationConfig;
  if (!config) throw new Error('Missing invitationConfig. Load config.js before app.js.');
  const read = path => path.split('.').reduce((value, key) => value?.[key], config);
  document.documentElement.lang = config.site.language;
  document.title = config.site.title.replaceAll('{classOf}', config.graduate.classOf);
  document.querySelector('meta[name="description"]').content = config.site.description;
  document.querySelectorAll('[data-content]').forEach(element => {
    const value = read(element.dataset.content);
    if (value !== undefined && value !== null) element.textContent = String(value);
  });
  document.querySelectorAll('[data-lines]').forEach(element => {
    const lines = read(element.dataset.lines);
    if (!Array.isArray(lines)) return;
    element.replaceChildren(...lines.flatMap((line, index) => index ? [document.createElement('br'), line] : [line]));
  });
  document.querySelectorAll('[data-image]').forEach(element => {
    const image = read(element.dataset.image);
    if (!image) return;
    element.src = image.src;
    element.alt = image.alt;
  });
  document.querySelectorAll('[data-map-link]').forEach(link => {
    try {
      const destination = new URL(config.links.googleMaps);
      if (destination.protocol !== 'https:') return;
      link.href = destination.href;
      link.hidden = false;
    } catch (_) { /* Keep the link hidden until a valid map URL is configured. */ }
  });
  document.querySelector('.dialog-close').ariaLabel = config.rsvp.dialog.closeLabel;
  document.querySelectorAll('[data-section]').forEach(element => {
    element.hidden = config.sections[element.dataset.section] === false;
  });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function initializeWebsiteMotion() {
  const compact = window.matchMedia('(max-height: 740px)');
  const opening = document.querySelector('.opening');
  let frame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  function draw() {
    frame = 0;
    if (!document.documentElement.classList.contains('motion')) return;
    const rect = opening.getBoundingClientRect();
    const progress = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
    const flap = clamp((progress - .08) / .23);
    const extract = clamp((progress - .25) / .43);
    const depart = clamp((progress - .63) / .2);
    opening.style.setProperty('--flap-angle', `${(1-flap)*180}deg`);
    opening.style.setProperty('--card-y', `${180*(1-extract)}px`);
    opening.style.setProperty('--card-scale', `${.76 + .24*extract}`);
    opening.style.setProperty('--card-alpha', `${clamp((progress-.19)/.12)}`);
    opening.style.setProperty('--envelope-y', `${depart*220}px`);
    opening.style.setProperty('--envelope-alpha', `${1-depart}`);
    opening.style.setProperty('--photo-alpha', `${clamp((progress-.68)/.2)}`);
    opening.style.setProperty('--photo-x', `${(1-clamp((progress-.68)/.2))*40}px`);
    opening.style.setProperty('--flap-layer', flap < .5 ? '6' : '2');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  function setMotion() {
    const cardFits = document.querySelector('.invitation-paper').offsetHeight <= window.innerHeight - 64;
    document.documentElement.classList.toggle('motion', !reduced.matches && !compact.matches && cardFits);
    schedule();
  }
  reduced.addEventListener('change', setMotion);
  compact.addEventListener('change', setMotion);
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', setMotion, {passive:true});
  setMotion();
  if (document.fonts) document.fonts.ready.then(setMotion);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('is-visible'); observer.unobserve(entry.target);}
    }), {threshold:.12});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    document.documentElement.classList.add('reveal-ready');
  }
  }
  if (window.envelopeIntro?.active) {
    document.addEventListener('invitation:intro-complete', initializeWebsiteMotion, {once:true});
  } else {
    initializeWebsiteMotion();
  }
  const dialog = document.querySelector('#rsvp-dialog');
  const button = document.querySelector('#rsvp-button');
  button.addEventListener('click', () => {
    let destination;
    try {destination = new URL(config.rsvp.url);} catch (_) { /* No destination configured yet. */ }
    if (destination && destination.protocol === 'https:') {window.location.assign(destination.href); return;}
    dialog.showModal();
  });
  dialog.querySelectorAll('button').forEach(close => close.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
})();
