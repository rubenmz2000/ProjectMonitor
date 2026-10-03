import type { ReactNode } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import HistoryIcon from '@mui/icons-material/History';
import type { IssueActivity } from '../../../models/IssueActivityModel.ts';
import ActorMarker from '../../actors/ActorMarker.tsx';
import RelativeTime from '../../time/RelativeTime.tsx';
import { ActivityActor, ActivityNote, EventIcon } from './ActivityParts.tsx';

export interface RenderedActivity {
    variant: 'event' | 'block';
    marker: ReactNode;
    content: ReactNode;
}

type ActivityRenderer = (activity: IssueActivity) => RenderedActivity;

/** A one-line history event: who, what, when, and an optional note attached to the change. */
function eventContent(activity: IssueActivity, description: ReactNode): ReactNode {
    return (
        <>
            <span className="rmz-activity__line">
                <ActivityActor activity={activity} /> {description}
                <span className="rmz-activity__time"> · <RelativeTime value={activity.occurredAt} /></span>
            </span>
            <ActivityNote body={activity.body} />
        </>
    );
}

function describeAssigneeChange(activity: IssueActivity): ReactNode {
    const from = activity.from?.value ? activity.from.label : null;
    const to = activity.to?.value ? activity.to.label : null;
    if (!from && to) return <>assigned the issue to <strong>{to}</strong></>;
    if (from && !to) return <>unassigned <strong>{from}</strong></>;
    return <>changed the assignee from <strong>{from ?? 'Unassigned'}</strong> to <strong>{to ?? 'Unassigned'}</strong></>;
}

/**
 * How each activity type is shown. A new activity type is a new entry here, not a redesign;
 * unknown types fall back to a generic event line.
 */
const RENDERERS: Record<string, ActivityRenderer> = {
    Created: (activity) => ({
        variant: 'event',
        marker: <EventIcon><AddCircleOutlineIcon /></EventIcon>,
        content: eventContent(activity, 'created the issue'),
    }),
    AssigneeChanged: (activity) => ({
        variant: 'event',
        marker: <EventIcon><PersonOutlineIcon /></EventIcon>,
        content: eventContent(activity, describeAssigneeChange(activity)),
    }),
    Comment: (activity) => ({
        variant: 'block',
        marker: <ActorMarker actor={activity.actor} />,
        content: (
            <>
                <div className="rmz-activity__comment-header">
                    <ActivityActor activity={activity} />
                    <span className="rmz-activity__time"><RelativeTime value={activity.occurredAt} /></span>
                </div>
                <div className="rmz-activity__comment-body">{activity.body}</div>
            </>
        ),
    }),
};

const fallbackRenderer: ActivityRenderer = (activity) => ({
    variant: 'event',
    marker: <EventIcon><HistoryIcon /></EventIcon>,
    content: eventContent(activity, <>recorded <code>{activity.type}</code></>),
});

export function renderActivity(activity: IssueActivity): RenderedActivity {
    return (RENDERERS[activity.type] ?? fallbackRenderer)(activity);
}
