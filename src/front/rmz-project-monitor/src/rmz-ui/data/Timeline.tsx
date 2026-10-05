import type { ReactNode } from 'react';
import './Timeline.css';

export interface TimelineItemProps {
    /** Small visual anchor on the timeline line (an icon, an avatar…). */
    marker: ReactNode;
    /** "event": a compact one-line entry; "block": a highlighted entry with its own surface. */
    variant?: 'event' | 'block';
    children: ReactNode;
}

/** One entry of a Timeline. */
export function TimelineItem({ marker, variant = 'event', children }: TimelineItemProps) {
    return (
        <li className={`rmz-timeline__item rmz-timeline__item--${variant}`}>
            <div className="rmz-timeline__marker">{marker}</div>
            <div className="rmz-timeline__content">{children}</div>
        </li>
    );
}

/** Vertical, ordered sequence of entries joined by a line. The application decides the entries. */
function Timeline({ children }: { children: ReactNode }) {
    return <ol className="rmz-timeline">{children}</ol>;
}

export default Timeline;
