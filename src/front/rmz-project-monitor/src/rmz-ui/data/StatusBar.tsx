import StatusDot from './StatusDot.tsx';
import './StatusBar.css';

export interface StatusBarSegment {
    key: string;
    label: string;
    value: number;
    /** Any CSS color, typically a token value or CSS variable such as "var(--info)". */
    color: string;
}

export interface StatusBarProps {
    segments: StatusBarSegment[];
    /** Defaults to the sum of segment values. */
    total?: number;
    showLegend?: boolean;
}

/**
 * Horizontal segmented bar with an optional legend: a generic way to show how a total splits
 * across named, colored categories. The application supplies the categories, values and colors.
 */
function StatusBar({ segments, total, showLegend = true }: StatusBarProps) {
    const sum = total ?? segments.reduce((acc, s) => acc + s.value, 0);
    const visible = segments.filter((s) => s.value > 0);

    return (
        <div className="rmz-status-bar">
            <div className="rmz-status-bar__track">
                {sum === 0 ? (
                    <div className="rmz-status-bar__empty" />
                ) : (
                    visible.map((s) => (
                        <div
                            key={s.key}
                            className="rmz-status-bar__segment"
                            style={{ flexGrow: s.value, backgroundColor: s.color }}
                            title={`${s.label}: ${s.value}`}
                        />
                    ))
                )}
            </div>
            {showLegend && (
                <ul className="rmz-status-bar__legend">
                    {segments.map((s) => (
                        <li key={s.key} className="rmz-status-bar__legend-item">
                            <StatusDot label={s.label} color={s.color} />
                            <span className="rmz-status-bar__legend-value">{s.value}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default StatusBar;
