/**
 * exchange_validation.js
 *
 * Validates that the target amount (#fx-target-amount) is not equal to
 * the source amount (#fx-amount) in the FX exchange form.
 *
 * Currency-pair validation (fx-from vs fx-to) lives in rate_validation.js.
 */

(function () {
  "use strict";

  /**
   * Returns true when both numeric amounts are identical.
   * @param {number} sourceAmount
   * @param {number} targetAmount
   * @returns {boolean}
   */
  function amountsAreEqual(sourceAmount, targetAmount) {
    return sourceAmount === targetAmount;
  }

  /**
   * Validates that the received amount differs from the sent amount.
   * @returns {boolean} true if validation passes.
   */
  function validateAmounts() {
    const sourceInput = document.getElementById("fx-amount");
    const targetInput = document.getElementById("fx-target-amount");

    if (!sourceInput || !targetInput) return true;

    const sourceVal = parseFloat(sourceInput.value);
    const targetVal = parseFloat(targetInput.value);

    // Skip when either field is still empty
    if (isNaN(sourceVal) || isNaN(targetVal)) return true;

    let errorEl = document.getElementById("fx-amounts-equal-err");

    if (amountsAreEqual(sourceVal, targetVal)) {
      if (!errorEl) {
        errorEl = document.createElement("span");
        errorEl.id = "fx-amounts-equal-err";
        errorEl.className = "err show";
        errorEl.textContent =
          "Сумата за получаване не може да бъде равна на сумата за изпращане.";
        targetInput.insertAdjacentElement("afterend", errorEl);
      }
      errorEl.style.display = "block";
      targetInput.setCustomValidity(
        "Target amount must differ from source amount."
      );
      return false;
    }

    if (errorEl) errorEl.style.display = "none";
    targetInput.setCustomValidity("");
    return true;
  }

  function init() {
    const sourceInput = document.getElementById("fx-amount");
    const targetInput = document.getElementById("fx-target-amount");
    const form = document.getElementById("fxForm");

    if (!form) return;

    if (sourceInput) sourceInput.addEventListener("input", validateAmounts);
    if (targetInput) targetInput.addEventListener("input", validateAmounts);

    // Also guard on submit (capture phase – runs before other submit listeners)
    form.addEventListener(
      "submit",
      function (e) {
        if (!validateAmounts()) {
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
