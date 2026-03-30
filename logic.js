/* ── Helpers ──────────────────────────────────────────────────────── */
function el(id)  { return document.getElementById(id); }
function $(sel)  { return document.querySelector(sel); }
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
function randomRef() {
  return 'FTB-' + Math.random().toString(36).slice(2,10).toUpperCase();
}
function randomHex(len) {
  return Array.from({length: len}, () => Math.floor(Math.random()*16).toString(16)).join('');
}

/* ══════════════════════════════════════════════════════════════════
   FORM 1 · Loan
══════════════════════════════════════════════════════════════════ */
const loanRates = { '12':8.9,'24':9.5,'36':10.2,'48':11.0,'60':11.8,'84':12.9 };

function updateDTI() {
  const income  = parseFloat(el('l-income').value) || 0;
  const amount  = parseFloat(el('l-amount').value) || 0;
  const months  = el('l-months').value;
  if (!income || !amount || !months) { el('l-dti-wrap').style.display='none'; return; }
  const rate    = loanRates[months] / 100 / 12;
  const monthly = amount * rate / (1 - Math.pow(1+rate, -months));
  const dti     = (monthly / income) * 100;
  const pct     = Math.min(dti, 100);
  el('l-dti-wrap').style.display = '';
  const valEl   = el('l-dti-val');
  const bar     = el('l-dti-bar');
  const hint    = el('l-dti-hint');
  valEl.textContent = dti.toFixed(1) + '%';
  bar.style.width   = pct + '%';
  if (dti < 30) {
    valEl.className = 'risk-val risk-low';
    bar.style.background = '#3fb950';
    hint.textContent = 'Нисък риск – банките предпочитат DTI < 30%.';
  } else if (dti < 43) {
    valEl.className = 'risk-val risk-medium';
    bar.style.background = '#d29922';
    hint.textContent = 'Умерен риск – DTI е приемлив, но близо до лимита.';
  } else {
    valEl.className = 'risk-val risk-high';
    bar.style.background = '#da3633';
    hint.textContent = 'Висок риск – DTI надвишава 43%. Вероятен отказ.';
  }
}

['l-income','l-amount','l-months'].forEach(id =>
  el(id).addEventListener('input', updateDTI)
);

el('loanForm').addEventListener('submit', function(e) {
  e.preventDefault();
  let ok = true;
  const fields = [
    { id:'l-name',    errId:'l-name-err',    test: v => v.trim().length >= 5 },
    { id:'l-egn',     errId:'l-egn-err',     test: v => /^\d{10}$/.test(v.trim()) },
    { id:'l-income',  errId:'l-income-err',  test: v => parseFloat(v) > 0 },
    { id:'l-employer',errId:'l-employer-err',test: v => v.trim().length > 1 },
    { id:'l-amount',  errId:'l-amount-err',  test: v => parseFloat(v) >= 100 },
    { id:'l-months',  errId:'l-months-err',  test: v => v !== '' },
    { id:'l-score',   errId:'l-score-err',   test: v => v !== '' },
  ];
  fields.forEach(f => {
    const inp = el(f.id);
    clearErr(f.errId);
    if (f.test(inp.value)) { markValid(inp); }
    else { markInvalid(inp, f.errId); ok = false; }
  });
  if (ok) {
    el('l-ref').textContent = randomRef();
    el('l-success').classList.add('show');
    this.querySelectorAll('input,select,button[type=submit]').forEach(x => x.disabled = true);
  }
});

/* ══════════════════════════════════════════════════════════════════
   OTP auto-advance helper (shared)
══════════════════════════════════════════════════════════════════ */
function setupOTP(inputs) {
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g,'').slice(-1);
      if (inp.value && i < inputs.length - 1) inputs[i+1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i-1].focus();
    });
  });
}

/* ══════════════════════════════════════════════════════════════════
   FORM 2 · Crypto
══════════════════════════════════════════════════════════════════ */
const walletPatterns = {
  btc:  /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  eth:  /^0x[0-9a-fA-F]{40}$/,
  usdt: /^(0x[0-9a-fA-F]{40}|T[A-Za-z1-9]{33})$/,
  bnb:  /^(bnb1[0-9a-z]{38}|0x[0-9a-fA-F]{40})$/,
};
const fees = { btc:'~0.0001 BTC', eth:'~0.002 ETH', usdt:'~3.50 USDT', bnb:'~0.001 BNB' };

function checkCryptoIntegrity() {
  const asset  = el('c-asset').value;
  const wallet = el('c-wallet').value.trim();
  const amount = parseFloat(el('c-amount').value);
  const pin    = [...document.querySelectorAll('#c-pin-wrap .otp')].map(x=>x.value).join('');
  const dot    = el('c-integrity').querySelector('.dot');
  const txt    = el('c-integrity-text');

  if (!asset || !wallet || !amount || pin.length < 6) {
    dot.className = 'dot dot-grey'; txt.textContent = 'Попълнете формата за проверка на целостта.'; return;
  }
  const validWallet = walletPatterns[asset]?.test(wallet);
  if (!validWallet) {
    dot.className = 'dot dot-red'; txt.textContent = 'Адресът не отговаря на формата за ' + asset.toUpperCase() + '.'; return;
  }
  if (amount <= 0) {
    dot.className = 'dot dot-yellow'; txt.textContent = 'Сумата е невалидна.'; return;
  }
  dot.className = 'dot dot-green';
  txt.textContent = 'Целостта е потвърдена – адресът и сумата са валидни.';
}

el('c-asset').addEventListener('change', function() {
  el('c-fee').value = fees[this.value] || '';
  el('c-wallet').value = '';
  el('c-hash-preview').textContent = '';
  checkCryptoIntegrity();
});

el('c-wallet').addEventListener('input', function() {
  const v = this.value.trim();
  el('c-hash-preview').textContent = v.length > 10
    ? 'Hash: ' + v.slice(0,6) + '…' + v.slice(-6) + ' (' + v.length + ' ch)'
    : '';
  checkCryptoIntegrity();
});
el('c-amount').addEventListener('input', checkCryptoIntegrity);

setupOTP([...document.querySelectorAll('#c-pin-wrap .otp')]);
document.querySelectorAll('#c-pin-wrap .otp').forEach(x => x.addEventListener('input', checkCryptoIntegrity));

el('cryptoForm').addEventListener('submit', function(e) {
  e.preventDefault();
  let ok = true;
  const asset  = el('c-asset').value;
  const wallet = el('c-wallet').value.trim();
  const amount = parseFloat(el('c-amount').value);
  const pin    = [...document.querySelectorAll('#c-pin-wrap .otp')].map(x=>x.value).join('');

  clearErr('c-asset-err'); clearErr('c-wallet-err'); clearErr('c-amount-err'); clearErr('c-pin-err');

  if (!asset)  { markInvalid(el('c-asset'), 'c-asset-err'); ok = false; } else markValid(el('c-asset'));
  const validWallet = asset && walletPatterns[asset]?.test(wallet);
  if (!validWallet) { markInvalid(el('c-wallet'), 'c-wallet-err'); ok = false; } else markValid(el('c-wallet'));
  if (!(amount > 0)) { markInvalid(el('c-amount'), 'c-amount-err'); ok = false; } else markValid(el('c-amount'));
  if (pin.length < 6) { el('c-pin-err').classList.add('show'); ok = false; }

  if (ok) {
    el('c-txid').textContent = '0x' + randomHex(64);
    el('c-success').classList.add('show');
    this.querySelectorAll('input,select,button[type=submit]').forEach(x => x.disabled = true);
  }
});

/* ══════════════════════════════════════════════════════════════════
   FORM 3 · Overdraft
══════════════════════════════════════════════════════════════════ */
function isBGIBAN(v) { return /^BG\d{2}[A-Z]{4}\d{14}$/.test(v.trim()); }

el('od-iban').addEventListener('input', function() {
  const v = this.value.trim().toUpperCase();
  this.value = v;
  const statusDot  = el('od-status').querySelector('.dot');
  const statusTxt  = el('od-status-text');
  if (isBGIBAN(v)) {
    markValid(this); clearErr('od-iban-err');
    // Simulate fetching limit
    const limit = Math.floor(Math.random() * 4 + 1) * 500;
    el('od-limit').value = limit;
    statusDot.className = 'dot dot-green';
    statusTxt.textContent = 'Сметката е намерена. Лимит: ' + limit + ' BGN.';
    updateGauge();
  } else {
    el('od-limit').value = '';
    statusDot.className = 'dot dot-yellow';
    statusTxt.textContent = 'Въведете валиден BG IBAN (22 символа).';
  }
});

function updateGauge() {
  const req   = parseFloat(el('od-req').value) || 0;
  const limit = parseFloat(el('od-limit').value) || 0;
  if (!limit) return;
  const pct   = Math.min((req / limit) * 100, 100);
  el('od-gauge-pct').textContent = pct.toFixed(0) + '%';
  const bar = el('od-gauge-bar');
  bar.style.width = pct + '%';
  bar.style.background = pct > 100 ? '#da3633' : pct > 75 ? '#d29922' : '#3fb950';
}
el('od-req').addEventListener('input', updateGauge);

el('odForm').addEventListener('submit', function(e) {
  e.preventDefault();
  let ok = true;
  clearErr('od-iban-err'); clearErr('od-balance-err'); clearErr('od-req-err'); clearErr('od-reason-err');

  if (!isBGIBAN(el('od-iban').value)) { markInvalid(el('od-iban'),'od-iban-err'); ok=false; } else markValid(el('od-iban'));
  if (!(parseFloat(el('od-balance').value) >= 0)) { markInvalid(el('od-balance'),'od-balance-err'); ok=false; } else markValid(el('od-balance'));

  const req   = parseFloat(el('od-req').value);
  const limit = parseFloat(el('od-limit').value) || 0;
  if (!req || req < 50 || req > limit) { markInvalid(el('od-req'),'od-req-err'); ok=false; } else markValid(el('od-req'));
  if (el('od-reason').value.trim().length < 20) { markInvalid(el('od-reason'),'od-reason-err'); ok=false; } else markValid(el('od-reason'));

  if (ok) {
    el('od-success').classList.add('show');
    this.querySelectorAll('input,select,textarea,button[type=submit]').forEach(x => x.disabled = true);
  }
});

/* ══════════════════════════════════════════════════════════════════
   FORM 4 · Corporate Card
══════════════════════════════════════════════════════════════════ */
el('cc-eik').addEventListener('input', function() {
  const v = this.value.trim();
  if (/^\d{9}$/.test(v)) {
    markValid(this); clearErr('cc-eik-err');
    // Simulate EIK lookup → step 1 done
    el('cc-s1-num').className = 'step-num step-done';
    el('cc-s1-check').style.display = '';
  } else {
    el('cc-s1-num').className = 'step-num step-wait';
    el('cc-s1-check').style.display = 'none';
  }
});

el('cc-level').addEventListener('change', function() {
  const lvl = parseInt(this.value);
  // Step 2: any manager+ (level >= 2)
  if (lvl >= 2) {
    el('cc-s2-num').className = 'step-num step-active';
    el('cc-s2-check').style.display = '';
  } else {
    el('cc-s2-num').className = 'step-num step-wait';
    el('cc-s2-check').style.display = 'none';
  }
  // Step 3: director+ requires TOTP
  if (lvl >= 3) {
    el('cc-s3-num').className = 'step-num step-active';
    el('cc-s3-check').style.display = '';
  } else {
    el('cc-s3-num').className = 'step-num step-wait';
    el('cc-s3-check').style.display = 'none';
  }
});

el('corpForm').addEventListener('submit', function(e) {
  e.preventDefault();
  let ok = true;
  const fields = [
    { id:'cc-company', errId:'cc-company-err', test: v => v.trim().length > 2 },
    { id:'cc-eik',     errId:'cc-eik-err',     test: v => /^\d{9}$/.test(v.trim()) },
    { id:'cc-holder',  errId:'cc-holder-err',  test: v => v.trim().split(' ').filter(Boolean).length >= 2 },
    { id:'cc-email',   errId:'cc-email-err',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { id:'cc-level',   errId:'cc-level-err',   test: v => v !== '' },
    { id:'cc-monthly', errId:'cc-monthly-err', test: v => parseFloat(v) >= 0 },
  ];
  fields.forEach(f => {
    const inp = el(f.id); clearErr(f.errId);
    if (f.test(inp.value)) markValid(inp); else { markInvalid(inp, f.errId); ok=false; }
  });
  if (ok) {
    // activate step 4
    el('cc-s4-num').className = 'step-num step-active';
    el('cc-s4-check').style.display = '';
    el('cc-success').classList.add('show');
    this.querySelectorAll('input,select,button[type=submit]').forEach(x => x.disabled = true);
  }
});

/* ══════════════════════════════════════════════════════════════════
   FORM 5 · FX
══════════════════════════════════════════════════════════════════ */
// Simulated rates (base BGN)
const fxRates = { BGN:1, EUR:1.9558, USD:1.82, GBP:2.31, CHF:2.05 };

let fxVerified = false;
let fxTs = null;

function fxRate(from, to) {
  return fxRates[to] / fxRates[from];
}

function refreshRate() {
  const from = el('fx-from').value;
  const to   = el('fx-to').value;
  const dot  = el('fx-int-dot');
  const txt  = el('fx-int-text');

  if (from === to) {
    el('fx-rate-val').textContent = '–';
    el('fx-rate-ts').textContent  = 'Изберете различни валути';
    el('fx-pair-err').style.display = 'block';
    dot.className = 'dot dot-red'; txt.textContent = 'Невалидна валутна двойка.';
    fxVerified = false; return;
  }
  el('fx-pair-err').style.display = 'none';

  const rate = fxRate(from, to);
  // Add tiny random spread to simulate live feed
  const live = rate * (1 + (Math.random()-.5) * 0.002);
  fxTs = new Date();
  el('fx-rate-val').textContent = '1 ' + from + ' = ' + live.toFixed(4) + ' ' + to;
  el('fx-rate-ts').textContent  = 'Обновен: ' + fxTs.toLocaleTimeString('bg-BG') + ' (симулация)';

  fxVerified = true;
  dot.className = 'dot dot-green';
  txt.textContent = 'Курсът е верифициран – целостта е потвърдена.';
  calcConverted();
}

function calcConverted() {
  const from   = el('fx-from').value;
  const to     = el('fx-to').value;
  const amount = parseFloat(el('fx-amount').value);
  if (!fxVerified || from === to || !(amount > 0)) {
    el('fx-result-box').style.display = 'none'; return;
  }
  const rate      = fxRate(from, to);
  const converted = amount * rate;
  const fee       = amount * 0.005;
  const net       = converted - fee * rate;
  el('fx-converted').textContent = net.toFixed(2) + ' ' + to;
  el('fx-fee-val').textContent   = fee.toFixed(2) + ' ' + from;
  el('fx-result-box').style.display = '';
}

el('fx-from').addEventListener('change', refreshRate);
el('fx-to').addEventListener('change', refreshRate);
el('fx-amount').addEventListener('input', calcConverted);
el('fx-refresh-btn').addEventListener('click', refreshRate);
refreshRate();

el('fxForm').addEventListener('submit', function(e) {
  e.preventDefault();
  let ok = true;
  clearErr('fx-amount-err'); clearErr('fx-purpose-err');

  if (el('fx-from').value === el('fx-to').value) { ok=false; }
  if (!(parseFloat(el('fx-amount').value) > 0)) { markInvalid(el('fx-amount'),'fx-amount-err'); ok=false; } else markValid(el('fx-amount'));
  if (!el('fx-purpose').value) { markInvalid(el('fx-purpose'),'fx-purpose-err'); ok=false; } else markValid(el('fx-purpose'));
  if (!fxVerified) { el('fx-int-text').textContent = 'Обновете курса преди потвърждение.'; ok=false; }

  if (ok) {
    el('fx-ref').textContent = randomRef();
    el('fx-success').classList.add('show');
    this.querySelectorAll('input,select,button[type=submit]').forEach(x => x.disabled = true);
  }
});

/* ══════════════════════════════════════════════════════════════════
   FORM 6 · MFA Password Recovery
══════════════════════════════════════════════════════════════════ */
setupOTP([...document.querySelectorAll('.mfa-otp')]);

// Step 1
el('mfa-btn1').addEventListener('click', function() {
  let ok = true;
  const user  = el('mfa-user').value.trim();
  const dob   = el('mfa-dob').value;
  const phone = el('mfa-phone').value.trim();

  clearErr('mfa-user-err'); clearErr('mfa-dob-err'); clearErr('mfa-phone-err');

  const validUser = user.length > 3 && (user.includes('@') || /^\w{4,}$/.test(user));
  if (!validUser) { markInvalid(el('mfa-user'),'mfa-user-err'); ok=false; } else markValid(el('mfa-user'));
  if (!dob) { markInvalid(el('mfa-dob'),'mfa-dob-err'); ok=false; } else markValid(el('mfa-dob'));
  if (!/^\d{4}$/.test(phone)) { markInvalid(el('mfa-phone'),'mfa-phone-err'); ok=false; } else markValid(el('mfa-phone'));

  if (ok) {
    el('mfa-phone-hint').textContent = phone;
    el('mfa-step1').style.display = 'none';
    el('mfa-step2').style.display = '';
    el('mfa-d1').style.background = 'var(--accent)';
    el('mfa-d2').style.background = 'var(--accent2)';
    startOTPTimer();
    document.querySelector('.mfa-otp').focus();
  }
});

// OTP countdown
let timerInterval;
function startOTPTimer() {
  let seconds = 120;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds--;
    const m = String(Math.floor(seconds/60)).padStart(2,'0');
    const s = String(seconds%60).padStart(2,'0');
    el('mfa-countdown').textContent = m + ':' + s;
    if (seconds <= 0) {
      clearInterval(timerInterval);
      el('mfa-countdown').textContent = '00:00';
      el('mfa-otp-err').textContent = 'Кодът е изтекъл. Заявете нов.';
      el('mfa-otp-err').classList.add('show');
    }
  }, 1000);
}

// Step 2
el('mfa-btn2').addEventListener('click', function() {
  const otp = [...document.querySelectorAll('.mfa-otp')].map(x=>x.value).join('');
  clearErr('mfa-otp-err');
  if (otp.length < 6) { el('mfa-otp-err').classList.add('show'); return; }
  // Accept any 6-digit code for demo
  clearInterval(timerInterval);
  el('mfa-step2').style.display = 'none';
  el('mfa-step3').style.display = '';
  el('mfa-d2').style.background = 'var(--accent)';
  el('mfa-d3').style.background = 'var(--accent2)';
  el('mfa-pass1').focus();
});

// Password strength
function passwordStrength(p) {
  let score = 0;
  if (p.length >= 12)                  score++;
  if (p.length >= 16)                  score++;
  if (/[A-Z]/.test(p))                 score++;
  if (/[0-9]/.test(p))                 score++;
  if (/[^A-Za-z0-9]/.test(p))         score++;
  return score;
}

el('mfa-pass1').addEventListener('input', function() {
  const p     = this.value;
  const score = passwordStrength(p);
  const pct   = (score / 5) * 100;
  const bar   = el('mfa-strength-bar');
  bar.style.width = pct + '%';
  const labels = ['Много слаба','Слаба','Умерена','Добра','Силна'];
  const colors  = ['#da3633','#f85149','#d29922','#3fb950','#238636'];
  bar.style.background = colors[score-1] || '#da3633';
  el('mfa-strength-txt').textContent = 'Сила на паролата: ' + (labels[score-1] || 'Много слаба');
});

// Step 3
el('mfa-btn3').addEventListener('click', function() {
  let ok = true;
  const p1 = el('mfa-pass1').value;
  const p2 = el('mfa-pass2').value;
  clearErr('mfa-pass1-err'); clearErr('mfa-pass2-err');

  const validPwd = p1.length >= 12 && /[A-Z]/.test(p1) && /[0-9]/.test(p1) && /[^A-Za-z0-9]/.test(p1);
  if (!validPwd) { markInvalid(el('mfa-pass1'),'mfa-pass1-err'); ok=false; } else markValid(el('mfa-pass1'));
  if (p1 !== p2) { markInvalid(el('mfa-pass2'),'mfa-pass2-err'); ok=false; } else markValid(el('mfa-pass2'));

  if (ok) {
    el('mfa-step3').style.display = 'none';
    el('mfa-dots').style.display  = 'none';
    el('mfa-d3').style.background = 'var(--accent)';
    el('mfa-success').classList.add('show');
  }
});
