import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState, useRef } from 'react'
import TasksChatSideBar from './Components/TasksChatSideBar';
import { useCookies } from "../../hooks/cookie-provider";
import { useDispatch, useSelector } from "react-redux";
import { Clock, Link, Loader2, ScrollText, X, SquareDashed, FolderKanban, FolderGit2Icon } from "lucide-react";
import { getSocket } from "../../app/socket";
import { setSelectedTask, updateTasksInQueue } from "../../features/task/task_inqueue";
import { convertIsoStringTodate } from "../../app/dateformat";
import { useToast } from "../../hooks/use-toast";
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { isPermissionGranted } from "../../hooks/permission";

const TasksChat = () => {
    const { toast } = useToast();
    const dispatch = useDispatch();
    const socket = getSocket();
    const selectedTask = useSelector((state) => state.tasks_in_queue.selected_task);

    const tasksInQueue = useSelector((state) => state.tasks_in_queue.tasks_in_queue);
    const [selectedTaskPosition, setSelectedTaskPosition] = useState(0);
    const user = useSelector((state) => state.auth.user);
    const users = useSelector((state) => state.users.users);
    const [postLinkInput, setPostLinkInput] = useState(null);
    const [postLinkUploading, setPostLinkUploading] = useState(false)
    const [statusChanging, setStatusChanging] = useState(false);
    const [chat, setChat] = useState([])
    const [contentTitle, setContentTitle] = useState(null);
    const [contentUrl, setContentUrl] = useState(null);
    const [contentUploading, setContentUploading] = useState(false);

    const textareaRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (socket) {
            socket.on('message_updated_task', async (data) => {
                // console.log('message_updated_task', data);

                if (data.messages) {
                    const last_message = data.messages[data.messages.length - 1];
                    last_message?.fromId !== user._id && toast({
                        title: 'New Message',
                        description: `You have receive new message on task ${data.title}`
                    })
                    if (selectedTask && selectedTask.id == data.id) {
                        dispatch(setSelectedTask(data));
                    } else {
                        // now replace with task in queue find by taskInQueue.id === data.id
                        const updatedTasksInQueue = tasksInQueue.map((task) =>
                            task.id === data.id ? { ...task, messages: data.messages } : task
                        );
                        dispatch(updateTasksInQueue(updatedTasksInQueue))

                    }
                }

            })

            return () => {
                socket.off('message_updated_task')
            }
        }



    }, [socket, selectedTask])


    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chat]);
    useEffect(() => {
        console.log("Content uploading state changed:", contentUploading);
    }, [contentUploading]);

    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height to auto to calculate scroll height accurately
            textarea.style.height = "auto";
            // Set height to either the scroll height or max height (h-28 in rem units)
            textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
        }
    };

    // on task select
    const onTaskSelect = (task) => {
        // console.log(task);

        // Find the index of the selected task in the tasksInQueue array
        const taskIndex = tasksInQueue.findIndex((t) => t.id === task.id);

        if (taskIndex !== -1) {
            setSelectedTaskPosition(taskIndex)
        } else {
            console.log("Task not found in the queue.");
        }

        dispatch(setSelectedTask(task));
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
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

    // on link submit
    const onLinkSubmit = async () => {
        setPostLinkUploading(true)
        try {
            if (postLinkInput) {
                if (socket) {
                    socket.emit('post_link_submit', { postLink: postLinkInput, task: selectedTask }, (response) => {
                        if (response.status == "success") {
                            toast({
                                title: "Success!",
                                description: "Post link updated successfully"
                            })

                        } else {


                            toast({
                                title: "Error!",
                                description: "Something wrong to submit post lint",
                                variant: "destructive"
                            })


                        }
                    })
                }
            } else {
                toast({
                    title: "Error!",
                    description: "Please enter post link",
                    variant: "destructive"
                })


            }
        } catch (error) {
            console.log(error);
            setPostLinkUploading(false);
        } finally {
            setPostLinkUploading(false)
        }
    }

    const onChangeTaskStatus = ({ task, status }) => {
        if (socket) {
            setStatusChanging(true)
            socket.emit('update_task_status', { task: task, status: status }, (response) => {
                if (response.status === 'success') {
                    if (user) {
                        socket.emit('get_tasks_in_queue', { role: user.role.name, id: user._id, head: user.head ? user.head : false, }, (response) => {


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

    // on content submit
    const onContentSubmit = async () => {
        
        setContentUploading(true);
    
        try {
            if (contentTitle && contentUrl) {
                if (socket) {
                    socket.emit('add_content_to_task', { task: selectedTask, title: contentTitle, contentUrl: contentUrl }, (response) => {
                        if (response.status === 'success') {
                            toast({
                                title: "Success!",
                                description: response.message
                            })
                        } else {
                            toast({
                                title: "Error!",
                                description: response.message,
                                variant: "destructive"
                            })
                        }
                    })
                }
            }
        } catch (error) {
            toast({
                title: "Error!",
                description: "Something wrong to submit content",
                variant: "destructive"
            })
        } finally {
            setContentUploading(false);
        }
    }

    return (<>
        <div className="flex flex-row font-mono">
            <TasksChatSideBar selectedTask={selectedTask} onTaskSelect={onTaskSelect} tasksInQueue={tasksInQueue} />

            {/* chat box */}
            <div className="flex-grow">
                {
                    selectedTask && (
                        <div className="relative">
                            <div className="w-full h-16 bg-slate-100 dark:bg-zinc-950 flex flex-row justify-between px-5 absolute top-0">
                                <div className="">{contentUploading && 'Loading...'}</div>

                                <div className={`flex h-full items-center gap-2`}>
                                    {isPermissionGranted(user, 'Chat Status Change') && <>
                                        {['Client Approved', 'Rework Approved'].includes(selectedTask.status.name) &&
                                            <Popover>
                                                <PopoverTrigger>
                                                    <button><Badge>{selectedTask && selectedTask.status.name}</Badge></button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium leading-none">Change Status</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            SME have to take approval from client, if client approved then select "Posting Started" else click on "Hand Over to client"
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className='flex flex-row gap-2' onClick={() => { onChangeTaskStatus({ task: selectedTask, status: "Posting Started" }) }}>
                                                            <SquareDashed />
                                                            <p className={`cursor-pointer inline`}> Posting Started</p>
                                                        </div>
                                                        <div className='flex flex-row gap-2' onClick={() => { onChangeTaskStatus({ task: selectedTask, status: "Hand Overed To Client" }) }}>
                                                            <SquareDashed />
                                                            <p className={`cursor-pointer inline`}>Hand Over To Client</p>
                                                        </div>
                                                    </div>

                                                </PopoverContent>
                                            </Popover>
                                        }

                                        {
                                            ['Posting Started'].includes(selectedTask.status.name) && <>
                                                <Badge className={`cursor-pointer`} onClick={() => {
                                                    onChangeTaskStatus({ task: selectedTask, status: "Posting Complete" })

                                                }}>{selectedTask && selectedTask.status.name}</Badge>
                                            </>
                                        }

                                    </>}

                                    {selectedTask.status.name === 'Posting Complete' && <Popover>
                                        <PopoverTrigger>
                                            <button><Link size={20} /></button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium leading-none">Post Link</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Here is post final link
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {
                                                    selectedTask.calendarEntries && selectedTask.calendarEntries.length > 0 && selectedTask.calendarEntries.map((entry, index) => {

                                                        return selectedTask.postLinks.length > 0 ? selectedTask.postLinks[index] ? <div>{index + 1}. <a href={selectedTask.postLinks[index].url} className="text-blue-500">Click Here </a> To Open Link</div> : isPermissionGranted(user, 'Chat Status Change') ? <div className="grid gap-2 mb-1">
                                                            <div className="grid grid-cols-3 items-center gap-4">
                                                                <Label htmlFor="width">Link </Label>

                                                            </div>
                                                            <div className="w-full flex justify-end gap-1">
                                                                <Input
                                                                    id="width"
                                                                    placeholder='Here you have to put post final link'
                                                                    className="col-span-2 h-8"
                                                                    onChange={(e) => {
                                                                        setPostLinkInput(e.target.value)
                                                                    }}
                                                                />
                                                                <Button size='sm' onClick={onLinkSubmit}>{postLinkUploading ? <Loader2 className="animate-spin" /> : 'Submit'}</Button>
                                                            </div>
                                                        </div> : <></> : isPermissionGranted(user, 'Chat Status Change') ? <div className="grid gap-2 mb-1">
                                                            <div className="grid grid-cols-3 items-center gap-4">
                                                                <Label htmlFor="width">Link </Label>

                                                            </div>
                                                            <div className="w-full flex justify-end gap-1">
                                                                <Input
                                                                    id="width"
                                                                    placeholder='Here you have to put post final link'
                                                                    className="col-span-2 h-8"
                                                                    onChange={(e) => {
                                                                        setPostLinkInput(e.target.value)
                                                                    }}
                                                                />
                                                                <Button size='sm' onClick={onLinkSubmit}>{postLinkUploading ? <Loader2 className="animate-spin" /> : 'Submit'}</Button>
                                                            </div>
                                                        </div> : <></>
                                                    })
                                                }
                                            </div>



                                        </PopoverContent>
                                    </Popover>}

                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <button className={`text-black dark:text-white`}><FolderKanban size={20} /></button>
                                        </SheetTrigger>
                                        <SheetContent className={`text-black dark:text-white`}>


                                            <SheetHeader>
                                                <SheetTitle>Content </SheetTitle>
                                                <SheetDescription>
                                                    All log of content here
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="flex flex-col font-mono text-xs mt-5 gap-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
                                                <div className="grid gap-2 mb-1">
                                                    <div className="grid grid-cols-3 items-center gap-4">
                                                        <Label htmlFor="width">Link </Label>

                                                    </div>
                                                    <Input
                                                        id="title"
                                                        placeholder='Title'
                                                        className="col-span-2 h-8"
                                                        onChange={(e) => {
                                                            setContentTitle(e.target.value)
                                                        }}
                                                    />
                                                    <div className="w-full flex justify-end gap-1">
                                                        <Input
                                                            id="link"
                                                            placeholder='content link'
                                                            className="col-span-2 h-8"
                                                            onChange={(e) => {
                                                                setContentUrl(e.target.value)
                                                            }}
                                                        />
                                                        <Button size='sm' onClick={onContentSubmit}>{postLinkUploading ? <Loader2 className="animate-spin" /> : 'Submit'}</Button>
                                                    </div>
                                                </div>

                                                {selectedTask.contents && selectedTask.contents.map((_content, index) => (

                                                    <div key={`log_${_content.id}`} className={`border-l-zinc-700 dark:border-l-zinc-100 bg-zinc-300 dark:bg-zinc-700 border-l-2  pl-2 py-1`}>
                                                        <div className="flex flex-row gap-2 justify-start items-center ">
                                                            <FolderGit2Icon size={20} />
                                                            <div>
                                                                <p className="text-[15px]">{_content.title}</p>
                                                                <p>This is content download  <a href={_content.contentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400">link</a></p>
                                                            </div>
                                                        </div>

                                                    </div>
                                                ))}

                                            </div>

                                        </SheetContent>
                                    </Sheet>

                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <button className={`text-black dark:text-white`}><ScrollText size={20} /></button>
                                        </SheetTrigger>
                                        <SheetContent className={`text-black dark:text-white`}>


                                            <SheetHeader>
                                                <SheetTitle>Log</SheetTitle>
                                                <SheetDescription>
                                                    All log of this selected task is here
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="flex flex-col font-mono text-xs mt-5 gap-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
                                                {selectedTask.logs && selectedTask.logs.map((_log, index) => (
                                                    <div key={`log_${_log.id}`} className={`border-l-zinc-700 dark:border-l-zinc-100 bg-zinc-300 dark:bg-zinc-700 border-l-2  pl-2 py-1`}>
                                                        <p>{_log.comment}</p>
                                                        <p className="text-[10px] text-zinc-700 dark:text-zinc-400">{convertIsoStringTodate(_log.timestamp).date} {convertIsoStringTodate(_log.timestamp).time}</p>
                                                    </div>
                                                ))}

                                            </div>

                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>
                            {/* chat list  */}
                            <div ref={chatContainerRef} className={`flex-1 h-[calc(100vh-3.5rem)] bg-zinc-200 dark:bg-zinc-900 p-2 overflow-y-auto pt-20 pb-20`}>
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
                                                <div className="bg-green-900 text-white rounded-bl-lg rounded-t-lg min-w-28 max-w-sm relative">
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
                                                <div className="bg-blue-900 text-white rounded-tr-lg rounded-b-lg min-w-28 max-w-sm relative">
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
                            <div className="  w-full absolute bottom-0">
                                <div className=" bg-green-300 w-full p-0 font-mono"> <p className=" text-xs text-center p-0 m-0 text-zinc-800">{selectedTask.status.name}</p></div>
                                <div className="p-4 bg-zinc-800">
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
                        </div>
                    )
                }

            </div>
        </div>

    </>)
}
export default TasksChat;