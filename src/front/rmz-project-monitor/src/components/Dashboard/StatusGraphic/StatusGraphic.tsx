import {Typography} from "@mui/material";
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#2f80ed', '#555555', '#e74c3c'];

function StatusGraphic() {
    const data = [
        { name: 'In Progress', value: 1 },
        { name: 'Paused', value: 2 },
    ]
    return <>
        <div className={'card-container'}>
            <Typography variant={'h5'}>Projects Status</Typography>
            <div>
                <PieChart width={400} height={400}>
                    <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                        {data.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index]} />
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