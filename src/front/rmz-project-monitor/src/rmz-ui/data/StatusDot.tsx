import './StatusDot.css';

export interface StatusDotProps {
    label: string;
    /** Any CSS color, typically a token value or CSS variable such as "var(--info)". */
    color: string;
}

/** A small colored dot next to a label: the compact way to show a single categorical status. */
function StatusDot({ label, color }: StatusDotProps) {
    return (
        <span className="rmz-status-dot">
            <span className="rmz-status-dot__marker" style={{ backgroundColor: color }} />
            {label}
        </span>
    );
}

export default StatusDot;
