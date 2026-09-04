import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Button, Typography, CircularProgress, Alert, Box, Card } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Project } from '../../models/ProjectModel.ts';
import type { ProjectTask } from '../../models/ProjectTaskModel.ts';
import { getProjectById, getProjectTasks } from '../../serivces/ApiService.ts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import CreateTaskDialog from '../../components/Dialogs/CreateTask/CreateTaskDialog.tsx';

dayjs.extend(utc);
dayjs.extend(relativeTime);

function ProjectTasks({ triggerAlert }: { triggerAlert: (message: string, severity?: string) => void }) {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const [projectData, tasksData] = await Promise.all([
                getProjectById(projectId),
                getProjectTasks(projectId)
            ]);
            setProject(projectData);
            setTasks(tasksData);
        } catch (err) {
            setError('Failed to load project or tasks');
            setProject(null);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateTask = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = (result: string, taskIdentifier?: string) => {
        if (result === 'submit') {
            triggerAlert(`Task ${taskIdentifier} created successfully`, 'success');
            fetchData();
        } else if (result === 'error') {
            triggerAlert('An error occurred while creating the task', 'error');
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
                <Typography variant="body1" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                    Project not found.
                </Typography>
            ) : (
                <>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant={'h4'}>
                                {project.name} ({project.taskPrefix})
                            </Typography>
                            <Typography variant={'body2'} color="text.secondary">
                                {project.description}
                            </Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={handleCreateTask}
                        >
                            Create Task
                        </Button>
                    </Box>

                    <Typography variant={'h5'} sx={{ mb: 2 }}>Tasks</Typography>
                    
                    <div className={'projects-list'}>
                        {tasks.length === 0 ? (
                            <Typography variant="body1" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                No tasks yet. Create your first task to get started.
                            </Typography>
                        ) : (
                            tasks.map((task) => (
                                <Card key={task.id} className={'project-card'}>
                                    <Typography variant={"h6"}>{task.taskIdentifier}</Typography>
                                    <Typography variant={"subtitle1"}>{task.title}</Typography>
                                    <Typography variant={"body2"}>Status: {task.status}</Typography>
                                    <Typography variant={"body2"}>Priority: {task.priority}</Typography>
                                    {task.dueDate && (
                                        <Typography variant={'body2'}>
                                            Due: {dayjs.utc(task.dueDate).format('DD/MM/YYYY')}
                                        </Typography>
                                    )}
                                    <Typography variant={'body2'}>
                                        Created: {dayjs.utc(task.creationDate).local().fromNow()}
                                    </Typography>
                                </Card>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
        {project && (
            <CreateTaskDialog 
                open={dialogOpen} 
                projectId={projectId!}
                taskPrefix={project.taskPrefix}
                onClose={handleDialogClose} 
            />
        )}
    </>
}

export default ProjectTasks;
