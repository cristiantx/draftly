'use strict';

// src/lib/dev.ts
function isDevMode() {
  try {
    return typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
  } catch {
    return false;
  }
}
function devWarn(message, ...details) {
  if (!isDevMode()) return;
  console.warn(`[draftly] ${message}`, ...details);
}
var reportedOnce = /* @__PURE__ */ new Set();
function reportOnce(key, report) {
  if (reportedOnce.has(key)) return;
  reportedOnce.add(key);
  report();
}

exports.devWarn = devWarn;
exports.isDevMode = isDevMode;
exports.reportOnce = reportOnce;
//# sourceMappingURL=chunk-QFIW5FJA.cjs.map
//# sourceMappingURL=chunk-QFIW5FJA.cjs.map