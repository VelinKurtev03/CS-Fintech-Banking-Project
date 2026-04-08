/**
 * exchange_validation.js
 * Validates that the target amount (#fx-target-amount) is not equal
 * to the source amount (#fx-amount) in the FX exchange form.
 */

(function () {
    "use strict";

    /**
     * Returns true when the two amount fields have the same numeric value.
     * @param {string} sourceIban
     * @param {string} targetIban
     * @returns {boolean}
     */
    function amountsAreEqual(sourceIban, targetIban) {
        return sourceIban === targetIban;
    }

    /**
     * Validates the FX amount pair and shows/hides an error message.
     * @returns {boolean} true if validation passes (amounts differ), false otherwise.
     */
    function validateAmounts() {
        const sourceInput = document.getElementById("fx-source-account");
        const targetInput = document.getElementById("fx-dest-account");

        if (!sourceInput || !targetInput) return true; // elements not present – skip

        const sourceVal = sourceInput.value;
        const targetVal = targetInput.value;

        let errorEl = document.getElementById("fx-accounts-equal-err");

        if (amountsAreEqual(sourceVal, targetVal)) {
            // Show error
            if (!errorEl) {
                errorEl = document.createElement("span");
                errorEl.id = "fx-accounts-equal-err";
                errorEl.className = "err show";
                errorEl.textContent =
                    "Сметката за получаване не може да бъде същата като сметката за изпращане.";
                // Insert the error after the target amount input
                targetInput.insertAdjacentElement("afterend", errorEl);
            }
            errorEl.style.display = "block";
            targetInput.setCustomValidity(
                "Target account must differ from source account."
            );
            return false;
        }

        // Clear error
        if (errorEl) {
            errorEl.style.display = "none";
        }
        targetInput.setCustomValidity("");
        return true;
    }

    function init() {
        const sourceInput = document.getElementById("fx-source-account");
        const targetInput = document.getElementById("fx-dest-account");
        const form = document.getElementById("fxForm");

        if (!sourceInput || !targetInput || !form) return;

        // Re-validate whenever either amount field changes
        sourceInput.addEventListener("input", validateAmounts);
        targetInput.addEventListener("input", validateAmounts);

        // Block form submission when amounts are equal
        form.addEventListener(
            "submit",
            function (e) {
                if (!validateAmounts()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            },
            true // capture phase – runs before other submit listeners
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
