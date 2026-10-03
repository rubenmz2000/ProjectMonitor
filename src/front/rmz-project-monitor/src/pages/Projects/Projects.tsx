import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Button,
    Card,
    Chip,
    CircularProgress,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import { EmptyState, StatusBar, StatusDot, useAlert } from '../../rmz-ui/index.ts';
import CreateProjectDialog from '../../components/Dialogs/CreateProject/CreateProjectDialog.tsx';
import { useProjectsOverview } from '../../app/data/useProjectsOverview.ts';
import type { ProjectWithIssueStats } from '../../app/data/useProjectsOverview.ts';
import {
    ISSUE_STATUS_COLORS,
    ISSUE_STATUS_LABELS,
    ISSUE_STATUS_ORDER,
    PROJECT_STATUS_COLORS,
    PROJECT_STATUS_LABELS,
} from '../../app/domain/statusPresentation.ts';
import type { ProjectStatus } from '../../models/enums/ProjectStatus.ts';
import './Projects.css';

dayjs.extend(utc);
dayjs.extend(relativeTime);

function projectStatusLabel(status: string): string {
    return PROJECT_STATUS_LABELS[status as ProjectStatus] ?? status;
}

function projectStatusColor(status: string): string {
    return PROJECT_STATUS_COLORS[status as ProjectStatus] ?? 'var(--neutral)';
}

function matchesSearch(project: ProjectWithIssueStats, query: string): boolean {
    if (!query) return true;
    return project.name.toLowerCase().includes(query) || project.issuePrefix.toLowerCase().includes(query);
}

function Projects() {
    const { notify } = useAlert();
    const navigate = useNavigate();
    const { projects, loading, error, refetch } = useProjectsOverview();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [search, setSearch] = useState('');

    const handleClose = (result: string) => {
        if (result === 'submit') {
            notify('Project created successfully', 'success');
            refetch();
        } else if (result === 'error') {
            notify('An error occurred while creating the project', 'error');
        }
        setDialogOpen(false);
    };

    const query = search.trim().toLowerCase();
    const filtered = useMemo(
        () => projects.filter((p) => matchesSearch(p, query)),
        [projects, query]
    );

    const handleRowClick = (project: ProjectWithIssueStats) => {
        navigate(`/projects/${project.issuePrefix}/issues`);
    };

    return (
        <div className="rmz-projects-page">
            <div className="rmz-projects-page__toolbar">
                <div>
                    <h1 className="rmz-projects-page__title">Projects</h1>
                    <p className="rmz-projects-page__subtitle">
                        {projects.length} project{projects.length === 1 ? '' : 's'}
                    </p>
                </div>
                <div className="rmz-projects-page__actions">
                    <TextField
                        size="small"
                        placeholder="Search projects…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                        New project
                    </Button>
                </div>
            </div>

            <Card className="rmz-projects-page__card">
                {loading ? (
                    <div className="rmz-projects-page__loading">
                        <CircularProgress />
                    </div>
                ) : error ? (
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
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<FolderOutlinedIcon />}
                        title={projects.length === 0 ? 'No projects yet' : 'No projects match your search'}
                        description={projects.length === 0 ? 'Create your first project to get started.' : undefined}
                        action={
                            projects.length === 0 ? (
                                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                                    New project
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <Table className="rmz-projects-table" size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Project</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Issues</TableCell>
                                <TableCell align="right">Updated</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((project) => (
                                <TableRow
                                    key={project.id}
                                    hover
                                    className="rmz-projects-table__row"
                                    onClick={() => handleRowClick(project)}
                                >
                                    <TableCell>
                                        <div className="rmz-projects-table__project">
                                            <Chip size="small" variant="outlined" label={project.issuePrefix} className="rmz-projects-table__prefix" />
                                            <div className="rmz-projects-table__name-block">
                                                <span className="rmz-projects-table__name">{project.name}</span>
                                                {project.description && (
                                                    <span className="rmz-projects-table__description">{project.description}</span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusDot label={projectStatusLabel(project.status)} color={projectStatusColor(project.status)} />
                                    </TableCell>
                                    <TableCell className="rmz-projects-table__issues">
                                        {project.totalIssues === 0 ? (
                                            <span className="rmz-projects-table__no-issues">No issues</span>
                                        ) : (
                                            <>
                                                <StatusBar
                                                    showLegend={false}
                                                    segments={ISSUE_STATUS_ORDER.map((status) => ({
                                                        key: status,
                                                        label: ISSUE_STATUS_LABELS[status],
                                                        value: project.issueCounts[status],
                                                        color: ISSUE_STATUS_COLORS[status],
                                                    }))}
                                                />
                                                <span className="rmz-projects-table__issues-count">{project.totalIssues}</span>
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell align="right" className="rmz-projects-table__updated">
                                        {dayjs.utc(project.updatedAt).local().fromNow()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>

            <CreateProjectDialog open={dialogOpen} onClose={handleClose} />
        </div>
    );
}

export default Projects;
