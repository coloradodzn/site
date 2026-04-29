# Changelog

Tutte le modifiche rilevanti al progetto sono documentate in questo file.
Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.0.0/).

---

## [Unreleased]

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
- Hero aggiornata a `100dvh` per compatibilità con i browser mobile che hanno barre dell'interfaccia dinamiche
