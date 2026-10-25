// Versi diambil dari alamat skrip ini (sw.js?v=...), jadi Anda tidak perlu mengedit file ini saat update.
const V = new URL(self.location.href).searchParams.get("v") || "0";
const CACHE = "presensiyuk-" + V;
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(new Request(u, {cache: "reload"})))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.indexOf("presensiyuk-") === 0 && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Hanya GET milik situs sendiri, selalu cek versi terbaru dulu, cache dipakai saat offline.
// Pengiriman presensi (POST ke Google Script) dan pengecekan versi (?cek=) tidak disentuh.
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if(req.method !== "GET" || url.origin !== location.origin || url.searchParams.has("cek")) return;
  e.respondWith(
    fetch(req.mode === "navigate" ? req.url : req, {cache: "no-cache"}).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("./index.html")))
  );
});
