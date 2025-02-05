import { useEffect, useState } from 'react';
import { getSocket } from '@/app/socket';
import { useToast } from '@/hooks/use-toast';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { useSelector } from 'react-redux';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { convertIsoStringTodate } from '../../../app/dateformat';
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
const AllDesignerTasks = () => {
    const socket = getSocket()
    const { toast } = useToast();
    const user = useSelector((state) => state.auth.user)
    const users = useSelector((state) => state.users.users);
    const tasksInQueue = useSelector((state) => state.tasks_in_queue.tasks_in_queue);
    const [tempInQueue, setTempInQueue] = useState([]);
    const [designers, setDesigners] = useState(null);
    const [selectedDesigner, setSelectedDesigner] = useState(null);
    useEffect(() => {
        if (!designers) {
            getDesigners()
        }
    }, [designers, users]);

    // get designer
    const getDesigners = () => {

        if (users) {
            // get designers called
            const _designers = users.filter(({ role }) => role.name.toLowerCase() === 've' || role.name.toLowerCase() === 'gd');

            if (_designers.length > 0) {
                setDesigners(_designers);
            } else {
                // setDesigners([]); // Ensure designers is an empty array if no match
            }
        }
    }

    useEffect(() => {


        if (tasksInQueue?.length > 0) {
            if (user.role.name.toLowerCase() === 've' || user.role.name.toLowerCase() === 'gd') {
                const filteredList = tasksInQueue?.filter((task) => task.status.name === 'In Queue')
                console.log(filteredList);
                setTempInQueue(filteredList);

            } else {
                setTempInQueue(tasksInQueue);
            }

        }

        return () => {

        }
    }, [tasksInQueue])


    // handle order

    // handle Reorder
 
    const handleReorder = (newOrder) => {
        // console.log(newOrder);
        setTempInQueue(newOrder);
    }

    const onUpdateReorder = () => {
        if (socket) {
            socket.emit('on_reorder', { newOrderOfTasks: tempInQueue, user: user, designerId: selectedDesigner._id }, (response) => {
                if (response.status === 'success') {
                    toast({
                        title: "Success!",
                        description : response.message,
                    });
                }else{
                    toast({
                        title: "Error!",
                        description : response.message,
                        variant: "destructive"
                    });
                }
            })
        }
    }

    return (<>
        <TabsContent value={`designers-task`}>
            <div className="p-2 md:p-5 lg:p-5 ">
                <Card>
                    <CardHeader className={`flex flex-row justify-between items-center`}>
                        <div>
                            <CardTitle>Task List of designer</CardTitle>
                            <CardDescription>You can change create and edit clients here</CardDescription>
                        </div>
                        <div>
                            <label htmlFor={`designer-date`} className={``}>Select Designer</label>
                            <Select id={`designer-date`} onValueChange={(e) => {
                                let filteredTask = tasksInQueue.filter((_task) => _task.designerId === e._id);
                                setTempInQueue(filteredTask);
                                
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

                    </CardHeader>
                    <CardContent>
                        {/* <Reorder.Group axis="y" values={tempInQueue} onReorder={handleReorder} className={`space-y-2`}>
                            <AnimatePresence>
                                <table className='w-full border-collapse border border-slate-500'>
                                    <thead>
                                        <tr>
                                            <th className="border border-slate-600" >Id</th>
                                            <th className="border border-slate-600" >Title</th>
                                            <th className="border border-slate-600" >Schedule Time</th>
                                            <th className="border border-slate-600" >Work Time</th>
                                            <th className="border border-slate-600" >Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {
                                            selectedDesigner && tempInQueue && tempInQueue.filter(({ designerId }) => designerId === selectedDesigner?._id).map((task) => (
                                                <Reorder.Item key={`in_queue_${task.id}`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    value={task}
                                                    onDragEnd={(event, info) => {
                                                        // updateReorderOnServer();
                                                    }}
                                                >
                                                    <tr>
                                                        <td className={`border border-slate-600`}>{task.id}</td>
                                                        <td className={`border border-slate-600`}>{task.title}</td>
                                                        <td className={`border border-slate-600`}>{convertIsoStringTodate(task.scheduleDate).date} {convertIsoStringTodate(task.scheduleDate).time}</td>
                                                        <td className={`border border-slate-600`}>{convertIsoStringTodate(task.workDate).date} {convertIsoStringTodate(task.workDate).time}</td>
                                                        <td className={`border border-slate-600`}></td>
                                                    </tr>
                                                </Reorder.Item>
                                            ))
                                        }

                                    </tbody>
                                </table>
                            </AnimatePresence>
                        </Reorder.Group> */}
                        <Reorder.Group axis="y" values={tempInQueue} onReorder={handleReorder} className="flex flex-col border border-gray-500">
                            <div className="grid grid-cols-5 font-semibold ">
                                <div className="p-2 border border-slate-600">Id</div>
                                <div className="p-2 border border-slate-600">Title</div>
                                <div className="p-2 border border-slate-600">Schedule Time</div>
                                <div className="p-2 border border-slate-600">Work Time</div>
                                <div className="p-2 border border-slate-600">Action</div>
                            </div>
                            <AnimatePresence>
                                {selectedDesigner &&
                                    tempInQueue
                                        .filter(({ designerId }) => designerId === selectedDesigner?._id)
                                        .map((task) => (
                                            <Reorder.Item
                                                key={`in_queue_${task.id}`}
                                                value={task}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="grid grid-cols-5 cursor-grabbing"
                                                onDragEnd={(event, info) => {
                                                    onUpdateReorder()
                                                }}
                                                dragListener={user.head || user.role.name.toLowerCase() === 'admin' || user.role.name.toLowerCase() === 'super admin' ? true : false}
                                            >
                                                <div className="p-2 border border-slate-600">{task.id}</div>
                                                <div className="p-2 border border-slate-600">{task.title}</div>
                                                <div className="p-2 border border-slate-600">{convertIsoStringTodate(task.scheduleDate).date} {convertIsoStringTodate(task.scheduleDate).time}</div>
                                                <div className="p-2 border border-slate-600">{convertIsoStringTodate(task.workDate).date} {convertIsoStringTodate(task.workDate).time}</div>
                                                <div className="p-2 border border-slate-600"> {/* Add action buttons here */} </div>
                                            </Reorder.Item>
                                        ))}
                            </AnimatePresence>
                        </Reorder.Group>

                    </CardContent>
                </Card>
            </div>


        </TabsContent>
    </>)
}
export default AllDesignerTasks;