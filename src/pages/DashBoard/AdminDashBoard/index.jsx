import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import TodayTaskRunningCard from './Components/TodayTaskRunningCard';
import YesterdayTaskRunningCard from './Components/YesterdayTaskRunningCard';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from '@/components/ui/separator'
import { ListTodo } from 'lucide-react'
import PreviousWeekTasksReportCard from './Components/PreviousWeekTasksReportCard';
import CustomRangeChart from './Components/CustomRangeChart';


const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];

const AdminDashBoard = () => {
    return (<>
    <div className={`w-full flex flex-col gap-4`}>

   
        <div className={`w-full flex flex-col lg:flex-row gap-4`}>
            <div className="flex-none">
                <div className={`grid grid-cols-2 gap-4`}>
                    <TodayTaskRunningCard />
                    <YesterdayTaskRunningCard />
                    
                </div>
            </div>

            <div className={`grow overflow-hidden`}>
                <PreviousWeekTasksReportCard />
            </div>
        </div>
        <CustomRangeChart />
        </div>
    </>)
}
export default AdminDashBoard;