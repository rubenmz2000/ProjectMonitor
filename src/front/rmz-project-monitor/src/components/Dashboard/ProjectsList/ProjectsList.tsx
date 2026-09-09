import {useState, useEffect} from 'react'
import {Button, Card, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import './../../../pages/Dashboard/Dashboard.css';
import type {Project} from '../../../models/ProjectModel.ts';
import {getLatestProjects} from '../../../serivces/ApiService.ts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import CreateProjectDialog from '../../Dialogs/CreateProject/CreateProjectDialog.tsx'
import { useAlert } from '../../../rmz-ui/index.ts';

function ProjectsList() {
    const { notify } = useAlert();
    const [projects, setProjects] = useState<Project[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const handleClickOpen = () => {
        setDialogOpen(true);
    };
    const handleClose = (result: string) => {
        if (result === 'cancel') {
            // User cancelled, no action needed
        } else if (result === 'submit') {
            notify('Project created successfully');
        } else {
            notify('An error occurred while creating the project', 'error');
        }
        setDialogOpen(false);
    };
    
    dayjs.extend(utc);
    dayjs.extend(relativeTime);
    
    useEffect( () => {
        const fetchProjects = async () => { 
        const data = await getLatestProjects();
            setProjects(data);
        };
        
        fetchProjects();
    }, []);
    return <>
        <div className={'card-container'}>
            <Typography variant={'h5'}>Recent Projects</Typography>
            <div className={'projects-list'}>
                {projects.map((project, index) => (
                    <Card key={index} className={'project-card'}>
                        <Typography variant={"h6"}>{project.name}</Typography>
                        <Typography variant={"body2"}>{project.status}</Typography>
                        <Typography variant={'body2'}>{dayjs.utc(project.updatedAt).local().fromNow()}</Typography>
                    </Card>
                ))}
                <Button sx={{ height: '70px', fontFamily: 'Rajdhani', fontSize: '1.5rem' }} onClick={() => handleClickOpen()} variant={"contained"}>
                    <AddIcon sx={{ marginRight: '10px' }} /> Add Project
                </Button>
            </div>
        </div>
        <CreateProjectDialog open={dialogOpen} onClose={handleClose} />
    </>
}

export default ProjectsList;
