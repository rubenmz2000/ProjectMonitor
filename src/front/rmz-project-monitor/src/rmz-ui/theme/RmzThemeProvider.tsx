import { useMemo, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { createRmzTheme } from './createRmzTheme.ts';
import { rmzTokens, tokensToCssVariables } from './tokens.ts';
import './fonts.css';

/**
 * Applies RMZ-UI to the whole application: the MUI theme, MUI's baseline reset, the CSS custom
 * properties for plain CSS files, and the few global styles of the identity (fonts, selection).
 */
function RmzThemeProvider({ children }: { children: ReactNode }) {
    const theme = useMemo(() => createRmzTheme(rmzTokens), []);
    const cssVariables = useMemo(() => tokensToCssVariables(rmzTokens), []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    ':root': cssVariables,
                    '*, *::before, *::after': { margin: 0, padding: 0, boxSizing: 'border-box' },
                    html: { scrollBehavior: 'smooth' },
                    body: { fontFamily: rmzTokens.font.body, lineHeight: 1.6, overflowX: 'hidden' },
                    'h1, h2, h3, h4, h5, h6': { fontFamily: rmzTokens.font.heading },
                    a: { color: 'inherit', textDecoration: 'none' },
                    '::selection': { background: rmzTokens.color.blue, color: '#ffffff' },
                    '#root': { minHeight: '100dvh' },
                }}
            />
            {children}
        </ThemeProvider>
    );
}

export default RmzThemeProvider;
