import { Alert, Button, CircularProgress } from '@mui/material';
import { Timeline, TimelineItem } from '../../../rmz-ui/index.ts';
import type { IssueActivity } from '../../../models/IssueActivityModel.ts';
import { renderActivity } from './activityRenderers.tsx';
import './IssueActivity.css';

interface IssueActivityTimelineProps {
    activities: IssueActivity[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
}

/** The history of an issue, oldest first: changes as compact events, comments as blocks. */
function IssueActivityTimeline({ activities, loading, error, onRetry }: IssueActivityTimelineProps) {
    if (loading) {
        return (
            <div className="rmz-activity__loading">
                <CircularProgress size={24} />
            </div>
        );
    }
    if (error) {
        return (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>Retry</Button>}>
                {error}
            </Alert>
        );
    }
    if (activities.length === 0) {
        return <p className="rmz-activity__empty">No activity yet.</p>;
    }
    return (
        <Timeline>
            {activities.map((activity) => {
                const rendered = renderActivity(activity);
                return (
                    <TimelineItem key={activity.id} marker={rendered.marker} variant={rendered.variant}>
                        {rendered.content}
                    </TimelineItem>
                );
            })}
        </Timeline>
    );
}

export default IssueActivityTimeline;
