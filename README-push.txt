Push remoto: cosa serve

1. Pubblicare la PWA su HTTPS.
2. Generare chiavi VAPID lato server.
3. Esporre un endpoint POST per salvare la PushSubscription inviata dalla PWA.
4. Inviare notifiche dal server usando Web Push verso la subscription salvata.

La PWA già include:
- manifest installabile
- service worker offline
- listener push nel service worker
- UI per attivare notifiche
- UI per salvare public VAPID key e subscribe endpoint
- subscribe() del browser verso PushManager

Senza backend, le notifiche remote push non possono essere consegnate quando l'app è chiusa.
Le notifiche locali invece funzionano già nella PWA dopo consenso utente.
