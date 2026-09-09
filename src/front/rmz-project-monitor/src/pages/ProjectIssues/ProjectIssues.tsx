import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Button, Typography, CircularProgress, Alert, Box, Card } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Project } from '../../models/ProjectModel.ts';
import type { Issue } from '../../models/IssueModel.ts';
import { getProjectById, getProjectIssues } from '../../serivces/ApiService.ts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import CreateIssueDialog from '../../components/Dialogs/CreateIssue/CreateIssueDialog.tsx';
import './ProjectIssues.css';

dayjs.extend(utc);
dayjs.extend(relativeTime);

function ProjectIssues({ triggerAlert }: { triggerAlert: (message: string, severity?: string) => void }) {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const [projectData, issuesData] = await Promise.all([
                getProjectById(projectId),
                getProjectIssues(projectId)
            ]);
            setProject(projectData);
            setIssues(issuesData);
        } catch (err) {
            setError('Failed to load project or issues');
            setProject(null);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateIssue = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = (result: string, issueIdentifier?: string) => {
        if (result === 'submit') {
            triggerAlert(`Issue ${issueIdentifier} created successfully`, 'success');
            fetchData();
        } else if (result === 'error') {
            triggerAlert('An error occurred while creating the issue', 'error');
        }
        setDialogOpen(false);
    };

    const handleBack = () => {
        navigate('/projects');
    };

    return <>
        <div className={'card-container'} style={{ padding: '20px' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
                Back to Projects
            </Button>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ width: '100%' }}>
                    {error}
                    <Button onClick={fetchData} sx={{ ml: 2 }} size="small" variant="outlined">
                        Retry
                    </Button>
                </Alert>
            ) : !project ? (
                <Typography variant="body1" className="empty-state" sx={{ py: 4, textAlign: 'center' }}>
                    Project not found.
                </Typography>
            ) : (
                <>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant={'h4'}>
                                {project.name} ({project.issuePrefix})
                            </Typography>
                            <Typography variant={'body2'} className="empty-state">
                                {project.description}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateIssue}
                        >
                            Create Issue
                        </Button>
                    </Box>

                    <Typography variant={'h5'} sx={{ mb: 2 }}>Issues</Typography>

                    <div className={'projects-list'}>
                        {issues.length === 0 ? (
                            <Typography variant="body1" className="empty-state" sx={{ py: 4, textAlign: 'center' }}>
                                No issues yet. Create your first issue to get started.
                            </Typography>
                        ) : (
                            issues.map((issue) => (
                                <Card
                                    key={issue.id}
                                    className={'project-card'}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/issues/${issue.issueIdentifier}`)}
                                >
                                    <Typography variant={"h6"}>{issue.issueIdentifier}</Typography>
                                    <Typography variant={"subtitle1"}>{issue.title}</Typography>
                                    <Typography variant={"body2"}>Status: {issue.status}</Typography>
                                    <Typography variant={"body2"}>Priority: {issue.priority}</Typography>
                                    {issue.dueDate && (
                                        <Typography variant={'body2'}>
                                            Due: {dayjs.utc(issue.dueDate).format('DD/MM/YYYY')}
                                        </Typography>
                                    )}
                                    <Typography variant={'body2'}>
                                        Created: {dayjs.utc(issue.creationDate).local().fromNow()}
                                    </Typography>
                                </Card>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
        {project && (
            <CreateIssueDialog
                open={dialogOpen}
                projectId={projectId!}
                issuePrefix={project.issuePrefix}
                onClose={handleDialogClose}
            />
        )}
    </>
}

export default ProjectIssues;
