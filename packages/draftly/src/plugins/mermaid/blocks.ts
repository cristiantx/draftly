import { StateField, type EditorState } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { Decoration, EditorView, type DecorationSet } from "@codemirror/view";
import { draftlyThemeFacet } from "../../editor/view-plugin";
import { ThemeEnum } from "../../editor/utils";
import { parseAttributes } from "./render";
import { MermaidBlockWidget } from "./widget";

type Diagram = { from: number; to: number; definition: string; attributes: Record<string, string> };
type DiagramState = { diagrams: Diagram[]; decorations: DecorationSet };

function readDiagrams(state: EditorState): Diagram[] {
  const diagrams: Diagram[] = [];
  syntaxTree(state).iterate({
    enter(node) {
      if (node.name !== "MermaidBlock") return;
      const lines = state.sliceDoc(node.from, node.to).split("\n");
      diagrams.push({
        from: node.from,
        to: node.to,
        definition: lines.slice(1, -1).join("\n").trim(),
        attributes: parseAttributes(lines[0] ?? ""),
      });
      return false;
    },
  });
  return diagrams;
}

/**
 * Publishes structural decorations directly, so hidden fences and tall diagrams
 * participate in the height map. Ordinary view-plugin decorations run too late.
 * @param activation How a diagram activation enters its source.
 * @returns A state field whose cached ranges are refreshed only when parsing changes.
 */
export function createMermaidBlocks(activation: "select" | "caret"): StateField<DiagramState> {
  const decorate = (state: EditorState, diagrams: Diagram[]): DecorationSet => {
    const theme = state.facet(draftlyThemeFacet) === ThemeEnum.DARK ? "dark" : "default";
    return Decoration.set(
      diagrams.map((diagram) => {
        const expanded = state.selection.ranges.some((range) => range.from <= diagram.to && range.to >= diagram.from);
        const widget = new MermaidBlockWidget(
          diagram.definition,
          diagram.attributes,
          theme,
          diagram.from,
          diagram.to,
          activation
        );
        return expanded
          ? Decoration.widget({ widget, block: true, side: 1 }).range(diagram.to)
          : Decoration.replace({ widget, block: true, inclusive: false }).range(diagram.from, diagram.to);
      }),
      true
    );
  };
  return StateField.define<DiagramState>({
    create(state) {
      const diagrams = readDiagrams(state);
      return { diagrams, decorations: decorate(state, diagrams) };
    },
    update(value, transaction) {
      const parsed = transaction.docChanged || syntaxTree(transaction.startState) !== syntaxTree(transaction.state);
      if (!parsed && !transaction.selection && !transaction.reconfigured) return value;
      const diagrams = parsed ? readDiagrams(transaction.state) : value.diagrams;
      return { diagrams, decorations: decorate(transaction.state, diagrams) };
    },
    provide: (field) => EditorView.decorations.from(field, (value) => value.decorations),
  });
}
