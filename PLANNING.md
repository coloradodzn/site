# Piano progetto — Colorado Design

> **Pallini spuntabili:** clicca le caselle `- [ ]` qui sotto, oppure apri **Plans** → **Colorado — checklist esame**.

**Riferimento esame:** `../Caratteristiche progetto d'esame.html`  
**Storico codice:** `CHANGELOG.md`

**Feedback professore:** struttura e **layout pagine OK**. Focus = **riempire e completare** i contenuti.

---

## Da fare (spuntabili)

Ordine: history → about → lavori → estratto home → rifiniture → QA.

- [ ] Riempire `history.html` — testo, figure, CTA portfolio
- [ ] Riempire `about.html` — copy professionale + H1 (globo già ok)
- [ ] Completare `lavoro-1/2/3` — media + testi
- [ ] Completare `lavoro-4/5/6` — media + testi
- [ ] Homepage: estratto history
- [ ] Lightbox su history, portfolio, lavori
- [ ] `portfolio.html`: CTA finale contatti
- [ ] Testi SEO abbondanti history/about/portfolio/lavori
- [ ] H1 visibile per pagina (about / history)
- [ ] Intro video home: allineare path (`sigla.mp4` vs `intro.mp4`)
- [ ] Validazione W3C zero errori
- [ ] QA responsive 375 / 768 / 1280 px
- [ ] Search Console: reindicizzazione

## Già fatto

- [x] Struttura + layout pagine OK (feedback prof)
- [x] Navbar: logo → home (nessuna voce Home)
- [x] Home: scroll Z accettata
- [x] Cookie banner site-wide
- [x] Link `history.html` in nav + reveal
- [x] `SITE_URL` coloradodesign.it
- [x] `privacy.html` + `termini.html`
- [x] Footer CTA professionale
- [x] Portfolio hub + categorie + filtri
- [x] About globo TacticalGlobe3D
- [x] contatti.html Formspree + FAQ + timeline
- [x] i18n IT/EN/FR/ES + tema chiaro/scuro

## Decisioni prese

- **Struttura / layout** — OK per il professore. Non rifare architettura.
- **Privacy / contatti** — Niente via, Maps, telefono pubblici. Email studio, Roma, GPS footer OK. Form solo su `contatti.html`.
- **History (ex Bio)** — in nav; contenuto da riempire. CV non pubblicato.
- **Form homepage** — escluso (CTA mailto in footer).

### Audit privacy

| Elemento | Policy | Stato sul sito |
|----------|--------|----------------|
| Indirizzo fisico / via | Non pubblicare | Assente |
| Google Maps / iframe | Non pubblicare | Assente |
| Telefono | Non pubblicare | Assente |
| Cognome nel form | Non richiesto | Assente |
| Coordinate GPS | Pubblicare | OK — footer |
| Email studio | Pubblicare | OK — `info.coloradodesign@gmail.com` |
| Città Roma | Pubblicare | OK — meta/footer/JSON-LD |
| Nome/cognome reale | Non pubblicare | Assente (solo “Colorado”) |
