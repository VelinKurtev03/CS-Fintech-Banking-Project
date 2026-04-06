/* ── Helpers ──────────────────────────────────────────────────────── */
function el(id)    { return document.getElementById(id); }
function markValid(inp) {
  inp.classList.add('valid'); inp.classList.remove('invalid');
}
function markInvalid(inp, errId) {
  inp.classList.add('invalid'); inp.classList.remove('valid');
  if (errId) el(errId).classList.add('show');
}
function clearErr(errId) {
  if (errId) el(errId).classList.remove('show');
}
function isBGIBAN(v) { return /^BG\d{2}[A-Z]{4}\d{14}$/.test(v.trim()); }

/* ══════════════════════════════════════════════════════════════════
   Корпоративна карта – 5-стъпков формуляр
══════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  // Hidden timestamp
  el('corp-ts').value = new Date().toISOString();

  // ── Captcha ─────────────────────────────────────────────────────
  let captchaAnswer = 0;
  function genCaptcha() {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    captchaAnswer = a + b;
    el('corp-captcha-q').textContent = a + ' + ' + b + ' = ?';
  }
  genCaptcha();

  // ── Step navigation ─────────────────────────────────────────────
  function setStep(step) {
    for (let i = 1; i <= 5; i++) {
      el('corp-s' + i).style.display = i === step ? '' : 'none';
      const nav = el('cni-' + i);
      if (i < step) {
        nav.style.background = 'var(--accent2, #388bfd)';
        nav.style.color = '#fff';
      } else if (i === step) {
        nav.style.background = 'var(--accent, #3fb950)';
        nav.style.color = '#fff';
      } else {
        nav.style.background = 'var(--surface2, #21262d)';
        nav.style.color = 'var(--muted, #8b949e)';
      }
    }
    el('card-corp').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Validation: Step 1 – Фирма ─────────────────────────────────
  function validate1() {
    let ok = true;
    const fields = [
      { id:'cc-company',  errId:'cc-company-err',  test: v => v.trim().length >= 3 },
      { id:'cc-eik',      errId:'cc-eik-err',      test: v => /^\d{9}$/.test(v.trim()) },
      { id:'cc-reg-date', errId:'cc-reg-date-err', test: v => v !== '' },
      { id:'cc-legal',    errId:'cc-legal-err',    test: v => v !== '' },
      { id:'cc-activity', errId:'cc-activity-err', test: v => v.trim().length > 2 },
      { id:'cc-addr-reg', errId:'cc-addr-reg-err', test: v => v.trim().length > 5 },
    ];
    if (!el('cc-same-addr').checked)
      fields.push({ id:'cc-addr-corr', errId:'cc-addr-corr-err', test: v => v.trim().length > 5 });

    fields.forEach(f => {
      const inp = el(f.id); clearErr(f.errId);
      if (f.test(inp.value)) markValid(inp); else { markInvalid(inp, f.errId); ok = false; }
    });

    // VAT – optional but must match format if filled
    const vat = el('cc-vat').value.trim();
    clearErr('cc-vat-err');
    if (vat && !/^BG\d{9}$/.test(vat)) { markInvalid(el('cc-vat'), 'cc-vat-err'); ok = false; }
    else if (vat) markValid(el('cc-vat'));

    return ok;
  }

  // ── Validation: Step 2 – Управител ─────────────────────────────
  function validate2() {
    let ok = true;
    [
      { id:'cc-rep-name',    errId:'cc-rep-name-err',    test: v => v.trim().split(/\s+/).filter(Boolean).length >= 2 },
      { id:'cc-rep-egn',     errId:'cc-rep-egn-err',     test: v => /^\d{10}$/.test(v.trim()) },
      { id:'cc-rep-dob',     errId:'cc-rep-dob-err',     test: v => v !== '' },
      { id:'cc-rep-citizen', errId:'cc-rep-citizen-err', test: v => v.trim().length > 1 },
      { id:'cc-doc-type',    errId:'cc-doc-type-err',    test: v => v !== '' },
      { id:'cc-doc-num',     errId:'cc-doc-num-err',     test: v => v.trim().length >= 5 },
      { id:'cc-doc-issued',  errId:'cc-doc-issued-err',  test: v => v !== '' },
      { id:'cc-doc-expiry',  errId:'cc-doc-expiry-err',  test: v => v !== '' },
      { id:'cc-doc-issuer',  errId:'cc-doc-issuer-err',  test: v => v.trim().length > 2 },
      { id:'cc-rep-addr',    errId:'cc-rep-addr-err',    test: v => v.trim().length > 5 },
      { id:'cc-rep-phone',   errId:'cc-rep-phone-err',   test: v => /^\+?\d[\d\s\-]{6,}$/.test(v.trim()) },
      { id:'cc-rep-email',   errId:'cc-rep-email-err',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    ].forEach(f => {
      const inp = el(f.id); clearErr(f.errId);
      if (f.test(inp.value)) markValid(inp); else { markInvalid(inp, f.errId); ok = false; }
    });
    return ok;
  }

  // ── Validation: Step 3 – Карта ─────────────────────────────────
  function validate3() {
    let ok = true;
    clearErr('cc-iban-err');
    if (!isBGIBAN(el('cc-iban').value)) { markInvalid(el('cc-iban'), 'cc-iban-err'); ok = false; }
    else markValid(el('cc-iban'));

    clearErr('cc-embossed-err');
    if (!/^[A-Za-z\s]{4,26}$/.test(el('cc-embossed').value.trim())) { markInvalid(el('cc-embossed'), 'cc-embossed-err'); ok = false; }
    else markValid(el('cc-embossed'));

    clearErr('cc-daily-limit-err');
    if (!(parseFloat(el('cc-daily-limit').value) > 0)) { markInvalid(el('cc-daily-limit'), 'cc-daily-limit-err'); ok = false; }
    else markValid(el('cc-daily-limit'));

    clearErr('cc-monthly-err');
    if (!(parseFloat(el('cc-monthly').value) > 0)) { markInvalid(el('cc-monthly'), 'cc-monthly-err'); ok = false; }
    else markValid(el('cc-monthly'));

    if (el('cc-diff-user').checked) {
      [
        { id:'cc-user-name',     errId:'cc-user-name-err',     test: v => v.trim().split(/\s+/).filter(Boolean).length >= 2 },
        { id:'cc-user-egn',      errId:'cc-user-egn-err',      test: v => /^\d{10}$/.test(v.trim()) },
        { id:'cc-user-position', errId:'cc-user-position-err', test: v => v.trim().length > 1 },
        { id:'cc-user-phone',    errId:'cc-user-phone-err',    test: v => /^\+?\d[\d\s\-]{6,}$/.test(v.trim()) },
        { id:'cc-user-email',    errId:'cc-user-email-err',    test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
      ].forEach(f => {
        const inp = el(f.id); clearErr(f.errId);
        if (f.test(inp.value)) markValid(inp); else { markInvalid(inp, f.errId); ok = false; }
      });
    }
    return ok;
  }

  // ── Validation: Step 4 – Документи ─────────────────────────────
  function validate4() {
    let ok = true;
    ['cc-doc-statute','cc-doc-status','cc-doc-id','cc-doc-aml'].forEach(id => {
      const errId = id + '-err';
      clearErr(errId);
      if (!el(id).files.length) { el(errId).classList.add('show'); ok = false; }
    });
    return ok;
  }

  // ── Validation: Step 5 – Декларации ────────────────────────────
  function validate5() {
    let ok = true;
    [
      ['cc-chk-tos',   'cc-chk-tos-err'],
      ['cc-chk-ubo',   'cc-chk-ubo-err'],
      ['cc-chk-funds', 'cc-chk-funds-err'],
      ['cc-chk-gdpr',  'cc-chk-gdpr-err'],
    ].forEach(([id, errId]) => {
      clearErr(errId);
      if (!el(id).checked) { el(errId).classList.add('show'); ok = false; }
    });
    clearErr('corp-captcha-err');
    if (parseInt(el('corp-captcha-ans').value) !== captchaAnswer) {
      el('corp-captcha-err').classList.add('show'); ok = false;
    }
    return ok;
  }

  // ── Conditional fields ──────────────────────────────────────────
  el('cc-same-addr').addEventListener('change', function () {
    el('cc-addr-corr-wrap').style.display = this.checked ? 'none' : '';
  });

  el('cc-diff-user').addEventListener('change', function () {
    el('cc-user-wrap').style.display = this.checked ? '' : 'none';
  });

  el('cc-iban').addEventListener('input', function () {
    this.value = this.value.toUpperCase();
    if (isBGIBAN(this.value)) { markValid(this); clearErr('cc-iban-err'); }
  });

  // ── Next / Prev buttons ─────────────────────────────────────────
  el('corp-next-1').addEventListener('click', function () { if (validate1()) setStep(2); });
  el('corp-prev-2').addEventListener('click', function () { setStep(1); });
  el('corp-next-2').addEventListener('click', function () { if (validate2()) setStep(3); });
  el('corp-prev-3').addEventListener('click', function () { setStep(2); });
  el('corp-next-3').addEventListener('click', function () { if (validate3()) setStep(4); });
  el('corp-prev-4').addEventListener('click', function () { setStep(3); });
  el('corp-next-4').addEventListener('click', function () { if (validate4()) setStep(5); });
  el('corp-prev-5').addEventListener('click', function () { setStep(4); });

  // ── Submit ──────────────────────────────────────────────────────
  el('corpForm').addEventListener('submit', function (e) {
    e.preventDefault();
    el('corp-ts').value = new Date().toISOString();
    if (validate5()) {
      el('cc-success').classList.add('show');
      this.querySelectorAll('input,select,textarea,button').forEach(x => x.disabled = true);
    }
  });

}); // DOMContentLoaded
