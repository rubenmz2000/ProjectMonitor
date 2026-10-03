import type { ReactNode } from 'react';
import './StatTile.css';

export interface StatTileProps {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
    /** Small secondary line under the value (e.g. "3 in progress"). */
    hint?: ReactNode;
}

/**
 * Compact stat card: a label, a large value and an optional icon/hint. Generic building block
 * for overview/dashboard panels; the application decides what the numbers mean.
 */
function StatTile({ label, value, icon, hint }: StatTileProps) {
    return (
        <div className="rmz-stat-tile">
            <div className="rmz-stat-tile__header">
                <span className="rmz-stat-tile__label">{label}</span>
                {icon && <span className="rmz-stat-tile__icon">{icon}</span>}
            </div>
            <div className="rmz-stat-tile__value">{value}</div>
            {hint && <div className="rmz-stat-tile__hint">{hint}</div>}
        </div>
    );
}

export default StatTile;
