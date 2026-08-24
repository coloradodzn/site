const I18N = {
  it: {
    "nav.bio": "Bio",
    "nav.portfolio": "Portfolio",
    "nav.contatti": "Contatti",
    "a11y.mainNav": "Navigazione principale",
    "a11y.home": "Torna alla homepage",
    "a11y.openSocial": "Apri social",
    "a11y.lang": "Selettore lingua",
    "a11y.theme": "Cambia tema",
    "logo.alt": "Logo — homepage",
    "home.hero.alt": "Hero — immagine di copertina",
    "home.test": "Sezione di prova",
    "title.home": "Portfolio",
    "title.bio": "Bio — Portfolio",
    "title.portfolio": "Portfolio",
    "title.contatti": "Contatti — Portfolio",
    "title.lavoro1": "Lavoro 1 — Portfolio",
    "title.lavoro2": "Lavoro 2 — Portfolio",
    "title.lavoro3": "Lavoro 3 — Portfolio",
    "desc.home": "Portfolio personale di [Colorado], studente di Media Design. Scopri i miei progetti, la mia biografia e come contattarmi.",
    "desc.bio": "Biografia e background di [Nome Cognome], studente di Media Design.",
    "desc.portfolio": "Raccolta dei progetti realizzati da [Nome Cognome], studente di Media Design.",
    "desc.contatti": "Contatta [Nome Cognome] — studente di Media Design disponibile per collaborazioni e progetti.",
    "desc.lavoro1": "Dettaglio del primo progetto del portfolio di [Nome Cognome], studente di Media Design.",
    "desc.lavoro2": "Dettaglio del secondo progetto del portfolio di [Nome Cognome], studente di Media Design.",
    "desc.lavoro3": "Dettaglio del terzo progetto del portfolio di [Nome Cognome], studente di Media Design."
  },
  en: {
    "nav.bio": "Bio",
    "nav.portfolio": "Portfolio",
    "nav.contatti": "Contact",
    "a11y.mainNav": "Main navigation",
    "a11y.home": "Back to homepage",
    "a11y.openSocial": "Open social links",
    "a11y.lang": "Language selector",
    "a11y.theme": "Toggle theme",
    "logo.alt": "Logo — homepage",
    "home.hero.alt": "Hero — cover image",
    "home.test": "Test section",
    "title.home": "Portfolio",
    "title.bio": "Bio — Portfolio",
    "title.portfolio": "Portfolio",
    "title.contatti": "Contact — Portfolio",
    "title.lavoro1": "Work 1 — Portfolio",
    "title.lavoro2": "Work 2 — Portfolio",
    "title.lavoro3": "Work 3 — Portfolio",
    "desc.home": "Personal portfolio of [Colorado], Media Design student. Discover my projects, biography and how to get in touch.",
    "desc.bio": "Biography and background of [Nome Cognome], Media Design student.",
    "desc.portfolio": "Collection of projects created by [Nome Cognome], Media Design student.",
    "desc.contatti": "Contact [Nome Cognome] — Media Design student available for collaborations and projects.",
    "desc.lavoro1": "Details of the first portfolio project by [Nome Cognome], Media Design student.",
    "desc.lavoro2": "Details of the second portfolio project by [Nome Cognome], Media Design student.",
    "desc.lavoro3": "Details of the third portfolio project by [Nome Cognome], Media Design student."
  },
  fr: {
    "nav.bio": "Bio",
    "nav.portfolio": "Portfolio",
    "nav.contatti": "Contact",
    "a11y.mainNav": "Navigation principale",
    "a11y.home": "Retour à l'accueil",
    "a11y.openSocial": "Ouvrir les réseaux sociaux",
    "a11y.lang": "Sélecteur de langue",
    "a11y.theme": "Changer de thème",
    "logo.alt": "Logo — page d'accueil",
    "home.hero.alt": "Hero — image de couverture",
    "home.test": "Section de test",
    "title.home": "Portfolio",
    "title.bio": "Bio — Portfolio",
    "title.portfolio": "Portfolio",
    "title.contatti": "Contact — Portfolio",
    "title.lavoro1": "Projet 1 — Portfolio",
    "title.lavoro2": "Projet 2 — Portfolio",
    "title.lavoro3": "Projet 3 — Portfolio",
    "desc.home": "Portfolio personnel de [Colorado], étudiant en Media Design. Découvrez mes projets, ma biographie et comment me contacter.",
    "desc.bio": "Biographie et parcours de [Nome Cognome], étudiant en Media Design.",
    "desc.portfolio": "Collection de projets réalisés par [Nome Cognome], étudiant en Media Design.",
    "desc.contatti": "Contactez [Nome Cognome] — étudiant en Media Design disponible pour des collaborations et des projets.",
    "desc.lavoro1": "Détail du premier projet du portfolio de [Nome Cognome], étudiant en Media Design.",
    "desc.lavoro2": "Détail du deuxième projet du portfolio de [Nome Cognome], étudiant en Media Design.",
    "desc.lavoro3": "Détail du troisième projet du portfolio de [Nome Cognome], étudiant en Media Design."
  },
  es: {
    "nav.bio": "Bio",
    "nav.portfolio": "Portfolio",
    "nav.contatti": "Contacto",
    "a11y.mainNav": "Navegación principal",
    "a11y.home": "Volver a la página de inicio",
    "a11y.openSocial": "Abrir redes sociales",
    "a11y.lang": "Selector de idioma",
    "a11y.theme": "Cambiar tema",
    "logo.alt": "Logo — página de inicio",
    "home.hero.alt": "Hero — imagen de portada",
    "home.test": "Sección de prueba",
    "title.home": "Portfolio",
    "title.bio": "Biografía — Portfolio",
    "title.portfolio": "Portfolio",
    "title.contatti": "Contacto — Portfolio",
    "title.lavoro1": "Trabajo 1 — Portfolio",
    "title.lavoro2": "Trabajo 2 — Portfolio",
    "title.lavoro3": "Trabajo 3 — Portfolio",
    "desc.home": "Portafolio personal de [Colorado], estudiante de Media Design. Descubre mis proyectos, mi biografía y cómo contactarme.",
    "desc.bio": "Biografía y trayectoria de [Nome Cognome], estudiante de Media Design.",
    "desc.portfolio": "Colección de proyectos realizados por [Nome Cognome], estudiante de Media Design.",
    "desc.contatti": "Contacta con [Nome Cognome] — estudiante de Media Design disponible para colaboraciones y proyectos.",
    "desc.lavoro1": "Detalle del primer proyecto del portafolio de [Nome Cognome], estudiante de Media Design.",
    "desc.lavoro2": "Detalle del segundo proyecto del portafolio de [Nome Cognome], estudiante de Media Design.",
    "desc.lavoro3": "Detalle del tercer proyecto del portafolio de [Nome Cognome], estudiante de Media Design."
  }
};

const I18N_SUPPORTED = ["it", "en", "fr", "es"];
const I18N_DEFAULT = "it";
const I18N_STORAGE_KEY = "lang";

// mappa: attributo data-* -> attributo HTML da tradurre
const I18N_ATTR_MAP = {
  "data-i18n-alt": "alt",
  "data-i18n-aria-label": "aria-label",
  "data-i18n-content": "content"
};

function i18nDetectLang() {
  const saved = localStorage.getItem(I18N_STORAGE_KEY);
  if (saved && I18N_SUPPORTED.includes(saved)) return saved;
  const browser = (navigator.language || I18N_DEFAULT).slice(0, 2).toLowerCase();
  return I18N_SUPPORTED.includes(browser) ? browser : I18N_DEFAULT;
}

function i18nApply(lang) {
  const dict = I18N[lang] || I18N[I18N_DEFAULT];
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = dict[el.getAttribute("data-i18n")];
    if (value != null) el.textContent = value;
  });

  Object.keys(I18N_ATTR_MAP).forEach((dataAttr) => {
    document.querySelectorAll("[" + dataAttr + "]").forEach((el) => {
      const value = dict[el.getAttribute(dataAttr)];
      if (value != null) el.setAttribute(I18N_ATTR_MAP[dataAttr], value);
    });
  });

  document.querySelectorAll(".navbar__lang-btn").forEach((btn) => {
    const isActive = btn.getAttribute("data-lang") === lang;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  localStorage.setItem(I18N_STORAGE_KEY, lang);
}

document.addEventListener("DOMContentLoaded", () => {
  i18nApply(i18nDetectLang());

  document.querySelectorAll(".navbar__lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => i18nApply(btn.getAttribute("data-lang")));
  });
});
