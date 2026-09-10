import { useEffect, useState, type ReactNode } from 'react';
import './AppShell.css';

const COLLAPSED_STORAGE_KEY = 'rmz-ui.sidebar.collapsed';

function readCollapsed(): boolean {
    try {
        return localStorage.getItem(COLLAPSED_STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

function writeCollapsed(collapsed: boolean) {
    try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
        // Storage unavailable: the preference simply does not persist
    }
}

export interface AppShellProps {
    /** Rendered inside the sidebar column; receives the collapsed state. */
    sidebar: (state: { collapsed: boolean, toggle: () => void }) => ReactNode;
    /** Rendered inside the top bar. */
    topBar: ReactNode;
    children: ReactNode;
}

/**
 * Generic application frame: a collapsible sidebar column, a top bar and a scrollable content
 * area. Knows nothing about what goes inside; the application composes it.
 */
function AppShell({ sidebar, topBar, children }: AppShellProps) {
    const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);

    useEffect(() => {
        writeCollapsed(collapsed);
    }, [collapsed]);

    const toggle = () => setCollapsed((c) => !c);

    return (
        <div className={`rmz-shell${collapsed ? ' rmz-shell--collapsed' : ''}`}>
            <aside className="rmz-shell__sidebar">
                {sidebar({ collapsed, toggle })}
            </aside>
            <header className="rmz-shell__topbar">
                {topBar}
            </header>
            <main className="rmz-shell__content">
                {children}
            </main>
        </div>
    );
}

export default AppShell;
