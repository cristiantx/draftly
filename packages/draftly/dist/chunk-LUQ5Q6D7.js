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

export { escapeHtml };
//# sourceMappingURL=chunk-LUQ5Q6D7.js.map
//# sourceMappingURL=chunk-LUQ5Q6D7.js.map