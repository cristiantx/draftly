import { createTheme, selectionOverlapsRange, cursorInRange, markdownResetExtension, draftlyBaseTheme } from './chunk-XRXGYUPJ.js';
import { isDevMode, reportOnce } from './chunk-ONHEBAB4.js';
import { Facet, RangeSetBuilder, Prec } from '@codemirror/state';
import { ViewPlugin, EditorView, keymap, highlightActiveLine } from '@codemirror/view';
import { markdown, markdownLanguage, markdownKeymap } from '@codemirror/lang-markdown';
import { syntaxTree, syntaxTreeAvailable, indentOnInput } from '@codemirror/language';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { languages } from '@codemirror/language-data';
import { StyleModule } from 'style-mod';

var DraftlyPluginsFacet = Facet.define({
  combine: (values) => values.flat()
});
var draftlyOnNodesChangeFacet = Facet.define({
  combine: (values) => values.find((v) => v !== void 0)
});
var draftlyOnPluginErrorFacet = Facet.define({
  combine: (values) => values.find((v) => v !== void 0)
});
var draftlyThemeFacet = Facet.define({
  combine: (values) => values.find((v) => v !== void 0) || "auto" /* AUTO */
});
function resolveVisibleRanges(view) {
  const ranges = view.visibleRanges;
  return ranges.length > 0 ? ranges : [{ from: 0, to: view.state.doc.length }];
}
function createVisibleIterator(view, ranges) {
  return (spec) => {
    const tree = syntaxTree(view.state);
    const leave = spec.leave ?? (() => {
    });
    const first = ranges[0];
    if (ranges.length === 1 && first) {
      tree.iterate({ from: first.from, to: first.to, enter: spec.enter, leave });
      return;
    }
    const open = /* @__PURE__ */ new Map();
    for (let index = 0; index < ranges.length; index++) {
      const { from, to } = ranges[index];
      const next = ranges[index + 1];
      tree.iterate({
        from,
        to,
        enter: (node) => {
          const key = `${node.from}:${node.to}:${node.name}`;
          if (open.has(key)) return open.get(key) ? void 0 : false;
          const result = spec.enter(node);
          open.set(key, result !== false);
          return result;
        },
        leave: (node) => {
          if (next && node.to >= next.from) return;
          open.set(`${node.from}:${node.to}:${node.name}`, false);
          leave(node);
        }
      });
    }
  };
}
function isReportableDecorationError(view) {
  return syntaxTreeAvailable(view.state, view.viewport.to);
}
function reportDecorationError(view, plugin, error) {
  if (!isReportableDecorationError(view)) return;
  const handler = view.state.facet(draftlyOnPluginErrorFacet);
  if (!handler && !isDevMode()) return;
  const message = error instanceof Error ? error.message : String(error);
  reportOnce(`${plugin.name}\0${message}`, () => {
    if (handler) {
      handler(plugin.name, error);
    } else {
      console.error(`[draftly] Plugin "${plugin.name}" threw while building decorations:`, error);
    }
  });
}
function buildDecorations(view, plugins = []) {
  const builder = new RangeSetBuilder();
  const decorations = [];
  if (plugins.length > 0) {
    const visibleRanges = resolveVisibleRanges(view);
    const ctx = {
      view,
      decorations,
      visibleRanges,
      iterateVisible: createVisibleIterator(view, visibleRanges),
      selectionOverlapsRange: (from, to) => selectionOverlapsRange(view, from, to),
      cursorInRange: (from, to) => cursorInRange(view, from, to)
    };
    const sortedPlugins = [...plugins].sort((a, b) => a.decorationPriority - b.decorationPriority);
    for (const plugin of sortedPlugins) {
      try {
        plugin.buildDecorations(ctx);
      } catch (error) {
        reportDecorationError(view, plugin, error);
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
  /**
   * Held solely so `destroy()` can name the view it is tearing down. `destroy()` takes
   * no arguments, and `onViewDestroy` needs the identity to release the right state.
   */
  view;
  constructor(view) {
    this.view = view;
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
    const nextPlugins = update.state.facet(DraftlyPluginsFacet);
    if (nextPlugins !== this.plugins) {
      for (const plugin of this.plugins) {
        if (!nextPlugins.includes(plugin)) {
          try {
            plugin.onViewDestroy(update.view);
          } catch {
          }
        }
      }
      for (const plugin of nextPlugins) {
        if (!this.plugins.includes(plugin)) plugin.onViewReady(update.view);
      }
      this.plugins = nextPlugins;
    }
    this.onNodesChange = update.view.state.facet(draftlyOnNodesChangeFacet);
    for (const plugin of this.plugins) {
      plugin.onViewUpdate(update);
    }
    if (update.docChanged || update.selectionSet || update.viewportChanged || update.startState.facet(DraftlyPluginsFacet) !== this.plugins || syntaxTree(update.startState) !== syntaxTree(update.state)) {
      this.decorations = buildDecorations(update.view, this.plugins);
      if (this.onNodesChange) {
        this.onNodesChange(this.buildNodes(update.view));
      }
    }
  }
  /**
   * Called by CodeMirror when the view is torn down.
   *
   * The library had no teardown path at all before this: no view-plugin `destroy()`, no
   * widget `destroy()`, and `onUnregister` declared but never called. Since plugin
   * instances are module-level singletons, anything a plugin was holding — a pending
   * microtask's `EditorView`, most concretely — was retained for the lifetime of the
   * page. Hosts that rebuild their extension array on a config change (the playground
   * does, on every devbar toggle) create and destroy views routinely.
   *
   * Reads the plugin list from the facet rather than `this.plugins` so a plugin removed
   * by a reconfigure just before teardown is not notified about a view it never saw.
   */
  destroy() {
    for (const plugin of this.plugins) {
      try {
        plugin.onViewDestroy(this.view);
      } catch {
      }
    }
  }
  buildNodes(view) {
    const tree = syntaxTree(view.state);
    const roots = [];
    const stack = [];
    tree.iterate({
      enter: (nodeRef) => {
        const node = {
          from: nodeRef.from,
          to: nodeRef.to,
          name: nodeRef.name,
          children: [],
          isSelected: selectionOverlapsRange(view, nodeRef.from, nodeRef.to)
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
var draftlyViewPlugin = ViewPlugin.fromClass(draftlyViewPluginClass, {
  decorations: (v) => v.decorations,
  provide: () => []
});
var draftlyEditorClass = EditorView.editorAttributes.of({ class: "cm-draftly" });
function createDraftlyViewExtension(theme = "auto" /* AUTO */, baseStyles = true, plugins = [], onNodesChange, onPluginError) {
  return [
    draftlyEditorClass,
    DraftlyPluginsFacet.of(plugins),
    draftlyOnNodesChangeFacet.of(onNodesChange),
    draftlyOnPluginErrorFacet.of(onPluginError),
    draftlyThemeFacet.of(theme),
    draftlyViewPlugin,
    ...baseStyles ? [draftlyBaseTheme(theme)] : []
  ];
}
var themeCache = /* @__PURE__ */ new WeakMap();
function entryFor(plugin) {
  let entry = themeCache.get(plugin);
  if (!entry) {
    entry = { styles: /* @__PURE__ */ new Map(), extensions: /* @__PURE__ */ new Map() };
    themeCache.set(plugin, entry);
  }
  return entry;
}
function resolvePluginTheme(plugin, theme) {
  const { styles } = entryFor(plugin);
  let resolved = styles.get(theme);
  if (!resolved) {
    const resolver = plugin.theme;
    resolved = typeof resolver === "function" ? resolver(theme) : {};
    styles.set(theme, resolved);
  }
  return resolved;
}
function pluginThemeExtension(plugin, theme) {
  const { extensions } = entryFor(plugin);
  let extension = extensions.get(theme);
  if (!extension) {
    extension = EditorView.theme(resolvePluginTheme(plugin, theme));
    extensions.set(theme, extension);
  }
  return extension;
}

// src/editor/draftly.ts
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
    onNodesChange: configOnNodesChange = void 0,
    onPluginError: configOnPluginError = void 0
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
      if (baseStyles) {
        pluginExtensions.push(pluginThemeExtension(plugin, configTheme));
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
  const markdownSupport = markdown({
    base: markdownLanguage,
    codeLanguages: languages,
    extensions: markdownExtensions,
    addKeymap: true,
    completeHTMLTags: true,
    pasteURLAsLink: true
  });
  const baseExtensions = [
    ...defaultKeybindings ? [keymap.of(defaultKeymap)] : [],
    ...configHistory ? [history(), keymap.of(historyKeymap)] : [],
    ...configIndentWithTab ? [indentOnInput(), keymap.of([indentWithTab])] : [],
    ...configHighlightActiveLine && disableViewPlugin ? [highlightActiveLine()] : []
  ];
  const draftlyExtensions = [];
  if (!disableViewPlugin) {
    draftlyExtensions.push(
      createDraftlyViewExtension(configTheme, baseStyles, allPlugins, configOnNodesChange, configOnPluginError)
    );
    draftlyExtensions.push(Prec.highest(markdownResetExtension));
  }
  if (!disableViewPlugin || configLineWrapping) draftlyExtensions.push(EditorView.lineWrapping);
  const composedExtensions = [
    // Core markdown support (highest priority)
    Prec.high(markdownSupport),
    Prec.high(keymap.of(markdownKeymap)),
    // draftly view plugin for rich rendering
    draftlyExtensions,
    // Core CodeMirror extensions
    baseExtensions,
    // Plugin extensions & keymaps
    pluginExtensions,
    pluginKeymaps.length > 0 ? keymap.of(pluginKeymaps) : [],
    // Config keymaps & extensions
    configKeymap.length > 0 ? keymap.of(configKeymap) : [],
    extensions
  ];
  return composedExtensions;
}
var emptyThemeResolver = createTheme({
  default: {},
  dark: {},
  light: {}
});
var DraftlyPlugin = class {
  /**
   * Priority of this plugin relative to others, on **both** surfaces.
   *
   * - **Editor:** plugins are sorted *ascending* and all of them run. Later decorations
   *   layer over earlier ones, so a higher number wins visually.
   * - **Preview:** candidates for a node are tried in *descending* order and the first
   *   non-null `renderToHTML` result wins. So a higher number wins here too.
   *
   * The sorts point opposite ways because the composition models differ — layering
   * versus precedence — and that is exactly what makes one number mean the same thing
   * on both surfaces. Two plugins claiming the same node at the same priority is
   * ambiguous and warns in development.
   *
   * Pick a value inside an existing band; see `artifacts/architecture/plugin-system.md`.
   */
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
  /**
   * Plugin theme resolver.
   *
   * Overrides must return a **module-level constant**, not a fresh `createTheme(...)`
   * per access — the resolved styles and the `EditorView.theme()` extension are both
   * memoized per `(plugin, ThemeEnum)` pair, and an unstable getter defeats that.
   */
  get theme() {
    return emptyThemeResolver;
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
   *
   * @returns Bindings to register, each carrying its own documentation
   */
  getKeymap() {
    return [];
  }
  /**
   * Return every shortcut this plugin wants listed in a shortcut reference.
   *
   * Defaults to {@link getKeymap}. Override when a plugin registers bindings some
   * other way -- `TablePlugin` wraps its bindings in `Prec.highest()` and scopes
   * them to a table, so they never pass through `getKeymap()` even though a user
   * still needs to know they exist.
   *
   * @returns Documented shortcuts, registered or otherwise
   */
  getShortcuts() {
    return this.getKeymap();
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
   * Called when plugin is unregistered.
   *
   * @deprecated **Nothing calls this.** `onRegister` runs from `draftly()`, and there is
   * no corresponding teardown of an extension bundle to hang an unregister off.
   *
   * T-017 removed the *second* reason it could not be wired to view destruction — with
   * per-editor instances from `createEssentialPlugins()`, clearing `_context` no longer
   * breaks other editors. It remains uncalled because the first reason stands: plugin
   * registration is not scoped to a view, so there is no event to fire it on. A consumer
   * still holding the deprecated shared arrays would also still be broken by it.
   *
   * Use {@link onViewDestroy} to release view-scoped state. This hook is kept rather than
   * removed because it is public API.
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
  /**
   * Called when the `EditorView` is torn down. Symmetric with {@link onViewReady}.
   *
   * **Any plugin holding view-scoped state must release it here.** Plugin instances are
   * module-level singletons that outlive every view, so a retained `EditorView` retains
   * its DOM, its state and the whole document for the lifetime of the page. Pending
   * timers and microtasks holding a view are the usual culprits.
   *
   * Called from the view plugin's own `destroy()`, so it fires for every reconfigure as
   * well as for a real teardown — hosts that rebuild their extension array do this
   * routinely.
   *
   * @param view - The view being destroyed
   */
  onViewDestroy(_view) {
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
    return this.transformToCss(resolvePluginTheme(this, theme), wrapperClass);
  }
  /**
   * Transform ThemeStyle object to CSS string for preview
   * Uses cssClassMap to convert CM selectors to semantic selectors
   */
  transformToCss(themeStyles, wrapperClass) {
    const styleMod = new StyleModule(themeStyles, {
      finish: (sel) => {
        return `.${wrapperClass} ${sel}`;
      }
    });
    return styleMod.getRules();
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

// src/editor/shortcuts.ts
function collectShortcuts(plugins) {
  const shortcuts = [];
  const seen = /* @__PURE__ */ new Set();
  for (const plugin of plugins) {
    for (const shortcut of plugin.getShortcuts()) {
      const identity = `${shortcut.context ?? ""}\0${shortcut.key ?? ""}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      shortcuts.push(shortcut);
    }
  }
  return shortcuts;
}

export { DecorationPlugin, DraftlyPlugin, SyntaxPlugin, collectShortcuts, draftly, draftlyOnPluginErrorFacet, draftlyThemeFacet };
//# sourceMappingURL=chunk-N765BDMH.js.map
//# sourceMappingURL=chunk-N765BDMH.js.map