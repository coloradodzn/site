# Changelog

Tutte le modifiche rilevanti al progetto sono documentate in questo file.
Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.0.0/).
Le voci più recenti sono in fondo al file.

---

### [0.1] — Struttura base e design system
- Creata struttura completa di file e cartelle: `index.html`, `bio.html`, `portfolio.html`, `lavoro-1/2/3.html`, `contatti.html`, `/css`, `/img`, `/js`, `README.md`, `CHANGELOG.md`, `.cursorrules`
- Aggiunte CSS custom properties in `style.css`: `--color-primary: #FF4D0A`, `--color-accent: #000000`, `--color-bg: #ffffff`, `--color-text: #FF4D0A`, `--color-surface: #FF4D0A`
- Creato `README.md` con: nome progetto, obiettivo, stack tecnologico, struttura delle pagine (tabella), struttura delle cartelle

### [0.2] — Tipografia e font
- Aggiunti tag Google Fonts (`preconnect` × 2 + `link`) nell'`<head>` di `index.html`
- Creato boilerplate HTML5 completo per `index.html` con `lang="it"` e collegamento a `css/style.css`
- Aggiunte classi `.public-sans` e `.inter` in `style.css` con `font-optical-sizing: auto`

### [0.3] — Configurazione .cursorrules
- Creato e compilato `.cursorrules` con: obiettivo del progetto, stack, design system completo (colori e font), regole di sviluppo (custom properties, HTML semantico, alt tag, struttura CSS, mobile-first)
- Corretta assegnazione font: **Public Sans** per i titoli, **Inter** per i testi

### [0.4] — Meta description SEO
- Aggiunto tag `<meta name="description">` nell'`<head>` di `index.html`

### [0.5] — Navbar sticky
- Aggiunto `<header>` con `<nav>` semantico in `index.html`
- Logo a sinistra, links a destra: Home, Bio, Portfolio, Contatti
- Pulsante `☰` con attributi `aria-expanded` e `aria-controls` per accessibilità mobile
- Aggiunta sezione `NAVBAR` in `style.css`: layout flex, sticky, bordo inferiore primario
- Mobile-first: menu nascosto sotto 768px, visibile con classe `.is-open`
- Da 768px: toggle nascosto, links in riga orizzontale
- Aggiunto toggle in `js/main.js`: click su `☰` aggiunge/rimuove `.is-open` e aggiorna `aria-expanded`

### [0.6] — Logo immagine nella navbar
- Sostituito il testo logo con l'immagine `img/mylogo.png`
- Il logo è un link `<a>` verso `index.html` con `aria-label` per accessibilità
- Aggiunto stile `.navbar__logo-img` in `style.css` (height: 40px, width: auto)

### [0.7] — Navbar su tutte le pagine
- Aggiunta la navbar identica a `bio.html`, `portfolio.html`, `contatti.html`, `lavoro-1.html`, `lavoro-2.html`, `lavoro-3.html`
- Ogni pagina ha `<title>` e `meta description` specifici
- Collegati `css/style.css` e `js/main.js` su tutti i file

### [0.8] — Rimozione tasto Home dalla navbar
- Rimosso il link "Home" da tutte e 7 le navbar
- La navigazione verso la homepage è affidata esclusivamente al click sul logo

### [0.9] — Navbar a tre colonne con icone social
- Aggiunto blocco `.navbar__social` in tutte le navbar con link a Instagram, Behance e LinkedIn
- I link puntano a `#` (placeholder) e le icone fanno riferimento a `img/icon-instagram.svg`, `img/icon-behance.svg`, `img/icon-linkedin.svg`
- Layout navbar aggiornato in `style.css` da `flex` a `grid` con tre colonne: logo | menu centrato | social a destra
- Su mobile le icone social sono nascoste e visibili solo da 768px in su
- Aggiunta classe `.navbar__social-link` con altezza icona 20px

### [1.0] — Link social reali
- Sostituiti i placeholder `#` con i link reali in tutte e 7 le navbar
- Instagram: https://www.instagram.com/colorado.dzn/
- Behance: https://www.behance.net/coloradodzn
- LinkedIn: https://www.linkedin.com/in/colorado-dzn-977297308/
- Aggiunti attributi `target="_blank"` e `rel="noopener noreferrer"` per apertura in nuova scheda in sicurezza

### [1.1] — Restyling navbar
- Sfondo navbar cambiato da bianco a nero (`--color-accent`)
- Rimosso il bordo arancione inferiore
- Colore testi navbar cambiato in `#FF4D0A`, hover in bianco
- Icone social impostate su `#FF4D0A` come colore fisso (via CSS filter)
- Hover sulle icone: scala a 1.25 con leggero spostamento verso l'alto (`translateY(-2px)`)

### [1.2] — Navbar light/dark mode
- Sfondo navbar ripristinato a bianco (default light mode)
- Aggiunto supporto `prefers-color-scheme` per light e dark mode
- **Light mode:** sfondo bianco, testi e icone `#FF4D0A`, hover sui testi = glow arancione (`text-shadow`), hover sulle icone = scala avanti + glow
- **Dark mode:** sfondo nero, testi e icone `#FF4D0A`, hover sui testi = bianco, hover sulle icone = scala avanti

### [1.3] — Hover unificato navbar
- Scale up (`scale(1.1) translateY(-2px)`) applicato a tutti gli elementi della navbar: testi e icone
- Rimosso glow in entrambe le modalità
- **Light mode:** hover testi → nero, nessun glow
- **Dark mode:** hover testi → bianco

### [1.4] — Hero section
- Aggiunta `<section class="hero">` in `index.html` con immagine `img/herosection.jpg`
- La hero occupa tutta la viewport meno l'altezza della navbar (`100vh - 72px`)
- Immagine in `object-fit: cover` centrata, adattiva a qualsiasi dimensione dello schermo

### [1.5] — Reset CSS, larghezza piena e breakpoint minimo
- Aggiunto reset globale (`* { box-sizing: border-box; margin: 0; padding: 0 }`) per eliminare margini di default del browser
- Navbar e hero ora coprono tutta la larghezza della viewport
- Aggiunto `min-width: 320px` su `html` e `body` — il sito non scende sotto la dimensione mobile minima (iPhone SE)
- `overflow-x: hidden` su `body` per prevenire scroll orizzontale indesiderato
- Reset spostato in `css/reset.css`, separato da `style.css` e collegato prima di esso in tutti gli HTML

### [1.6] — Navbar sempre visibile, rimosso hamburger menu
- I link Bio, Portfolio, Contatti sono ora sempre visibili su tutti i breakpoint
- Rimosso il pulsante `☰` dall'HTML di tutti i file
- Rimossa la logica toggle da `main.js`
- Su mobile i link sono compatti (`font-size: 0.8rem`, `gap: 1rem`), su desktop tornano a dimensione piena
- Le icone social rimangono visibili solo da 768px in su

### [1.7] — Hamburger menu solo per i social
- I link Bio, Portfolio, Contatti sempre visibili su tutti i breakpoint
- Il pulsante `☰` è stato reinserito in tutti i file HTML ma controlla solo le icone social
- Su mobile: `☰` mostra/nasconde i social con classe `.is-open`; da 768px il toggle scompare e i social sono sempre visibili
- `main.js` aggiornato: il toggle gestisce `.navbar__social` invece di `.navbar__menu`

### [1.8] — Dropdown social su mobile con nomi testuali
- Su mobile il `☰` apre un dropdown verticale posizionato in assoluto sotto il pulsante, allineato a destra
- Sfondo dropdown nero (`--color-accent`), testi con font Inter bold, colore `--color-primary`
- Le icone SVG sono nascoste su mobile, mostrano solo il nome testuale (Instagram, Behance, LinkedIn)
- Su desktop rimane tutto invariato: icone visibili, nomi nascosti, social in riga orizzontale

### [1.9] — Fix dropdown social mobile
- Rimossa sottolineatura viola sui nomi social (`text-decoration: none` su `.navbar__social-link`)
- Dropdown bianco in light mode, nero in dark mode tramite `prefers-color-scheme`

### [2.0] — Hero section 16:9 su mobile
- Su mobile la hero usa `aspect-ratio: 16 / 9` invece di coprire tutta la viewport
- Da 768px in su rimane fullscreen (`100dvh - 72px`)

### [2.1] — Hover icone social allineato ai link navbar
- Hover sulle icone social unificato con quello di Bio/Portfolio/Contatti: `scale(1.1) translateY(-2px)`
- Light mode: le icone diventano nere al hover (`filter: brightness(0)`)
- Dark mode: le icone diventano bianche al hover (`filter: brightness(0) invert(1)`)
- Aggiornamento automatico su tutte le pagine tramite `style.css`
- Hero aggiornata a `100dvh` per compatibilità con i browser mobile che hanno barre dell'interfaccia dinamiche

### [2.2] — Shadow on scroll
- Aggiunto event listener su `window scroll` in `main.js`: quando `scrollY > 50` aggiunge classe `.scrolled` all'header
- CSS: `.site-header.scrolled` con `box-shadow` evidente e padding navbar ridotto (`0.5rem`)
- Transizione smooth su `box-shadow` e `padding` (`0.3s ease`)

### [2.3] — Immagine hero aggiornata
- Sostituita l'immagine di copertina della hero con `img/mainback.jpg`

### [2.4] — Dark mode estesa a tutto il sito
- Le CSS custom properties vengono ridefinite dentro `@media (prefers-color-scheme: dark)` su `:root`: essendo tutto basato su `var(--color-*)`, il tema scuro si applica automaticamente a tutte le pagine e sezioni, non più solo alla navbar
- Dark mode: `--color-bg` → `#0d0d0d`, `--color-accent` → `#ffffff`; primary/text/surface (arancione) invariati
- Aggiunta regola base su `body` che usa `var(--color-bg)` e `var(--color-text)`, così lo sfondo dell'intera pagina segue il tema
- Consolidati gli hover della navbar: rimossi i blocchi duplicati light/dark, ora usano le variabili; mantenuto un solo blocco dark per il filtro delle icone social
- Rimosso l'override che forzava lo sfondo dell'header al colore accent in dark (ora segue `--color-bg`)

### [2.5] — Navbar in overlay sulla hero a tutta viewport
- Aggiunta classe `home` al `<body>` della homepage per limitare l'overlay a questa pagina
- `.home .site-header` reso `position: absolute` e trasparente: la navbar si sovrappone alla hero invece di stare in una barra separata
- Hero portata a tutta la viewport (`100vh` con fallback `100dvh`), rimossi `aspect-ratio: 16/9` e la media query `calc(100dvh - 72px)`

### [2.6] — URL homepage pulito (niente nome file visibile)
- La homepage resta il file `index.html`: è l'unico nome servito di default alla radice del dominio e quindi mai mostrato nell'URL
- I link del logo di tutte le pagine puntano ora alla radice `/` invece che a un file: cliccando il logo l'URL resta `coloradodesign.it/` senza `index.html` o altri nomi visibili
- Eliminato `home.html` e il redirect provvisorio (avrebbero mostrato `/home.html` nell'URL)
- Mantenuti sulla home la navbar in overlay, la hero fullscreen e la classe `home` sul `<body>`

### [2.7] — Navbar home trasparente con cambio colore allo scroll
- Sulla home la navbar è `position: fixed`, resta visibile e in overlay sulla hero
- In cima (stato `:not(.scrolled)`): elementi della navbar bianchi (link, toggle, logo e — su desktop — icone social) tramite la nuova variabile `--color-navbar-overlay`
- Allo scroll (`> 50px`) `main.js` aggiunge la classe `.scrolled` all'header: sfondo pieno (`--color-bg`), ombra leggera ed elementi che tornano al colore di default (arancione `--color-primary`)
- Transizioni morbide su sfondo, ombra, colore testi e filtro di logo/icone
- Mantenute invariate le proprietà hover esistenti degli elementi della navbar (scale + colore)
- Comportamento coerente in dark/light mode (lo stato scrollato segue il tema tramite le variabili)

### [2.8] — Sito multilingua (IT / EN / FR / ES)
- Aggiunto selettore lingua nella navbar di **tutte le pagine** (sigle IT / EN / FR / ES, dentro il nuovo contenitore `.navbar__actions` insieme a toggle e social)
- Creato `js/i18n.js`: dizionario delle traduzioni per italiano, inglese, francese e spagnolo + logica di applicazione
- Traduzione dinamica via attributi `data-i18n` (testo), `data-i18n-alt`, `data-i18n-aria-label` e `data-i18n-content` (per `alt`, `aria-label` e `meta description`)
- Tradotti: link di navigazione, `<title>` e meta description di ogni pagina, aria-label e alt, testo di prova della home
- Alla prima visita la lingua viene rilevata dal browser (fallback italiano); la scelta dell'utente viene salvata in `localStorage` e mantenuta tra pagine e visite
- L'attributo `lang` di `<html>` viene aggiornato in base alla lingua selezionata
- Stile del selettore coerente con overlay/scrollato e dark/light mode; compatto su mobile e più ampio da 768px
- Incluso `js/i18n.js` in tutte le 7 pagine

### [2.9] — Hover arancione sulla navbar trasparente (home)
- Ripristinato l'effetto hover con cambio colore quando la navbar è trasparente in cima alla home: link, toggle e sigle lingua diventano arancioni (`--color-primary`) al passaggio del mouse
- Su desktop anche le icone social (bianche in overlay) tornano arancioni all'hover
- Prima, nello stato trasparente, la regola del colore bianco aveva la precedenza e l'hover cambiava solo la scala, non il colore
- Lo stato scrollato (navbar bianca) mantiene il comportamento hover già presente

### [3.0] — Pulsante tema chiaro/scuro manuale
- Aggiunto pulsante di cambio tema nella navbar (`.navbar__theme-toggle`) in tutte le pagine, accanto al selettore lingua (icona provvisoria ☾/☀, in attesa dell'icona definitiva)
- Rifattorizzata la dark mode: oltre all'automatico `@media (prefers-color-scheme: dark)`, il tema si può forzare via attributo `data-theme` su `<html>` (`:root[data-theme="dark"]` e `:root:not([data-theme="light"])`)
- Logica in `main.js`: alla prima visita si segue il sistema; al click la scelta diventa manuale e viene salvata in `localStorage` (mantenuta tra pagine e visite)
- Aggiunta chiave di traduzione `a11y.theme` (IT/EN/FR/ES) per l'etichetta accessibile del pulsante
- Stile del pulsante coerente con overlay/scrollato e hover arancione della navbar

### [3.1] — Font titoli: Outfit
- Sostituito **Public Sans** con **Outfit** come font dei titoli; **Inter** resta per i testi (coppia da 2 font, come richiesto dal brief)
- Link Google Fonts aggiornato su tutte le pagine: `Outfit` (pesi 100–900) + `Inter`
- Aggiunte variabili `--font-title` e `--font-body`; heading (`h1`–`h6`) usano Outfit di default
- Classe `.public-sans` sostituita da `.outfit`; aggiornato `.cursorrules`

### [3.2] — Pagina Contact
- [contatti.html](contatti.html): sfondo `mainback.jpg` a tutta viewport con overlay, navbar e footer **senza barra piena** (solo testi/icone, come la navbar overlay)
- Layout: tavola `formcontact.png` al centro. Overlay: nome, email, 5 piume con etichetta visibile (soggetto, spiegazione accanto al titolo), messaggio con scrollbar, privacy tra messaggio e Send (25px più in basso, testo visibile ma contenuto). Timeline sulla colonna destra. Campi senza bordo. La piuma scelta arriva in mail come campo `subject` (es. Identità) e nell'oggetto Formspree. Nascosti i marker arancioni della lista timeline (niente più elenco numerato) e i pallini nativi dei radio sulle piume.
- Form POST a Formspree `https://formspree.io/f/xnpaeboj`; conferma/errore in pagina via `main.js` (niente numero di telefono né nel form né tra i recapiti)
- Footer a 3 colonne (My Info, Navigation, Social) + copyright e link Privacy
- Navbar su tutte le pagine: About, Bio, Portfolio, Contact. About è la pagina professionale (`about.html`, contenuti ancora da inserire).

### [3.3] — Menu hamburger mobile
- Solo sotto i 768px: barra con logo + globo + tema + hamburger; About, Bio, Portfolio, Contatti nella tendina. Da desktop la navbar resta in linea (voci al centro, lingue, tema, social), hamburger e globo nascosti
- Su Contact/About la header torna `position: fixed` overlay come la home: una regola successiva la forzava a `relative`, quindi la barra non restava agganciata e lo scroll si comportava diversamente

### [3.4] — Form contatto più compatto
- Ridotta la larghezza massima della tavola (`36rem` / `40rem` da 1024px): overlay in % e font in `cqi` scalano insieme, senza rifare i posizionamenti

### [3.5] — Contact mobile (ripristinato)
- Tolto il layout mobile che staccava il flusso dalla grafica e rimpiccioliva troppo la tavola (testi form sfasati). Overlay di nuovo come prima. In attesa di una versione PNG del form **senza** colonna flusso

### [3.6] — Nuovo form Contact (card + rail)
- Sostituita la tavola `formcontact.png` con layout HTML/CSS da design: card bianca + timeline laterale (Contact / Review / Kickoff / Launch)
- Campi nativi (nome, email, select spedizione, messaggio), privacy, Formspree invariato
- Mobile: card sopra, rail in riga sotto; da 768px form + colonna verticale a destra
- Nuove chiavi i18n IT/EN/FR/ES per copy expedition

### [3.7] — FAQ Contatti + footer bianco
- Aggiunta sezione FAQ accordion sotto il form (layout due colonne da tablet, testi provvisori)
- Footer Contatti con sfondo bianco e testo brand (colore definitivo da definire)

### [3.8] — Footer spacing + Privacy Policy
- Colonne laterali del footer avvicinate di 50px al blocco centrale (desktop)
- Nuova pagina `privacy.html` (informativa GDPR: titolare, dati, finalità, Formspree, diritti, cookie/localStorage)

### [3.9] — Freccia indietro globale
- Pulsante freccia in alto a sinistra (navbar) su tutte le pagine tranne `index.html`
- `history.back()` con fallback a `index.html` se non c'è cronologia; aria-label i18n (`a11y.back`)

### [4.0] — Home Z, portfolio categorie, SEO e footer
- `index.html` rifatta: hero fullscreen con scroll-asse-Z (5 card lavori in tunnel 3D), sfondo `mainback.jpg` con zoom, nav reveal al centro a fine scroll, footer overlay nella sticky
- `js/home.js`: tunnel 3D (profondità, opacità, scale), fallback `prefers-reduced-motion`, indicatore scroll con percentuale, fade footer legato alla fase scroll
- Card lavori (Logo Design, Calyy, Editorial Study, Colorado Series, Axit Collection) → `lavoro-1` … `lavoro-5`; solo la card attiva è cliccabile
- Nav reveal: link About, Bio, Portfolio, Contatti animati al centro viewport; navbar nascosta in fase reveal; testi bianchi, hover arancione
- Footer home (`.site-footer--home-overlay`): trasparente su hero, testi bianchi fissi (indipendenti da tema), layout compatto brand + CTA email
- `portfolio.html`: hub con due caroselli — Success Projects (3 card) e Independent Projects (2 card) — e link "Vedi tutti" alle pagine categoria
- `success-projects.html` / `independent-projects.html`: catalogo con griglia raggruppata per servizio e filtri toolbar (Servizio + Settore, multi-select stile Paper Crowns)
- `js/portfolio.js`: caroselli prev/next; `js/portfolio-category.js`: filtri AND/OR, conteggio dinamico, chiusura Escape/click fuori, re-apply su cambio lingua
- Navbar Portfolio dropdown (desktop): Success / Independent con stato attivo; freccia indietro su categorie → sempre `portfolio.html`
- Fix UX portfolio: trigger filtro senza glow browser, scrollbar sottile, allineamento carosello desktop, sfondo pagine trasparente
- Aggiunti `lavoro-4.html` (Colorado Series) e `lavoro-5.html` (Axit Collection) — shell pronta, contenuto da completare
- Nuova `about.html` (cover professionale; contenuto da inserire)
- `js/seo.js`: canonical, Open Graph, Twitter Card, JSON-LD Organization; `robots.txt` e `sitemap.xml` (13 URL)
- Footer global: sfondo solido (tranne overlay home), heading Navigation/Socials in primary, link in nero, CTA "Diamo forma alla prossima idea"
- Estensioni i18n: portfolio, lavori 4/5, footer CTA; navbar con voce About, icone globo SVG e tema ☾/☀
- Creato `PLANNING.md` con checklist prioritizzata vs brief d'esame

## [Unreleased]

### Footer (pagine a sfondo solido)
- Verificato e allineato il footer su tutte le pagine a sfondo piano (`portfolio.html`, `success-projects.html`, `independent-projects.html`, `lavoro-1`–`lavoro-5`, `privacy.html`): struttura unificata (identity, CTA, nav/social, legal), copy CTA `footer.cta` (“Diamo forma alla prossima idea.”), i18n su `footer.nav` e `footer.copy`
- Colori gestiti da `body:not(.page-cover):not(.home) .site-footer` (heading primary, link/CTA lead/legal accent, nome ed email primary)
- Non modificati i footer overlay: home (`site-footer--home-overlay`), `about.html`, `bio.html`, `contatti.html`

### Decisioni di progetto
- Navbar: nessuna voce Home; logo → `index.html` (confermato)
- Homepage: hero scroll Z al posto del carousel del brief (Z accettata)
- Homepage bio/CV (29 ago 2026): link a `bio.html` già presente (nav reveal post-scroll Z) — fatto; CV non in homepage né sul sito pubblico (privato, rischio identificazione) — cancellato; estratto bio in homepage — pianificato, da implementare
- Privacy contatti: nessun indirizzo fisico (via), Maps, telefono o recapiti personali sul sito pubblico; form senza cognome/telefono; identità reale riservata ai collaboratori; email professionale studio (`info.coloradodesign@gmail.com`), città (“Roma” / “Rome, Italy”) e coordinate GPS nel footer (`41°50′01″N 12°28′15″E`) OK in footer/privacy/i18n/SEO/JSON-LD
- Lingua default del sito: **italiano** (SEO su dominio `.it`); EN/FR/ES restano nel selettore
- Meta/description: non dichiarare “studio con sede a Roma”; Roma resta in footer e in JSON-LD Organization per Google

### [4.1] — SEO, audio, lingua IT, lavori placeholder, navbar lingue
- **SEO title home** ripristinato a `Colorado Design — Creative Studio` in `index.html`, `og:title` e `title.home` (IT/EN/FR/ES)
- **Meta description home** ripristinata al posizionamento creative director (senza “studio a Roma”); allineate `desc.home` / `og:description` e description bio/about/contatti; rimosso `Sede: Rome, Italy` da `privacy.html`
- **JSON-LD** Organization: mantenuto `addressLocality: Rome` + `addressCountry: IT` (utile a Google); footer con `Rome, Italy · coordinate` invariato
- Default lingua **`I18N_DEFAULT = "it"`**; `<html lang="it">` e `og:locale` `it_IT` su tutte le pagine; rimosse chiavi i18n hero obsolete (tagline “media design e visual storytelling”, eyebrow/line non usate)
- **Playlist ambient**: cartella `Music/` (7 MP3) aggiunta al repo e online; aggiornato `blossom.mp3`
- `sitemap.xml`: `lastmod` sulla homepage per segnalare refresh metadata
- **Pagine lavoro** (`lavoro-1`, `lavoro-2`, `lavoro-5`): rimosse gallerie/immagini interne non confermate; stage con `.work-gallery__placeholder`; miniature home/portfolio/nav lavori lasciate
- **Navbar**: allineamento verticale voci (About/Bio/Portfolio/Contatti), chevron Portfolio ridotto; icone custom (globo `language.svg`, tema, chiusura menu) e timeline contatti (`posta` / `pergamena`)
- **Dropdown lingue**: click sul globo apre EN/IT/FR/ES anche su desktop (prima bloccato); bordo sinistro del pannello allineato al globo; `z-index` header alzato così il menu resta cliccabile anche in cima alla home (non solo dopo lo scroll); testi leggibili a header trasparente
