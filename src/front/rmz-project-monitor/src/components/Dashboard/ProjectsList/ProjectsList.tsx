import {useState, useEffect} from 'react'
import {Button, Card, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import './../../../pages/Dashboard/Dashboard.css';
import type {Project} from '../../../models/ProjectModel.ts';
import {getLatestProjects} from '../../../serivces/ApiService.ts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

function ProjectsList() {
    const [projects, setProjects] = useState<Project[]>([]);
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
                        <Typography variant={'body2'}>{dayjs(project.updatedAt).fromNow()}</Typography>
                    </Card>
                ))}
                <Button sx={{ height: '70px', fontFamily: 'Rajdhani', fontSize: '1.5rem' }} variant={"contained"}>
                    <AddIcon sx={{ marginRight: '10px' }} /> Add Project
                </Button>
            </div>
        </div>
    </>
}

export default ProjectsList;