import {useState, useEffect, useCallback} from 'react'
import {Button, Card, Typography, CircularProgress, Alert, Box} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import './Projects.css'
import type {Project} from '../../models/ProjectModel.ts';
import {getAllProjects} from '../../serivces/ApiService.ts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import CreateProjectDialog from '../../components/Dialogs/CreateProject/CreateProjectDialog.tsx'

dayjs.extend(utc);
dayjs.extend(relativeTime);

function Projects({ triggerAlert }: { triggerAlert: (message: string, severity?: string) => void }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const handleClickOpen = () => {
        setDialogOpen(true);
    };
    const handleClose = (result: string) => {
        if (result === 'submit') {
            triggerAlert('Project created successfully', 'success');
            fetchProjects();
        } else if (result === 'error') {
            triggerAlert('An error occurred while creating the project', 'error');
        }
        setDialogOpen(false);
    };

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllProjects();
            setProjects(data);
        } catch (err) {
            setError('Failed to load projects');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return <>
        <div className={'card-container'}>
            <Typography variant={'h5'}>All Projects</Typography>
            <div className={'projects-list'}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {error}
                        <Button onClick={fetchProjects} sx={{ ml: 2 }} size="small" variant="outlined">
                            Retry
                        </Button>
                    </Alert>
                ) : projects.length === 0 ? (
                    <Typography variant="body1" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                        No projects yet. Create your first project to get started.
                    </Typography>
                ) : (
                    projects.map((project) => (
                        <Card key={project.id} className={'project-card'}>
                            <Typography variant={"h6"}>{project.name}</Typography>
                            <Typography variant={"body2"}>{project.status}</Typography>
                            <Typography variant={'body2'}>{dayjs.utc(project.updatedAt).local().fromNow()}</Typography>
                        </Card>
                    ))
                )}
                <Button sx={{ height: '70px', fontFamily: 'Rajdhani', fontSize: '1.5rem' }} onClick={() => handleClickOpen()} variant={"contained"}>
                    <AddIcon sx={{ marginRight: '10px' }} /> Add Project
                </Button>
            </div>
        </div>
        <CreateProjectDialog open={dialogOpen} onClose={handleClose} />
    </>
}

export default Projects;
