import { DecorationPlugin } from './chunk-N765BDMH.js';
import { createTheme } from './chunk-XRXGYUPJ.js';
import { Decoration, WidgetType } from '@codemirror/view';
import * as emoji from 'node-emoji';

function shortcodeToEmoji(raw) {
  const rendered = emoji.emojify(raw);
  return rendered !== raw ? rendered : null;
}
var EmojiWidget = class extends WidgetType {
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
  "emoji-source": Decoration.mark({ class: "cm-draftly-emoji-source" })
};
var EmojiPlugin = class extends DecorationPlugin {
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
    const { view, decorations } = ctx;
    ctx.iterateVisible({
      enter: (node) => {
        const { from, to, name } = node;
        if (name !== "Emoji") {
          return;
        }
        const raw = view.state.sliceDoc(from, to);
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
          Decoration.replace({
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
var theme = createTheme({
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

export { EmojiPlugin };
//# sourceMappingURL=chunk-ZLGHC26R.js.map
//# sourceMappingURL=chunk-ZLGHC26R.js.map