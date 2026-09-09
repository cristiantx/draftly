'use strict';

var chunk3TJPHTNQ_cjs = require('./chunk-3TJPHTNQ.cjs');
var chunkPULMPDQL_cjs = require('./chunk-PULMPDQL.cjs');
var view = require('@codemirror/view');
var emoji = require('node-emoji');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var emoji__namespace = /*#__PURE__*/_interopNamespace(emoji);

function shortcodeToEmoji(raw) {
  const rendered = emoji__namespace.emojify(raw);
  return rendered !== raw ? rendered : null;
}
var EmojiWidget = class extends view.WidgetType {
  constructor(rendered) {
    super();
    this.rendered = rendered;
  }
  eq(other) {
    return other.rendered === this.rendered;
  }
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-draftly-emoji";
    span.textContent = this.rendered;
    return span;
  }
  ignoreEvent() {
    return false;
  }
};
var emojiMarkDecorations = {
  "emoji-source": view.Decoration.mark({ class: "cm-draftly-emoji-source" })
};
var EmojiPlugin = class extends chunk3TJPHTNQ_cjs.DecorationPlugin {
  name = "emoji";
  version = "1.0.0";
  decorationPriority = 20;
  requiredNodes = ["Emoji", "EmojiMark"];
  constructor() {
    super();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme;
  }
  /**
   * Build emoji decorations by iterating the syntax tree
   */
  buildDecorations(ctx) {
    const { view: view$1, decorations } = ctx;
    ctx.iterateVisible({
      enter: (node) => {
        const { from, to, name } = node;
        if (name !== "Emoji") {
          return;
        }
        const raw = view$1.state.sliceDoc(from, to);
        const rendered = shortcodeToEmoji(raw);
        if (!rendered) {
          return;
        }
        const cursorInNode = ctx.selectionOverlapsRange(from, to);
        if (cursorInNode) {
          decorations.push(emojiMarkDecorations["emoji-source"].range(from, to));
          return;
        }
        decorations.push(
          view.Decoration.replace({
            widget: new EmojiWidget(rendered)
          }).range(from, to)
        );
      }
    });
  }
  renderToHTML(node, children, ctx) {
    if (node.name === "EmojiMark") {
      return "";
    }
    if (node.name !== "Emoji") {
      return null;
    }
    const raw = ctx.sliceDoc(node.from, node.to);
    const rendered = shortcodeToEmoji(raw);
    if (!rendered) {
      return `<span class="cm-draftly-emoji-source">${children}</span>`;
    }
    return `<span class="cm-draftly-emoji">${rendered}</span>`;
  }
};
var theme = chunkPULMPDQL_cjs.createTheme({
  default: {
    ".cm-draftly-emoji": {
      fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif',
      fontVariantEmoji: "emoji",
      lineHeight: "1.2"
    },
    ".cm-draftly-emoji-source": {
      fontFamily: "inherit",
      lineHeight: "inherit"
    }
  }
});

exports.EmojiPlugin = EmojiPlugin;
//# sourceMappingURL=chunk-7BSQYD3N.cjs.map
//# sourceMappingURL=chunk-7BSQYD3N.cjs.map