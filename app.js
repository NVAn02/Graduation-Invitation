(() => {
  'use strict';
  const config = window.invitationConfig;
  if (!config) throw new Error('Missing invitationConfig. Load config.js before app.js.');
  const read = path => path.split('.').reduce((value, key) => value?.[key], config);
  // Keep a person's name together, including when it appears inside a sentence.
  const names = [...new Set([config.graduate.name, config.graduate.shortName].filter(Boolean))]
    .sort((a,b) => b.length-a.length);
  const namePattern = names.length ? new RegExp(`(${names.map(name => name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})`, 'g') : null;
  function contentNodes(value) {
    const text = String(value);
    if (!namePattern) return [text];
    return text.split(namePattern).map(part => {
      if (!names.includes(part)) return part;
      const name = document.createElement('span');
      name.className = 'person-name';
      name.textContent = part;
      return name;
    });
  }
  document.documentElement.lang = config.site.language;
  document.title = config.site.title.replaceAll('{classOf}', config.graduate.classOf);
  document.querySelector('meta[name="description"]').content = config.site.description;
  document.querySelectorAll('[data-content]').forEach(element => {
    const value = read(element.dataset.content);
    if (value !== undefined && value !== null) element.replaceChildren(...contentNodes(value));
  });
  document.querySelectorAll('[data-lines]').forEach(element => {
    const lines = read(element.dataset.lines);
    if (!Array.isArray(lines)) return;
    element.replaceChildren(...lines.flatMap((line, index) => index ? [document.createElement('br'), ...contentNodes(line)] : contentNodes(line)));
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
  const opening = document.querySelector('.opening');
  const card = document.querySelector('.invitation-paper');
  const flapElement = document.querySelector('.envelope-flap');
  const envelopeElements = ['.envelope-back','.envelope-pocket','.envelope-flap'].map(selector => document.querySelector(selector));
  const portrait = document.querySelector('.portrait-print');
  // Measure the same stable viewport unit used by the sticky stage, not the
  // changing visible height when a mobile browser's address bar moves.
  let viewportProbe;
  if (window.CSS?.supports('height','100svh')) {
    viewportProbe = document.createElement('div');
    viewportProbe.className = 'opening-viewport-measure';
    viewportProbe.setAttribute('aria-hidden','true');
    document.body.append(viewportProbe);
  }
  let frame = 0;
  let start = 0, distance = 1, progress = null, lastTime = 0, active = false;
  let measuredWidth, measuredHeight;
  const clamp = value => Math.max(0, Math.min(1, value));
  function draw(time = 0) {
    frame = 0;
    if (!active) return;
    const target = clamp(((window.scrollY || 0) - start) / distance);
    const previous = progress;
    const elapsed = lastTime ? Math.min(64,Math.max(1,time-lastTime)) : 16;
    lastTime = time;
    progress = progress === null ? target : progress + (target-progress)*(1-Math.exp(-elapsed/55));
    if (Math.abs(target-progress) < .0001) progress = target;
    if (progress === previous) return;
    const flap = clamp((progress - .08) / .23);
    const extract = clamp((progress - .25) / .43);
    const depart = clamp((progress - .63) / .2);
    // Keep animated variables on the affected layers, avoiding style
    // invalidation across every descendant of the opening section.
    flapElement.style.setProperty('--flap-angle', `${(1-flap)*180}deg`);
    flapElement.style.setProperty('--flap-layer', flap < .5 ? '6' : '2');
    card.style.setProperty('--card-y', `${180*(1-extract)}px`);
    card.style.setProperty('--card-scale', `${.76 + .24*extract}`);
    card.style.setProperty('--card-alpha', `${clamp((progress-.19)/.12)}`);
    envelopeElements.forEach(element => {
      element.style.setProperty('--envelope-y', `${depart*220}px`);
      element.style.setProperty('--envelope-alpha', `${1-depart}`);
    });
    portrait.style.setProperty('--photo-alpha', `${clamp((progress-.68)/.2)}`);
    portrait.style.setProperty('--photo-x', `${(1-clamp((progress-.68)/.2))*40}px`);
    if (progress !== target) schedule();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  function setMotion() {
    measuredHeight = viewportProbe?.offsetHeight || window.innerHeight;
    measuredWidth = window.innerWidth;
    const cardFits = card.offsetHeight <= measuredHeight - 64;
    active = measuredWidth > 900 && !reduced.matches && measuredHeight > 740 && cardFits;
    document.documentElement.classList.toggle('motion', active);
    const rect = opening.getBoundingClientRect();
    start = rect.top + (window.scrollY || 0);
    distance = Math.max(1, rect.height - measuredHeight);
    progress = null;
    schedule();
  }
  reduced.addEventListener('change', setMotion);
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', () => {
    const height = viewportProbe?.offsetHeight || window.innerHeight;
    if (window.innerWidth !== measuredWidth || height !== measuredHeight) setMotion();
  }, {passive:true});
  setMotion();
  if (document.fonts) document.fonts.ready.then(setMotion);
  if ('ResizeObserver' in window) {
    new ResizeObserver(setMotion).observe(card);
  }
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
    document.querySelector('#dialog-title').focus({preventScroll:true});
    dialog.scrollTop = 0;
  });
  dialog.querySelectorAll('button').forEach(close => close.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
})();
