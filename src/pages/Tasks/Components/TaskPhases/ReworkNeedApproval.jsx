import { useSelector, useDispatch } from 'react-redux';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

import {  ArrowDownUp, ArrowBigRight, MessageCirclePlus, Loader2, SquareDashed, EllipsisVertical } from 'lucide-react';
import { updateTasksInQueue } from '@/features/task/task_inqueue';
import { useState, useEffect, useCallback } from 'react';

import { getSocket } from '@/app/socket';
import { setTasksInQueue } from '@/features/task/task_inqueue';
import TaskCard from '../TaskCard';
import { useToast } from '@/hooks/use-toast';
import { setSelectedTask } from '../../../../features/task/task_inqueue';
import { useNavigate } from "react-router";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
const ReworkNeedApproval = () => {
    let navigate = useNavigate();
    const { toast } = useToast();
    const tasksInQueue = useSelector((state) => state.tasks_in_queue.tasks_in_queue);
    const users = useSelector((state) => state.users.users);
    const user = useSelector((state) => state.auth.user)
    const [tempInQueue, setTempInQueue] = useState([]);
    const [statusChanging, setStatusChanging] = useState(false);
    const socket = getSocket();
    const dispatch = useDispatch();


    useEffect(() => {

        if (socket) {
            socket.on('tasks_in_queue', (data) => {
                // console.log('new data', data);
                dispatch(setTasksInQueue(data));
                setTempInQueue(filterTaskInQueue(data, users))


                // have add tasks in slice store
            })

            return () => {
                socket.off('tasks_in_queue')
            }
        }
    }, [socket])

    const filterTaskInQueue = (_tasksInQueue, _users) => {
        if (_tasksInQueue?.length > 0) {
            if (user.role.name.toLowerCase() === 'sme') {
              

                // const filteredTasks = _tasksInQueue.filter((task) => {
                //     // console.log("Checking task:", task.title);
                //     // // Log the client's sme details for each task:
                //     // if (task.client?.smes) {
                //     //     task.client.smes.forEach(sme => {
                //     //         console.log("SME for task:", task.title, "smeId:", sme.smeId, "role:", sme.role);
                //     //     });
                //     // }
                //     // Return true if at least one SME object matches
                //     return task.client?.smes?.some((sme) =>
                //         String(sme.smeId) === String(user._id) && sme.role.toLowerCase() === 'primary'
                //     );
                // });


                // console.log("Filtered tasks:", filteredTasks);
                const filteredTasks = _tasksInQueue.filter((task) => {
                    return task.client?.smes?.some((sme) => {
                        if (String(sme.smeId) === String(user._id)) {
                            const role = sme.role.toLowerCase();
                            if (role === 'primary') {
                                return true; // Include if user is primary
                            } else if (role === 'secondary') {
                                // Find primary SME for the task
                                const primarySme = task.client.smes.find(s => s.role.toLowerCase() === 'primary');
                                if (!primarySme) {
                                    return true; // No primary, include task
                                }
                                // Check if primary SME is offline
                                const primaryUser = _users.find(u => String(u._id) === String(primarySme.smeId));
                                return !primaryUser?.online;
                            }
                        }
                        return false;
                    });
                });
                return filteredTasks;
            } else {
                return _tasksInQueue;
            }
        } else {
            return _tasksInQueue;
        }
    }

    useEffect(() => {


        if (tasksInQueue?.length > 0) {

            const filteredList = tasksInQueue?.filter((task) => task.status.name === 'Rework Need Approval')
            // console.log(filteredList);
            setTempInQueue(filterTaskInQueue(filteredList, users));
        }

        return () => {

        }
    }, [tasksInQueue])



    // handle Reorder
    const handleReorder = (newOrder) => {
        // console.log(newOrder);

        dispatch(updateTasksInQueue(newOrder));
        setTempInQueue(newOrder);
    }

    // 
    const updateReorderOnServer = () => {
        if (socket) {
            socket.emit('on_reorder', { newOrderOfTasks: tasksInQueue, user: user })
        }
    }

    const onChangeTaskStatus = ({ task, status }) => {
        if (socket) {
            setStatusChanging(true)
            socket.emit('update_task_status', { task: task, status: status }, (response) => {
                if (response.status === 'success') {
                    if (user) {
                        socket.emit('get_tasks_in_queue', { role: user.role.name, id: user._id, head: user.head ? user.head : false, }, (response)=>{
                           
                        });
                    }
                    toast({
                        title: "Success!",
                        description: response.message,
                    })
                    setStatusChanging(false)
                } else {
                    setStatusChanging(false)
                    toast({
                        title: "Error!",
                        description: response.message,
                        variant: "destructive"
                    })
                }
            });
        }

    }


    const ActionButtonComponents = ({ task, index }) => {
        return <div className='flex flex-row gap-1 justify-center'>
           
           {index === 0 && !['gd', 've'].includes(user.role.name.toLowerCase()) && <>
                <Popover>
                    <PopoverTrigger asChild className='cursor-pointer'>
                        {/* <button variant="outline">Open popover</button> */}
                        <EllipsisVertical size={20} />
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Change Status</h4>
                                <p className="text-sm text-muted-foreground">
                                    SME have to take approval from client, if client approved then select "Rework Approved" else click on "Need Rework"
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <div className='flex flex-row gap-2' onClick={() => { onChangeTaskStatus({ task: task, status: "Rework Approved" }) }}>
                                    <SquareDashed />
                                    <p className={`cursor-pointer inline`}> Rework Approved</p>
                                </div>
                                <div className='flex flex-row gap-2' onClick={() => { onChangeTaskStatus({ task: task, status: "Need Rework" }) }}>
                                    <SquareDashed />
                                    <p className={`cursor-pointer inline`}>Need Rework</p>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </>}

            <button onClick={() => {
                dispatch(setSelectedTask(task));
                navigate("/tasks/chat");
            }}>
                <MessageCirclePlus size={20} className='mr-2 animate-bounce hover:animate-none text-green-600' />
            </button>
        </div>
    }

    return (<>
        <Reorder.Group axis="y" values={tempInQueue} onReorder={handleReorder} className={`space-y-2`}>
            <AnimatePresence>
                {tempInQueue.length > 0 && tempInQueue.map((task, index) => (
                    <TaskCard key={`new_in_queue_task${task.id}`} task={task} updateReorderOnServer={updateReorderOnServer}>
                        <ActionButtonComponents task={task} index={index} />
                    </TaskCard>
                ))}
            </AnimatePresence>
        </Reorder.Group>
    </>)
}
export default ReworkNeedApproval;