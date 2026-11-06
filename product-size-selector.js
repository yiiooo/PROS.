/* PROS Select Size — options are derived only from the product's saved Size Guide. */
(function () {
  "use strict";

  function splitCells(line) {
    return String(line || "").trim().replace(/^\\|+|\\|+$/g, "").split("|").map(function (cell) {
      return cell.trim();
    });
  }

  function isDividerRow(row) {
    return row.length > 0 && row.every(function (cell) {
      return /^:?-{3,}:?$/.test(cell);
    });
  }

  function getSizeOptions(value) {
    var raw = String(value == null ? "" : value).replace(/\\r\\n?/g, "\\n").trim();
    if (!raw || raw.indexOf("|") < 0) return [];

    var rows = raw.split("\\n").map(splitCells).filter(function (row) {
      return row.some(function (cell) { return cell !== ""; }) && !isDividerRow(row);
    });
    if (rows.length < 2) return [];

    var header = rows[0];
    var firstHeader = String(header[0] || "").toLowerCase().replace(/[^a-z]/g, "");
    var options;

    // Support both chart layouts:
    // 1) Size | Chest | Length, with S/M/L in the first column of body rows.
    // 2) Measurement | S | M | L, with sizes across the header columns.
    if (/^(measurement|measurements|measure|bodymeasurement)$/.test(firstHeader)) {
      options = header.slice(1);
    } else {
      options = rows.slice(1).map(function (row) { return row[0] || ""; });
    }

    var seen = Object.create(null);
    return options.map(function (item) { return String(item || "").trim(); }).filter(function (item) {
      var key = item.toLowerCase();
      if (!item || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  window.prosSizeSelectorHtml = function (product) {
    var options = getSizeOptions(product && product.size);
    if (!options.length) return "";

    return '<section class="pros-size-select" aria-label="Choose product size">' +
      '<div class="pros-size-select-heading"><span>SELECT SIZE</span><span class="pros-size-separator">·</span>' +
      '<button type="button" class="pros-size-guide-link" data-size-guide-link>SIZE GUIDE IN PRODUCT TABS</button></div>' +
      '<div class="pros-size-options" role="group" aria-label="Available sizes">' +
      options.map(function (size, index) {
        var safe = String(size).replace(/[&<>"']/g, function (ch) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
        });
        return '<button type="button" class="pros-size-option" data-product-size="' + safe +
          '" aria-pressed="' + (index === 0 ? "true" : "false") + '">' + safe + '</button>';
      }).join("") + '</div><p class="pros-size-selected" aria-live="polite">Selected size: ' +
      String(options[0]).replace(/[&<>"']/g, function (ch) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
      }) + '</p></section>';
  };

  document.addEventListener("click", function (event) {
    var sizeButton = event.target.closest && event.target.closest("[data-product-size]");
    if (sizeButton) {
      var group = sizeButton.closest(".pros-size-select");
      if (!group) return;
      group.querySelectorAll("[data-product-size]").forEach(function (button) {
        button.setAttribute("aria-pressed", button === sizeButton ? "true" : "false");
      });
      var status = group.querySelector(".pros-size-selected");
      if (status) status.textContent = "Selected size: " + sizeButton.getAttribute("data-product-size");
      return;
    }

    var guideLink = event.target.closest && event.target.closest("[data-size-guide-link]");
    if (guideLink) {
      event.preventDefault();
      var detail = document.getElementById("product-size-guide");
      if (!detail) return;
      detail.open = true;
      detail.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();
