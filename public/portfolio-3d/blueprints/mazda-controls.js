(() => {
  const sheet = document.getElementById('sheet'), desk = sheet.parentElement;
  const style = document.createElement('style');
  style.textContent = `.sheet .row{cursor:pointer}.sheet .row[aria-pressed=true]{background:#c2e4ee}.sheet .row:focus-visible{outline:2px solid #2e6f9e}.measure-hit{fill:#126589!important;stroke:#d9f3ff!important;stroke-width:2!important}.sheet-tools{position:sticky;top:0;z-index:2;padding:12px;background:#f7f5f0;color:#1c1c1a;font:14px/1.5 system-ui}.sheet-tools label{display:block}.sheet-tools select{max-width:100%;margin:4px 0 8px;font:inherit}.sheet-tools button{padding:8px 14px;margin-right:5px;font:inherit}.sheet-tools output{display:block;margin-top:8px}.desk{overflow:auto}@media print{.sheet-tools{display:none}}`;
  document.head.append(style);
  const tools = document.createElement('div'); tools.className = 'sheet-tools';
  tools.innerHTML = '<label for="measure">Inspect a measurement</label><select id="measure"><option value="">Choose a dimension</option></select><div><button id="out" aria-label="Zoom out">−</button><button id="in" aria-label="Zoom in">+</button><button id="fit">Fit sheet</button><button id="clear">Clear selection</button></div><output aria-live="polite">Choose a dimension to highlight its reference points. Zoom in, then scroll to inspect the drawing.</output>';
  desk.before(tools);
  const select = tools.querySelector('select'), output = tools.querySelector('output');
  const rows = [...sheet.querySelectorAll('.row')];
  const texts = [...sheet.querySelectorAll('svg text')];
  function choose(key) {
    texts.forEach(t => t.classList.remove('measure-hit'));
    rows.forEach(row => row.setAttribute('aria-pressed', String(row.querySelector('.k').textContent.trim() === key)));
    select.value = key;
    const row = rows.find(r => r.querySelector('.k').textContent.trim() === key);
    if (!row) { output.textContent = 'Choose a dimension to highlight its reference points. Zoom in, then scroll to inspect the drawing.'; return; }
    const refs = row.querySelector('.r').textContent.trim();
    output.textContent = `${key} · ${row.querySelector('.d').textContent} · ${row.querySelector('.v').textContent} mm · ${refs}`;
    const points = refs.split(/[–→]/);
    texts.forEach(t => { if (points.includes(t.textContent.trim()) || t.textContent.trim().startsWith(key + ' ')) t.classList.add('measure-hit'); });
  }
  rows.forEach(row => {
    const key = row.querySelector('.k').textContent.trim();
    const option = document.createElement('option'); option.value = key;
    option.textContent = `${key} — ${row.querySelector('.d').textContent}`; select.append(option);
    row.tabIndex = 0; row.setAttribute('role', 'button'); row.setAttribute('aria-pressed', 'false');
    row.addEventListener('click', () => choose(key));
    row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(key); } });
  });
  select.addEventListener('change', () => choose(select.value));
  tools.querySelector('#clear').addEventListener('click', () => choose(''));
  let zoom = 1;
  function fit() {
    if (matchMedia('print').matches) return;
    const scale = Math.min(1, (innerWidth - 32) / sheet.offsetWidth) * zoom;
    sheet.style.transform = `scale(${scale})`;
    desk.style.cssText = `padding:16px;height:${sheet.offsetHeight*scale+32}px`;
    sheet.style.marginRight = `${sheet.offsetWidth*(scale-1)}px`;
    tools.querySelector('#out').disabled = zoom <= 1;
    tools.querySelector('#in').disabled = zoom >= 6;
  }
  tools.querySelector('#in').addEventListener('click', () => { zoom = Math.min(6, zoom*1.5); fit(); });
  tools.querySelector('#out').addEventListener('click', () => { zoom = Math.max(1, zoom/1.5); fit(); });
  tools.querySelector('#fit').addEventListener('click', () => { zoom = 1; fit(); desk.scrollLeft = 0; });
  addEventListener('resize', fit); fit();
})();
