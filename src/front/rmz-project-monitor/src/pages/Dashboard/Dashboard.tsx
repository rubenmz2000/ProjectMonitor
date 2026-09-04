import ProjectsList from './../../components/Dashboard/ProjectsList/ProjectsList.tsx'
import StatusGraphic from './../../components/Dashboard/StatusGraphic/StatusGraphic.tsx'
import './Dashboard.css'
import {Card} from "@mui/material";

function Dashboard({ alert }: { alert: (message: string, severity?: string) => void }) {
    return <>
        <div className={'dashboard-container'}>
            <Card className={'dashboard-card'}>
                <ProjectsList alert={alert} />
            </Card>
            <Card className={'dashboard-card'}>
                <StatusGraphic />
            </Card>
        </div>
    </>
}

export default Dashboard;