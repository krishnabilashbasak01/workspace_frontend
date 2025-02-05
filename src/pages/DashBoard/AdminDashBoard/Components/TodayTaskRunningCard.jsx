import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
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

const TodayTaskRunningCard = () => {
    const tasksInQueue = useSelector((state) => state.tasks_in_queue.tasks_in_queue);

    return (<>
        <Card className={`font-mono`}>
            <CardHeader className={`flex flex-row justify-between items-center  bg-blue-100  dark:bg-zinc-800`}>
                <ListTodo size={40} />
             
                <div className="flex flex-col gap-2">
                    <CardTitle>Today</CardTitle>
                    <CardDescription>Tasks Progress</CardDescription>
                </div>

            </CardHeader>
            
            <CardContent className={`text-sm text-center mt-5`}>

                <p className=''>In Progress : {tasksInQueue && tasksInQueue.filter((task) => ['Work In Progress', 'In Queue', 'In Queue'].includes(task.status.name)).length}</p>
                <p>Done / Total : {tasksInQueue && tasksInQueue.filter((task) => ['Posting Complete', 'Hand Overed To Client'].includes(task.status.name)).length}/{tasksInQueue && tasksInQueue?.length}</p>

            </CardContent>
        </Card>
    </>)
}
export default TodayTaskRunningCard;