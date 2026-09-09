import { draftlyOnPluginErrorFacet } from "../../editor/view-plugin";
import { WidgetType, type EditorView } from "@codemirror/view";
import { resolveWidgetRange, shallowEqualRecord } from "../../lib/widget-position";
import { escapeHtml } from "../../lib/escape-html";
import { renderMermaid } from "./render";

/**
 * Widget to render mermaid block diagrams
 */
export class MermaidBlockWidget extends WidgetType {
  constructor(
    readonly definition: string,
    readonly attributes: Record<string, string>,
    readonly defaultTheme: string,
    readonly from: number,
    readonly to: number,
    readonly activation: "select" | "caret" = "select"
  ) {
    super();
  }

  /**
   * Compares **content only**.
   *
   * `eq()` answers "can CodeMirror keep the DOM it already built?". Document positions
   * shift on any edit earlier in the document, so including them made the answer
   * permanently no -- every diagram below an edit re-ran an async
   * mermaid.render() on every keystroke, flashing "Rendering diagram…" as it went. The handlers resolve the range from the live DOM instead.
   */
  override eq(other: MermaidBlockWidget): boolean {
    return (
      other.activation === this.activation &&
      other.definition === this.definition &&
      other.defaultTheme === this.defaultTheme &&
      shallowEqualRecord(other.attributes, this.attributes)
    );
  }

  /**
   * Set by {@link destroy}. `mermaid.render()` is async and routinely outlives the
   * element it was started for, so the resolution handler must be able to tell.
   */
  private disposed = false;

  override destroy(): void {
    this.disposed = true;
  }

  toDOM(view: EditorView) {
    const div = document.createElement("button");
    div.type = "button";
    div.style.border = "0";
    div.style.background = "transparent";
    div.style.color = "inherit";
    div.style.width = "100%";
    div.className = "cm-draftly-mermaid-rendered";
    div.style.cursor = "pointer";

    // A rendered SVG has no text alternative of its own, and the diagram source it was
    // built from is hidden by the decoration. Naming it from the source is the only
    // description available -- imperfect, but it is the difference between "graphic" and
    // nothing at all.

    div.setAttribute(
      "aria-label",
      `Edit Mermaid diagram: ${this.definition.replace(/\s+/g, " ").trim().slice(0, 200)}`
    );

    // Show loading state initially
    div.innerHTML = `<div class="cm-draftly-mermaid-loading">Rendering diagram…</div>`;

    // Render mermaid asynchronously. Both guards matter: `disposed` catches a widget
    // CodeMirror told us about, `isConnected` catches an element that left the document
    // without destroy() being reached.
    renderMermaid(this.definition, this.attributes, this.defaultTheme).then(({ svg, error }) => {
      if (this.disposed || !div.isConnected) {
        return;
      }

      if (error) {
        // classList.add, not `className +=` -- the latter accumulates if the element is
        // ever written to twice.
        div.classList.add("cm-draftly-mermaid-error");
        div.innerHTML = `<span role="alert">[Mermaid Error: ${escapeHtml(error)}]</span>`;
        view.state.facet(draftlyOnPluginErrorFacet)?.("mermaid", new Error(error));
      } else {
        div.innerHTML = svg;
        const diagram = div.querySelector("svg");
        const box = diagram?.viewBox.baseVal;
        if (diagram && box?.width) diagram.style.width = `${box.width}px`;
      }
      view.requestMeasure();
    });

    div.addEventListener("mousedown", (event) => event.preventDefault());
    // Click handler to select the raw mermaid text
    div.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const range = resolveWidgetRange(view, div, ["MermaidBlock"]) ?? { from: this.from, to: this.to };
      view.dispatch({
        selection:
          this.activation === "caret"
            ? { anchor: Math.min(view.state.doc.lineAt(range.from).to + 1, range.to) }
            : { anchor: range.from, head: range.to },
        scrollIntoView: true,
      });
      view.focus();
    });

    return div;
  }

  override ignoreEvent() {
    return true;
  }
}
