'use strict';

// src/lib/escape-html.ts
var HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var HTML_ESCAPE_PATTERN = /[&<>"']/g;
function escapeHtml(text) {
  return text.replace(HTML_ESCAPE_PATTERN, (char) => HTML_ENTITIES[char]);
}

exports.escapeHtml = escapeHtml;
//# sourceMappingURL=chunk-FAW6KSSV.cjs.map
//# sourceMappingURL=chunk-FAW6KSSV.cjs.map