import { TabsContent } from "@/components/ui/tabs";
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { convertIsoStringTodate } from "../../../../../app/dateformat.js";
import { CircleX, Delete, Loader2, MessageCirclePlus, Pencil, Plus, Clock, ScrollText, PersonStanding } from "lucide-react";
import Modal, {
    ModalHead,
    ModalMain,
    ModalClose,
    ModalBody,
    ModalFooter,
} from "@/components/app/Modal";
import { useEffect, useState, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { getSocket } from "../../../../../app/socket.js";
import { setSelectedTask } from "../../../../../features/task/task_inqueue.js";

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,

} from "@/components/ui/sheet"

export const TasksTab = ({ selectedTasks, getDaysOfMonth, setSelectedTasks }) => {
    const { toast } = useToast();
    const socket = getSocket()
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const users = useSelector((state) => state.users.users);
    const selectedTask = useSelector((state) => state.tasks_in_queue.selected_task);
    const [editTaskModal, setEditTaskModal] = useState(false);
    const [selectedEditTask, setSelectedEditTask] = useState(null);
    const [designers, setDesigners] = useState(null);
    const [selectedDesigner, setSelectedDesigner] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [taskChatModal, setTaskChatModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [tasks, setTasks] = useState(null);


    const textareaRef = useRef(null);
    const chatContainerRef = useRef(null);

    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height to auto to calculate scroll height accurately
            textarea.style.height = "auto";
            // Set height to either the scroll height or max height (h-28 in rem units)
            textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
        }
    };


    // Change Edit Task Modal State
    const onEditTaskModalChange = () => {
        setEditTaskModal(!editTaskModal);
    }

    useEffect(() => {
        if (selectedTasks && selectedTasks.length > 0) {
            setTasks([...selectedTasks]); // Ensure a new array reference
        }
    }, [selectedTasks]);


    useEffect(() => {
        if (!designers) {
            getDesigners()
        }
    }, [designers]);

    // get designer
    const getDesigners = () => {

        if (users) {

            const _designers = users.filter(({ role }) => role.name.toLowerCase() === 've' || role.name.toLowerCase() === 'gd');

            if (_designers.length > 0) {
                setDesigners(_designers);
            } else {
                setDesigners([]); // Ensure designers is an empty array if no match
            }
        }
    }


    // Update Task
    const updateTask = async () => {
        setIsUpdating(true)
        try {
            if (selectedEditTask && selectedDesigner) {
                // console.log(selectedEditTask);
                const data = {
                    id: selectedEditTask.id,
                    title: selectedEditTask.title,
                    workDate: selectedEditTask.workDate,
                    designerId: selectedDesigner._id,
                    user: user
                }
    
                if (data.id && data.title && data.workDate && data.designerId) {
                    if (socket) {
                        socket.emit("update_task", data, (response) => {
                            if (response.status === "success") {
                                getDaysOfMonth();
                                toast({
                                    title: "Success",
                                    description: "Successfully updated",
                
                                })
                                onEditTaskModalChange();
                            } else {
    
                                toast({
                                    title: "Error!",
                                    description: response.message,
                                    variant: "destructive"
                                })
    
                            }
                        })
                    }
    
    
                   
                } else {
    
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
    
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        }finally{
            setIsUpdating(false)
        }
       


    }


    // on task chat modal change
    const onTaskChatModalChange = () => {
        setTaskChatModal(!taskChatModal);
    }


    // on message send
    const onMessageSend = ({ task, user, value }) => {
        // console.log('task : ', task);
        // console.log('user : ', user);
        // console.log('value : ', value);
        let data = {
            user: user,
            message: value,
            task: task
        }
        const last_message_id = !(selectedTask.messages[parseInt(selectedTask.messages.length) - 1]) ? 0 : (selectedTask.messages[parseInt(selectedTask.messages.length) - 1]).id;

        let newMessage = {
            "id": last_message_id + 1,
            "createdAt": (new Date()).toISOString(),
            "updatedAt": (new Date()).toISOString(),
            "taskId": task.id,
            "message": value,
            "fromId": user._id,
            "sending": true
        }

        const updatedTask = {
            ...selectedTask,
            messages: [...selectedTask.messages, newMessage], // Create a new array
        };

        dispatch(setSelectedTask(updatedTask));




        if (socket) {
            socket.emit('send_message', data, (response) => {

                if (response.status === 'success') {
                    // Create a new messages array with the updated message
                    const updatedMessages = updatedTask.messages.map((msg) =>
                        msg.id === newMessage.id ? { ...msg, sending: false } : msg
                    );

                    const _updatedTask = {
                        ...updatedTask,
                        messages: updatedMessages,
                    };

                    dispatch(setSelectedTask(_updatedTask));
                }
            })
        }
        const textarea = textareaRef.current;
        textarea.value = ''
    }

    const getDesignerById = (id) => {


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

    const deleteTask = (taskId) => {

        setIsDeleting(true);
        try {
            // Update state with new array


            if (socket) {

                socket.emit("delete_task", taskId, (response) => {
                    if (response.status === "success") {

                        // remove task from list
                        let updatedTasks = tasks?.filter(({ id }) => id !== taskId); // Create a new array without the deleted task
                        setTasks(updatedTasks);

                        getDaysOfMonth();
                        // Optionally, remove the task from the UI
                        toast({
                            title: "Success",
                            description: response.message,

                        })
                    } else {
                        toast({
                            title: "Error",
                            description: response.message,
                            variant: "destructive",
                        })
                    }
                });

            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })

        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <TabsContent value={`tasks-tab`}>
                <h1>Total Tasks : {tasks ? tasks?.length : ''}</h1>
                <Table className="w-full border-collapse border border-slate-500">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="border border-slate-600">Id</TableHead>
                            <TableHead className="border border-slate-600">Title</TableHead>
                            <TableHead className="border border-slate-600">Action</TableHead>

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks && tasks?.length > 0 && tasks?.map((task, index) => (
                            <TableRow key={`task-${index}`}>
                                <TableCell>{task.id}</TableCell>
                                <TableCell>
                                    <div>
                                        <p>{task.title}</p>
                                        {task.designerId ? getDesignerById(task.designerId) : ''}
                                        <p className={`text-xs text-zinc-400`}>S: {convertIsoStringTodate(task.scheduleDate).date} W: {task.workDate ? convertIsoStringTodate(task.workDate).date : ''}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {tasks && !tasks.postFromHome &&
                                        <div className={`flex flex-row gap-1`}>
                                            <button
                                                onClick={() => {
                                                    dispatch(setSelectedTask(task))
                                                    onTaskChatModalChange();
                                                }}
                                            >
                                                <MessageCirclePlus />
                                            </button>
                                            {parseInt(task.status.id) < 4 && <button
                                                className={`bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black p-1 rounded`}
                                                onClick={() => {
                                                    let _task = task;
                                                    _task.workDate = new Date().toISOString().split('T')[0];
                                                    setSelectedEditTask(_task);
                                                    if (designers.length === 0) {
                                                        getDesigners()
                                                    } else {

                                                    }
                                                    onEditTaskModalChange();
                                                }}
                                            ><Pencil size={15} /></button>}

                                            <button
                                                className={`bg-red-500 text-zinc-100 p-1 rounded`}
                                                onClick={() => {
                                                    deleteTask(task.id)
                                                }}
                                            >{isDeleting ? <Loader2 className={`animate-spin`} /> : <Delete size={15} />}</button>
                                        </div>
                                    }
                                </TableCell>

                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </TabsContent>

            {/* Post Type Modal */}
            <Modal

                open={editTaskModal}
                onClose={() => onEditTaskModalChange()}
            >
                <ModalMain className={`w-full md:w-5/12 lg:w-5/12`}>

                    <ModalClose onClose={() => onEditTaskModalChange()}>
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
                                value={selectedEditTask ? selectedEditTask.title : ''} onChange={e => {
                                    setSelectedEditTask({
                                        ...selectedEditTask,
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
                                    selectedEditTask && selectedEditTask.workDate
                                        ? new Date(selectedEditTask.workDate).toISOString().split('T')[0]
                                        : new Date().toISOString().split('T')[0]
                                }

                                onChange={e => {
                                    setSelectedEditTask({
                                        ...selectedEditTask,
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


            {/* Tasks Chat */}
            <Modal
                open={taskChatModal}
                onClose={() => onTaskChatModalChange()}
            >
                <ModalMain className={`w-full md:w-8/12 lg:w-10/12`}>
                    <ModalClose onClose={() => onTaskChatModalChange()}>
                        <CircleX />
                    </ModalClose>
                    <ModalHead>
                        <p className={``}>Task Chat</p>
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className={`text-black dark:text-white`}><ScrollText size={15} /></button>
                            </SheetTrigger>
                            <SheetContent className={`text-black dark:text-white`}>


                                <SheetHeader>
                                    <SheetTitle>Log</SheetTitle>
                                    <SheetDescription>
                                        All log of this selected task is here
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex flex-col font-mono text-xs mt-5 gap-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
                                    {selectedTask?.logs && selectedTask.logs.map((_log, index) => (
                                        <div key={`log_${_log.id}`} className={`border-l-zinc-700 dark:border-l-zinc-100 bg-zinc-300 dark:bg-zinc-700 border-l-2  pl-2 py-1`}>
                                            <p>{_log.comment}</p>
                                            <p className="text-[10px] text-zinc-700 dark:text-zinc-400">{convertIsoStringTodate(_log.timestamp).date} {convertIsoStringTodate(_log.timestamp).time}</p>
                                        </div>
                                    ))}

                                </div>

                            </SheetContent>
                        </Sheet>
                    </ModalHead>
                    <ModalBody>
                        {
                            selectedTask && (
                                <div className="relative">

                                    {/* chat list  */}
                                    <div ref={chatContainerRef} className={`flex-1 h-[calc(100vh-5.5rem)] bg-zinc-900 p-2 overflow-y-auto pb-20`}>
                                        {/* Message from 'from' */}
                                        {/* <div className="mb-2 flex justify-start">
                                    <div className="bg-blue-900 text-white px-4 py-2 rounded-tr-lg rounded-b-lg max-w-xs">
                                        Hello, how are you?
                                    </div>
                                </div> */}

                                        {selectedTask && selectedTask.messages && selectedTask.messages.length > 0 && selectedTask.messages.map((message, index) => {
                                            const me = user && user._id === message.fromId ? true : false;
                                            const { name } = users && users.find(({ _id }) => _id === message.fromId);
                                            return (
                                                <div key={`message_${index}${message.id}`}> {me ? (<>
                                                    <div className="mb-2 flex justify-end">
                                                        <div className="bg-green-900 text-white rounded-bl-lg rounded-t-lg max-w-xs min-w-20 relative">
                                                            <div style={{ whiteSpace: "pre-wrap" }} className="pl-4 pr-1 pt-1 pb-4">
                                                                {message.message}
                                                            </div>
                                                            <div className="absolute right-1 bottom-1 flex flex-row gap-1 text-zinc-300">
                                                                <p className="text-[8px]">{convertIsoStringTodate(message.createdAt).date} {convertIsoStringTodate(message.createdAt).time}</p>
                                                                {
                                                                    message.sending ? (
                                                                        <Clock size={8} />
                                                                    ) : ''
                                                                }
                                                            </div>

                                                        </div>
                                                    </div>
                                                </>) : (<>
                                                    <div className="mb-2 flex justify-start">
                                                        <div className="bg-blue-900 text-white rounded-tr-lg rounded-b-lg max-w-xs min-w-20 relative">
                                                            <div style={{ whiteSpace: "pre-wrap" }} className="pl-1 pr-4 pt-1 pb-4 text-left">
                                                                {message.message}
                                                            </div>
                                                            <div className="absolute left-1 bottom-1 flex flex-row gap-1 text-zinc-300">
                                                                <p className="text-[8px]">{convertIsoStringTodate(message.createdAt).date} {convertIsoStringTodate(message.createdAt).time}</p>
                                                                {
                                                                    message.sending ? (
                                                                        <Clock size={8} />
                                                                    ) : ''
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>)}

                                                </div>
                                            )
                                        })}




                                    </div>

                                    {/* Input box */}
                                    <div className="p-4 bg-zinc-800 w-full absolute bottom-0">
                                        <div className="flex items-center">
                                            <textarea
                                                ref={textareaRef}
                                                placeholder="Type your message..."
                                                className="flex-1 p-2 bg-zinc-700 text-white rounded-lg focus:outline-none resize-none overflow-hidden"
                                                rows={1}
                                                style={{ maxHeight: "130px" }} // Ensure max height for overflow prevention
                                                onInput={handleInput}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        // Handle message submission here
                                                        // console.log("Message sent!", e.target.value);
                                                        const messageValue = e.target.value.trim();
                                                        if (messageValue) {
                                                            onMessageSend({ task: selectedTask, user: user, value: messageValue });
                                                            e.target.value = ""; // Clear the textarea after sending
                                                            handleInput(); // Reset height
                                                        }

                                                        // onMessageSend({ task: selectedTask, user: user, value: e.target.value });
                                                    }
                                                }}
                                            ></textarea>

                                        </div>
                                    </div>
                                </div>
                            )
                        }

                    </ModalBody>

                </ModalMain>
            </Modal>
        </>
    )
}
export default TasksTab
