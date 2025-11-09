// Global premium loader — inject once and expose window.AppLoader
(function(){
  if (window.AppLoader) return;

  // Inject DOM
  const root = document.createElement('div');
  root.id = 'app-loader';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="card" role="status" aria-live="polite">
      <div class="row">
        <div class="spinner" aria-hidden="true"></div>
        <div>
          <h4 id="al-title">Working…</h4>
          <p id="al-sub">Please wait while we complete your request.</p>
        </div>
      </div>
      <div class="foot">
        <div class="pulse" aria-hidden="true"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        <div class="right"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span id="al-tip">Fast network helps—hang tight.</span></div>
      </div>
    </div>`;
  document.body.appendChild(root);

  let slowTimer = null, minTimer = null, visibleSince = 0;

  function show(text = "Working…", sub = "Please wait while we complete your request.", opts = {}){
    const { min = 600, slowAt = 6000, slowText = "This is taking longer than usual. Still working…" } = opts;
    const t = root.querySelector('#al-title');
    const s = root.querySelector('#al-sub');
    if (t) t.textContent = text;
    if (s) s.textContent = sub;

    root.classList.add('active');
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    visibleSince = Date.now();

    clearTimeout(slowTimer);
    slowTimer = setTimeout(()=> {
      const s2 = root.querySelector('#al-sub');
      if (s2) s2.textContent = slowText;
      const tip = root.querySelector('#al-tip');
      if (tip) tip.textContent = "Might be your internet speed or server load.";
    }, slowAt);

    clearTimeout(minTimer);
    minTimer = setTimeout(()=>{}, min);
  }

  function hide(){
    const elapsed = Date.now() - visibleSince;
    const remaining = Math.max(0, 600 - elapsed); // keep min 600ms feel
    setTimeout(()=>{
      clearTimeout(slowTimer);
      root.classList.remove('active');
      root.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    }, remaining);
  }

  // Convenience wrapper: run a promise with loader shown
  async function run(fnOrPromise, { text = "Working…", sub, min = 600 } = {}){
    show(text, sub, { min });
    try {
      const res = (typeof fnOrPromise === 'function') ? await fnOrPromise() : await fnOrPromise;
      hide();
      return res;
    } catch (e) {
      hide();
      throw e;
    }
  }

  window.AppLoader = { show, hide, run };
})();
