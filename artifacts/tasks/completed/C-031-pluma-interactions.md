# C-031 — Pluma interactions

> Last verified: 2026-09-09 · commit `754465b` plus final rebuilt interaction worktree.

**Status:** Complete
**Completed:** 2026-09-09
**Origin:** T-029
**Priority:** High

## Integration scope

Merged exact upstream `86ee956ebdfdae1e25ceea697a661f7f3ee8e25b` in
`754465b7872f56505b23bfe2cd9b85b27d06825b` before the interaction fixes.

- `TablePlugin({ normalizeOnOpen, normalizeOnChange })` keeps both defaults `true`.
  Pluma passes `false` for both to preserve source during open and ordinary edits.
- Table pointer handling maps rendered cell coordinates to source positions, retaining
  CodeMirror's native caret and drag-selection behavior. Toolbar buttons perform actions
  through semantic clicks, including keyboard activation.
- `MermaidPlugin({ activation })` defaults to `"select"`; Pluma uses `"caret"` to place
  the cursor at the diagram body instead of selecting all source.
- Mermaid supplies block decorations directly from a `StateField`. Multiline replacement
  is valid on this direct path; it must not return to view-plugin decorations. Parsed
  ranges are cached until document or syntax-tree changes. Async widget completion calls
  `requestMeasure()` so layout reflects the rendered SVG.
- Reconfiguration runs removal/addition lifecycle hooks even when the view survives.
- Regenerate and commit `packages/draftly/dist` with source: Pluma installs the Git
  package and needs its built public entry points.

The public entry points export the table and Mermaid option types. Empty table cells map
padding clicks to their source midpoint. Asynchronous Mermaid rendering errors are forwarded
to `DraftlyConfig.onPluginError`, as are reportable decoration failures.

## Verification

- [x] Fork typecheck and build passed against the final artifacts.
- [x] All 27 integrated real Chromium/Electron interaction tests passed against the final rebuild.
- [x] Table pointer/padding insertion and Space/Enter toolbar activation passed.
- [x] Mermaid geometry, activation, async layout, and deep-scroll insertion passed.
- [x] Forward/backward selection and history across surfaces, tabs, settings, and themes passed.
- [x] Changed-file Biome check: no formatting errors; 25 pre-existing style warnings remain.

Publication and Pluma's final dependency pin, packaged-app checks, and full final validation
remain consumer/release follow-up work. The Electron harness is not proof of production
menus, dialogs, persistence, or packaged IPC behavior.
