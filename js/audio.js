(function () {
  const STORAGE_VOLUME = 'colorado_audio_volume';
  const STORAGE_MUTED = 'colorado_audio_muted';
  const STORAGE_SESSION = 'colorado_audio_session';
  const DEFAULT_VOLUME = 0.3;
  const DUCK_RATIO = 0.15;
  const FADE_MS = 1200;

  const PLAYLIST = [
    'Music/KOTA The Friend - COLORADO {Official Music Video}.mp3',
    'Music/Milky Chance - Colorado (Lyric Video).mp3',
    'Music/Reneé Rapp - Colorado (Official Audio).mp3',
    'Music/_Colorado Bluebird Sky_- The String Cheese Incident (Song In My Head).mp3'
  ];

  if (document.body.dataset.noAmbient !== undefined) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const audio = new Audio();
  audio.preload = 'metadata';

  let trackIndex = 0;
  let userVolume = readVolume();
  let isMuted = readMuted();
  let isPlaying = false;
  let isDucked = false;
  let fadeFrame = null;
  let unlocked = false;
  let contentPlaying = 0;

  function readVolume() {
    const saved = parseFloat(localStorage.getItem(STORAGE_VOLUME));
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : DEFAULT_VOLUME;
  }

  function readMuted() {
    return localStorage.getItem(STORAGE_MUTED) === '1';
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_VOLUME, String(userVolume));
      localStorage.setItem(STORAGE_MUTED, isMuted ? '1' : '0');
    } catch (err) {
      /* storage blocked */
    }
  }

  function saveSession() {
    try {
      sessionStorage.setItem(STORAGE_SESSION, JSON.stringify({
        playing: isPlaying && !isMuted,
        trackIndex,
        time: audio.currentTime || 0
      }));
    } catch (err) {
      /* storage blocked */
    }
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(STORAGE_SESSION);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function shuffleStartIndex() {
    return Math.floor(Math.random() * PLAYLIST.length);
  }

  function effectiveVolume() {
    if (isMuted) return 0;
    return isDucked ? userVolume * DUCK_RATIO : userVolume;
  }

  function applyVolume() {
    audio.volume = effectiveVolume();
  }

  function cancelFade() {
    if (fadeFrame) {
      cancelAnimationFrame(fadeFrame);
      fadeFrame = null;
    }
  }

  function fadeTo(target, done) {
    cancelFade();
    const start = audio.volume;
    const delta = target - start;
    if (Math.abs(delta) < 0.01) {
      audio.volume = target;
      if (done) done();
      return;
    }

    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - startTime) / FADE_MS);
      audio.volume = start + delta * t;
      if (t < 1) {
        fadeFrame = requestAnimationFrame(step);
      } else if (done) {
        done();
      }
    };
    fadeFrame = requestAnimationFrame(step);
  }

  function loadTrack(index) {
    trackIndex = (index + PLAYLIST.length) % PLAYLIST.length;
    audio.src = PLAYLIST[trackIndex];
  }

  function getDict() {
    const lang = document.documentElement.lang || 'en';
    return (typeof I18N !== 'undefined' && I18N[lang]) ? I18N[lang] : {};
  }

  function updateUi() {
    if (!root) return;

    const sliderVal = Math.round(userVolume * 100);
    slider.value = String(sliderVal);
    slider.setAttribute('aria-valuenow', String(sliderVal));

    const isMutedState = sliderVal === 0 || isMuted;
    const isAudiblePlaying = isPlaying && !isMutedState;

    volumeBtn.classList.toggle('is-muted', isMutedState);
    playbackBtn.classList.toggle('is-playing', isAudiblePlaying);
    playbackBtn.setAttribute('aria-pressed', String(isAudiblePlaying));

    const dict = getDict();
    volumeBtn.setAttribute(
      'aria-label',
      isMutedState
        ? (dict['a11y.audio.unmute'] || 'Unmute background music')
        : (dict['a11y.audio.mute'] || 'Mute background music')
    );
    playbackBtn.setAttribute(
      'aria-label',
      isAudiblePlaying
        ? (dict['a11y.audio.pause'] || 'Pause background music')
        : (dict['a11y.audio.play'] || 'Play background music')
    );
  }

  function playAmbient() {
    if (!unlocked || isMuted) return;
    applyVolume();
    const promise = audio.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        isPlaying = false;
        updateUi();
      });
    }
    isPlaying = true;
    fadeTo(effectiveVolume());
    updateUi();
    saveSession();
  }

  function pauseAmbient() {
    cancelFade();
    audio.pause();
    isPlaying = false;
    updateUi();
    saveSession();
  }

  function togglePlayPause() {
    unlocked = true;

    if (isPlaying) {
      pauseAmbient();
      return;
    }

    if (isMuted || userVolume === 0) {
      userVolume = userVolume > 0 ? userVolume : DEFAULT_VOLUME;
      isMuted = false;
      savePrefs();
    }

    playAmbient();
  }

  function toggleMute() {
    unlocked = true;

    if (userVolume === 0 || isMuted) {
      if (userVolume === 0) userVolume = DEFAULT_VOLUME;
      isMuted = false;
      savePrefs();
      applyVolume();
      if (!isPlaying) playAmbient();
      else fadeTo(effectiveVolume());
      updateUi();
      return;
    }

    setUserVolume(0);
  }

  function setUserVolume(value) {
    const sliderVal = Math.round(Math.min(100, Math.max(0, value * 100)));
    const wasMuted = isMuted;
    userVolume = sliderVal / 100;
    isMuted = sliderVal === 0;
    savePrefs();

    if (isMuted) {
      pauseAmbient();
    } else {
      applyVolume();
      if (isPlaying) {
        fadeTo(effectiveVolume());
      } else if (wasMuted && unlocked) {
        playAmbient();
      }
    }

    updateUi();
  }

  function duck() {
    isDucked = true;
    if (isPlaying) fadeTo(effectiveVolume());
  }

  function unduck() {
    isDucked = false;
    if (isPlaying) fadeTo(effectiveVolume());
  }

  function onContentPlay() {
    contentPlaying += 1;
    duck();
  }

  function onContentPause() {
    contentPlaying = Math.max(0, contentPlaying - 1);
    if (contentPlaying === 0) unduck();
  }

  function bindContentMedia() {
    document.querySelectorAll('[data-audio-role="content"]').forEach((el) => {
      if (el.dataset.audioBound === '1') return;
      el.dataset.audioBound = '1';
      el.addEventListener('play', onContentPlay);
      el.addEventListener('pause', onContentPause);
      el.addEventListener('ended', onContentPause);
    });
  }

  function unlockAndMaybePlay() {
    if (unlocked || introBlocksAmbient()) return;
    unlocked = true;
    if (!isMuted) playAmbient();
  }

  function introBlocksAmbient() {
    return document.body.classList.contains('home-intro-active');
  }

  function initPlaybackState() {
    const session = loadSession();
    trackIndex = session && Number.isFinite(session.trackIndex)
      ? session.trackIndex
      : shuffleStartIndex();
    loadTrack(trackIndex);

    if (session && session.time > 0) {
      audio.currentTime = session.time;
    }

    if (introBlocksAmbient()) return;

    if (session && session.playing && !isMuted) {
      unlocked = true;
      playAmbient();
    }
  }

  function buildWidget() {
    if (document.getElementById('ambient-audio')) return null;

    const wrap = document.createElement('div');
    wrap.className = 'ambient-audio';
    wrap.id = 'ambient-audio';
    wrap.innerHTML = `
      <div class="ambient-audio__controls">
        <button type="button" class="ambient-audio__btn ambient-audio__btn--playback" id="ambient-audio-playback" aria-pressed="false" data-i18n-aria-label="a11y.audio.play" aria-label="Avvia musica di sottofondo">
          <svg class="ambient-audio__icon ambient-audio__icon--play" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9 7.5v9l7.5-4.5L9 7.5z" fill="currentColor"/>
          </svg>
          <svg class="ambient-audio__icon ambient-audio__icon--pause" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M8 7h2.5v10H8V7zm5.5 0H16v10h-2.5V7z" fill="currentColor"/>
          </svg>
        </button>
        <span class="ambient-audio__divider" aria-hidden="true"></span>
        <div class="ambient-audio__volume-zone" id="ambient-audio-volume-zone">
          <div class="ambient-audio__panel" id="ambient-audio-panel" role="group" data-i18n-aria-label="a11y.audio.volume" aria-label="Volume musica">
            <input type="range" class="ambient-audio__slider" id="ambient-audio-slider" min="0" max="100" value="30" aria-valuemin="0" aria-valuemax="100" aria-valuenow="30" data-i18n-aria-label="a11y.audio.volume" aria-label="Volume musica">
          </div>
          <button type="button" class="ambient-audio__btn ambient-audio__btn--volume" id="ambient-audio-volume" data-i18n-aria-label="a11y.audio.mute" aria-label="Muta musica di sottofondo">
            <svg class="ambient-audio__icon ambient-audio__icon--on" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor"/>
              <path d="M15.5 8.5a5 5 0 010 7" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
              <path d="M18 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
            <svg class="ambient-audio__icon ambient-audio__icon--off" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor"/>
              <path d="M16 9l5 5M21 9l-5 5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);
    return wrap;
  }

  const root = buildWidget();
  if (!root) return;

  const volumeBtn = root.querySelector('#ambient-audio-volume');
  const playbackBtn = root.querySelector('#ambient-audio-playback');
  const slider = root.querySelector('#ambient-audio-slider');
  const volumeZone = root.querySelector('#ambient-audio-volume-zone');

  slider.value = String(Math.round(userVolume * 100));

  function setVolumePanelOpen(open) {
    root.classList.toggle('is-open', open);
  }

  volumeBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMute();
  });

  playbackBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    togglePlayPause();
  });

  slider.addEventListener('input', () => {
    unlocked = true;
    setUserVolume(slider.valueAsNumber / 100);
  });

  slider.addEventListener('change', () => {
    unlocked = true;
    setUserVolume(slider.valueAsNumber / 100);
  });

  slider.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    setVolumePanelOpen(true);
  });

  if (volumeZone) {
    volumeZone.addEventListener('mouseenter', () => {
      setVolumePanelOpen(true);
    });

    volumeZone.addEventListener('mouseleave', () => {
      if (!slider.matches(':active')) setVolumePanelOpen(false);
    });
  }

  root.addEventListener('pointerdown', (event) => {
    if (window.innerWidth >= 768) return;
    if (playbackBtn.contains(event.target)) return;
    if (volumeZone?.contains(event.target)) setVolumePanelOpen(true);
  });

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) setVolumePanelOpen(false);
  });

  audio.addEventListener('ended', () => {
    loadTrack(trackIndex + 1);
    if (isPlaying && !isMuted) playAmbient();
  });

  audio.addEventListener('timeupdate', () => {
    if (isPlaying) saveSession();
  });

  window.addEventListener('beforeunload', saveSession);

  document.addEventListener('colorado:intro-dismissed', () => {
    unlocked = true;
    if (!isMuted) playAmbient();
  });

  document.addEventListener('pointerdown', unlockAndMaybePlay, { once: true });
  document.addEventListener('keydown', unlockAndMaybePlay, { once: true });

  bindContentMedia();
  const mediaObserver = new MutationObserver(bindContentMedia);
  mediaObserver.observe(document.body, { childList: true, subtree: true });

  initPlaybackState();
  updateUi();

  if (typeof i18nApply === 'function') {
    i18nApply(document.documentElement.lang || 'en');
  }

  window.addEventListener('colorado:langchange', () => updateUi());

  window.ColoradoAudio = {
    play: playAmbient,
    pause: pauseAmbient,
    setVolume: setUserVolume,
    duck,
    unduck
  };
})();
