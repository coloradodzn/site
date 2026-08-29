# Piano progetto — Colorado Design

> **Checklist cliccabile (pallini):** apri il **Plan** in Cursor  
> **Nome:** `Colorado — checklist esame`  
> **File:** `C:\Users\sempr\.cursor\plans\colorado_design_exam_checklist.plan.md`  
> In Cursor: **Command Palette** (`Ctrl+Shift+P`) → cerca **Plans** → seleziona il piano.

Questo file `.md` nel repo è solo **backup/testo** (utile su Git, senza UI interattiva).  
Per spuntare le cose da fare usa il Plan sopra.

---

**Riferimento esame:** `../Caratteristiche progetto d'esame.html`  
**Storico modifiche codice:** `CHANGELOG.md`

**Legenda:** P0 = blocca consegna · P1 = obbligatorio esame · P2 = contenuto · P3 = rifinitura · P4 = extra

Per l’elenco completo aggiornato vedi il Plan in Cursor (si sincronizza quando spunti i todo).

---

## Decisioni prese

- **Navbar** — Nessuna voce Home separata; il logo porta alla homepage. Scelta definitiva.
- **Home** — Hero scroll Z al posto del carousel del brief. Soluzione accettata (Z accettata).
- **Privacy / contatti pubblici** — I recapiti personali restano privati: identità reale di Colorado nota solo ai collaboratori; nessun indirizzo fisico (via), mappa Google, telefono o dato identificativo sensibile sul sito pubblico. Contatto via form e email professionale studio (`info.coloradodesign@gmail.com`) in footer, privacy, i18n e SEO — OK. Città (“Roma” / “Rome, Italy”) in meta, footer, privacy e JSON-LD — OK. Coordinate GPS nel footer (`41°50′01″N 12°28′15″E`) — OK. Niente Google Maps, orari, indicazioni stradali, cognome o telefono nel form.
- **Homepage — bio e CV** (29 ago 2026):
  - **Link a `bio.html`** — OK / **fatto**: presente nella nav reveal al centro dopo lo scroll Z (About, Bio, Portfolio, Contatti).
  - **CV** — **cancellato**: non in homepage né sul sito pubblico; CV privato, rischio di identificazione/tracciamento.
  - **Estratto bio** — **pianificato**: da aggiungere in homepage in un secondo momento (contenuto non ancora implementato).

### Audit privacy (stato attuale vs policy)

| Elemento | Policy | Stato sul sito |
|----------|--------|----------------|
| Indirizzo fisico / via | Non pubblicare | Assente |
| Google Maps / iframe | Non pubblicare | Assente |
| Telefono | Non pubblicare | Assente |
| Cognome nel form contatti | Non richiesto | Assente (solo nome visitatore) |
| Coordinate GPS | Pubblicare (footer) | **OK** — footer tutte le pagine: `41°50′01″N 12°28′15″E` |
| Email studio (professionale) | Pubblicare | **Presente** — footer, `privacy.html`, `i18n.js`, `seo.js` (`info.coloradodesign@gmail.com`) |
| Città (Roma / Rome, Italy) in meta/JSON-LD | Pubblicare (solo livello città) | **OK** — `index.html`, `bio.html`, `i18n.js`, `privacy.html`, `seo.js` |
| Social (IG, Behance, LinkedIn) | Brand pubblico | Presente — link professionali |
| Nome/cognome reale | Non pubblicare | Assente (solo brand “Colorado”) |

---

## Da fare (backup testuale)

- **P0 — Homepage: estratto bio** — Breve estratto biografico in homepage (link Bio già presente; CV escluso per privacy).
- **P1 — QA responsive (tutte le pagine)** — Revisione manuale a **375px** (mobile), **768px** (tablet) e **1280px** (desktop): layout, tipografia, navbar/hamburger, footer, hero home (scroll Z), form contatti, portfolio e case study. Stato attuale: poco lavorato finora; da pianificare prima della consegna.
