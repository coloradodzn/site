(function () {
  const INTRO_KEY = 'colorado_intro_seen';
  const SESSION_KEY = 'colorado_session';
  const intro = document.getElementById('home-intro');
  const gate = document.getElementById('home-intro-gate');
  const videoWrap = document.getElementById('home-intro-video-wrap');
  const video = document.getElementById('home-intro-video');
  const startBtn = document.getElementById('home-intro-start');
  const skipBtn = document.getElementById('home-intro-skip');

  if (!intro || !document.body.classList.contains('home-intro-active')) return;

  intro.setAttribute('aria-hidden', 'false');

  function dismissIntro() {
    try {
      localStorage.setItem(INTRO_KEY, '1');
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch (err) {
      /* storage blocked */
    }

    intro.classList.add('is-hidden');
    intro.classList.remove('is-playing', 'is-gate');
    document.body.classList.remove('home-intro-active', 'home-intro-sigla');

    window.setTimeout(() => {
      intro.setAttribute('aria-hidden', 'true');
    }, 700);

    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    document.dispatchEvent(new CustomEvent('colorado:intro-dismissed'));
  }

  function showGate() {
    intro.classList.remove('is-playing');
    intro.classList.add('is-gate');
    document.body.classList.remove('home-intro-sigla');

    if (video) {
      video.pause();
    }
  }

  function playSigla() {
    if (!video) {
      showGate();
      return;
    }

    intro.classList.add('is-playing');
    intro.classList.remove('is-gate');
    document.body.classList.add('home-intro-sigla');

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => showGate());
    }
  }

  if (startBtn) startBtn.addEventListener('click', dismissIntro);
  if (skipBtn) skipBtn.addEventListener('click', showGate);
  if (video) video.addEventListener('ended', showGate);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (intro.classList.contains('is-gate')) {
      dismissIntro();
    } else if (intro.classList.contains('is-playing')) {
      showGate();
    }
  });

  playSigla();
})();
