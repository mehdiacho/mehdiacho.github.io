(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))m(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&m(i)}).observe(document,{childList:!0,subtree:!0});function o(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function m(t){if(t.ep)return;t.ep=!0;const r=o(t);fetch(t.href,r)}})();const O="modulepreload",M=function(n){return"/projects/toll-sim/"+n},x={},R=function(e,o,m){let t=Promise.resolve();if(o&&o.length>0){let i=function(l){return Promise.all(l.map(f=>Promise.resolve(f).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),g=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));t=i(o.map(l=>{if(l=M(l),l in x)return;x[l]=!0;const f=l.endsWith(".css"),h=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${h}`))return;const c=document.createElement("link");if(c.rel=f?"stylesheet":O,f||(c.as="script"),c.crossOrigin="",c.href=l,g&&c.setAttribute("nonce",g),document.head.appendChild(c),f)return new Promise((b,$)=>{c.addEventListener("load",b),c.addEventListener("error",()=>$(new Error(`Unable to preload CSS for ${l}`)))})}))}function r(i){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=i,window.dispatchEvent(s),!s.defaultPrevented)throw i}return t.then(i=>{for(const s of i||[])s.status==="rejected"&&r(s.reason);return e().catch(r)})},_="Independent demo with synthetic data. Not affiliated with the Government of Botswana, any ministry, toll operator or payment provider.",A="/projects/toll-sim/live/dashboard";function D(){return`<span class="disclaimer">${_}</span>`}function v(n){return String(n??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function G(n){return`P ${((n??0)/100).toLocaleString("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2})}`}function N(n){if(!n)return'<span class="plate unread">no read</span>';const e=/^([A-Z])(\d{3})([A-Z]{3})$/.exec(n),o=e?`${e[1]} ${e[2]} ${e[3]}`:n;return`<span class="plate">${v(o)}</span>`}const I={charged:"Paid",paid:"Paid",unpaid:"Unpaid",violation:"Violation",review:"Review",waived:"Waived",refunded:"Refunded"},U={insufficient_funds:"low balance",unregistered_vehicle:"not registered",account_inactive:"account inactive"},B="/projects/toll-sim/",j=[["Traffic","SUMO drives a few hundred vehicles over the real A1 between Gaborone and Mahalapye, imported from OpenStreetMap. Cars, buses, trucks and trailers keep their own speeds and queue behind each other on the single-carriageway stretches."],["Gantries","Three free-flow gantries at Mmamashia, Artesia and Dibete. No booths and no barriers: each portal carries a tag reader and a plate camera over every lane."],["Plate reading","A small CRNN model trained on synthetic Botswana plates reads every camera image. Reads it isn't sure of go to a human review queue rather than straight to a bill."],["Settlement","Prepaid accounts topped up through a stand-in mobile-money service whose callbacks can arrive late, twice or never. Every balance change goes through one ledger, in integer thebe."],["Back office","Tag first, then plate. Each read is matched, priced by class, charged or recorded as unpaid. Operators get a live dashboard, an append-only audit log, disputes and an enforcement ladder."]],k=[["Pass","A vehicle drives under a gantry at road speed."],["Read","The tag reader and the plate camera both fire."],["Match","The read is matched to an account, by tag if there is one."],["Charge","The class tariff comes off the prepaid balance."],["Follow up","No account or no money: an unpaid passage with a grace period."]];async function q(n){try{const e=await(await fetch(`${B}road.json`)).json(),[o,m,t,r]=e.bounds,i=320,s=600,g=Math.min(i/(t-o),s/(r-m))*.9,l=(i-(t-o)*g)/2,f=(s-(r-m)*g)/2,h=(a,d)=>[l+(a-o)*g,f+(r-d)*g];let c="";for(const a of e.lanes){if(a.idx!==0||a.id.startsWith("-"))continue;let d=null,u="";for(const[p,P]of a.pts){const y=h(p,P);d&&Math.hypot(y[0]-d[0],y[1]-d[1])<1||(u+=`${u?"L":"M"}${y[0].toFixed(1)} ${y[1].toFixed(1)}`,d=y)}c+=u}const b=new Set,$=e.gantries.filter(a=>!b.has(a.id)&&b.add(a.id)).map((a,d)=>{const[u,p]=h(a.x,a.y);return`<g class="g" style="--d:${d*.7}s"><circle class="ring" cx="${u}" cy="${p}" r="7"/><circle cx="${u}" cy="${p}" r="4"/>
          <text x="${u+12}" y="${p+4}">${v(a.name)} <tspan>km ${a.km}</tspan></text></g>`}).join(""),T=e.places.filter(a=>a.name==="Gaborone"||a.name==="Mahalapye").map(a=>{const[d,u]=h(a.x,a.y),p=a.name==="Gaborone";return`<g class="p"><rect x="${d-3}" y="${u-3}" width="6" height="6"/><text x="${p?d+10:d-10}" y="${p?u+14:u+4}" text-anchor="${p?"start":"end"}">${v(a.name)}</text></g>`}).join("");n.innerHTML=`<svg viewBox="0 0 ${i} ${s}" role="img" aria-label="Map of the A1 corridor from Gaborone to Mahalapye with the three toll gantries">
      <path class="road-glow" d="${c}"/><path class="road" d="${c}"/><path class="road-flow" d="${c}"/>${T}${$}</svg>
      <p class="map-credit">Road network © OpenStreetMap contributors (ODbL)</p>`}catch{n.remove()}}function C(n){return n.innerHTML=`
  <div class="landing">
    <header class="top">
      <a class="brand" href="#/">A1 Toll Simulator</a>
      <nav><a href="#/live">Live view</a><a href="${A}">Dashboard</a></nav>
    </header>
    <main>
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow">Botswana · A1 · simulated free-flow tolling</p>
          <h1>A1 Toll Simulator</h1>
          <p class="lead">
            A working model of an electronic toll on the A1 from Gaborone to Mahalapye.
            Simulated traffic drives the real road network, gantries read tags and number plates,
            and a back office matches every read to an account and settles it from a mobile-money wallet.
          </p>
          <div class="cta">
            <a class="btn primary" href="#/live">Watch it in 3D</a>
            <a class="btn" href="${A}">Operations dashboard</a>
            <span class="btn ghost" title="The code is not public yet; ask and I'll share it">Source on request</span>
          </div>
          <p class="note">The 3D view streams the running simulation when it is up, and plays a recorded loop when it isn't. The badge in the corner tells you which.</p>
        </div>
        <div class="hero-map" id="map"></div>
      </section>

      <section class="cards">
        <h2>What's in it</h2>
        <div class="grid">
          ${j.map(([e,o])=>`<article><h3>${v(e)}</h3><p>${v(o)}</p></article>`).join("")}
        </div>
      </section>

      <section class="flow">
        <h2>One passage, end to end</h2>
        <ol>${k.map(([e,o])=>`<li><b>${v(e)}</b><span>${v(o)}</span></li>`).join("")}</ol>
      </section>

      <section class="closing">
        <p>Prices, plates, accounts and payments are all made up. The road geometry is real.</p>
        <a class="btn primary" href="#/live">Open the live view</a>
      </section>
    </main>
    <footer class="foot">
      ${D()}
      <span>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors (ODbL)</a></span>
    </footer>
  </div>`,q(n.querySelector("#map")),()=>{}}const L=document.getElementById("app");let w=null,S=null;async function E(){const e=(location.hash.replace(/^#/,"").split("?")[0]||"/").startsWith("/live")?"live":"landing";if(e!==S)if(S=e,w&&(w(),w=null),document.body.dataset.page=e,window.scrollTo(0,0),e==="live"){document.title="Live view · A1 Toll Simulator";const{mountViewer:o}=await R(async()=>{const{mountViewer:m}=await import("./viewer-VEJssSs1.js");return{mountViewer:m}},[]);if(S!=="live")return;w=await o(L)}else document.title="A1 Toll Simulator",w=C(L)}window.addEventListener("hashchange",E);E();export{U as R,I as S,v as e,D as f,G as m,N as p};
