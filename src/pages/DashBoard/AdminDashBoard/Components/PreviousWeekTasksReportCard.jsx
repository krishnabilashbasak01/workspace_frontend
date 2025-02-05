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
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { useState, useEffect } from "react";
import axios from 'axios';
import { getToken } from '@/hooks/get-token';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PreviousWeekTasksReportCard = () => {

    const [weeklyTasks, setWeeklyTasks] = useState(null);

    // Get the previous week's date range
    const getPreviousWeekDateRange = () => {
        const previousWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
        const previousWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });

        return {
            from: format(previousWeekStart, "MM/dd/yyyy"),
            to: format(previousWeekEnd, "MM/dd/yyyy")
        };
    };

    useEffect(() => {
      if(!weeklyTasks){
        getWeeklyTasks();
      }
    
      return () => {
        
      }
    }, [weeklyTasks])
    

    // Fetch the weekly tasks (Here you simulate fetching with async)
    const getWeeklyTasks = async () => {
        // Await the resolved result of getPreviousWeekDateRange to get start and end dates
        const { from, to } = getPreviousWeekDateRange();

        try {
            const response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/task/get-all-task-by-date-and-range/`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                params: { from: from, to: to, dateType: 'workDate', }
            })
            // console.log(response.data);

            if (response.status === 200) {
                // setData(response.data);
                const formattedTasks = Object.entries(
                    response.data.reduce((acc, { workDate }) => {
                        acc[workDate] = (acc[workDate] || 0) + 1;
                        return acc;
                    }, {})
                ).map(([date, tasks]) => ({ date :format(date, "MM/dd/yyyy"), tasks }));

                setWeeklyTasks(formattedTasks)
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (<>
        <Card className={`font-mono w-full`}>
            <CardContent className={`text-sm text-center mt-5`}>
               
                {weeklyTasks &&
                    <>
                     
                        <ResponsiveContainer width="100%" height={145}>
                            <LineChart data={weeklyTasks}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Line type="monotone" dataKey="tasks" stroke="#8884d8" strokeWidth={2} />
                                <Tooltip />
                            </LineChart>
                            <p className="text-center"> Previous Week Data</p>
                        </ResponsiveContainer>
                    </>

                }

            </CardContent>
        </Card>
    </>)
}
export default PreviousWeekTasksReportCard;