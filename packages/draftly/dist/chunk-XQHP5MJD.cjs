'use strict';

var language = require('@codemirror/language');

// src/lib/widget-position.ts
function resolveAt(view, pos, side, nodeNames) {
  let node = language.syntaxTree(view.state).resolveInner(pos, side);
  while (node.parent) {
    if (nodeNames.includes(node.name)) {
      return { from: node.from, to: node.to };
    }
    node = node.parent;
  }
  return nodeNames.includes(node.name) ? { from: node.from, to: node.to } : null;
}
function resolveWidgetRange(view, dom, nodeNames) {
  let pos;
  try {
    pos = view.posAtDOM(dom);
  } catch {
    return null;
  }
  return resolveAt(view, pos, -1, nodeNames) ?? resolveAt(view, pos, 1, nodeNames);
}
function shallowEqualRecord(a, b) {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((key) => a[key] === b[key]);
}

exports.resolveWidgetRange = resolveWidgetRange;
exports.shallowEqualRecord = shallowEqualRecord;
//# sourceMappingURL=chunk-XQHP5MJD.cjs.map
//# sourceMappingURL=chunk-XQHP5MJD.cjs.map