/* Forma service worker. Kod izmjene aplikacije povecaj VER (i APP_BUILD u index.html, b u version.json). */
const VER='forma-v5',SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VER).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin){
  /* version.json: uvijek samo s mreze, nikad iz kesa i nikad u kes (bez interneta zahtjev jednostavno ne uspije) */
  if(/\/version\.json$/.test(u.pathname)){e.respondWith(fetch(r,{cache:'no-store'}));return}
  /* aplikacija: prvo mreza uz provjeru svjezine (no-cache zaobilazi GitHub Pages kes od ~10 min), ako nema interneta iz kesa */
  e.respondWith(fetch(r,{cache:'no-cache'}).then(x=>{if(x.ok){const y=x.clone();caches.open(VER).then(c=>c.put(r,y))}return x}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));return}
 if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
  /* fontovi: iz kesa, osvjezi u pozadini */
  e.respondWith(caches.open(VER).then(c=>c.match(r).then(m=>{const n=fetch(r).then(x=>{if(x.ok)c.put(r,x.clone());return x}).catch(()=>m);return m||n})))}});
