// Covenant Connection Fellowship of Churches — shared site behavior
// This is a static design mockup: forms below do not submit anywhere yet.
// In the live build, these will post to Wix forms wired to CCFC's Google
// Sheets, per the Website & Organizational Framework doc.

document.addEventListener('DOMContentLoaded', function () {
  var yearEls = document.querySelectorAll('[data-year]');
  yearEls.forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Form tabs (Registration & Requests page)
  var tabs = document.querySelectorAll('.form-tab');
  function activateTab(tab) {
    var target = tab.getAttribute('data-target');
    tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
    tab.setAttribute('aria-selected', 'true');
    document.querySelectorAll('.form-panel').forEach(function (panel) {
      panel.classList.toggle('active', panel.id === target);
    });
  }
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activateTab(tab); });
  });
  // Deep-link support: /registration/#vendor opens the matching tab.
  if (tabs.length && window.location.hash) {
    var hashTarget = window.location.hash.replace('#', '');
    var matchingTab = document.querySelector('.form-tab[data-target="' + hashTarget + '"]');
    if (matchingTab) activateTab(matchingTab);
  }

  // Mockup form submission — shows a confirmation instead of sending data.
  document.querySelectorAll('form[data-mock-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = form.parentElement.querySelector('.form-success');
      if (success) {
        success.classList.add('show');
        success.setAttribute('tabindex', '-1');
        success.focus();
      }
      form.reset();
    });
  });

  initSandboxPayment();
});

/* ============================================================
   Sandbox payment checkout
   Pure front-end demo: no card data is validated, sent, or stored
   anywhere. Amounts, card numbers, and receipts are all simulated.
   ============================================================ */
function initSandboxPayment() {
  var form = document.getElementById('paymentForm');
  if (!form) return;

  var paymentType = form.getAttribute('data-payment-type') || 'Payment';
  var nameEl = form.querySelector('#pay-name');
  var numberEl = form.querySelector('#pay-number');
  var expiryEl = form.querySelector('#pay-expiry');
  var cvcEl = form.querySelector('#pay-cvc');
  var zipEl = form.querySelector('#pay-zip');
  var payBtn = form.querySelector('.btn-pay');
  var sandboxApplied = document.querySelector('.sandbox-applied');
  var sandboxFillBtn = document.querySelector('.sandbox-fill-btn');

  var previewNumber = document.querySelector('.card-preview-number');
  var previewName = document.querySelector('.card-preview-name');
  var previewExpMonth = document.querySelector('.card-preview-expiry .exp-val');

  var amountTotalEl = document.querySelector('.amount-total');
  var amountValueEl = document.querySelector('.amount-total .value');

  // ---- Amount handling ----
  function currentAmount() {
    if (!amountTotalEl) return 0;
    var mode = amountTotalEl.getAttribute('data-amount-mode');
    if (mode === 'fixed') {
      return parseFloat(amountTotalEl.getAttribute('data-fixed-amount')) || 0;
    }
    if (mode === 'radio') {
      var checked = form.querySelector('input[name="amount"]:checked');
      return checked ? parseFloat(checked.value) || 0 : 0;
    }
    if (mode === 'event') {
      var select = document.getElementById('pay-event-select');
      var qty = document.getElementById('pay-event-qty');
      var price = select ? parseFloat(select.selectedOptions[0].getAttribute('data-price')) || 0 : 0;
      var count = qty ? parseInt(qty.value, 10) || 1 : 1;
      return price * count;
    }
    return 0;
  }

  function formatCurrency(n) {
    return '$' + n.toFixed(2);
  }

  function refreshAmountDisplay() {
    if (amountValueEl) amountValueEl.textContent = formatCurrency(currentAmount());
    checkReady();
  }

  // Radio amount options
  form.querySelectorAll('input[name="amount"]').forEach(function (radio) {
    radio.addEventListener('change', refreshAmountDisplay);
  });
  // Event + quantity amount
  var eventSelect = document.getElementById('pay-event-select');
  var eventQty = document.getElementById('pay-event-qty');
  if (eventSelect) eventSelect.addEventListener('change', refreshAmountDisplay);
  if (eventQty) eventQty.addEventListener('input', refreshAmountDisplay);

  // ---- Card number formatting (groups of 4) ----
  if (numberEl) {
    numberEl.addEventListener('input', function () {
      var digits = numberEl.value.replace(/\D/g, '').slice(0, 16);
      numberEl.value = digits.replace(/(.{4})/g, '$1 ').trim();
      updatePreview();
      checkReady();
    });
  }

  // ---- Expiry formatting (MM/YY) ----
  if (expiryEl) {
    expiryEl.addEventListener('input', function () {
      var digits = expiryEl.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length > 2) digits = digits.slice(0, 2) + '/' + digits.slice(2);
      expiryEl.value = digits;
      updatePreview();
      checkReady();
    });
  }

  if (cvcEl) {
    cvcEl.addEventListener('input', function () {
      cvcEl.value = cvcEl.value.replace(/\D/g, '').slice(0, 4);
      checkReady();
    });
  }
  if (nameEl) nameEl.addEventListener('input', function () { updatePreview(); checkReady(); });
  if (zipEl) zipEl.addEventListener('input', checkReady);

  // ---- Live card preview ----
  function updatePreview() {
    if (previewNumber) {
      var raw = numberEl ? numberEl.value.replace(/\D/g, '') : '';
      var padded = (raw + '••••••••••••••••').slice(0, 16);
      previewNumber.textContent = padded.replace(/(.{4})/g, '$1 ').trim();
    }
    if (previewName) {
      previewName.textContent = (nameEl && nameEl.value.trim()) ? nameEl.value.trim().toUpperCase() : 'YOUR NAME HERE';
    }
    if (previewExpMonth) {
      previewExpMonth.textContent = (expiryEl && expiryEl.value.trim()) ? expiryEl.value.trim() : 'MM/YY';
    }
  }

  // ---- Sandbox test card autofill ----
  function applySandboxCard() {
    if (nameEl && !nameEl.value) nameEl.value = 'Jordan Michaels';
    if (numberEl) numberEl.value = '4242 4242 4242 4242';
    if (expiryEl) expiryEl.value = '12/29';
    if (cvcEl) cvcEl.value = '123';
    if (zipEl && !zipEl.value) zipEl.value = '27262';
    updatePreview();
    checkReady();
    if (sandboxApplied) sandboxApplied.classList.add('show');
  }

  if (numberEl) {
    numberEl.addEventListener('focus', function () {
      if (!numberEl.value) applySandboxCard();
    });
  }
  if (sandboxFillBtn) {
    sandboxFillBtn.addEventListener('click', applySandboxCard);
  }

  // ---- Pay button readiness ("illumination") ----
  function checkReady() {
    var nameOk = nameEl && nameEl.value.trim().length > 1;
    var numberOk = numberEl && numberEl.value.replace(/\D/g, '').length >= 13;
    var expiryOk = expiryEl && /^\d{2}\/\d{2}$/.test(expiryEl.value.trim());
    var cvcOk = cvcEl && cvcEl.value.trim().length >= 3;
    var amountOk = currentAmount() > 0;
    var ready = nameOk && numberOk && expiryOk && cvcOk && amountOk;
    if (payBtn) {
      payBtn.classList.toggle('ready', !!ready);
      payBtn.disabled = !ready;
    }
    return ready;
  }

  // ---- Submit: show sandbox success ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!checkReady()) return;
    var card = form.closest('.form-card') || form.parentElement;
    var success = document.querySelector('.payment-success');
    if (card) card.style.display = 'none';
    if (success) {
      var amountEl = success.querySelector('.success-amount');
      var typeEl = success.querySelector('.success-type');
      if (amountEl) amountEl.textContent = formatCurrency(currentAmount());
      if (typeEl) typeEl.textContent = paymentType;
      success.classList.add('show');
      success.setAttribute('tabindex', '-1');
      success.focus();
    }
  });

  // Initialize
  refreshAmountDisplay();
  updatePreview();
  checkReady();
}
