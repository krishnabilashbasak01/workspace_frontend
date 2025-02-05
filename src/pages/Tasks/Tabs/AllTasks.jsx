import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSelector, useDispatch } from 'react-redux';
import { getSocket } from "@/app/socket";
import { ChevronRight, EllipsisVertical, Pencil, PersonStanding, User, CircleX, BetweenHorizonalStart } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { convertIsoStringTodate } from "@/app/dateformat";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Modal, {
    ModalHead,
    ModalMain,
    ModalClose,
    ModalBody,
    ModalFooter,
} from "@/components/app/Modal";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import InQueue from "../Components/TaskPhases/InQueue";
import WorkInProgress from "../Components/TaskPhases/WorkInProgress";
import JobSubmitted from "../Components/TaskPhases/JobSubmitted";
import NeedClientApproval from "../Components/TaskPhases/NeedClientApproval";
import ClientApproved from "../Components/TaskPhases/ClientApproved";
import NeedReWork from "../Components/TaskPhases/NeedReWork";
import ReworkInProgress from "../Components/TaskPhases/ReworkInProgress";
import ReworkSubmitted from "../Components/TaskPhases/ReworkSubmitted";
import ReworkNeedApproval from "../Components/TaskPhases/ReworkNeedApproval";
import ReworkApproved from "../Components/TaskPhases/ReworkApproved";
import PostingStarted from "../Components/TaskPhases/PostingStarted";
import PostComplete from "../Components/TaskPhases/PostComplete";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

const AllTasks = () => {
    const { toast } = useToast();
    const [tasks, setTasks] = useState([]);
    const user = useSelector((state) => state.auth.user);
    const users = useSelector((state) => state.users.users);
    const tasksInQueue = useSelector((state) => state.tasks_in_queue.tasks_in_queue)
    const dispatch = useDispatch();
    const socket = getSocket();
    const [designers, setDesigners] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskEditModal, setTaskEditModal] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedDesigner, setSelectedDesigner] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        // console.log('Component mounted or socket changed');
        if (!socket) return;
        const handleReceiveTasks = async (data) => {

            if (!tasks.length > 0) { setTasks(data) } else {
                setTasks((prevTasks) => {

                    return prevTasks.map((task) => {
                        const updatedTask = data.find((d) => d.id === task.id);
                        return updatedTask ? { ...task, ...updatedTask } : task;
                    });
                });
            }


        };
        socket.on('receive_tasks', handleReceiveTasks);
        // Cleanup function to remove the event listener
        return () => {
            // console.log('Cleaning up socket listener');
            socket.off('receive_tasks', handleReceiveTasks);
        };



    }, [socket, tasks])
    useEffect(() => {

        if (socket) {
            socket.on('tasks_in_queue', (data) => {
                // console.log('new data', data);
                dispatch(setTasksInQueue(data));
                setTempInQueue(data)


                // have add tasks in slice store
            })

            return () => {
                socket.off('tasks_in_queue')
            }
        }
    }, [socket])


    useEffect(() => {

        if (!tasks.length > 0 && user) {
            getTasks()
        }

    }, [user])

    useEffect(() => {
        if (!designers) {
            getDesigners()
        }
    }, [users, designers]);

    // get designer
    const getDesigners = () => {

        if (users && users.length > 0) {
            const _designers = users?.filter(({ role }) => role.name.toLowerCase() === 've' || role.name.toLowerCase() === 'gd');

            if (_designers.length > 0) {
                setDesigners(_designers);
            } else {
                setDesigners([]); // Ensure designers is an empty array if no match
            }
        }
    }

    // get Tasks
    const getTasks = () => {
        setIsLoading(true);
        try {
            if (!user || !socket) return;
            let data = {}
            if (user) {
                data.userType = user.role.name;
                data.userId = user._id;
                if (socket) {
                    socket.emit('get_tasks', data);
                }
            }
        } catch (e) {

        } finally {
            setIsLoading(false);
        }

    }

    const getDesignerById = (id) => {
        // console.log(users);

        let _designer = users?.find(({ _id }) => _id === id);

        if (_designer) {
            return (
                <div className={`flex flex-row gap-1 items-center`}>
                    <PersonStanding size={16} />
                    <p className={`text-sm ${_designer.online ? 'text-green-500' : ''}`}>{_designer.name.split(' ')[0]}</p>
                </div>
            )
        }


        return ''
    }

    // Task Date time component
    function TaskDateTimeComponent({ task }) {
        // console.log(task);

        const _sDate = convertIsoStringTodate(task.scheduleDate).date;
        const _sTime = convertIsoStringTodate(task.scheduleDate).time;
        const _wDate = task.workDate ? convertIsoStringTodate(task.workDate).date : '';
        const _platform = task.calendarEntry ? <img className={`w-5 h-5`} src={task.calendarEntry.socialMediaPlatform.icon} /> : '';
        const _cPostType = task.calendarEntry?.postType ? task.calendarEntry?.postType.name : '';
        const _wPostType = task.postType ? task.postType.name : '';
        const _status = task.status ? task.status.name : ''
        const designer = task.designerId ? getDesignerById(task.designerId) : ''
        return (
            <>
                <div>
                    <p className="text-xs">S: {_sDate} {_sTime} / W: {_wDate}</p>
                </div>
                <div className="flex flex-row gap-1 items-center">

                    <p className="text-xs">ST:</p>
                    {_platform}
                    <p className="text-xs">{_cPostType}</p>
                    <p className="text-xs">WT: {_wPostType}</p>
                </div>
                <div className="flex flex-row gap-1 items-center">
                    {designer}
                    <div className="flex flex-row gap-1 items-center">
                        <ChevronRight size={16} />
                        <p className={`text-sm`}>{_status}</p>
                    </div>
                </div>
            </>
        )
    }

    // on task edit modal change
    const onTaskEditModalOpen = () => {
        setTaskEditModal(!taskEditModal);
    }

    // add to bucket
    const addToBucket = ({ task, user }) => {
        // console.log(task);
        // console.log(user);
        let data = {
            task,
            user: {
                smeId: user._id,
                role: user.role.name,
                socketId: user.socketId
            }
        }
        if (socket) {
            socket.emit('add_task_to_bucket', data, (response) => {
                if (response.status === 'success') {
                    toast({
                        title: "Success!",
                        description: response.message,
                    });
                } else {
                    toast({
                        title: "Error!",
                        description: response.message,
                        variant: "destructive"
                    });
                }
            });
        }


    };

    // DropDown Component
    const DropDownMenuComponent = ({ task }) => {
        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button>
                            <EllipsisVertical />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="">
                        {!task.designerId || !task.workDate ? (
                            <>

                            </>
                        ) : ''}
                        <DropdownMenuLabel>Update Task</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>

                            <DropdownMenuItem onClick={() => {
                                setSelectedTask(task);
                                onTaskEditModalOpen();

                            }}>
                                <Pencil />
                                <span>Edit</span>

                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => {
                                if (user.role.name.toLowerCase() === 'sme') {

                                    addToBucket({ task, user })
                                } else {
                                    toast({
                                        title: "Error!",
                                        description: `${user.role.name} Don't have permission to add task in Bucket`
                                    })
                                }
                            }}>
                                <BetweenHorizonalStart />
                                <span>Add To Bucket</span>
                            </DropdownMenuItem>

                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

            </>

        )
    }


    // Update task
    const updateTask = async () => {
        setIsUpdating(true)
        if (selectedTask && selectedDesigner) {
            // console.log(selectedTask);
            const data = {
                id: selectedTask.id,
                title: selectedTask.title,
                workDate: selectedTask.workDate,
                designerId: selectedDesigner._id,
                user: user
            }

            if (data.id && data.title && data.workDate && data.designerId) {
                if (socket) {
                    socket.emit("update_task", data)
                    setIsUpdating(false)
                    await getTasks();
                    toast({
                        title: "Success",
                        description: "Successfully updated",

                    })
                    onTaskEditModalOpen();
                }



            } else {
                setIsUpdating(false)

                toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                })
            }
        } else {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
            setIsUpdating(false)

        }
    }

    return (<>
        <TabsContent value={`all-tasks`}>
            <div className={`p-4 `}>
                <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2`}>

                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Task Queue</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InQueue />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Task in Progress</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <WorkInProgress />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Task Completed</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <JobSubmitted />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Need Client Approval</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NeedClientApproval />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Client Approved</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ClientApproved />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Need Rework</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NeedReWork />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Rework In Progress</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReworkInProgress />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Rework Complete</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReworkSubmitted />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Rework Need Client Approval</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReworkNeedApproval />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Rework Approved</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReworkApproved />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Posting Started</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PostingStarted />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Posting Complete</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PostComplete />
                        </CardContent>
                    </Card>
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle className={`text-center`}>Hand Overed to client</CardTitle>
                            <CardDescription className={`text-center`}  >Here is all task of today</CardDescription>
                        </CardHeader>
                        <CardContent>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
        <Modal

            open={taskEditModal}
            onClose={() => onTaskEditModalOpen()}
        >
            <ModalMain className={`w-full md:w-5/12 lg:w-5/12`}>

                <ModalClose onClose={() => onTaskEditModalOpen()}>
                    <CircleX />
                </ModalClose>
                <ModalHead>
                    {/* Title */}
                    <p className={``}>Edit Task</p>
                </ModalHead>
                {/* Modal Body */}
                <ModalBody className={`p-5 flex flex-col gap-1`}>
                    <Separator />
                    <div>
                        <label htmlFor={`task-title`}>Task Title</label>
                        <Input id={`task-title`} placeholder={`Give unique task title , 13091995(ddmmyyyy)`}
                            value={selectedTask ? selectedTask.title : ''} onChange={e => {
                                setSelectedTask({
                                    ...selectedTask,
                                    title: e.target.value,
                                })
                            }} />
                    </div>
                    {/* Schedule Date Picker */}
                    <div>
                        <label htmlFor={`work-date`} className={``}>Work Date</label>
                        <br />
                        <input className={`bg-blue-100 dark:bg-zinc-100 text-zinc-900 p-1 rounded`} id={`work-date`}
                            type={'date'}
                            value={
                                selectedTask && selectedTask.workDate
                                    ? new Date(selectedTask.workDate).toISOString().split('T')[0]
                                    : new Date().toISOString().split('T')[0]
                            }

                            onChange={e => {
                                setSelectedTask({
                                    ...selectedTask,
                                    workDate: e.target.value,
                                })
                            }} />
                    </div>
                    <div>
                        <label htmlFor={`designer-date`} className={``}>Select Designer</label>
                        <Select id={`designer-date`} onValueChange={(e) => {
                            setSelectedDesigner(e)
                        }}

                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Designer" />
                            </SelectTrigger>
                            <SelectContent>

                                {Array.isArray(designers) && designers?.map((designer, index) => (
                                    <SelectItem key={`designer_${index}`}
                                        value={designer}>
                                        <p>{designer.name}</p>
                                    </SelectItem>
                                ))}
                            </SelectContent>

                        </Select>
                    </div>
                </ModalBody>
                <ModalFooter
                    className={`flex flex-row justify-end items-center pt-2`}
                >
                    <button onClick={updateTask} disabled={isUpdating} className={`bg-zinc-900 dark:bg-zinc-200 text-zinc-100 dark:text-black
                px-2 py-1 rounded flex flex-row gap-1
                `}>
                        <p> Submit</p> {isUpdating && <Loader2 className={'animate-spin'} />}
                    </button>

                </ModalFooter>
            </ModalMain>
        </Modal>
    </>)
}
export default AllTasks;