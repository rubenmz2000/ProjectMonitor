import type { ReactNode } from 'react';
import type { IssueActivity } from '../../../models/IssueActivityModel.ts';

/** Round marker holding the icon of a history event. */
export function EventIcon({ children }: { children: ReactNode }) {
    return <span className="rmz-activity__event-icon">{children}</span>;
}

/** Name of the actor who performed the activity. */
export function ActivityActor({ activity }: { activity: IssueActivity }) {
    return <span className="rmz-activity__actor">{activity.actor.displayName}</span>;
}

/** Text attached to a change (e.g. the note of a reassignment), if any. */
export function ActivityNote({ body }: { body: string | null }) {
    return body ? <blockquote className="rmz-activity__note">{body}</blockquote> : null;
}
