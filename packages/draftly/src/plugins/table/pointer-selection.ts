import { EditorSelection, Prec, type SelectionRange } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

/**
 * Table cells use CSS table layout rather than CodeMirror's inline line layout.
 * Ask the browser which text was hit, then map that DOM boundary to source.
 * @param view The editor containing the gesture.
 * @param event The current pointer coordinates.
 * @returns A source offset, or null when no editable boundary was hit.
 */
function pointerPosition(view: EditorView, event: MouseEvent): number | null {
  const document = view.contentDOM.ownerDocument;
  const hit = document.elementFromPoint(event.clientX, event.clientY);
  const cell = hit?.closest(".cm-draftly-table-cell");
  if (cell && !cell.textContent?.trim()) {
    const from = view.posAtDOM(cell, 0);
    const to = view.posAtDOM(cell, cell.childNodes.length);
    return Math.floor((from + to) / 2);
  }
  let x = event.clientX;
  let y = event.clientY;
  // A short cell shares the height of wrapped neighbors. Clamp padding clicks to
  // the nearest rendered text rectangle before asking for a native caret.
  if (cell) {
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    let text = walker.nextNode();
    let nearest: DOMRect | null = null;
    let distance = Infinity;
    while (text) {
      if (text.textContent?.length) {
        const textRange = document.createRange();
        textRange.selectNodeContents(text);
        for (const rect of textRange.getClientRects()) {
          if (!rect.width || !rect.height) continue;
          const dx = Math.max(rect.left - x, 0, x - rect.right);
          const dy = Math.max(rect.top - y, 0, y - rect.bottom);
          const next = dx * dx + dy * dy;
          if (next < distance) {
            nearest = rect;
            distance = next;
          }
        }
      }
      text = walker.nextNode();
    }
    if (nearest && distance > 0) {
      x = Math.max(nearest.left + 0.1, Math.min(x, nearest.right - 0.1));
      y = Math.max(nearest.top + 0.1, Math.min(y, nearest.bottom - 0.1));
    }
  }
  const range = document.caretRangeFromPoint(x, y);
  if (range && view.contentDOM.contains(range.startContainer) && (!cell || cell.contains(range.startContainer))) {
    return view.posAtDOM(range.startContainer, range.startOffset);
  }
  if (cell && view.contentDOM.contains(cell)) {
    const rect = cell.getBoundingClientRect();
    const end = event.clientX > (rect.left + rect.right) / 2;
    return view.posAtDOM(cell, end ? cell.childNodes.length : 0);
  }
  try {
    return view.posAtCoords({ x: event.clientX, y: event.clientY });
  } catch {
    return null;
  }
}

/**
 * Keeps the native hit boundary stable when revealing Markdown changes layout.
 * CodeMirror still owns drag tracking, autoscroll, and transaction dispatch.
 */
export const tablePointerSelection = Prec.highest(
  EditorView.mouseSelectionStyle.of((view, event) => {
    if (
      event.button !== 0 ||
      !(event.target instanceof Element) ||
      !event.target.closest(".cm-draftly-table-cell") ||
      event.target.closest("button, a, [contenteditable=false]")
    ) {
      return null;
    }
    const hit = pointerPosition(view, event);
    if (hit === null) return null;
    let start = hit;
    let original = view.state.selection;
    const initialX = event.clientX;
    const initialY = event.clientY;
    const granularity = Math.min(event.detail, 3);
    const rangeAt = (position: number): SelectionRange => {
      if (granularity === 2) return view.state.wordAt(position) ?? EditorSelection.cursor(position);
      if (granularity === 3) {
        const line = view.state.doc.lineAt(position);
        return EditorSelection.range(line.from, line.to);
      }
      return EditorSelection.cursor(position);
    };
    return {
      get(current, extend, multiple) {
        const moved = current.clientX !== initialX || current.clientY !== initialY;
        const position = moved ? (pointerPosition(view, current) ?? start) : start;
        const first = rangeAt(start);
        const last = rangeAt(position);
        const anchor = extend ? original.main.anchor : position < start ? first.to : first.from;
        const head = position < start ? last.from : last.to;
        const selection = EditorSelection.range(anchor, head);
        return multiple ? original.addRange(selection) : EditorSelection.create([selection]);
      },
      update(update) {
        if (update.docChanged) {
          start = update.changes.mapPos(start);
          original = original.map(update.changes);
        }
        // Reusing the initial DOM coordinates after a decoration update would hit a
        // different cell. Only actual pointer movement should perform another hit test.
      },
    };
  })
);
