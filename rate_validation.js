/**
 * rate_validation.js
 *
 * Validates that the "from" currency (#fx-from) and the "to" currency (#fx-to)
 * are not the same value in the FX exchange form.
 */

(function () {
  "use strict";

  /**
   * Returns true when both currency selects carry the same non-empty value.
   * @param {string} fromVal
   * @param {string} toVal
   * @returns {boolean}
   */
  function currenciesAreEqual(fromVal, toVal) {
    return fromVal !== "" && fromVal === toVal;
  }

  /**
   * Validates that the source and target currencies differ.
   * Reuses the existing #fx-pair-err element already present in exchange.html.
   * @returns {boolean} true if validation passes (currencies differ).
   */
  function validateCurrencyPair() {
    const fromSelect = document.getElementById("fx-from");
    const toSelect = document.getElementById("fx-to");
    const errorEl = document.getElementById("fx-pair-err");

    if (!fromSelect || !toSelect) return true;

    if (currenciesAreEqual(fromSelect.value, toSelect.value)) {
      if (errorEl) errorEl.style.display = "block";
      toSelect.setCustomValidity("Source and target currencies must differ.");
      return false;
    }

    if (errorEl) errorEl.style.display = "none";
    toSelect.setCustomValidity("");
    return true;
  }

  function init() {
    const fromSelect = document.getElementById("fx-from");
    const toSelect = document.getElementById("fx-to");
    const form = document.getElementById("fxForm");

    if (!form) return;

    if (fromSelect) fromSelect.addEventListener("change", validateCurrencyPair);
    if (toSelect) toSelect.addEventListener("change", validateCurrencyPair);

    // Also guard on submit (capture phase – runs before other submit listeners)
    form.addEventListener(
      "submit",
      function (e) {
        if (!validateCurrencyPair()) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
