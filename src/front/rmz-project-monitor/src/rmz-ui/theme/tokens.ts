/**
 * RMZ-UI design tokens.
 *
 * Single source of truth for the visual identity. They are exposed twice from here:
 *  - as CSS custom properties on :root (see RmzThemeProvider), for plain CSS files;
 *  - as the input of the MUI theme (see createRmzTheme), so MUI components need no per-component
 *    color patches.
 *
 * Generic on purpose: nothing here knows about the application that uses it.
 */
export const rmzTokens = {
    color: {
        // Surfaces, from the page background up to floating elements
        bg: '#090c10',
        bgSurface: '#0d1117',
        bgCard: '#161b22',
        bgElevated: '#1c2230',

        // Brand accent
        blue: '#2f80ed',
        blueBright: '#4d9fff',
        blueGlow: 'rgba(47, 128, 237, 0.15)',

        // Text
        text: '#e6edf3',
        textMuted: '#7d8590',

        // Borders
        border: 'rgba(47, 128, 237, 0.2)',
        borderSubtle: 'rgba(125, 133, 144, 0.25)',

        // Semantic (generic meanings; applications map their own concepts onto these)
        success: '#27ae60',
        warning: '#f2a93b',
        danger: '#e74c3c',
        info: '#4d9fff',
        neutral: '#7d8590',
    },
    font: {
        heading: "'Rajdhani', sans-serif",
        body: "'Inter', sans-serif",
        mono: "ui-monospace, 'Cascadia Mono', 'Consolas', monospace",
    },
    space: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '24px',
        6: '32px',
        7: '48px',
    },
    radius: {
        sm: '2px',
        md: '4px',
        lg: '8px',
    },
    layout: {
        sidebarWidth: '240px',
        sidebarCollapsedWidth: '60px',
        topBarHeight: '52px',
        contentMaxWidth: '1400px',
    },
} as const;

export type RmzTokens = typeof rmzTokens;

/** Maps the tokens to the CSS custom properties consumed by plain CSS. */
export function tokensToCssVariables(tokens: RmzTokens = rmzTokens): Record<string, string> {
    const c = tokens.color;
    const vars: Record<string, string> = {
        '--bg': c.bg,
        '--bg-surface': c.bgSurface,
        '--bg-card': c.bgCard,
        '--bg-elevated': c.bgElevated,
        '--blue': c.blue,
        '--blue-bright': c.blueBright,
        '--blue-glow': c.blueGlow,
        '--text': c.text,
        '--text-muted': c.textMuted,
        '--border': c.border,
        '--border-subtle': c.borderSubtle,
        '--success': c.success,
        '--warning': c.warning,
        '--danger': c.danger,
        '--info': c.info,
        '--neutral': c.neutral,
        '--font-heading': tokens.font.heading,
        '--font-body': tokens.font.body,
        '--font-mono': tokens.font.mono,
        '--radius-sm': tokens.radius.sm,
        '--radius-md': tokens.radius.md,
        '--radius-lg': tokens.radius.lg,
        '--sidebar-width': tokens.layout.sidebarWidth,
        '--sidebar-collapsed-width': tokens.layout.sidebarCollapsedWidth,
        '--topbar-height': tokens.layout.topBarHeight,
        '--content-max-width': tokens.layout.contentMaxWidth,
    };
    for (const [step, value] of Object.entries(tokens.space)) {
        vars[`--space-${step}`] = value;
    }
    return vars;
}
