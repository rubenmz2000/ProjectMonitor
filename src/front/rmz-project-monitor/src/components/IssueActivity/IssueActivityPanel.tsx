import { useState, useEffect, useCallback } from 'react';
import { Button, Typography, CircularProgress, Alert, Box, Card, TextField } from '@mui/material';
import { getIssueActivity, addComment } from '../../serivces/ApiService.ts';
import type { IssueActivity } from '../../models/IssueActivityModel.ts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import './IssueActivityPanel.css';

dayjs.extend(utc);
dayjs.extend(relativeTime);

function describe(activity: IssueActivity): string {
    switch (activity.type) {
        case 'Created':
            return 'created the issue';
        case 'AssigneeChanged':
            return `changed assignee: ${activity.from?.label ?? '?'} → ${activity.to?.label ?? '?'}`;
        case 'Comment':
            return 'commented';
        default:
            return activity.type;
    }
}

/**
 * Minimal history view for an issue: chronological list plus a comment box.
 * `refreshKey` lets the parent force a reload after it changes the issue (e.g. reassignment).
 */
function IssueActivityPanel({ issueIdentifier, refreshKey }: { issueIdentifier: string, refreshKey: number }) {
    const [activities, setActivities] = useState<IssueActivity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchActivity = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setActivities(await getIssueActivity(issueIdentifier));
        } catch {
            setError('Failed to load activity');
            setActivities([]);
        } finally {
            setLoading(false);
        }
    }, [issueIdentifier]);

    useEffect(() => {
        fetchActivity();
    }, [fetchActivity, refreshKey]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const body = comment.trim();
        if (!body) return;
        setSubmitting(true);
        try {
            await addComment(issueIdentifier, body);
            setComment('');
            await fetchActivity();
        } catch {
            setError('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="activity-card">
            <Typography variant="h6" className="activity-title">Activity</Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : error ? (
                <Alert severity="error">
                    {error}
                    <Button onClick={fetchActivity} sx={{ ml: 2 }} size="small" variant="outlined">Retry</Button>
                </Alert>
            ) : activities.length === 0 ? (
                <Typography variant="body2" className="activity-muted">No activity yet.</Typography>
            ) : (
                <ul className="activity-list">
                    {activities.map((activity) => (
                        <li key={activity.id} className="activity-entry">
                            <div className="activity-line">
                                <span className="activity-actor">{activity.actor.displayName}</span>
                                {activity.actor.kind === 'Agent' && <span className="activity-muted"> (Agent)</span>}
                                <span> {describe(activity)}</span>
                                <span className="activity-muted activity-time" title={dayjs.utc(activity.occurredAt).local().format('DD/MM/YYYY HH:mm')}>
                                    {dayjs.utc(activity.occurredAt).local().fromNow()}
                                </span>
                            </div>
                            {activity.body && (
                                <Typography variant="body2" className="activity-body">{activity.body}</Typography>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <form className="activity-comment-form" onSubmit={handleSubmit}>
                <TextField
                    name="comment"
                    label="Add a comment"
                    multiline
                    minRows={2}
                    fullWidth
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={submitting}
                    className="activity-comment-input"
                />
                <Button type="submit" variant="contained" disabled={submitting || !comment.trim()}>
                    Comment
                </Button>
            </form>
        </Card>
    );
}

export default IssueActivityPanel;
