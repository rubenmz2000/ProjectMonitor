# Project Monitor — frontend

React + Vite + TypeScript frontend of Project Monitor. See the root [`README.md`](../../../README.md)
for what the project is and how to run it, and [`docs/`](../../../docs/README.md) for product context.

```
pnpm install
pnpm dev      # Vite dev server
pnpm build    # tsc -b && vite build
pnpm lint
```

Styling: RMZ-UI lives in `src/rmz-ui/` — tokens (`theme/tokens.ts`), the MUI dark theme and the
generic shell. MUI components take their colors from the theme; plain CSS uses the CSS custom
properties the provider emits (`--text`, `--text-muted`, `--space-4`, ...). Do not patch colors per
component. Application-specific shell composition is in `src/app/`.
