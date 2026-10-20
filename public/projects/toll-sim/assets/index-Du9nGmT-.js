(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))u(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&u(c)}).observe(document,{childList:!0,subtree:!0});function n(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function u(t){if(t.ep)return;t.ep=!0;const o=n(t);fetch(t.href,o)}})();const M="modulepreload",R=function(r){return"/projects/toll-sim/"+r},A={},_=function(e,n,u){let t=Promise.resolve();if(n&&n.length>0){let c=function(i){return Promise.all(i.map(m=>Promise.resolve(m).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),v=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));t=c(n.map(i=>{if(i=R(i),i in A)return;A[i]=!0;const m=i.endsWith(".css"),f=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${f}`))return;const l=document.createElement("link");if(l.rel=m?"stylesheet":M,m||(l.as="script"),l.crossOrigin="",l.href=i,v&&l.setAttribute("nonce",v),document.head.appendChild(l),m)return new Promise((y,$)=>{l.addEventListener("load",y),l.addEventListener("error",()=>$(new Error(`Unable to preload CSS for ${i}`)))})}))}function o(c){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=c,window.dispatchEvent(s),!s.defaultPrevented)throw c}return t.then(c=>{for(const s of c||[])s.status==="rejected"&&o(s.reason);return e().catch(o)})},k="Independent demo with synthetic data. Not affiliated with the Government of Botswana, any ministry, toll operator or payment provider.",x="/projects/toll-sim/live/dashboard";function D(){return`<span class="disclaimer">${k}</span>`}function g(r){return String(r??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function N(r){return`P ${((r??0)/100).toLocaleString("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2})}`}function G(r){if(!r)return'<span class="plate unread">no read</span>';const e=/^([A-Z])(\d{3})([A-Z]{3})$/.exec(r),n=e?`${e[1]} ${e[2]} ${e[3]}`:r;return`<span class="plate">${g(n)}</span>`}const H={charged:"Paid",paid:"Paid",unpaid:"Unpaid",violation:"Violation",review:"Review",waived:"Waived",refunded:"Refunded"},I={insufficient_funds:"insufficient funds",unregistered_vehicle:"not registered",account_inactive:"account inactive"},U={tag:"Tag",cash:"Cash",card:"Card",plate:"Plate",runner:"Runner"},B="/projects/toll-sim/",j=[["Traffic","SUMO drives a few hundred vehicles over the real A1 between Gaborone and Mahalapye, imported from OpenStreetMap. Cars, buses, trucks and trailers keep their own speeds and queue behind each other on the single-carriageway stretches."],["Toll plazas","Three mainline plazas at Mmamashia, Artesia and Dibete, laid out like the N1 and N4 plazas in South Africa: the road flares to five lanes each way under a lit canopy, with heavy-vehicle, mixed and e-tag lanes, booths, booms and a tag reader and plate camera in every lane."],["Plate reading","A small CRNN model trained on synthetic Botswana plates reads every camera image. Reads it isn't sure of go to a human review queue rather than straight to a bill."],["Settlement","Prepaid accounts topped up through a stand-in mobile-money service whose callbacks can arrive late, twice or never. Every balance change goes through one ledger, in integer thebe."],["Back office","Tag first, then plate. Each read is matched, priced by class, charged or recorded as unpaid. Operators get a live dashboard, an append-only audit log, disputes and an enforcement ladder."]],q=[["Arrive","A vehicle picks a lane at the plaza: e-tag, mixed or heavy."],["Read","The tag reader and the plate camera fire as it reaches the boom."],["Match","The read is matched to an account, by tag if there is one."],["Charge","The class tariff comes off the prepaid balance, or is paid in cash or by card at the booth. The boom lifts."],["Follow up","No account or no money: an unpaid passage with a grace period."]];async function C(r){var e;try{const n=await(await fetch(`${B}road.json`)).json(),[u,t,o,c]=n.bounds,s=320,v=600,i=Math.min(s/(o-u),v/(c-t))*.9,m=(s-(o-u)*i)/2,f=(v-(c-t)*i)/2,l=(a,d)=>[m+(a-u)*i,f+(c-d)*i];let y="";for(const a of n.lanes){if(a.idx!==0||a.id.startsWith("-"))continue;let d=null,h="";for(const[p,P]of a.pts){const w=l(p,P);d&&Math.hypot(w[0]-d[0],w[1]-d[1])<1||(h+=`${h?"L":"M"}${w[0].toFixed(1)} ${w[1].toFixed(1)}`,d=w)}y+=h}const $=new Set,E=((e=n.plazas)!=null&&e.length?n.plazas:n.gantries).filter(a=>!$.has(a.id)&&$.add(a.id)).map((a,d)=>{const[h,p]=l(a.x,a.y);return`<g class="g" style="--d:${d*.7}s"><circle class="ring" cx="${h}" cy="${p}" r="7"/><circle cx="${h}" cy="${p}" r="4"/>
          <text x="${h+12}" y="${p+4}">${g(a.name)} <tspan>km ${a.km}</tspan></text></g>`}).join(""),O=n.places.filter(a=>a.name==="Gaborone"||a.name==="Mahalapye").map(a=>{const[d,h]=l(a.x,a.y),p=a.name==="Gaborone";return`<g class="p"><rect x="${d-3}" y="${h-3}" width="6" height="6"/><text x="${p?d+10:d-10}" y="${p?h+14:h+4}" text-anchor="${p?"start":"end"}">${g(a.name)}</text></g>`}).join("");r.innerHTML=`<svg viewBox="0 0 ${s} ${v}" role="img" aria-label="Map of the A1 corridor from Gaborone to Mahalapye with the three toll plazas">
      <path class="road-glow" d="${y}"/><path class="road" d="${y}"/><path class="road-flow" d="${y}"/>${O}${E}</svg>
      <p class="map-credit">Road network © OpenStreetMap contributors (ODbL)</p>`}catch{r.remove()}}function z(r){return r.innerHTML=`
  <div class="landing">
    <header class="top">
      <a class="brand" href="#/">A1 Toll Simulator</a>
      <nav><a href="#/live">Live view</a><a href="${x}">Dashboard</a></nav>
    </header>
    <main>
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow">Botswana · A1 · simulated toll plazas</p>
          <h1>A1 Toll Simulator</h1>
          <p class="lead">
            A working model of an electronic toll on the A1 from Gaborone to Mahalapye.
            Simulated traffic drives the real road network and queues at three toll plazas, where tags, cash and cards are taken,
            and a back office matches every read to an account and settles it from a mobile-money wallet.
          </p>
          <div class="cta">
            <a class="btn primary" href="#/live">Watch it in 3D</a>
            <a class="btn" href="${x}">Operations dashboard</a>
            <span class="btn ghost" title="The code is not public yet; ask and I'll share it">Source on request</span>
          </div>
          <p class="note">The 3D view streams the running simulation when it is up, and plays a recorded loop when it isn't. The badge in the corner tells you which.</p>
        </div>
        <div class="hero-map" id="map"></div>
      </section>

      <section class="cards">
        <h2>What's in it</h2>
        <div class="grid">
          ${j.map(([e,n])=>`<article><h3>${g(e)}</h3><p>${g(n)}</p></article>`).join("")}
        </div>
      </section>

      <section class="flow">
        <h2>One passage, end to end</h2>
        <ol>${q.map(([e,n])=>`<li><b>${g(e)}</b><span>${g(n)}</span></li>`).join("")}</ol>
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
  </div>`,C(r.querySelector("#map")),()=>{}}const L=document.getElementById("app");let b=null,S=null;async function T(){const e=(location.hash.replace(/^#/,"").split("?")[0]||"/").startsWith("/live")?"live":"landing";if(e!==S)if(S=e,b&&(b(),b=null),document.body.dataset.page=e,window.scrollTo(0,0),e==="live"){document.title="Live view · A1 Toll Simulator";const{mountViewer:n}=await _(async()=>{const{mountViewer:u}=await import("./viewer-DH5tZ22w.js");return{mountViewer:u}},[]);if(S!=="live")return;b=await n(L)}else document.title="A1 Toll Simulator",b=z(L)}window.addEventListener("hashchange",T);T();export{U as M,I as R,H as S,g as e,D as f,N as m,G as p};
