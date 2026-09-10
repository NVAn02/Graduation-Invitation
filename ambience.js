(() => {
  'use strict';
  const config = window.invitationConfig?.ambience;
  if (!config) return;
  const introActive = () => window.envelopeIntro?.active === true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let petals;
  if (config.petals) {
    petals = document.createElement('div');
    petals.className = 'petal-field';
    petals.setAttribute('aria-hidden','true');
    for (let i=0;i<16;i++) {
      const drift = document.createElement('span');
      drift.className = 'petal-drift';
      drift.style.cssText = `--left:${(i*37)%104-4}%;--size:${8+i%5*2}px;--duration:${18+i%7*2}s;--delay:-${i*3.7}s;--sway:${3+i%4}s;--alpha:${.4+i%4*.13}`;
      drift.append(document.createElement('i'));
      petals.append(drift);
    }
    document.body.append(petals);
    const updatePetals = () => {
      petals.hidden = introActive() || reduced.matches;
      petals.classList.toggle('is-paused',document.hidden || petals.hidden);
    };
    updatePetals();
    reduced.addEventListener('change',updatePetals);
    document.addEventListener('visibilitychange',updatePetals);
    document.addEventListener('invitation:intro-complete',updatePetals,{once:true});
  }

  const music = config.music;
  if (!music?.enabled) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'music-toggle';
  button.hidden = introActive();
  const symbol = document.createElement('span');
  symbol.className = 'music-symbol';
  symbol.textContent = '♪';
  symbol.setAttribute('aria-hidden','true');
  const label = document.createElement('span');
  button.append(symbol,label);
  document.body.append(button);

  const configuredVolume = Number(music.volume);
  const volume = Number.isFinite(configuredVolume) ? Math.max(0,Math.min(1,configuredVolume)) : .2;
  let context, master, interval, audio;
  let playing = false, busy = false, nextNote = 0, beat = 0;
  const beatLength = 60/68;
  // An original, repeating instrumental: soft bell-like keys and broken chords.
  const chords = [[48,55,60,64],[45,52,57,60],[53,60,65,69],[43,50,55,62]];
  const melody = [72,76,79,76,74,72,69,72,77,76,72,69,74,71,67,null,
                  76,79,84,79,76,72,69,72,77,81,79,77,74,71,72,null];
  function updateButton() {
    button.setAttribute('aria-pressed',String(playing));
    button.setAttribute('aria-label',playing ? music.pauseLabel : music.playLabel);
    label.textContent = playing ? music.onText : music.offText;
  }
  function note(midi,time,duration,level) {
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0,time);
    envelope.gain.linearRampToValueAtTime(level,time+.025);
    envelope.gain.exponentialRampToValueAtTime(.0001,time+duration);
    envelope.connect(master);
    const oscillator = context.createOscillator();
    oscillator.setPeriodicWave(context.createPeriodicWave(
      new Float32Array([0,0,0,0]),new Float32Array([0,1,.16,.035])));
    oscillator.frequency.value = 440*Math.pow(2,(midi-69)/12);
    oscillator.connect(envelope);
    oscillator.start(time);
    oscillator.stop(time+duration+.05);
    oscillator.onended = () => {oscillator.disconnect();envelope.disconnect();};
  }
  function schedule() {
    if (!playing || !context || context.state !== 'running') return;
    // Do not catch up missed bars when returning from a throttled background tab.
    if (nextNote < context.currentTime-.25) nextNote = context.currentTime+.05;
    while (nextNote < context.currentTime+.18) {
      const chord = chords[Math.floor(beat/4)%chords.length];
      note(chord[beat%4],nextNote,2.6,.2);
      const pitch = melody[beat%melody.length];
      if (pitch !== null) note(pitch,nextNote,2.1,.25);
      nextNote += beatLength;
      beat++;
    }
  }
  function makeInstrument() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('Audio is unavailable');
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = volume;
    master.connect(context.destination);
    const echo = context.createDelay(1);
    const feedback = context.createGain();
    echo.delayTime.value = .32;
    feedback.gain.value = .18;
    master.connect(echo);
    echo.connect(feedback);
    feedback.connect(echo);
    feedback.connect(context.destination);
  }
  async function play() {
    if (playing || busy) return;
    busy = true;
    try {
      if (music.src) {
        if (!audio) {audio = new Audio(music.src);audio.loop = true;audio.volume = volume;}
        await audio.play();
      } else {
        if (!context) makeInstrument();
        await context.resume();
        nextNote = context.currentTime+.06;
      }
      playing = true;
      if (context) {schedule();interval = setInterval(schedule,100);}
    } catch (_) {
      playing = false; // Autoplay denial leaves the manual play button available.
    } finally {busy = false;updateButton();}
  }
  async function pause() {
    if (busy) return;
    busy = true;
    clearInterval(interval);
    playing = false;
    try {if (audio) audio.pause();if (context) await context.suspend();}
    finally {busy = false;updateButton();}
  }
  updateButton();
  button.addEventListener('click',()=>playing ? pause() : play());
  // This handler runs inside the actual gesture, before browser activation expires.
  document.getElementById('intro-open')?.addEventListener('click',()=>{
    button.hidden = false;
    play();
  },{once:true});
  document.addEventListener('invitation:intro-complete',()=>{button.hidden=false;},{once:true});
  document.addEventListener('visibilitychange',()=>{
    if (document.hidden && playing) pause();
  });
})();
