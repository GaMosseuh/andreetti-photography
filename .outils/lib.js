/* OUTILS COMMUNS AUX TESTS : un petit serveur local et le lancement de Chrome.
   Le serveur imite Netlify : "/" sert accueil.html, et "/portfolio" sert portfolio.html. */
const http = require("http"), fs = require("fs"), path = require("path");
const puppeteer = require("puppeteer-core");
const RACINE = path.join(__dirname, "..");
const TYPES = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8",
  ".webp":"image/webp", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png", ".svg":"image/svg+xml",
  ".xml":"application/xml", ".txt":"text/plain; charset=utf-8", ".json":"application/json", ".ico":"image/x-icon" };
function serveur(port, racine){
  racine = racine || RACINE;
  return new Promise(res => {
    const s = http.createServer((req, rep) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p === "/") p = "/accueil.html";
      let f = path.join(racine, p);
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        if (fs.existsSync(f + ".html")) f = f + ".html";
        else { rep.writeHead(404, {"Content-Type":"text/html; charset=utf-8"}); rep.end(fs.existsSync(path.join(racine,"404.html")) ? fs.readFileSync(path.join(racine,"404.html")) : "404"); return; }
      }
      rep.writeHead(200, {"Content-Type": TYPES[path.extname(f).toLowerCase()] || "application/octet-stream", "Cache-Control":"no-store"});
      fs.createReadStream(f).pipe(rep);
    });
    s.listen(port, "127.0.0.1", () => res(s));
  });
}
async function chrome(){
  return puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new",
    args: ["--hide-scrollbars", "--disable-gpu", "--no-first-run", "--force-color-profile=srgb"] });
}
/* prepare une page pour une capture : tout est charge, rien n'est en fondu */
async function stabiliser(page){
  await page.evaluate(async () => {
    const st = document.createElement("style");
    st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}#preloader{display:none!important}.fade-in{opacity:1!important;transform:none!important}";
    document.head.appendChild(st);
    document.querySelectorAll("img").forEach(i => { i.loading = "eager"; });
    document.querySelectorAll(".fade-in").forEach(e => e.classList.add("visible"));
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
    await Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); })));
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await new Promise(r => setTimeout(r, 350));
}
module.exports = { serveur, chrome, stabiliser, RACINE };
