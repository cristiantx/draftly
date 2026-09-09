import mermaid from "mermaid";

/**
 * Whether {@link ensureMermaidInitialized} has run.
 */
let mermaidInitialized = false;

/**
 * Initialize mermaid with Draftly's defaults, once.
 *
 * Called on first render rather than at module scope. `mermaid.initialize()` on import
 * makes the module unconditionally side-effecting, so a bundler cannot drop mermaid —
 * roughly a megabyte — for a consumer who never writes a diagram.
 */
function ensureMermaidInitialized(): void {
  if (mermaidInitialized) return;
  mermaidInitialized = true;

  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    suppressErrorRendering: true,
  });
}

/**
 * Monotonic counter for mermaid's required per-render element id.
 *
 * Wraps, because mermaid keeps internal state keyed on these ids and the counter used to
 * grow unbounded for the page's lifetime. The window is far larger than the number of
 * renders that can be in flight at once, so wrapping cannot collide in practice.
 */
let mermaidCounter = 0;
const MERMAID_ID_WINDOW = 1_000_000;

/**
 * Renders currently in flight, keyed on everything that determines their output.
 *
 * Two widgets showing the same diagram — the split editor and preview panes, a definition
 * repeated in a document, a widget rebuilt while its first render is still running — would
 * otherwise each start their own `mermaid.render()`, which parses, lays out and serializes
 * an SVG in a hidden DOM node. Sharing the promise makes the duplicates free.
 *
 * This is **de-duplication, not a cache**: an entry is removed the moment its render
 * settles, so an edited diagram is never served a stale SVG, and a render that failed is
 * retried by the next caller rather than left as a permanent error.
 */
const inFlightRenders = new Map<string, Promise<{ svg: string; error: string | null }>>();

/**
 * Render a mermaid diagram, sharing the work with any identical render already running.
 *
 * @param definition - The diagram source, without its fence
 * @param options - Attributes parsed off the fence line, e.g. `theme`
 * @param defaultTheme - Theme to use when the fence does not name one
 * @returns The SVG, or an `error` message; this never rejects
 */
export function renderMermaid(
  definition: string,
  options: Record<string, string> = {},
  defaultTheme = "default"
): Promise<{ svg: string; error: string | null }> {
  // Object key order is insertion order, and `parseAttributes` walks the fence line
  // left to right — so two fences with the same attributes written in a different order
  // key differently. That costs a redundant render, never a wrong one.
  const key = `${defaultTheme}\u0000${JSON.stringify(options)}\u0000${definition}`;

  const existing = inFlightRenders.get(key);
  if (existing) return existing;

  const pending = renderMermaidUncached(definition, options, defaultTheme).finally(() => {
    // Guard on identity: only retract our own entry, never a later render's.
    if (inFlightRenders.get(key) === pending) inFlightRenders.delete(key);
  });

  inFlightRenders.set(key, pending);
  return pending;
}

/**
 * Perform one mermaid render. Call {@link renderMermaid} instead — it de-duplicates.
 */
async function renderMermaidUncached(
  definition: string,
  options: Record<string, string> = {},
  defaultTheme = "default"
): Promise<{ svg: string; error: string | null }> {
  try {
    ensureMermaidInitialized();

    mermaidCounter = (mermaidCounter + 1) % MERMAID_ID_WINDOW;
    const id = `draftly-mermaid-${mermaidCounter}`;
    let finalDefinition = definition;

    // transform theme to mermaid config
    const mermaidConfig: Record<string, string> = {};
    if (options.theme) {
      mermaidConfig.theme = options.theme;
    } else {
      mermaidConfig.theme = defaultTheme;
    }

    // If we have config to apply, prepend the directive
    if (Object.keys(mermaidConfig).length > 0) {
      const jsonConfig = JSON.stringify(mermaidConfig);
      // Mermaid directive format: %%{init: { ... }}%%
      finalDefinition = `%%{init: ${jsonConfig} }%%\n${definition}`;
    }

    const { svg } = await mermaid.render(id, finalDefinition);
    return { svg, error: null };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    return { svg: "", error: errorMsg };
  }
}

/**
 * Helper to parse attributes from fence line
 * Example: ```mermaid theme="dark" scale="2"
 */
export function parseAttributes(fenceLine: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  // Match key="value" or key='value'
  const regex = /(\w+)=["']([^"']*)["']/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(fenceLine)) !== null && match[1] && match[2]) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}
