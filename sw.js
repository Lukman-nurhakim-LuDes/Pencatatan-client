const CACHE_NAME = 'Pencatatan costumer';
// Daftar file inti yang diperlukan agar aplikasi bisa berjalan offline.
const URLS_TO_CACHE = [
    './', // Ini adalah file index.html itu sendiri
    'manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    // Font eksternal lain dan gambar statis bisa ditambahkan di sini
];

// 1. Install Service Worker
// Saat service worker di-install, buka cache dan tambahkan file-file inti.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache dibuka. Menambahkan aset inti...');
                return cache.addAll(URLS_TO_CACHE);
            })
            .catch(err => {
                console.error('Gagal menambahkan file ke cache:', err);
            })
    );
});

// 2. Intercept Fetch Requests (Strategi Network First, Fallback to Cache)
// Ini akan mencoba mengambil data terbaru dari network.
// Jika GAGAL (offline), baru akan mengambil dari cache.
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Jika fetch berhasil, simpan ke cache dan kembalikan
                return caches.open(CACHE_NAME).then(cache => {
                    // Hanya cache request GET
                    if (event.request.method === 'GET') {
                         cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                // Jika fetch gagal (offline), coba ambil dari cache
                return caches.match(event.request);
            })
    );
});

// 3. Activate (Pembersihan Cache Lama)
// Ini akan menghapus cache lama jika Anda mengupdate versi CACHE_NAME
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Menghapus cache lama:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
