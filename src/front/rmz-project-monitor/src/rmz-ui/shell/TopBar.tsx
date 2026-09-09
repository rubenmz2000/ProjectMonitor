import type { ReactNode } from 'react';
import './TopBar.css';

/** Generic top bar: a left area (typically breadcrumbs) and a right area (actions, identity). */
function TopBar({ left, right }: { left?: ReactNode, right?: ReactNode }) {
    return (
        <div className="rmz-topbar">
            <div className="rmz-topbar__left">{left}</div>
            <div className="rmz-topbar__right">{right}</div>
        </div>
    );
}

export default TopBar;
