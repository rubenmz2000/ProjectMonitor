import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, CircularProgress } from '@mui/material';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import { EmptyState, StatTile, StatusBar, StatusDot } from '../../rmz-ui/index.ts';
import { useProjectsOverview } from '../../app/data/useProjectsOverview.ts';
import {
    ISSUE_STATUS_COLORS,
    ISSUE_STATUS_LABELS,
    ISSUE_STATUS_ORDER,
    PROJECT_STATUS_COLORS,
    PROJECT_STATUS_LABELS,
    PROJECT_STATUS_ORDER,
} from '../../app/domain/statusPresentation.ts';
import type { ProjectStatus } from '../../models/enums/ProjectStatus.ts';
import './Dashboard.css';

dayjs.extend(utc);
dayjs.extend(relativeTime);

const RECENT_PROJECTS_LIMIT = 5;

function Dashboard() {
    const navigate = useNavigate();
    const { projects, loading, error, totals, refetch } = useProjectsOverview();

    const recentProjects = useMemo(
        () => [...projects].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, RECENT_PROJECTS_LIMIT),
        [projects]
    );

    const openIssues = totals.issuesByStatus.ToDo + totals.issuesByStatus.InProgress + totals.issuesByStatus.Blocked;

    if (loading) {
        return (
            <div className="rmz-dashboard__loading">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                severity="error"
                action={
                    <Button color="inherit" size="small" onClick={refetch}>
                        Retry
                    </Button>
                }
            >
                {error}
            </Alert>
        );
    }

    return (
        <div className="rmz-dashboard">
            <h1 className="rmz-dashboard__title">Overview</h1>

            <div className="rmz-dashboard__stats">
                <StatTile label="Projects" value={totals.projectCount} icon={<FolderOutlinedIcon />} />
                <StatTile
                    label="Projects in progress"
                    value={totals.projectsByStatus.InProgress}
                    icon={<TrendingUpOutlinedIcon />}
                />
                <StatTile label="Issues" value={totals.issueCount} icon={<AssignmentOutlinedIcon />} />
                <StatTile
                    label="Open issues"
                    value={openIssues}
                    icon={<PendingActionsOutlinedIcon />}
                    hint="To do, in progress or blocked"
                />
            </div>

            <div className="rmz-dashboard__panels">
                <Card className="rmz-dashboard__panel">
                    <h2 className="rmz-dashboard__panel-title">Projects by status</h2>
                    {totals.projectCount === 0 ? (
                        <EmptyState title="No projects yet" />
                    ) : (
                        <StatusBar
                            segments={PROJECT_STATUS_ORDER.map((status) => ({
                                key: status,
                                label: PROJECT_STATUS_LABELS[status],
                                value: totals.projectsByStatus[status],
                                color: PROJECT_STATUS_COLORS[status],
                            }))}
                        />
                    )}
                </Card>

                <Card className="rmz-dashboard__panel">
                    <h2 className="rmz-dashboard__panel-title">Issues by status</h2>
                    {totals.issueCount === 0 ? (
                        <EmptyState title="No issues yet" />
                    ) : (
                        <StatusBar
                            segments={ISSUE_STATUS_ORDER.map((status) => ({
                                key: status,
                                label: ISSUE_STATUS_LABELS[status],
                                value: totals.issuesByStatus[status],
                                color: ISSUE_STATUS_COLORS[status],
                            }))}
                        />
                    )}
                </Card>
            </div>

            <Card className="rmz-dashboard__panel rmz-dashboard__recent">
                <div className="rmz-dashboard__panel-header">
                    <h2 className="rmz-dashboard__panel-title">Recent projects</h2>
                    <Button size="small" onClick={() => navigate('/projects')}>
                        View all
                    </Button>
                </div>
                {recentProjects.length === 0 ? (
                    <EmptyState title="No projects yet" description="Create your first project from the Projects page." />
                ) : (
                    <ul className="rmz-dashboard__recent-list">
                        {recentProjects.map((project) => (
                            <li
                                key={project.id}
                                className="rmz-dashboard__recent-item"
                                onClick={() => navigate(`/projects/${project.issuePrefix}/issues`)}
                            >
                                <span className="rmz-dashboard__recent-prefix">{project.issuePrefix}</span>
                                <span className="rmz-dashboard__recent-name">{project.name}</span>
                                <StatusDot
                                    label={PROJECT_STATUS_LABELS[project.status as ProjectStatus] ?? project.status}
                                    color={PROJECT_STATUS_COLORS[project.status as ProjectStatus] ?? 'var(--neutral)'}
                                />
                                <span className="rmz-dashboard__recent-updated">
                                    {dayjs.utc(project.updatedAt).local().fromNow()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}

export default Dashboard;
