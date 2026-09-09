/**
 * About globe — TacticalGlobe3D + archi Roma → destinazione (opzione B).
 * Click ping → stop spin → arco draw → fade → riparte spin.
 */
import { createElement, Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import TacticalGlobe from './vendor/TacticalGlobe3D.js';

const ROME = { id: 'rome', label: 'Roma', description: 'Hub', latitude: 41.9028, longitude: 12.4964, hub: true };

const DESTINATIONS = [
  { id: 'ireland', label: 'Ireland', description: 'Dublin', latitude: 53.3498, longitude: -6.2603 },
  { id: 'lerici', label: 'Lerici', description: 'Liguria · La Spezia', latitude: 44.0761, longitude: 9.9114 },
  { id: 'salerno', label: 'Salerno', description: 'Campania', latitude: 40.6824, longitude: 14.7681 },
  { id: 'brescia', label: 'Brescia', description: 'Lombardia', latitude: 45.5416, longitude: 10.2118 },
  { id: 'brooklyn', label: 'Brooklyn', description: 'New York · USA', latitude: 40.6782, longitude: -73.9442 },
  { id: 'spain', label: 'Madrid', description: 'Spain', latitude: 40.4168, longitude: -3.7038 },
];

const ZOOM_MIN = 1;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.12;
/** Rotazione fluida verso Europa su “vedi tutte” (niente teleport / niente zoom forzato) */
const VIEW_TWEEN_MS = 1100;

const DRAW_MS = 1400;
const HOLD_MS = 180;
const FADE_MS = 520;
const ARC_SAMPLES = 72;
const ARC_COLOR = '#FF4D0A';

/* Vista Europa / Roma — hub e destinazioni (per ora) sul lato frontale.
   lambda (rotateZ) ≈ lng Roma; phi (rotateY) positivo porta le medie latitudini
   al centro (phi negativo inquadra l’Africa). */
const EUROPE_VIEW = {
  rotateX: 0,
  rotateY: 38,
  rotateZ: ROME.longitude, // ~12.5°
};
const DEFAULT_VIEW = {
  rotateX: 0,
  rotateY: 28,
  rotateZ: ROME.longitude,
};

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function isDarkTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark') return true;
  if (attr === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function reduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function clampZoom(v) {
  return clamp(v, ZOOM_MIN, ZOOM_MAX);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Percorso angolare più corto (gradi). */
function shortestDelta(from, to) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function readLiveView(frame, fallback) {
  if (frame && Number.isFinite(frame.lambda) && Number.isFinite(frame.phi) && Number.isFinite(frame.gamma)) {
    return {
      rotateX: frame.gamma,
      rotateY: frame.phi,
      rotateZ: frame.lambda,
    };
  }
  return { ...fallback };
}

function toXYZ(lat, lng) {
  const la = lat * D2R;
  const ln = lng * D2R;
  const cl = Math.cos(la);
  return [cl * Math.cos(ln), cl * Math.sin(ln), Math.sin(la)];
}

function slerp(a, b, t) {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  dot = clamp(dot, -1, 1);
  const omega = Math.acos(dot);
  if (omega < 1e-5) return [a[0], a[1], a[2]];
  const so = Math.sin(omega);
  const s1 = Math.sin((1 - t) * omega) / so;
  const s2 = Math.sin(t * omega) / so;
  return [s1 * a[0] + s2 * b[0], s1 * a[1] + s2 * b[1], s1 * a[2] + s2 * b[2]];
}

/** Same rotation convention as TacticalGlobe3D project(), with lofted xyz. */
function projectLofted(x, y, z, lambda, phi, gamma, R, cx, cy) {
  const cL = Math.cos(lambda * D2R);
  const sL = Math.sin(lambda * D2R);
  const xL = x * cL + y * sL;
  const yL = -x * sL + y * cL;
  const zL = z;

  const cp = Math.cos(phi * D2R);
  const sp = Math.sin(phi * D2R);
  const x1 = xL * cp + zL * sp;
  const y1 = yL;
  const z1 = -xL * sp + zL * cp;

  const cg = Math.cos(gamma * D2R);
  const sg = Math.sin(gamma * D2R);
  const rx = x1;
  const ry = y1 * cg - z1 * sg;
  const rz = y1 * sg + z1 * cg;
  return {
    sx: cx + R * ry,
    sy: cy - R * rz,
    rx,
    v: rx >= 0,
  };
}

function angularDistance(a, b) {
  const dot = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
  return Math.acos(dot);
}

function buildArcPath(from, to, progress, frame, loft) {
  if (!frame || progress <= 0) return '';
  const { lambda, phi, gamma, R, cx, cy } = frame;
  const A = toXYZ(from.latitude, from.longitude);
  const B = toXYZ(to.latitude, to.longitude);
  const n = Math.max(8, Math.ceil(ARC_SAMPLES * progress));
  let d = '';
  let started = false;
  let prev = null;

  for (let i = 0; i <= n; i++) {
    const t = (i / n) * progress;
    let p = slerp(A, B, t);
    const bump = Math.sin(t * Math.PI) * loft;
    const plen = Math.hypot(p[0], p[1], p[2]) || 1;
    p = [(p[0] / plen) * (1 + bump), (p[1] / plen) * (1 + bump), (p[2] / plen) * (1 + bump)];
    const pr = projectLofted(p[0], p[1], p[2], lambda, phi, gamma, R, cx, cy);
    if (pr.v) {
      if (!started || (prev && !prev.v)) {
        d += `M${pr.sx.toFixed(1)},${pr.sy.toFixed(1)}`;
        started = true;
      } else {
        d += `L${pr.sx.toFixed(1)},${pr.sy.toFixed(1)}`;
      }
    }
    prev = pr;
  }
  return d;
}

function loftForDestination(dest) {
  const A = toXYZ(ROME.latitude, ROME.longitude);
  const B = toXYZ(dest.latitude, dest.longitude);
  const ang = angularDistance(A, B);
  return ang < 0.35 ? 0.22 : ang < 0.9 ? 0.14 : 0.08;
}

function syncAllConnectionsButton(showAll) {
  const btn = document.querySelector('[data-about-globe-all]');
  if (!btn) return;
  const key = showAll ? 'about.globe.hideAll' : 'about.globe.viewAll';
  btn.classList.toggle('is-active', showAll);
  btn.setAttribute('aria-pressed', String(showAll));
  btn.setAttribute('data-i18n', key);
  if (typeof i18nApply === 'function' && typeof i18nDetectLang === 'function') {
    i18nApply(i18nDetectLang());
  } else {
    btn.textContent = showAll ? 'Nascondi le connessioni' : 'Vedi tutte le connessioni';
  }
}

function buildMarkers(dark) {
  /* Terra scura in light / grigia in dark → hub sempre chiaro per contrasto */
  const hubColor = dark ? '#f2f2f2' : '#ffffff';
  return [
    { ...ROME, color: hubColor },
    ...DESTINATIONS.map((d) => ({ ...d, color: ARC_COLOR, hub: false })),
  ];
}

function AboutGlobeApp() {
  const dark = isDarkTheme();
  const quiet = reduceMotion();
  const [autoRotate, setAutoRotate] = useState(!quiet);
  const [themeTick, setThemeTick] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [view, setView] = useState(DEFAULT_VIEW);
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const pinchRef = useRef(null);
  const viewTweenRef = useRef(null); // { raf, cancel }

  const arcPathRef = useRef(null);
  const arcSvgRef = useRef(null);
  const allGroupRef = useRef(null);
  const frameRef = useRef(null);
  const routeRef = useRef(null); // { from, to, loft, startedAt }
  const showAllRef = useRef(false);
  const viewRef = useRef(DEFAULT_VIEW);
  const markers = useMemo(() => buildMarkers(isDarkTheme()), [themeTick, dark]);

  const cancelViewTween = useCallback(() => {
    const tw = viewTweenRef.current;
    if (!tw) return;
    if (tw.raf) cancelAnimationFrame(tw.raf);
    viewTweenRef.current = null;
  }, []);

  const tweenViewTo = useCallback(
    (target, { duration = VIEW_TWEEN_MS } = {}) => {
      cancelViewTween();
      const from = readLiveView(frameRef.current, viewRef.current);
      const dX = shortestDelta(from.rotateX, target.rotateX);
      const dY = shortestDelta(from.rotateY, target.rotateY);
      const dZ = shortestDelta(from.rotateZ, target.rotateZ);
      const end = {
        rotateX: from.rotateX + dX,
        rotateY: from.rotateY + dY,
        rotateZ: from.rotateZ + dZ,
      };
      const dist = Math.abs(dX) + Math.abs(dY) + Math.abs(dZ);

      if (quiet || dist < 0.35) {
        viewRef.current = end;
        setView(end);
        return;
      }

      const startedAt = performance.now();
      const tw = { raf: 0 };
      viewTweenRef.current = tw;

      const tick = (now) => {
        const t = clamp((now - startedAt) / duration, 0, 1);
        const e = easeInOutCubic(t);
        const next = {
          rotateX: from.rotateX + dX * e,
          rotateY: from.rotateY + dY * e,
          rotateZ: from.rotateZ + dZ * e,
        };
        viewRef.current = next;
        setView(next);
        if (t < 1) {
          tw.raf = requestAnimationFrame(tick);
        } else {
          viewRef.current = end;
          setView(end);
          viewTweenRef.current = null;
        }
      };

      tw.raf = requestAnimationFrame(tick);
    },
    [cancelViewTween, quiet]
  );

  const clearAllArcs = useCallback(() => {
    const g = allGroupRef.current;
    if (!g) return;
    while (g.firstChild) g.removeChild(g.firstChild);
  }, []);

  const paintAllArcs = useCallback((frame) => {
    const g = allGroupRef.current;
    if (!g || !frame) return;

    while (g.children.length < DESTINATIONS.length) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', ARC_COLOR);
      p.setAttribute('stroke-width', '2');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('opacity', '0.88');
      g.appendChild(p);
    }
    while (g.children.length > DESTINATIONS.length) {
      g.removeChild(g.lastChild);
    }

    DESTINATIONS.forEach((dest, i) => {
      const d = buildArcPath(ROME, dest, 1, frame, loftForDestination(dest));
      g.children[i].setAttribute('d', d);
    });
  }, []);

  useEffect(() => {
    showAllRef.current = showAll;
  }, [showAll]);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    zoomRef.current = zoom;
    const stage = document.querySelector('.about-globe__stage');
    if (stage) stage.style.setProperty('--globe-zoom', String(zoom));
  }, [zoom]);

  useEffect(() => () => cancelViewTween(), [cancelViewTween]);

  /* Se l’utente trascina durante il tween, interrompi (niente “tiro” a fine animazione) */
  useEffect(() => {
    const stage = document.querySelector('.about-globe__stage');
    if (!stage) return undefined;
    const onPointerDown = (e) => {
      if (e.target.closest?.('.about-globe__zoom')) return;
      if (!viewTweenRef.current) return;
      cancelViewTween();
      const live = readLiveView(frameRef.current, viewRef.current);
      viewRef.current = live;
      setView(live);
    };
    stage.addEventListener('pointerdown', onPointerDown);
    return () => stage.removeEventListener('pointerdown', onPointerDown);
  }, [cancelViewTween]);

  useEffect(() => {
    const stage = document.querySelector('.about-globe__stage');
    if (!stage) return undefined;

    const onWheel = (e) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;
      setZoom((z) => clampZoom(z + dir * ZOOM_STEP));
    };

    const pinchDist = (touches) => {
      const a = touches[0];
      const b = touches[1];
      return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinchRef.current = { dist: pinchDist(e.touches), zoom: zoomRef.current };
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();
      const dist = pinchDist(e.touches);
      const ratio = dist / Math.max(pinchRef.current.dist, 1);
      setZoom(clampZoom(pinchRef.current.zoom * ratio));
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    stage.addEventListener('touchend', onTouchEnd);
    stage.addEventListener('touchcancel', onTouchEnd);

    return () => {
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      stage.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  useEffect(() => {
    const sync = () => setThemeTick((n) => n + 1);
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const schemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    schemeMq.addEventListener?.('change', sync);
    motionMq.addEventListener?.('change', () => {
      if (reduceMotion()) setAutoRotate(false);
      sync();
    });
    return () => {
      obs.disconnect();
      schemeMq.removeEventListener?.('change', sync);
    };
  }, []);

  useEffect(() => {
    const btn = document.querySelector('[data-about-globe-all]');
    if (!btn) return undefined;

    const hideAll = () => {
      if (!showAllRef.current) return;
      showAllRef.current = false;
      setShowAll(false);
      cancelViewTween();
      clearAllArcs();
      if (!reduceMotion()) setAutoRotate(true);
    };

    const onClick = () => {
      if (showAllRef.current) {
        hideAll();
        return;
      }
      showAllRef.current = true;
      setShowAll(true);
      routeRef.current = null;
      setAutoRotate(false);
      /* Ruota fluidamente verso Europa; lascia lo zoom com’è */
      tweenViewTo(EUROPE_VIEW);
    };

    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      hideAll();
    };

    btn.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      btn.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [clearAllArcs, tweenViewTo, cancelViewTween]);

  useEffect(() => {
    syncAllConnectionsButton(showAll);
  }, [showAll, themeTick]);

  const bumpZoom = useCallback((dir) => {
    setZoom((z) => clampZoom(z + dir * ZOOM_STEP));
  }, []);

  const paintArc = useCallback(() => {
    const el = arcPathRef.current;
    const svg = arcSvgRef.current;
    const frame = frameRef.current;
    const route = routeRef.current;
    if (!el) return;

    if (svg && frame) {
      svg.setAttribute('viewBox', `0 0 ${frame.W} ${frame.H}`);
    }

    if (showAllRef.current) {
      el.setAttribute('d', '');
      el.setAttribute('opacity', '0');
      if (frame) paintAllArcs(frame);
      return;
    }

    clearAllArcs();

    if (!route || !frame) {
      el.setAttribute('d', '');
      el.setAttribute('opacity', '0');
      return;
    }

    const now = performance.now();
    const elapsed = now - route.startedAt;
    let progress = 1;
    let opacity = 1;
    let done = false;

    if (quiet) {
      progress = 1;
      opacity = elapsed < HOLD_MS ? 1 : Math.max(0, 1 - (elapsed - HOLD_MS) / FADE_MS);
      if (elapsed >= HOLD_MS + FADE_MS) done = true;
    } else if (elapsed < DRAW_MS) {
      progress = elapsed / DRAW_MS;
      opacity = 1;
    } else if (elapsed < DRAW_MS + HOLD_MS) {
      progress = 1;
      opacity = 1;
    } else {
      progress = 1;
      opacity = Math.max(0, 1 - (elapsed - DRAW_MS - HOLD_MS) / FADE_MS);
      if (opacity <= 0) done = true;
    }

    el.setAttribute('d', buildArcPath(route.from, route.to, progress, frame, route.loft));
    el.setAttribute('opacity', String(opacity));
    el.setAttribute('stroke', ARC_COLOR);

    if (done) {
      routeRef.current = null;
      el.setAttribute('d', '');
      el.setAttribute('opacity', '0');
      if (!reduceMotion()) setAutoRotate(true);
    }
  }, [quiet, paintAllArcs, clearAllArcs]);

  const onFrame = useCallback(
    (frame) => {
      frameRef.current = frame;
      paintArc();
    },
    [paintArc]
  );

  const onMarkerClick = useCallback((marker) => {
    if (!marker || marker.hub || marker.id === 'rome') return;

    if (showAllRef.current) {
      setShowAll(false);
      showAllRef.current = false;
      cancelViewTween();
      clearAllArcs();
    }

    const from = ROME;
    const to = marker;
    const loft = loftForDestination(to);

    setAutoRotate(false);
    routeRef.current = {
      from,
      to,
      loft,
      startedAt: performance.now(),
    };
    paintArc();
  }, [paintArc, clearAllArcs, cancelViewTween]);

  const globeProps = {
    markers,
    countries: [],
    onMarkerClick,
    onFrame,
    interaction: {
      autoRotate,
      autoRotateSpeed: 6,
      rotateX: view.rotateX,
      rotateY: view.rotateY,
      rotateZ: view.rotateZ,
      enableDrag: true,
      dragSensitivity: 0.4,
      glowColor: '#FF4D0A',
      glowIntensity: 0,
      showStars: false,
      showLabels: false,
    },
    mapStyle: dark
      ? {
          oceanColor: '#181818',
          landFill: '#8a847c',
          landStroke: '#5c574f',
          strokeWidth: 0.5,
          hoverColor: '#FF4D0A',
          disabledColor: '#2a2a2a',
        }
      : {
          oceanColor: '#ebe7e2',
          landFill: '#1f1c1a',
          landStroke: '#c4bbb3',
          strokeWidth: 0.45,
          hoverColor: '#FF4D0A',
          disabledColor: '#d8d2cb',
        },
    tooltip: {
      show: true,
      background: dark ? 'rgba(18, 20, 23, 0.92)' : 'rgba(255, 255, 255, 0.94)',
      textColor: dark ? '#e7ece9' : '#1a1a1a',
      borderColor: dark ? 'rgba(255, 77, 10, 0.35)' : 'rgba(255, 77, 10, 0.28)',
    },
    grid: {
      show: false,
      color: dark ? '#5b636a' : '#a39a92',
      opacity: 0,
    },
    layout: {
      cornerRadius: 0,
      padding: 0,
      showBorder: false,
      borderColor: 'transparent',
    },
  };

  const zoomInLabel = 'Ingrandisci globo';
  const zoomOutLabel = 'Rimpicciolisci globo';

  return createElement(
    Fragment,
    null,
    createElement(
      'div',
      { className: 'about-globe__mount' },
      createElement(TacticalGlobe, globeProps),
      createElement(
        'svg',
        {
          ref: arcSvgRef,
          className: 'about-globe__arcs',
          'aria-hidden': 'true',
        },
        createElement('path', {
          ref: arcPathRef,
          className: 'about-globe__arc',
          fill: 'none',
          stroke: ARC_COLOR,
          strokeWidth: 2.25,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          opacity: 0,
        }),
        createElement('g', {
          ref: allGroupRef,
          className: 'about-globe__arcs-all',
        })
      )
    ),
    createElement(
      'div',
      { className: 'about-globe__zoom', role: 'group', 'aria-label': 'Zoom' },
      createElement(
        'button',
        {
          type: 'button',
          className: 'about-globe__zoom-btn',
          'aria-label': zoomInLabel,
          'data-i18n-aria-label': 'about.globe.zoomIn',
          onClick: (e) => {
            e.stopPropagation();
            bumpZoom(1);
          },
        },
        '+'
      ),
      createElement(
        'button',
        {
          type: 'button',
          className: 'about-globe__zoom-btn',
          'aria-label': zoomOutLabel,
          'data-i18n-aria-label': 'about.globe.zoomOut',
          onClick: (e) => {
            e.stopPropagation();
            bumpZoom(-1);
          },
        },
        '−'
      )
    )
  );
}

function initAboutGlobe() {
  const mount = document.querySelector('[data-about-globe]');
  if (!mount || mount.dataset.globeReady === '1') return;
  mount.dataset.globeReady = '1';

  const root = createRoot(mount);
  root.render(createElement(AboutGlobeApp));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutGlobe);
} else {
  initAboutGlobe();
}

/* SPA: il module non si riesegue; re-init su ogni arrivo in About */
document.addEventListener('colorado:pagechange', initAboutGlobe);
