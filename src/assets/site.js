// G&E Cleaning Solutions — site behavior (no libraries)

// ---------- Town search (Service Areas) ----------
(() => {
  const input = document.querySelector('.town-q');
  const data = document.getElementById('town-data');
  if (!input || !data) return;
  const index = JSON.parse(data.textContent); // { town: "County, ST" }
  const out = document.querySelector('.town-result');
  const norm = (t) => t.toLowerCase().replace(/[^a-z]/g, '');
  input.addEventListener('input', () => {
    const q = norm(input.value);
    out.className = 'town-result';
    if (q.length < 3) { out.textContent = ''; return; }
    const hits = Object.keys(index).filter((t) => norm(t).includes(q));
    if (hits.length) {
      out.classList.add('yes');
      const list = hits.slice(0, 3).map((t) => `${t} (${index[t]})`).join(', ');
      out.textContent = `Yes, we serve ${list}${hits.length > 3 ? ` and ${hits.length - 3} more` : ''}.`;
    } else {
      out.classList.add('no');
      out.textContent = 'Not on our list yet. Call us, we may still cover it.';
    }
  });
})();

// ---------- Quote form ----------
(() => {
  const form = document.getElementById('quote-form');
  if (!form) return;
  const endpoint = form.dataset.endpoint || '';
  const radios = [...form.querySelectorAll('input[name="Service"]')];
  const conditional = [...form.querySelectorAll('[data-for]')];
  const errorBox = form.querySelector('.form-error');
  const btn = form.querySelector('button[type="submit"]');
  const btnLabel = btn.innerHTML;

  // Show only the questions that fit the chosen service.
  // Hidden questions are disabled so they are not required and not sent.
  const applyService = () => {
    const picked = radios.find((r) => r.checked);
    const key = picked ? picked.dataset.key : '';
    conditional.forEach((el) => {
      const show = !!key && el.dataset.for.split(' ').includes(key);
      el.hidden = !show;
      el.querySelectorAll('input, select, textarea').forEach((f) => (f.disabled = !show));
    });
    form.querySelector('[data-error-for="Service"]').hidden = true;
  };
  radios.forEach((r) => r.addEventListener('change', applyService));

  // Preselect from the page the visitor came from: /contact/?service=deep
  const want = new URLSearchParams(location.search).get('service');
  const match = radios.find((r) => r.dataset.key === want);
  if (match) match.checked = true;
  applyService();

  // Photos: show chosen files, enforce limits
  const files = form.querySelector('.file-input');
  const fileList = form.querySelector('.file-list');
  const MAX_FILES = 5, MAX_MB = 10;
  const checkFiles = () => {
    if (!files) return '';
    const list = [...files.files];
    if (fileList) fileList.textContent = list.length ? list.map((f) => f.name).join(', ') : '';
    if (list.length > MAX_FILES) return `Please choose up to ${MAX_FILES} photos.`;
    const big = list.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (big) return `"${big.name}" is larger than ${MAX_MB} MB. Please choose a smaller photo.`;
    return '';
  };
  if (files) files.addEventListener('change', () => { const m = checkFiles(); showError(m); });

  const showError = (msg) => { errorBox.textContent = msg; errorBox.hidden = !msg; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');
    if (!radios.some((r) => r.checked)) {
      form.querySelector('[data-error-for="Service"]').hidden = false;
      radios[0].focus();
      return;
    }
    const bad = [...form.querySelectorAll('input, select, textarea')].find((f) => !f.disabled && !f.checkValidity());
    if (bad) {
      bad.focus();
      showError(bad.validity.patternMismatch ? 'Please enter a 5-digit ZIP code.' : `Please fill in "${(form.querySelector(`label[for="${bad.id}"]`) || {}).textContent || bad.name}".`.replace(' *"', '"'));
      return;
    }
    const fileMsg = checkFiles();
    if (fileMsg) return showError(fileMsg);

    const data = new FormData(form);
    const service = data.get('Service') || 'Cleaning';
    data.set('_subject', `New quote request: ${service} in ${data.get('City') || 'NJ'}`);
    if (files && !files.files.length) data.delete('Photos');

    const done = () => {
      form.hidden = true;
      const ok = document.querySelector('.success');
      ok.hidden = false;
      ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Demo mode (no form endpoint yet): confirm and offer an email draft
    if (!endpoint) {
      const lines = [];
      for (const [k, v] of data.entries()) if (typeof v === 'string' && v && !k.startsWith('_')) lines.push(`${k}: ${v}`);
      const mail = document.getElementById('mail-fallback');
      mail.href = `mailto:${document.querySelector('.info-card a[href^="mailto:"]').textContent}?subject=${encodeURIComponent('Quote request: ' + service)}&body=${encodeURIComponent(lines.join('\n'))}`;
      mail.hidden = false;
      return done();
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const r = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(String(r.status));
      if (window.gtag) window.gtag('event', 'generate_lead', { service });
      done();
    } catch {
      btn.disabled = false;
      btn.innerHTML = btnLabel;
      showError("We couldn't send your request. Please try again, or call us.");
    }
  });
})();
