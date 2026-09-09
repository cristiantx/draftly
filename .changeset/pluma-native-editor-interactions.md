---
"draftly": patch
---

Preserve native table caret and drag selection, and activate table toolbar actions through
semantic button clicks. Add optional `normalizeOnOpen` and `normalizeOnChange` table
settings, both enabled by default, for hosts that preserve source formatting.

Render Mermaid blocks through direct state-field decorations and request layout measurement
after asynchronous SVG rendering. Add `activation: "caret"` as an alternative to the
existing `"select"` behavior. Run plugin lifecycle hooks when configuration changes replace
plugin instances in a surviving editor view.
