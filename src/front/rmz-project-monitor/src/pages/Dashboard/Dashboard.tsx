import ProjectsList from './../../components/Dashboard/ProjectsList/ProjectsList.tsx'
import StatusGraphic from './../../components/Dashboard/StatusGraphic/StatusGraphic.tsx'
import './Dashboard.css'
import {Card, Alert} from "@mui/material";
import {useState} from 'react';

function Dashboard(alert) {
    return <>
        <div className={'dashboard-container'}>
            <Card className={'dashboard-card'}>
                <ProjectsList />
            </Card>
            <Card className={'dashboard-card'}>
                <StatusGraphic />
            </Card>
        </div>
    </>
}

export default Dashboard;