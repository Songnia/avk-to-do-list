const CACHE_NAME = 'todo-list-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  // Ajoutez ici les chemins vers vos icônes une fois que vous les aurez
  // '/icons/icon-192x192.png',
  // '/icons/icon-512x512.png'
];

// Installation du Service Worker et mise en cache des ressources initiales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        // Utiliser addAll pour une mise en cache atomique
        // Si une seule ressource échoue, toute l'opération échoue.
        return cache.addAll(urlsToCache).catch(error => {
            console.error('Échec de la mise en cache initiale:', error);
            // Gérer l'erreur si nécessaire, peut-être essayer de mettre en cache individuellement
            // ou simplement logger pour débogage.
        });
      })
  );
});

// Stratégie Cache-First pour les requêtes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retourne la réponse depuis le cache
        if (response) {
          return response;
        }

        // Cache miss - va chercher sur le réseau
        return fetch(event.request).then(
          response => {
            // Vérifie si nous avons reçu une réponse valide
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT : Cloner la réponse. Une réponse est un flux
            // et comme nous voulons que le navigateur consomme la réponse
            // ainsi que le cache consomme la réponse, nous devons la cloner
            // pour en avoir deux.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activation du Service Worker et nettoyage des anciens caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
