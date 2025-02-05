import { TabsContent } from "@/components/ui/tabs";
import { getSocket } from "@/app/socket";
import { useToast } from "@/hooks/use-toast"
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from "@/components/ui/separator";
import DateTimePicker from "@/components/app/DateTimePicker";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { isPermissionGranted } from "@/hooks/permission";

export const CreateManualTaskTab = ({ client, selectedDate, postTypes, statuses, selectedWeeklyCalendar, getDaysOfMonth, setSelectedTasks }) => {
    const user = useSelector((state) => state.auth.user);
    const socket = getSocket();
    const { toast } = useToast();
    const [taskTitle, setTaskTitle] = useState('');
    const [selectedPostType, setSelectedPostType] = useState(null);
    const [scheduleDate, setScheduleDate] = useState(null);

    const [taskCreating, setTaskCreating] = useState(false);


    // on submit task
    const onSubmit = async () => {
        // clientId, title, postTypeId = null, calendarEntryId = null, 
        // scheduleDate, statusId, designerId = null, workDate = null, 
        setTaskCreating(true);
        if (client?.id && taskTitle !== '' && scheduleDate) {
            let data = {
                clientId: client?.id,
                title: taskTitle,
                scheduleDate: scheduleDate,
                statusId: 1
            }
            if (socket) {
                socket.emit('create_task', data, (response) => {
                    if (response.status === "success") {
                        console.log(response);
                        
                        setSelectedTasks(response.tasks.tasks)
                        getDaysOfMonth();
                        toast({
                            title: "Success",
                            description: "Task Created Successfully",
                        })
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
            }
        } else {
            toast({
                title: "Error!",
                description: "Please enter all required fields",
                variant: "destructive"
            })
            setTaskCreating(false);
        }


    }



    return (
        <>
            <TabsContent value={`manual-task-create`}>

                {selectedDate && isPermissionGranted(user, "Create Manual Task") && (
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle>{selectedDate?.toDateString()}  </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`w-full flex flex-col gap-4`}>
                                <p className={``}>Create Extra task</p>
                                <Separator />

                                {/* Form */}
                                <div>
                                    <label htmlFor={`post-title`}>Task Title</label>
                                    <Input id={`post-title`} placeholder={`Give unique task title , 13091995(ddmmyyyy)`}
                                        value={taskTitle} onChange={e => {
                                            setTaskTitle(e.target.value);
                                        }} />
                                </div>
                                {/* Schedule Date Picker */}
                                <div>
                                    <label htmlFor={`schedule-date`} className={``}>Schedule Date & Time</label>
                                    <DateTimePicker id={`schedule-date`} date={scheduleDate} setDate={setScheduleDate}
                                        selectedDate={selectedDate} />
                                </div>


                                {/* Select post type */}
                                <div>
                                    <label htmlFor={`post-type-select`}>Select Post Type</label>
                                    <Select id={`post-type-select`}
                                        onValueChange={e => {
                                            setSelectedPostType(e);
                                        }}
                                    >
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Select a Task Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                postTypes?.map((postType, index) => (
                                                    <SelectItem key={`post_type_${postType.id}`}
                                                        value={postType}>{postType.name}</SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>


                                <Separator />

                                {/* Submit Button */}
                                <div className={`w-full flex flex-row gap-4 justify-center items-center`}>
                                    <button onClick={() => {
                                        onSubmit();
                                    }} className={`bg-zinc-200 rounded text-black p-2`}>{taskCreating ? (
                                        <Loader2 className={`animate-spin`} />) : 'Submit'}</button>

                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
        </>
    )
}
export default CreateManualTaskTab
