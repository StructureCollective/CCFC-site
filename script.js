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
});
