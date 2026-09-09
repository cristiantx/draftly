'use strict';

var state = require('@codemirror/state');
var view = require('@codemirror/view');

// src/lib/input-handler.ts
function createWrapSelectionInputHandler(markersByInput) {
  return view.EditorView.inputHandler.of((view, _from, _to, text) => {
    const marker = markersByInput[text];
    if (!marker) {
      return false;
    }
    const ranges = view.state.selection.ranges;
    if (ranges.length === 0 || ranges.some((range) => range.empty)) {
      return false;
    }
    const changes = ranges.map((range) => ({
      from: range.from,
      to: range.to,
      insert: `${marker}${view.state.sliceDoc(range.from, range.to)}${marker}`
    })).reverse();
    const nextRanges = ranges.map(
      (range) => state.EditorSelection.range(range.from + marker.length, range.to + marker.length)
    );
    view.dispatch({
      changes,
      selection: state.EditorSelection.create(nextRanges, view.state.selection.mainIndex)
    });
    return true;
  });
}

// src/lib/safe-url.ts
var ALLOWED_SCHEMES = /* @__PURE__ */ new Set(["http:", "https:", "mailto:", "tel:"]);
var SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
var DATA_IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|gif|webp|avif|bmp|x-icon|vnd\.microsoft\.icon);/i;
var IGNORED_IN_SCHEME = /[\u0000-\u0020\u007f-\u009f]/g;
function isSafeUrl(url, options = {}) {
  const normalized = url.replace(IGNORED_IN_SCHEME, "");
  const scheme = normalized.match(SCHEME_PATTERN)?.[0];
  if (!scheme) {
    return true;
  }
  if (ALLOWED_SCHEMES.has(scheme.toLowerCase())) {
    return true;
  }
  return options.allowDataImages === true && DATA_IMAGE_PATTERN.test(normalized);
}
function safeUrl(url, options = {}) {
  return isSafeUrl(url, options) ? url : "";
}

// src/lib/display-width.ts
var WIDE_RANGES = [
  [4352, 4447],
  // Hangul Jamo initial consonants
  [11904, 12350],
  // CJK Radicals, Kangxi, CJK Symbols and Punctuation
  [12353, 13311],
  // Hiragana, Katakana, Bopomofo, Hangul Compatibility Jamo, CJK Compatibility
  [13312, 19903],
  // CJK Unified Ideographs Extension A
  [19968, 40959],
  // CJK Unified Ideographs
  [40960, 42191],
  // Yi Syllables, Yi Radicals
  [43360, 43391],
  // Hangul Jamo Extended-A
  [44032, 55203],
  // Hangul Syllables
  [63744, 64255],
  // CJK Compatibility Ideographs
  [65040, 65049],
  // Vertical Forms
  [65072, 65135],
  // CJK Compatibility Forms, Small Form Variants
  [65280, 65376],
  // Fullwidth Forms
  [65504, 65510],
  // Fullwidth signs
  [127744, 128591],
  // Miscellaneous Symbols and Pictographs, Emoticons
  [129280, 129535],
  // Supplemental Symbols and Pictographs
  [129648, 129791],
  // Symbols and Pictographs Extended-A
  [131072, 196605],
  // CJK Extension B and beyond
  [196608, 262141]
  // CJK Extension G and beyond
];
var ZERO_WIDTH_RANGES = [
  [768, 879],
  // Combining Diacritical Marks
  [1155, 1161],
  // Cyrillic combining marks
  [1425, 1469],
  // Hebrew points
  [1552, 1562],
  // Arabic marks
  [1611, 1631],
  // Arabic diacritics
  [3633, 3633],
  // Thai vowel sign
  [3636, 3642],
  // Thai vowel signs
  [6832, 6911],
  // Combining Diacritical Marks Extended
  [7616, 7679],
  // Combining Diacritical Marks Supplement
  [8203, 8207],
  // Zero-width space through RTL mark (includes ZWNJ, ZWJ)
  [8400, 8432],
  // Combining Diacritical Marks for Symbols
  [65024, 65039],
  // Variation Selectors
  [65056, 65071],
  // Combining Half Marks
  [65279, 65279],
  // Zero-width no-break space
  [917760, 917999]
  // Variation Selectors Supplement
];
function inRanges(code, ranges) {
  let low = 0;
  let high = ranges.length - 1;
  while (low <= high) {
    const mid = low + high >> 1;
    const range = ranges[mid];
    if (code < range[0]) high = mid - 1;
    else if (code > range[1]) low = mid + 1;
    else return true;
  }
  return false;
}
var segmenter;
function getSegmenter() {
  if (segmenter === void 0) {
    segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(void 0, { granularity: "grapheme" }) : null;
  }
  return segmenter;
}
function clusterWidth(cluster) {
  const code = cluster.codePointAt(0);
  if (code === void 0) return 0;
  if (inRanges(code, ZERO_WIDTH_RANGES)) return 0;
  return inRanges(code, WIDE_RANGES) ? 2 : 1;
}
function displayWidth(text) {
  let width = 0;
  const segments = getSegmenter();
  if (segments) {
    for (const { segment } of segments.segment(text)) {
      width += clusterWidth(segment);
    }
    return width;
  }
  for (const char of text) {
    width += clusterWidth(char);
  }
  return width;
}

exports.createWrapSelectionInputHandler = createWrapSelectionInputHandler;
exports.displayWidth = displayWidth;
exports.isSafeUrl = isSafeUrl;
exports.safeUrl = safeUrl;
//# sourceMappingURL=chunk-X6JQRPQN.cjs.map
//# sourceMappingURL=chunk-X6JQRPQN.cjs.map