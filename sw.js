// সহজে — সার্ভিস ওয়ার্কার (অফলাইনে অ্যাপ চালানোর জন্য)
// নতুন প্রশ্ন বা কোড যোগ করলে নিচের ভার্সন নম্বরটি বদলে দিন (v1 → v2),
// তাহলে ব্যবহারকারীরা নতুন সংস্করণ পাবে।
const CACHE_NAME = 'sohoje-v2';

const FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './data/class-1.js',
  './data/class-2.js',
  './data/class-3.js',
  './data/class-4.js',
  './data/class-5.js',
  './data/class-6.js',
  './data/class-7.js',
  './data/class-8.js',
  './data/class-9.js',
  './data/class-10.js',
  './data/class-11.js',
  './data/class-12.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// আগে নেটওয়ার্ক থেকে আনার চেষ্টা, না পেলে ক্যাশ থেকে (অফলাইন সাপোর্ট)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
