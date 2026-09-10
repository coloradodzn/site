(function () {
  const INTRO_KEY = 'colorado_intro_seen';
  const SESSION_KEY = 'colorado_session';
  let introAbort = null;

  function initHomeIntro() {
    introAbort?.abort();
    introAbort = new AbortController();
    const { signal } = introAbort;

    const intro = document.getElementById('home-intro');
    const video = document.getElementById('home-intro-video');
    const startBtn = document.getElementById('home-intro-start');
    const skipBtn = document.getElementById('home-intro-skip');
    const playBtn = document.getElementById('home-intro-play');

    if (!intro || !document.body.classList.contains('home-intro-active')) {
      if (intro) {
        intro.classList.add('is-hidden');
        intro.classList.remove('is-playing', 'is-gate', 'is-locked', 'is-fading', 'is-arming');
        intro.setAttribute('aria-hidden', 'true');
      }
      return;
    }

    intro.classList.remove('is-hidden');
    intro.setAttribute('aria-hidden', 'false');

    function dismissIntro() {
      try {
        localStorage.setItem(INTRO_KEY, '1');
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch (err) {
        /* storage blocked */
      }

      intro.classList.add('is-hidden');
      intro.classList.remove('is-playing', 'is-gate', 'is-locked', 'is-fading', 'is-arming');
      document.body.classList.remove('home-intro-active', 'home-intro-sigla');

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.body.classList.add('home-intro-landed');
      window.setTimeout(() => document.body.classList.remove('home-intro-landed'), 4200);

      window.setTimeout(() => {
        intro.setAttribute('aria-hidden', 'true');
      }, 700);

      if (video) {
        video.pause();
        video.currentTime = 0;
      }

      document.dispatchEvent(new CustomEvent('colorado:intro-dismissed'));
    }

    function unlockGate() {
      intro.classList.remove('is-locked');
      if (startBtn) {
        startBtn.removeAttribute('aria-disabled');
        startBtn.disabled = false;
      }
    }

    /** Fine sigla: dissolvenza sul sito + cartello Welcome (button.png). */
    function showGate() {
      intro.classList.add('is-fading');
      intro.classList.remove('is-playing', 'is-arming');
      document.body.classList.remove('home-intro-sigla');

      if (video) {
        video.pause();
      }

      const revealGate = () => {
        intro.classList.remove('is-fading');
        intro.classList.add('is-gate');

        const consentPending = typeof window.coloradoCookieChoicePending === 'function'
          && window.coloradoCookieChoicePending();

        if (consentPending) {
          intro.classList.add('is-locked');
          if (startBtn) {
            startBtn.setAttribute('aria-disabled', 'true');
            startBtn.disabled = true;
          }
          document.addEventListener('colorado:cookies-settled', unlockGate, { once: true, signal });
        } else {
          unlockGate();
        }

        document.dispatchEvent(new CustomEvent('colorado:intro-gate'));
      };

      window.setTimeout(revealGate, prefersReducedMotion() ? 0 : 700);
    }

    function prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /** Schermo nero + CTA: il click è il gesto che permette l’audio. */
    function showArming() {
      if (!video) {
        showGate();
        return;
      }

      video.pause();
      video.muted = false;
      video.currentTime = 0;

      intro.classList.add('is-arming');
      intro.classList.remove('is-playing', 'is-gate', 'is-fading');
      document.body.classList.add('home-intro-sigla');
    }

    /** Parte solo con audio — mai muted. */
    function playWithSound() {
      if (!video) {
        showGate();
        return;
      }

      intro.classList.remove('is-arming');
      intro.classList.add('is-playing');
      document.body.classList.add('home-intro-sigla');

      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.playsInline = true;
      video.muted = false;
      video.volume = 1;
      video.removeAttribute('muted');

      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          /* Ancora bloccato: resta sul tap-to-play, niente mute */
          showArming();
        });
      }
    }

    /**
     * Prova autoplay CON suono. Se il browser lo blocca → tap-to-play
     * (mai fallback muted: la sigla ha audio).
     */
    function beginSigla() {
      if (!video) {
        showGate();
        return;
      }

      video.muted = false;
      video.volume = 1;
      video.removeAttribute('muted');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.playsInline = true;

      intro.classList.add('is-playing');
      intro.classList.remove('is-arming', 'is-gate', 'is-fading');
      document.body.classList.add('home-intro-sigla');

      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => showArming());
      }
    }

    if (playBtn) {
      playBtn.addEventListener('click', playWithSound, { signal });
    }
    if (startBtn) startBtn.addEventListener('click', dismissIntro, { signal });
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        showGate();
      }, { signal });
    }
    if (video) {
      video.addEventListener('ended', () => {
        showGate();
      }, { signal });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        if (intro.classList.contains('is-arming')) {
          event.preventDefault();
          playWithSound();
          return;
        }
      }
      if (event.key !== 'Escape') return;
      if (intro.classList.contains('is-locked')) {
        return;
      }
      if (intro.classList.contains('is-gate')) {
        dismissIntro();
      } else if (intro.classList.contains('is-playing') || intro.classList.contains('is-fading')) {
        showGate();
      } else if (intro.classList.contains('is-arming')) {
        showGate();
      }
    }, { signal });

    beginSigla();
  }

  initHomeIntro();
  document.addEventListener('colorado:pagechange', initHomeIntro);
})();
