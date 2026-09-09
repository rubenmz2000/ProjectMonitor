import { createTheme } from '@mui/material/styles';
import { rmzTokens, type RmzTokens } from './tokens.ts';

/**
 * Builds the MUI dark theme from the RMZ-UI tokens. With this theme active, MUI components pick
 * the right surfaces, text and border colors by themselves: do not patch colors per component.
 */
export function createRmzTheme(tokens: RmzTokens = rmzTokens) {
    const c = tokens.color;

    return createTheme({
        palette: {
            mode: 'dark',
            primary: { main: c.blue, light: c.blueBright },
            success: { main: c.success },
            warning: { main: c.warning },
            error: { main: c.danger },
            info: { main: c.info },
            background: { default: c.bg, paper: c.bgSurface },
            text: { primary: c.text, secondary: c.textMuted },
            divider: c.border,
        },
        shape: { borderRadius: parseInt(tokens.radius.md, 10) },
        typography: {
            fontFamily: tokens.font.body,
            h1: { fontFamily: tokens.font.heading, fontWeight: 700, letterSpacing: '0.05em' },
            h2: { fontFamily: tokens.font.heading, fontWeight: 700, letterSpacing: '0.05em' },
            h3: { fontFamily: tokens.font.heading, fontWeight: 700, letterSpacing: '0.05em' },
            h4: { fontFamily: tokens.font.heading, fontWeight: 700, letterSpacing: '0.04em' },
            h5: { fontFamily: tokens.font.heading, fontWeight: 600, letterSpacing: '0.03em' },
            h6: { fontFamily: tokens.font.heading, fontWeight: 600, letterSpacing: '0.02em' },
            button: { fontFamily: tokens.font.heading, fontWeight: 600, letterSpacing: '0.05em' },
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: c.bgCard,
                        backgroundImage: 'none',
                        border: `1px solid ${c.borderSubtle}`,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    // MUI adds a light overlay to dark papers by elevation; keep surfaces flat
                    root: { backgroundImage: 'none' },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: { backgroundColor: c.bgSurface, border: `1px solid ${c.border}` },
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: { backgroundColor: c.bgElevated, border: `1px solid ${c.borderSubtle}` },
                },
            },
            MuiChip: {
                styleOverrides: {
                    outlined: { borderColor: c.textMuted },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    notchedOutline: { borderColor: c.textMuted },
                },
            },
            MuiButton: {
                defaultProps: { disableElevation: true },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: { backgroundColor: c.bgElevated, border: `1px solid ${c.borderSubtle}`, color: c.text },
                },
            },
        },
    });
}
