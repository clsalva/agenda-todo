# Agenda Todo PWA su GitHub Pages

Questo pacchetto è già pronto per pubblicare la PWA su GitHub Pages.

## Contenuto
- `index.html` — entrypoint GitHub Pages
- `agenda-todo-pwa.html` — pagina principale della PWA
- `manifest.webmanifest` — manifest installabile
- `service-worker.js` — service worker offline + push listener
- icone e screenshot PWA
- `.github/workflows/deploy.yml` — deploy automatico su GitHub Pages

## Pubblicazione rapida
1. Crea un nuovo repository pubblico su GitHub, per esempio `agenda-todo-pwa`.
2. Carica tutti i file di questa cartella nella root del repository.
3. Fai commit su `main`.
4. Vai su **Settings > Pages** e verifica che GitHub Pages sia abilitato.
5. Attendi il completamento del workflow **Deploy static PWA to GitHub Pages**.
6. Apri l'URL pubblicato, tipicamente:
   `https://TUO-USERNAME.github.io/NOME-REPOSITORY/`

## Nota importante sul path
Poiché GitHub Pages pubblica i project site sotto `/NOME-REPOSITORY/`, il service worker e il manifest funzionano meglio se i file restano tutti nella root del repository, come in questo pacchetto.

## HTTPS
GitHub Pages supporta HTTPS e va lasciato attivo, perché installazione PWA, service worker e notifiche richiedono un contesto sicuro.

## Installazione su iPhone
1. Apri l'URL GitHub Pages in Safari.
2. Tocca Condividi.
3. Tocca **Aggiungi alla schermata Home**.
4. Apri l'icona dalla Home Screen.

## Push notifications
Le notifiche locali funzionano già dopo il consenso dell'utente.
Le push remote richiedono ancora un backend con VAPID e subscription endpoint.
