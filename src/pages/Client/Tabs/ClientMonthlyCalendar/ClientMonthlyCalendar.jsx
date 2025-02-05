import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Calendar from "@/components/app/Calendar";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { add } from "date-fns";
import axios from "axios";
import { getToken } from "../../../../hooks/get-token.js";

import CreateManualTaskTab from "./Tabs/CreateManualTaskTab.jsx";
import CreateScheduleTaskTab from "./Tabs/CreateScheduleTaskTab.jsx";
import TasksTab from "./Tabs/Tasks.jsx";
import { getSocket } from "../../../../app/socket.js";
import tasks from "./Tabs/Tasks.jsx";
import ManualPost from "./Tabs/ManualPost.jsx";
import { format } from 'date-fns';

const ClientMonthlyCalendar = ({ client, loading, getClient, setLoading }) => {
    const { toast } = useToast();
    const socket = getSocket();
    const user = useSelector(state => state.auth.user);
    const users = useSelector(state => state.users.users);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [calendar, setCalendar] = useState(null);
    const [weekDays, setWeekDays] = useState([]);
    const [selectedTasks, setSelectedTasks] = useState(null);
    const [selectedWeeklyCalendar, setSelectedWeeklyCalendar] = useState(null);
    const [postTypes, setPostType] = useState(null);
    const [statuses, setStatuses] = useState(null);

    const handlePrevMonth = () => setCurrentMonth(add(currentMonth, { months: -1 }));
    const handleNextMonth = () => setCurrentMonth(add(currentMonth, { months: 1 }));

    useEffect(() => {
        if (socket) {
            const taskCreationListener = (data) => {
                // console.log(data);
                if (data.error) {
                    toast({
                        title: "Error!",
                        description: data.error,
                        variant: "destructive",
                    });
                } else {
                    if (data?.tasks?.tasks.length > 0) {
                        setSelectedTasks(data?.tasks?.tasks);
                        getDaysOfMonth();
                    }
                    toast({
                        title: "Success!",
                        description: data.message,
                    });
                }
            };

            socket.on("task_creation_response", taskCreationListener);

            socket.on("tasks", (data) => console.log("Tasks", data));

            // Cleanup listeners
            return () => {
                socket.off("task_creation_response", taskCreationListener);
                socket.off("tasks");
            };
        }
    }, [])

    useEffect(() => {
        if (!calendar) {
            getDaysOfMonth()
        }
    }, [calendar]);
    useEffect(() => {
        getDaysOfMonth();
    }, [currentMonth])

    // Get Calender Data
    const getDaysOfMonth = async () => {
        setCalendarLoading(true)
        try {
            let response =
                await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/calendar/days-of-month/?month=${currentMonth.getMonth() + 1}&year=${currentMonth.getFullYear()}&clientId=${client.id}`, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                });


            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while fetching calendar",
                })
            }
            
            // console.log('data',response.data.days);
            if(selectedDate){

                let sDate = format(selectedDate, 'yyyy-MM-dd');
                let day = response.data.days.filter(day => day.day === sDate);                
                
                if(day.length > 0 && day[0].tasks){
                    setSelectedTasks(day[0].tasks);
                }else{
                    
                }
            }
            

            setCalendar(response.data.days);
            setWeekDays(response.data.weekdayNames);

        } catch (err) {
            
            toast({
                title: "Error",
                description: "Calendar Getting Error",
            })
        } finally {
            setCalendarLoading(false);
        }
    }


    useEffect(() => {
        if (!statuses) {
            getTaskStatuses();
        }
    }, [statuses])
    useEffect(() => {
        if (!postTypes) {
            getPostTypes()
        }
    }, [postTypes])

    // Get task status
    const getTaskStatuses = async () => {
        try {
            let response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/task/task-status/all`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })
            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while fetching task statuses",
                    variant: "destructive"
                })
            }
            setStatuses(response.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while fetching task status",
                variant: "destructive",
            })
        }
    }

    // Get Post Type
    const getPostTypes = async () => {
        try {
            let response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/post-type/all`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })
            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while fetching post type",
                    variant: "destructive",
                })
            }

            setPostType(response.data);
        } catch (e) {
            console.log(e);
        }
    }

    //
    const [taskTitle, setTaskTitle] = useState('');
    const [calendarEntry, setCalendarEntry] = useState(null);
    const [selectedPostType, setSelectedPostType] = useState(null);
    const [scheduleDate, setScheduleDate] = useState(null); // No explicit type annotation

    const [taskCreating, setTaskCreating] = useState(false);


    const onSubmitCreateTask = async () => {
        setTaskCreating(true);
        if (client?.id && taskTitle !== '' && selectedPostType && calendarEntry && scheduleDate) {
            const data = {
                clientId: client.id,
                title: taskTitle,
                postTypeId: selectedPostType.id,
                calendarEntryId: calendarEntry.id,
                scheduleDate: scheduleDate,
                statusId: 1
            };

            // console.log(data);
            if (socket) {
                socket.emit('create_task', data, (response) => {
                    if (response.status === "success") {
                        setTaskCreating(false);

                    } else {
                        setTaskCreating(false);
                        toast({
                            title: "Error!",
                            description: response.message,
                            variant: "destructive"
                        })

                    }
                });
                // setTaskCreating(false);
            }
        } else {
            setTaskCreating(false);
            toast({
                title: "Error",
                description: "Enter all necessary fields",
                variant: "destructive",
            })
        }


    }

    return (
        <>
            <TabsContent value={'monthly-calendar'}>
                <Card className="w-full">
                    <CardHeader className={`flex flex-row justify-between items-center`}>
                        <div>
                            <CardTitle>Monthly Calendar</CardTitle>
                            <CardDescription>
                                Task to client can be schedule and update here
                            </CardDescription>
                        </div>

                    </CardHeader>
                    <CardContent className={`space-y-2`}>
                        <div className={`flex flex-col md:flex-row lg:flex-row gap-1 justify-center`}>

                            <Calendar

                                client={client}
                                selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                                currentMonth={currentMonth} setCurrentMonth={setCurrentMonth}
                                calendar={calendar} weekDays={weekDays} handlePrevMonth={handlePrevMonth}
                                handleNextMonth={handleNextMonth} selectedTasks={selectedTasks}
                                setSelectedTasks={setSelectedTasks} setSelectedWeeklyCalendar={setSelectedWeeklyCalendar}
                            />
                            <div>
                                <Card className={`p-2`}>
                                    <Tabs className={`w-fill`} defaultValue="tasks-tab">
                                        <TabsList className="h-8">
                                            <TabsTrigger className="text-xs h-6" value='tasks-tab'>Tasks</TabsTrigger>
                                            <TabsTrigger className="text-xs h-6" value='schedule-task-create'>Create Task</TabsTrigger>
                                            <TabsTrigger className="text-xs h-6" value='manual-task-create'>Create Manual Task</TabsTrigger>
                                            <TabsTrigger className="text-xs h-6" value='manual-post-create'>Create Manual Post</TabsTrigger>

                                        </TabsList>
                                        <TasksTab selectedTasks={selectedTasks} getDaysOfMonth={getDaysOfMonth} setSelectedTasks={setSelectedTasks} />
                                        <CreateScheduleTaskTab
                                            client={client} selectedDate={selectedDate} postTypes={postTypes} statuses={statuses}
                                            selectedWeeklyCalendar={selectedWeeklyCalendar} getDaysOfMonth={getDaysOfMonth} setSelectedTasks={setSelectedTasks}
                                        />
                                        <CreateManualTaskTab client={client} selectedDate={selectedDate} postTypes={postTypes} statuses={statuses}
                                            selectedWeeklyCalendar={selectedWeeklyCalendar} getDaysOfMonth={getDaysOfMonth} setSelectedTasks={setSelectedTasks} />
                                        <ManualPost client={client} selectedDate={selectedDate} postTypes={postTypes} statuses={statuses}
                                            selectedWeeklyCalendar={selectedWeeklyCalendar} getDaysOfMonth={getDaysOfMonth} setSelectedTasks={setSelectedTasks} />
                                    </Tabs>
                                </Card>
                            </div>



                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </>
    )
}
export default ClientMonthlyCalendar