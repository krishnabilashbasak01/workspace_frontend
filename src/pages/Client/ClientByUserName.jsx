import { CalendarArrowUp, Loader2, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { getToken } from '../../hooks/get-token';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button'
import { convertIsoStringTodate } from '../../app/dateformat';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import LineCart from './Chart/LineCart';

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
const ClientByUserName = () => {


    let { username } = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [platforms, setPlatforms] = useState(null)
    const [activePackage, setActivePackage] = useState(null);
    const [packageOpen, setPackageOpen] = useState(false);
    const [tasks, setTasks] = useState(null)
    const [date, setDate] = useState(new Date())
    const [taskSearching, setTaskSearching] = useState(false);

    useEffect(() => {

        if (username && !client) {
            getClient();
        }

        return () => {

        }
    }, [username])

    useEffect(() => {
        if (client) {
            getPostsOfSocialMediaPlatforms();
        }
    }, [client])

    useEffect(() => {
        if (!tasks) {
            getAllTasksByDateRange();
        }
    }, [client])



    // get client by username
    const getClient = async () => {
        if (loading || !username) return;
        setLoading(true);
        try {
            let url = `${import.meta.env.VITE_USER_API_SERVER}/api/client/username/${username}`;
            let response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })
            if (response.status !== 200) {
                // console.log(response);
            }

            setClient(response.data)
            // console.log(response.data);

        } catch (error) {
            // console.log(error);

        } finally {
            setLoading(false);
        }
    }

    // const get number of post of each social media from weekly calendar
    const getPostsOfSocialMediaPlatforms = async () => {
        if (client) {
            let _platforms = [];
            for (const platform of client.platforms) {
                let _platform = { ...platform, contexts: [] };
                for (const context of platform.contexts || []) {

                    let _context = context;
                    const metrics = platform.socialMediaMetrics.filter(({ metricType }) => metricType === context.name);
                    const last_metric = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
                    _context.last_metric = last_metric;
                    _platform.contexts.push(_context)
                }
                _platforms.push(_platform)

            }

            // console.log(_platforms);

            let platformPostCounts = monthlyNoOfPosts();
            if (platformPostCounts) {
                // console.log('platformWeeklyPosts', platformPostCounts);

                _platforms = _platforms.map((platform) => ({
                    ...platform,
                    monthlyPostCount: platformPostCounts[platform.name] * 4 || 0
                }))
            }

            // console.log(_platforms);

            setPlatforms(_platforms);
            getActivePackage();
        }
    }


    // get client active package
    const getActivePackage = async () => {
        if (client) {
            let _package = client && client.packages && client.packages.find((p) => p.status === true);
            // console.log('active package : ',  _package.activationDate);

            setActivePackage(_package);

        }
    }

    // get all tasks by date range
    const getAllTasksByDateRange = async () => {

        if (client && client.id) {
            setTaskSearching(true);
            let startDate, endDate;
            if (date.from && date.to) {
                startDate = format(new Date(date.from), 'yyyy-MM-dd');
                endDate = format(new Date(date.to), 'yyyy-MM-dd');
            } else {
                const now = new Date();
                const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)

                startDate = format(firstDayOfPrevMonth, 'yyyy-MM-dd');
                endDate = format(lastDayOfPrevMonth, 'yyyy-MM-dd');

            }

            try {


                const clientId = client?.id;

                let response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/task/get-tasks-of-client-by-date-range`,
                    {
                        params: {
                            clientId: clientId, startDate: startDate, endDate: endDate
                        },
                        headers: {
                            'Authorization': `Bearer ${getToken()}`
                        }
                    })

                const _tasks = response.data;

                // Create object to store platform task counts
                let platformTasks = {};
                let extraTasks = 0;

                let _count = monthlyNoOfPosts();
                // console.log('_count', _count);


                _tasks.forEach(task => {
                    if (task.calendarEntry && task.calendarEntry.socialMediaPlatform) {
                        // Task belongs to a platform
                        const platform = task.calendarEntry.socialMediaPlatform.name;

                        if (!platformTasks[platform]) {
                            platformTasks[platform] = {
                                monthly: 0,
                                total: 0,
                                completed: 0,
                                inProgress: 0,
                                inQueue: 0
                            };
                        }

                        platformTasks[platform].total++;
                        platformTasks[platform].monthly = _count[platform] ? _count[platform] * 4 : 0;


                        // Count by status
                        if (task.status.name === "Posting Complete") {
                            platformTasks[platform].completed++;
                        } else if (task.status.name === "Work In Progress") {
                            platformTasks[platform].inProgress++;
                        } else if (task.status.name === "In Queue") {
                            platformTasks[platform].inQueue++;
                        }

                    } else {
                        // Task doesn't belong to any platform - count as extra
                        extraTasks++;
                    }
                });


                // Count extra tasks by status
                let extraTasksDetails = {
                    total: extraTasks,
                    completed: 0,
                    inProgress: 0,
                    inQueue: 0
                };

                // Count status for extra tasks
                _tasks.forEach(task => {
                    if (!task.calendarEntry || !task.calendarEntry.socialMediaPlatform) {
                        if (task.status.name === "Posting Complete") {
                            extraTasksDetails.completed++;
                        } else if (task.status.name === "Work In Progress") {
                            extraTasksDetails.inProgress++;
                        } else if (task.status.name === "In Queue") {
                            extraTasksDetails.inQueue++;
                        }
                    }
                });

                // console.log("Platform Tasks:", platformTasks);
                // console.log("Extra Tasks:", extraTasksDetails);
                setTasks({
                    platforms: platformTasks,
                    extras: extraTasksDetails
                });

            } catch (error) {
                console.log(error);
            } finally {
                setTaskSearching(false);
            }
        }
    }

    // get monthly no of post of each social media platforms
    const monthlyNoOfPosts = () => {
        // console.log(client);
        if (client) {
            let platformEntries = {};
            client.weeklyCalendar?.forEach((day) => {


                day?.entries.forEach((entry) => {
                    const platform = entry.socialMediaPlatform.name;
                    if (!platformEntries[platform]) {
                        platformEntries[platform] = 0;
                    }
                    platformEntries[platform] += entry.quantity || 1
                })
            })

            return platformEntries;
        } else {
            return null;
        }
    }

    if (!client && loading) {
        return <div className={`w-screen h-screen flex justify-center items-center`}>
            <Loader2 size={40} className={`animate-spin`} />
        </div>
    }

    if (!client && !loading) {
        return <div className={`w-screen h-screen flex justify-center items-center`}>
            <Loader2 size={40} className={`animate-spin`} />
        </div>
    }

    return (<>
        <div className="bg-white dark:bg-zinc-950 text-black dark:text-white min-h-screen flex flex-col justify-center items-center gap-5 px-10 py-10 font-mono">
            <Card className="w-screen md:w-[450px] lg:w-[450px] ">
                <CardHeader className={`flex flex-col justify-center items-center p-2`}>
                    <img src={`${client.profilePicture}`} className='w-20 h-20 object-cover object-center rounded-full border' />
                    <CardTitle>{`${client.name}`}</CardTitle>
                    <CardDescription>({`${client.businessName}`})</CardDescription>
                    <CardDescription>{`${client.businessName}`}</CardDescription>
                    <Collapsible
                        open={packageOpen}
                        onOpenChange={setPackageOpen}
                        className="w-full space-y-2"
                    >
                        <div className="flex items-center justify-center space-x-4 px-4">
                            <h4 className="text-sm font-semibold text-center">
                                {activePackage?.package?.name} {activePackage && activePackage.activationDate && convertIsoStringTodate(activePackage.activationDate).date} - Till Now
                            </h4>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-9 p-0">
                                    <ChevronsUpDown className="h-4 w-4" />
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent className="space-y-2">
                            {client?.packages?.map((_package) => (
                                <div key={`package${_package.id}`} className="mx-2 rounded-md border border-zinc-500 px-4 py-3 font-mono  flex justify-center items-center gap-4">
                                    <p className='text-sm'> {_package.package.name} </p> <p className='text-xs'>{convertIsoStringTodate(_package.activationDate).date} - {_package.deactivationDate ? convertIsoStringTodate(_package.deactivationDate).date : 'Till Now'}</p>

                                </div>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                </CardHeader>
                <CardContent>
                </CardContent>
            </Card>




            {/* Date range ende */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Social Media Platforms</CardTitle>
                </CardHeader>
                <CardContent className={`flex flex-col gap-2`}>
                    {platforms && platforms.map((platform) => (
                        <Card key={`platform_${platform.name}`} className="w-full">
                            <CardHeader>
                                <CardTitle className={`flex items-center gap-5`}><img src={`${platform.icon}`} className={`w-10 h-10`} />{platform.name}</CardTitle>

                            </CardHeader>
                            <CardContent >
                                <Card className="w-full">
                                    <CardHeader>
                                        <CardTitle>Contexts</CardTitle>
                                    </CardHeader>
                                    <CardContent className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 `}>
                                        {
                                            platform.contexts && platform.contexts.map((context) => (
                                                <Card key={`context_${context.id}`} className="w-full">
                                                    <CardContent >
                                                        <div className={`flex flex-col justify-center items-center pt-4 gap-2`}>
                                                            <h3 className={`font-mono font-bold text-sm text-center`}>{context.name && context.name}</h3>
                                                            <Separator />
                                                            <p className={`font-mono font-bold text-sm`}>{context.last_metric && context.last_metric.value}</p>

                                                        </div>

                                                        {context.last_metric && <p className={`text-[8px] text-center`}>Last Update : {context.last_metric && convertIsoStringTodate(context.last_metric.date).date}</p>}

                                                    </CardContent>
                                                </Card>
                                            ))
                                        }

                                    </CardContent>
                                </Card>

                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
            <Card className="w-full">
                <CardHeader className={`flex flex-row justify-between`}>
                    <div>
                        <CardTitle>Work report</CardTitle>
                        <CardDescription>Here you can see all report of work progress</CardDescription>
                    </div>
                    <div className='flex flex-row gap-1'>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline"><CalendarArrowUp /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Calender</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Select Date Range
                                        </p>
                                    </div>
                                    <div className="">
                                        <Calendar
                                            mode="range"
                                            selected={date}
                                            onSelect={setDate}
                                        />
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button onClick={() => {
                            getAllTasksByDateRange()
                        }} >{taskSearching ? <Loader2 className='animate-spin' /> : <SearchIcon />}</Button>
                    </div>

                </CardHeader>
                <CardContent>
                    <Table className="w-full border-collapse border border-slate-500">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="border border-slate-600">Id</TableHead>
                                <TableHead className="border border-slate-600">Platform</TableHead>
                                <TableHead className="border border-slate-600">No / Month</TableHead>
                                <TableHead className="border border-slate-600">Total</TableHead>
                                <TableHead className="border border-slate-600">Post Done</TableHead>
                                <TableHead className="border border-slate-600">In Progress</TableHead>
                                <TableHead className="border border-slate-600">In Queue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks &&
                                Object.entries(tasks.platforms).map(([platform, data], index) => (
                                    <TableRow key={`task_${index}`}>
                                        <TableCell className={`border border-slate-600`}>{index + 1}</TableCell>
                                        <TableCell className={`border border-slate-600`}>{platform}</TableCell>
                                        <TableCell className={`border border-slate-600`}>{data.monthly}</TableCell>
                                        <TableCell className={`border border-slate-600`}>{data.total}</TableCell>
                                        <TableCell className={`border border-slate-600`}>{data.completed}</TableCell>
                                        <TableCell className={`border border-slate-600`}>{data.inProgress}</TableCell>
                                        <TableCell className={`border border-slate-600`}>{data.inQueue}</TableCell>
                                    </TableRow>
                                ))}
                            {tasks && tasks.extras && (
                                <TableRow>
                                    <TableCell className={`border border-slate-600`}>{Object.keys(tasks.platforms).length + 1}</TableCell>
                                    <TableCell className={`border border-slate-600`}>Extra Tasks</TableCell>
                                    <TableCell className={`border border-slate-600`}>N/A</TableCell>
                                    <TableCell className={`border border-slate-600`}>{tasks.extras.total}</TableCell>
                                    <TableCell className={`border border-slate-600`}>{tasks.extras.completed}</TableCell>
                                    <TableCell className={`border border-slate-600`}>{tasks.extras.inProgress}</TableCell>
                                    <TableCell className={`border border-slate-600`}>{tasks.extras.inQueue}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>



        </div>
    </>);

}



export default ClientByUserName;