import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Chip, CircularProgress } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { EmptyState, PageHeader, useAlert } from '../../rmz-ui/index.ts';
import type { Actor } from '../../models/ActorModel.ts';
import { addComment, getActiveActors, updateAssignee } from '../../serivces/ApiService.ts';
import { useIssue } from '../../app/data/useIssue.ts';
import { useIssueActivity } from '../../app/data/useIssueActivity.ts';
import { useRouteProject } from '../../app/shell/useRouteProject.ts';
import IssueDetailsPanel from '../../app/issues/IssueDetailsPanel.tsx';
import IssueActivityTimeline from '../../app/issues/activity/IssueActivityTimeline.tsx';
import CommentComposer from '../../app/issues/activity/CommentComposer.tsx';
import './IssueWorkspace.css';

/**
 * An issue as a unit of work. Left: what the issue is (title, description) and what happened
 * (activity and comments). Right: what state it is in (details, assignee).
 */
function IssueWorkspace() {
    const { issueIdentifier } = useParams<{ issueIdentifier: string }>();
    const navigate = useNavigate();
    const { notify } = useAlert();
    const { prefix, project } = useRouteProject();
    const { issue, loading, notFound, error, refetch, setIssue } = useIssue(issueIdentifier);
    const activity = useIssueActivity(issueIdentifier);
    const [actors, setActors] = useState<Actor[]>([]);

    useEffect(() => {
        let cancelled = false;
        getActiveActors()
            .then((list) => { if (!cancelled) setActors(list); })
            .catch(() => { if (!cancelled) setActors([]); });
        return () => { cancelled = true; };
    }, []);

    const actorIdentifier: string | undefined = import.meta.env.VITE_ACTOR_IDENTIFIER;
    const currentActor = actors.find((a) => a.identifier === actorIdentifier) ?? null;

    if (loading) {
        return (
            <div className="rmz-issue-workspace__loading">
                <CircularProgress />
            </div>
        );
    }

    if (notFound || !issue || !issueIdentifier) {
        if (error) {
            return (
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
                    {error}
                </Alert>
            );
        }
        const listUrl = project ? `/projects/${project.issuePrefix}/issues` : '/projects';
        return (
            <EmptyState
                icon={<SearchOffIcon />}
                title="Issue not found"
                description={`There is no issue "${issueIdentifier?.toUpperCase()}".`}
                action={
                    <Button variant="outlined" onClick={() => navigate(listUrl)}>
                        {project ? `Go to ${prefix} issues` : 'Go to projects'}
                    </Button>
                }
            />
        );
    }

    const handleAssign = async (assigneeId: string | null, note: string): Promise<boolean> => {
        try {
            const updated = await updateAssignee(issueIdentifier, assigneeId, note || undefined);
            setIssue(updated);
            notify(updated.assignee ? `Assigned to ${updated.assignee.displayName}` : 'Issue unassigned', 'success');
            activity.refetch();
            return true;
        } catch {
            notify('Failed to update the assignee', 'error');
            return false;
        }
    };

    const handleComment = async (body: string): Promise<boolean> => {
        try {
            const created = await addComment(issueIdentifier, body);
            activity.append(created);
            // Commenting touches the issue (UpdatedAt) on the server; reflect it without a reload
            setIssue({ ...issue, updatedAt: created.occurredAt });
            return true;
        } catch {
            notify('Failed to add the comment', 'error');
            return false;
        }
    };

    return (
        <div className="rmz-issue-workspace">
            <PageHeader
                leading={<Chip size="small" variant="outlined" label={issue.issueIdentifier} className="rmz-issue-workspace__identifier" />}
                title={issue.title}
            />

            <div className="rmz-issue-workspace__columns">
                <div className="rmz-issue-workspace__main">
                    <section className="rmz-issue-workspace__section">
                        <h2 className="rmz-issue-workspace__section-title">Description</h2>
                        {issue.description.trim() ? (
                            <div className="rmz-issue-workspace__description">{issue.description}</div>
                        ) : (
                            <p className="rmz-issue-workspace__muted">No description.</p>
                        )}
                    </section>

                    <section className="rmz-issue-workspace__section">
                        <h2 className="rmz-issue-workspace__section-title">
                            Activity
                            {!activity.loading && !activity.error && (
                                <span className="rmz-issue-workspace__count">{activity.activities.length}</span>
                            )}
                        </h2>
                        <IssueActivityTimeline
                            activities={activity.activities}
                            loading={activity.loading}
                            error={activity.error}
                            onRetry={() => activity.refetch()}
                        />
                        <CommentComposer currentActor={currentActor} onSubmit={handleComment} />
                    </section>
                </div>

                <aside className="rmz-issue-workspace__aside">
                    <IssueDetailsPanel issue={issue} actors={actors} onAssign={handleAssign} />
                </aside>
            </div>
        </div>
    );
}

export default IssueWorkspace;
