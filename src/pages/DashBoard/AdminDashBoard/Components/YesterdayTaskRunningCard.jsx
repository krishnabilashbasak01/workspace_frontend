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
import axios from 'axios';
import { useState, useEffect } from "react";
import { format } from 'date-fns'
import { getToken } from '@/hooks/get-token'
const YesterdayTaskRunningCard = () => {
    const [data, setData] = useState(null);


    const getYesterdayDate = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return format(yesterday, "MM/dd/yyyy"); // Using 'date-fns' to format the date
    };

    useEffect(() => {
        if (!data) {
            getTasksOfYesterday()
        }
        return () => {
        }
    }, [data])


    // get task of yesterday
    const getTasksOfYesterday = async () => {
        const yesterday = getYesterdayDate();
        try {
            const response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/task/get-all-task-by-date-and-range/`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                params: { from: yesterday, dateType: 'workDate', }
            })
            if (response.status === 200) {
                setData(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (<>
        {data && <Card className={`font-mono`}>
            <CardHeader className={`flex flex-row justify-between items-center  bg-blue-100  dark:bg-zinc-800`}>
                <ListTodo size={40} />
             
                <div className="flex flex-col gap-2">
                    <CardTitle>Yesterday</CardTitle>
                    <CardDescription>Tasks Progress</CardDescription>
                </div>

            </CardHeader>
            
            <CardContent className={`text-sm text-center mt-5`}>
                <p>Done / Total : {data && data.filter((task)=> ['Posting Complete', 'Hand Overed To Client'].includes(task.status.name)).length}/{data && data.length} </p>
            </CardContent>
        </Card>}
    </>)
}
export default YesterdayTaskRunningCard;