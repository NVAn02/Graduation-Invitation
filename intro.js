(() => {
  'use strict';
  const root = document.documentElement;
  if (window.invitationConfig?.intro?.enabled === false) return;
  const intro = window.envelopeIntro = {active:true, state:'closed'};
  root.classList.add('intro-active');
  // A failed or incomplete load must never leave the invitation inaccessible.
  const bootFallback = setTimeout(finish, 12000);
  const timers = [];
  let layer, button, main, skip;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function state(value) {
    intro.state = value;
    if (layer) layer.dataset.state = value;
  }
  function finish() {
    if (!intro.active) return;
    clearTimeout(bootFallback);
    timers.forEach(clearTimeout);
    state('complete');
    intro.active = false;
    root.classList.remove('intro-active', 'intro-revealing');
    if (layer) {layer.hidden = true; layer.inert = true;}
    if (main) main.inert = false;
    if (skip) skip.inert = false;
    window.scrollTo({top:0,left:0,behavior:'instant'});
    document.dispatchEvent(new Event('invitation:intro-complete'));
    const heading = document.getElementById('cover-title');
    if (heading && button) {
      heading.setAttribute('tabindex','-1');
      heading.focus({preventScroll:true});
      heading.addEventListener('blur',()=>heading.removeAttribute('tabindex'),{once:true});
    }
  }
  function reveal() {
    state('revealing');
    root.classList.add('intro-revealing');
  }
  function open() {
    if (intro.state !== 'closed') return;
    state('opening');
    button.setAttribute('aria-disabled','true');
    if (reduced.matches) {
      layer.classList.add('intro-reduced');
      reveal();
      timers.push(setTimeout(finish,200));
    } else {
      timers.push(setTimeout(reveal,2100),setTimeout(finish,3250));
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (!intro.active) return;
    layer = document.getElementById('envelope-intro');
    button = document.getElementById('intro-open');
    main = document.querySelector('main');
    skip = document.querySelector('.skip-link');
    if (!layer || !button || !main) {finish(); return;}
    main.inert = true;
    if (skip) skip.inert = true;
    layer.hidden = false;
    button.setAttribute('aria-label',window.invitationConfig?.intro?.openText || 'Open invitation');
    button.addEventListener('click',open);
    window.scrollTo({top:0,left:0,behavior:'instant'});
    clearTimeout(bootFallback);
  }, {once:true});
  // If a visitor enables reduced motion mid-sequence, finish without further movement.
  reduced.addEventListener('change',()=>{
    if (reduced.matches && intro.active && intro.state !== 'closed') finish();
  });
  window.addEventListener('pageshow',event=>{
    if (event.persisted && intro.active && intro.state !== 'closed') finish();
  });
})();
