/**
 * RMZ-UI: the reusable part of the frontend. Tokens, MUI theme, generic shell components and
 * feedback. Nothing in this folder may depend on application concepts (projects, issues, actors…).
 */
export { rmzTokens, tokensToCssVariables } from './theme/tokens.ts';
export type { RmzTokens } from './theme/tokens.ts';
export { createRmzTheme } from './theme/createRmzTheme.ts';
export { default as RmzThemeProvider } from './theme/RmzThemeProvider.tsx';

export { default as AppShell } from './shell/AppShell.tsx';
export type { AppShellProps } from './shell/AppShell.tsx';
export { default as Sidebar } from './shell/Sidebar.tsx';
export type { SidebarItem, SidebarSection, SidebarProps } from './shell/Sidebar.tsx';
export { default as TopBar } from './shell/TopBar.tsx';
export { default as Breadcrumbs } from './shell/Breadcrumbs.tsx';
export type { BreadcrumbItem } from './shell/Breadcrumbs.tsx';
export { default as Brand } from './shell/Brand.tsx';

export { default as AlertProvider } from './feedback/AlertProvider.tsx';
export { useAlert } from './feedback/useAlert.ts';
export type { AlertApi, AlertSeverity } from './feedback/AlertContext.ts';

export { default as StatTile } from './data/StatTile.tsx';
export type { StatTileProps } from './data/StatTile.tsx';
export { default as StatusBar } from './data/StatusBar.tsx';
export type { StatusBarProps, StatusBarSegment } from './data/StatusBar.tsx';
export { default as StatusDot } from './data/StatusDot.tsx';
export type { StatusDotProps } from './data/StatusDot.tsx';
export { default as EmptyState } from './data/EmptyState.tsx';
export type { EmptyStateProps } from './data/EmptyState.tsx';

export { default as PageHeader } from './layout/PageHeader.tsx';
export type { PageHeaderProps } from './layout/PageHeader.tsx';

export { default as MultiSelectFilter } from './filters/MultiSelectFilter.tsx';
export type { MultiSelectFilterOption, MultiSelectFilterProps } from './filters/MultiSelectFilter.tsx';
