# Project Monitor — frontend

React + Vite + TypeScript frontend of Project Monitor. See the root [`README.md`](../../../README.md)
for what the project is and how to run it, and [`docs/`](../../../docs/README.md) for product context.

```
pnpm install
pnpm dev      # Vite dev server
pnpm build    # tsc -b && vite build
pnpm lint
```

Styling: RMZ-UI lives in `src/rmz-ui/` (a CSS theme file plus Navbar/Footer). MUI is used without
a custom theme, so use the RMZ-UI CSS variables (`--text`, `--text-muted`, `--bg-surface`, ...)
instead of MUI palette colors wherever contrast matters.
