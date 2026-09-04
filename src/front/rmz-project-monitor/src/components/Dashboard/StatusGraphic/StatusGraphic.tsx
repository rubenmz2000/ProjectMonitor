import {Typography} from "@mui/material";
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import type {StatusCount} from '../../../models/StatusCount.ts';
import {useState, useEffect} from 'react'
import {getStatusCount} from '../../../serivces/ApiService.ts'

const COLORS: Record<string, string> = {
    NotStarted: '#555555',
    InProgress: '#2f80ed',
    Paused: '#e74c3c',
    Completed : '#27ae60',
    Archived: '#2c3e50'
};

function StatusGraphic() {
    const [data, setData] = useState<{ name: string, count: number }[]>([]);
    
    useEffect(() => {
        const fetchCount = async () => {
            const count: StatusCount[] = await getStatusCount();
            const mapped = count.map((d: StatusCount) => ({name: d.status, count: d.count})).filter((d) => d.count > 0);
            setData(mapped);
        }
        
        fetchCount();
    },[])
    return <>
        <div className={'card-container'}>
            <Typography variant={'h5'}>Projects Status</Typography>
            <div>
                <PieChart width={500} height={500}>
                    <Pie data={data} dataKey="count" cx="50%" cy="50%" outerRadius={100} label={({ name }) => `${name}`}>
                        {data.map((entry, index) => (
                            <Cell key={index} fill={COLORS[entry.name]} />
                        ))}                    
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        </div>
    </>
}

export default StatusGraphic;