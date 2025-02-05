import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarDays, Loader2, Search } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { Button } from '@/components/ui/button'
import axios from "axios";
import { getToken } from '@/hooks/get-token'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';



const CustomRangeChart = () => {
    const [searching, setSearching] = useState(false);
    const [rangeTasks, setRangeTasks] = useState(null);
    const [date, setDate] = useState({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });

    useEffect(() => {
        if (!rangeTasks) {
            onSearch()
        }
    }, [rangeTasks])


    // on search 
    const onSearch = async () => {
        setSearching(true)
        try {
            const response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/task/get-all-task-by-date-and-range/`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                params: { from: format(date.from, 'MM/dd/yyyy'), to: format(date.to, "MM/dd/yyyy"), dateType: 'workDate', }
            })
            // console.log(response.data);

            if (response.status === 200) {
                // setData(response.data);
                const formattedTasks = Object.entries(
                    response.data.reduce((acc, { workDate }) => {
                        acc[workDate] = (acc[workDate] || 0) + 1;
                        return acc;
                    }, {})
                ).map(([date, tasks]) => ({ date: format(date, "MM/dd/yyyy"), tasks }));

                // console.log(formattedTasks);

                setRangeTasks(formattedTasks)
            }
        } catch (error) {
            console.log(error);
        } finally {
            setSearching(false)
        }
    }

    return (<>
        <Card className={`font-mono w-full`}>
            <CardHeader className={`flex flex-row justify-between items-center bg-blue-100  dark:bg-zinc-800`}>


                <div className="flex flex-col gap-2">
                    <CardTitle>Task Data by Date Range</CardTitle>
                    <CardDescription>Initially Current Month Selected</CardDescription>
                </div>

                <div className={`flex flex-row gap-2 justify-center items-center`}>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button variant="outline"><CalendarDays /></button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <Calendar
                                mode="range"
                                selected={date}
                                onSelect={setDate}
                            />
                        </PopoverContent>
                    </Popover>
                    {searching ? <Loader2 className={`animate-spin`} /> : <Button onClick={onSearch}><Search /></Button>}
                </div>

            </CardHeader>

            <CardContent className={`text-sm text-center mt-5`}>


                {rangeTasks &&
                    <>

                        <ResponsiveContainer width="100%" height={145}>
                            <LineChart data={rangeTasks}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Line type="monotone" dataKey="tasks" stroke="#8884d8" strokeWidth={2} />
                                <Tooltip />
                            </LineChart>
                            <p className="text-center"> {format(date.from, 'MM/dd/yyyy')} - {format(date.to, 'MM/dd/yyyy')} </p>
                        </ResponsiveContainer>
                    </>

                }

            </CardContent>
        </Card>

    </>)
}
export default CustomRangeChart;