/* ══════════════════════════════════════════════════════════════════
   FX Conversion · Bidirectional Amount Sync
══════════════════════════════════════════════════════════════════ */

const fxRates = { BGN: 1, EUR: 1.9558, USD: 1.82, GBP: 2.31, CHF: 2.05 };
const FEE_RATE = 0.005; // 0.5%

let lastChangedInput = null;

function getExchangeRate(from, to) {
  return fxRates[to] / fxRates[from];
}

function formatCurrency(value, currency) {
  return parseFloat(value).toFixed(2) + ' ' + currency;
}

function updateAmounts() {
  const sourceAmount = parseFloat(document.getElementById('fx-amount').value) || 0;
  const targetAmount = parseFloat(document.getElementById('fx-target-amount').value) || 0;
  const fromCurrency = document.getElementById('fx-from').value;
  const toCurrency = document.getElementById('fx-to').value;

  if (fromCurrency === toCurrency || (!sourceAmount && !targetAmount)) return;

  const rate = getExchangeRate(fromCurrency, toCurrency);

  // If source amount changed, calculate target
  if (lastChangedInput === 'source' && sourceAmount > 0) {
    const calculated = sourceAmount * rate;
    const fee = sourceAmount * FEE_RATE;
    const net = calculated - (fee * rate);
    document.getElementById('fx-target-amount').value = net.toFixed(2);
  }
  // If target amount changed, calculate source
  else if (lastChangedInput === 'target' && targetAmount > 0) {
    const fee = targetAmount / rate * FEE_RATE;
    const sourceNeeded = (targetAmount + (fee * rate)) / rate;
    document.getElementById('fx-amount').value = sourceNeeded.toFixed(2);
  }
}

function updateRateDisplay() {
  const fromCurrency = document.getElementById('fx-from').value;
  const toCurrency = document.getElementById('fx-to').value;
  const rateBox = document.getElementById('fx-result-box');

  if (fromCurrency === toCurrency) {
    rateBox.style.display = 'none';
    return;
  }

  const rate = getExchangeRate(fromCurrency, toCurrency);
  const sourceAmount = parseFloat(document.getElementById('fx-amount').value) || 0;

  if (sourceAmount > 0) {
    const calculated = sourceAmount * rate;
    const fee = sourceAmount * FEE_RATE;
    const net = calculated - (fee * rate);

    document.getElementById('fx-converted').textContent = formatCurrency(net, toCurrency);
    document.getElementById('fx-fee-val').textContent = formatCurrency(fee, fromCurrency);
    rateBox.style.display = '';
  }
}

// Event listeners for source amount
document.getElementById('fx-amount').addEventListener('input', function() {
  lastChangedInput = 'source';
  updateAmounts();
  updateRateDisplay();
});

// Event listeners for target amount
document.getElementById('fx-target-amount').addEventListener('input', function() {
  lastChangedInput = 'target';
  updateAmounts();
  updateRateDisplay();
});

// Update when currency changes
document.getElementById('fx-from').addEventListener('change', function() {
  lastChangedInput = null;
  document.getElementById('fx-amount').value = '';
  document.getElementById('fx-target-amount').value = '';
  document.getElementById('fx-result-box').style.display = 'none';
});

document.getElementById('fx-to').addEventListener('change', function() {
  lastChangedInput = null;
  document.getElementById('fx-amount').value = '';
  document.getElementById('fx-target-amount').value = '';
  document.getElementById('fx-result-box').style.display = 'none';
});

/* Account validation */
function validateAccount(accountInput, errId) {
  const value = accountInput.value.trim();
  const isValid = value.length > 0 && /^[A-Z]{2}\d{2}[A-Z0-9]{15,30}$/.test(value);

  if (isValid) {
    accountInput.classList.add('valid');
    accountInput.classList.remove('invalid');
    document.getElementById(errId).classList.remove('show');
  } else if (value.length > 0) {
    accountInput.classList.add('invalid');
    accountInput.classList.remove('valid');
    document.getElementById(errId).classList.add('show');
  }
  return isValid;
}

document.getElementById('fx-source-account').addEventListener('input', function() {
  validateAccount(this, 'fx-source-account-err');
});

document.getElementById('fx-dest-account').addEventListener('input', function() {
  validateAccount(this, 'fx-dest-account-err');
});
