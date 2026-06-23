'use strict';

var chunkW75QUUQC_cjs = require('./chunk-W75QUUQC.cjs');
var state = require('@codemirror/state');
var view = require('@codemirror/view');
var langMarkdown = require('@codemirror/lang-markdown');
var language = require('@codemirror/language');
var highlight = require('@lezer/highlight');
var commands = require('@codemirror/commands');
var languageData = require('@codemirror/language-data');
var styleMod = require('style-mod');

var draftlyBaseTheme = view.EditorView.theme({
  // Container styles - only apply when view plugin is enabled
  "&.cm-draftly": {
    fontSize: "16px",
    lineHeight: "1.6",
    backgroundColor: "transparent !important"
  },
  "&.cm-draftly .cm-content": {
    width: "100%",
    maxWidth: "48rem",
    padding: "0 0.5rem",
    margin: "0 auto",
    fontFamily: "var(--font-sans, sans-serif)",
    fontSize: "16px",
    lineHeight: "1.6"
  },
  "&.cm-draftly .cm-content .cm-line": {
    paddingInline: 0
  },
  "&.cm-draftly .cm-content .cm-widgetBuffer": {
    display: "none !important"
  }
});
var markdownResetStyle = language.HighlightStyle.define([
  {
    tag: [
      highlight.tags.heading,
      highlight.tags.strong,
      highlight.tags.emphasis,
      highlight.tags.strikethrough,
      highlight.tags.link,
      highlight.tags.url,
      highlight.tags.quote,
      highlight.tags.list,
      highlight.tags.meta,
      highlight.tags.contentSeparator,
      highlight.tags.labelName
    ],
    color: "inherit",
    fontWeight: "inherit",
    fontStyle: "inherit",
    textDecoration: "none"
  }
]);
var markdownResetExtension = language.syntaxHighlighting(markdownResetStyle, { fallback: false });

// src/editor/view-plugin.ts
var DraftlyPluginsFacet = state.Facet.define({
  combine: (values) => values.flat()
});
var draftlyOnNodesChangeFacet = state.Facet.define({
  combine: (values) => values.find((v) => v !== void 0)
});
var draftlyThemeFacet = state.Facet.define({
  combine: (values) => values.find((v) => v !== void 0) || "auto" /* AUTO */
});
function buildDecorations(view, plugins = []) {
  const builder = new state.RangeSetBuilder();
  const decorations = [];
  if (plugins.length > 0) {
    const ctx = {
      view,
      decorations,
      selectionOverlapsRange: (from, to) => chunkW75QUUQC_cjs.selectionOverlapsRange(view, from, to),
      cursorInRange: (from, to) => chunkW75QUUQC_cjs.cursorInRange(view, from, to)
    };
    const sortedPlugins = [...plugins].sort((a, b) => a.decorationPriority - b.decorationPriority);
    for (const plugin of sortedPlugins) {
      try {
        plugin.buildDecorations(ctx);
      } catch {
      }
    }
  }
  decorations.sort((a, b) => a.from - b.from || a.value.startSide - b.value.startSide);
  for (const decoration of decorations) {
    builder.add(decoration.from, decoration.to, decoration.value);
  }
  return builder.finish();
}
var draftlyViewPluginClass = class {
  decorations;
  plugins;
  onNodesChange;
  constructor(view) {
    this.plugins = view.state.facet(DraftlyPluginsFacet);
    this.onNodesChange = view.state.facet(draftlyOnNodesChangeFacet);
    this.decorations = buildDecorations(view, this.plugins);
    for (const plugin of this.plugins) {
      plugin.onViewReady(view);
    }
    if (this.onNodesChange && typeof this.onNodesChange === "function") {
      this.onNodesChange(this.buildNodes(view));
    }
  }
  update(update) {
    this.plugins = update.view.state.facet(DraftlyPluginsFacet);
    this.onNodesChange = update.view.state.facet(draftlyOnNodesChangeFacet);
    for (const plugin of this.plugins) {
      plugin.onViewUpdate(update);
    }
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      this.decorations = buildDecorations(update.view, this.plugins);
      if (this.onNodesChange) {
        this.onNodesChange(this.buildNodes(update.view));
      }
    }
  }
  buildNodes(view) {
    const tree = language.syntaxTree(view.state);
    const roots = [];
    const stack = [];
    tree.iterate({
      enter: (nodeRef) => {
        const node = {
          from: nodeRef.from,
          to: nodeRef.to,
          name: nodeRef.name,
          children: [],
          isSelected: chunkW75QUUQC_cjs.selectionOverlapsRange(view, nodeRef.from, nodeRef.to)
        };
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node);
        } else {
          roots.push(node);
        }
        stack.push(node);
      },
      leave: () => {
        stack.pop();
      }
    });
    return roots;
  }
};
var draftlyViewPlugin = view.ViewPlugin.fromClass(draftlyViewPluginClass, {
  decorations: (v) => v.decorations,
  provide: () => []
});
var draftlyEditorClass = view.EditorView.editorAttributes.of({ class: "cm-draftly" });
function createDraftlyViewExtension(theme = "auto" /* AUTO */, baseStyles = true, plugins = [], onNodesChange) {
  return [
    draftlyEditorClass,
    DraftlyPluginsFacet.of(plugins),
    draftlyOnNodesChangeFacet.of(onNodesChange),
    draftlyThemeFacet.of(theme),
    draftlyViewPlugin,
    ...baseStyles ? [draftlyBaseTheme] : []
  ];
}
function draftly(config = {}) {
  const {
    theme: configTheme = "auto" /* AUTO */,
    baseStyles = true,
    plugins = [],
    extensions = [],
    keymap: configKeymap = [],
    disableViewPlugin = false,
    defaultKeybindings = true,
    history: configHistory = true,
    indentWithTab: configIndentWithTab = true,
    highlightActiveLine: configHighlightActiveLine = true,
    lineWrapping: configLineWrapping = true,
    onNodesChange: configOnNodesChange = void 0
  } = config;
  const allPlugins = [...plugins];
  const pluginExtensions = [];
  const pluginKeymaps = [];
  const markdownExtensions = [];
  const pluginContext = { config };
  if (!disableViewPlugin) {
    for (const plugin of allPlugins) {
      plugin.onRegister(pluginContext);
      const exts = plugin.getExtensions();
      if (exts.length > 0) {
        pluginExtensions.push(...exts);
      }
      const keys = plugin.getKeymap();
      if (keys.length > 0) {
        pluginKeymaps.push(...keys);
      }
      const theme = plugin.theme;
      if (baseStyles && theme && typeof theme === "function") {
        pluginExtensions.push(view.EditorView.theme(theme(configTheme)));
      }
      const md = plugin.getMarkdownConfig();
      if (md) {
        markdownExtensions.push(md);
      }
    }
  }
  if (config.markdown) {
    markdownExtensions.push(...config.markdown);
  }
  const markdownSupport = langMarkdown.markdown({
    base: langMarkdown.markdownLanguage,
    codeLanguages: languageData.languages,
    extensions: markdownExtensions,
    addKeymap: true,
    completeHTMLTags: true,
    pasteURLAsLink: true
  });
  const baseExtensions = [
    ...defaultKeybindings ? [view.keymap.of(commands.defaultKeymap)] : [],
    ...configHistory ? [commands.history(), view.keymap.of(commands.historyKeymap)] : [],
    ...configIndentWithTab ? [language.indentOnInput(), view.keymap.of([commands.indentWithTab])] : [],
    ...configHighlightActiveLine && disableViewPlugin ? [view.highlightActiveLine()] : []
  ];
  const draftlyExtensions = [];
  if (!disableViewPlugin) {
    draftlyExtensions.push(createDraftlyViewExtension(configTheme, baseStyles, allPlugins, configOnNodesChange));
    draftlyExtensions.push(state.Prec.highest(markdownResetExtension));
  }
  if (!disableViewPlugin || configLineWrapping) draftlyExtensions.push(view.EditorView.lineWrapping);
  const composedExtensions = [
    // Core markdown support (highest priority)
    state.Prec.high(markdownSupport),
    state.Prec.high(view.keymap.of(langMarkdown.markdownKeymap)),
    // draftly view plugin for rich rendering
    draftlyExtensions,
    // Core CodeMirror extensions
    baseExtensions,
    // Plugin extensions & keymaps
    pluginExtensions,
    pluginKeymaps.length > 0 ? view.keymap.of(pluginKeymaps) : [],
    // Config keymaps & extensions
    configKeymap.length > 0 ? view.keymap.of(configKeymap) : [],
    extensions
  ];
  return composedExtensions;
}
var DraftlyPlugin = class {
  /** Decoration priority (higher = applied later) */
  decorationPriority = 100;
  /** Plugin dependencies - names of required plugins */
  dependencies = [];
  /** Node types this plugin handles for decorations and preview rendering */
  requiredNodes = [];
  /** Private configuration storage */
  _config = {};
  /** Protected context - accessible to subclasses */
  _context = null;
  /** Get plugin configuration */
  get config() {
    return this._config;
  }
  /** Set plugin configuration */
  set config(value) {
    this._config = value;
  }
  /** Get plugin context */
  get context() {
    return this._context;
  }
  /** Plugin theme */
  get theme() {
    return chunkW75QUUQC_cjs.createTheme({
      default: {},
      dark: {},
      light: {}
    });
  }
  // ============================================
  // EXTENSION METHODS (overridable by subclasses)
  // ============================================
  /**
   * Return CodeMirror extensions for this plugin
   * Override to provide custom extensions
   */
  getExtensions() {
    return [];
  }
  /**
   * Return markdown parser extensions
   * Override to extend markdown parsing
   */
  getMarkdownConfig() {
    return null;
  }
  /**
   * Return keybindings for this plugin
   * Override to add custom keyboard shortcuts
   */
  getKeymap() {
    return [];
  }
  // ============================================
  // DECORATION METHODS (overridable by subclasses)
  // ============================================
  /**
   * Build decorations for the current view state
   * Override to contribute decorations to the editor
   *
   * @param ctx - Decoration context with view and decoration array
   */
  buildDecorations(_ctx) {
  }
  // ============================================
  // LIFECYCLE HOOKS (overridable by subclasses)
  // ============================================
  /**
   * Called when plugin is registered with draftly
   * Override to perform initialization
   *
   * @param context - Plugin context with configuration
   */
  onRegister(context) {
    this._context = context;
  }
  /**
   * Called when plugin is unregistered
   * Override to perform cleanup
   */
  onUnregister() {
    this._context = null;
  }
  /**
   * Called when EditorView is created and ready
   * Override to perform view-specific initialization
   *
   * @param view - The EditorView instance
   */
  onViewReady(_view) {
  }
  /**
   * Called on view updates (document changes, selection changes, etc.)
   * Override to react to editor changes
   *
   * @param update - The ViewUpdate with change information
   */
  onViewUpdate(_update) {
  }
  // ============================================
  // PROTECTED UTILITIES (for subclasses)
  // ============================================
  /**
   * Helper to get current editor state
   * @param view - The EditorView instance
   */
  getState(view) {
    return view.state;
  }
  /**
   * Helper to get current document
   * @param view - The EditorView instance
   */
  getDocument(view) {
    return view.state.doc;
  }
  /**
   * Get CSS styles for preview mode
   * Override to provide custom CSS for preview rendering
   *
   * @param theme - Current theme enum
   * @returns CSS string for preview styles
   */
  getPreviewStyles(theme, wrapperClass) {
    const themeStyles = this.theme(theme);
    return this.transformToCss(themeStyles, wrapperClass);
  }
  /**
   * Transform ThemeStyle object to CSS string for preview
   * Uses cssClassMap to convert CM selectors to semantic selectors
   */
  transformToCss(themeStyles, wrapperClass) {
    const styleMod$1 = new styleMod.StyleModule(themeStyles, {
      finish: (sel) => {
        return `.${wrapperClass} ${sel}`;
      }
    });
    return styleMod$1.getRules();
  }
};
var DecorationPlugin = class extends DraftlyPlugin {
  /**
   * Decoration priority - lower than default for decoration plugins
   * Override to customize
   */
  decorationPriority = 50;
};
var SyntaxPlugin = class extends DraftlyPlugin {
};

exports.DecorationPlugin = DecorationPlugin;
exports.DraftlyPlugin = DraftlyPlugin;
exports.SyntaxPlugin = SyntaxPlugin;
exports.draftly = draftly;
exports.draftlyBaseTheme = draftlyBaseTheme;
exports.markdownResetExtension = markdownResetExtension;
//# sourceMappingURL=chunk-EQUQHE2E.cjs.map
//# sourceMappingURL=chunk-EQUQHE2E.cjs.map