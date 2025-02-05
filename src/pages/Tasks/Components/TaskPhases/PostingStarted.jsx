import { useSelector, useDispatch } from 'react-redux';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

import {  ArrowDownUp, ArrowBigRight, MessageCirclePlus, Loader2 } from 'lucide-react';
import { updateTasksInQueue } from '@/features/task/task_inqueue';
import { useState, useEffect, useCallback } from 'react';

import { getSocket } from '@/app/socket';
import { setTasksInQueue } from '@/features/task/task_inqueue';
import TaskCard from '../TaskCard';
import { useToast } from '@/hooks/use-toast';
import { setSelectedTask } from '../../../../features/task/task_inqueue';
import { useNavigate } from "react-router";

const PostingStarted = () => {
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

            const filteredList = tasksInQueue?.filter((task) => task.status.name === 'Posting Started')
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
            {index === 0 && !['ve', 'gd'].includes(user.role.name.toLowerCase()) && <><button disabled={statusChanging}
                onClick={() => { onChangeTaskStatus({ task: task, status: "Posting Complete" }) }}
            >{statusChanging ? <Loader2 size={20} className={`animate-spin`} /> : <ArrowBigRight size={20} className='mr-2 cursor-pointer' />} </button></>}
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
export default PostingStarted;