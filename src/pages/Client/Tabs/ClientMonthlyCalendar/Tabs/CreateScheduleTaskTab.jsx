import { TabsContent } from "@/components/ui/tabs";
import DateTimePicker from "@/components/app/DateTimePicker";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { getSocket } from "../../../../../app/socket.js";
import { useToast } from "@/hooks/use-toast";

export const CreateScheduleTaskTab = ({ client, selectedDate, postTypes, statuses, selectedWeeklyCalendar, getDaysOfMonth, setSelectedTasks }) => {

    const socket = getSocket();
    const { toast } = useToast();
    const [taskTitle, setTaskTitle] = useState('');
    const [calendarEntries, setCalendarEntries] = useState([]);
    const [selectedPostType, setSelectedPostType] = useState(null);
    const [scheduleDate, setScheduleDate] = useState(null); // No explicit type annotation


    const [taskCreating, setTaskCreating] = useState(false);


    const onSubmitCreateTask = async () => {
        setTaskCreating(true);

        if (client?.id && taskTitle !== '' && selectedPostType && calendarEntries.length > 0 && scheduleDate) {
            const data = {
                clientId: client.id,
                title: taskTitle,
                postTypeId: selectedPostType.id,
                calendarEntryIds: calendarEntries.map(entry => entry.id),
                scheduleDate: scheduleDate,
                statusId: 1
            };

            // console.log('data', data);
            if (socket) {
                socket.emit('create_task', data, (response) => {
                    if (response.status === "success") {
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
                // setTaskCreating(false);
            }else{
                setTaskCreating(false);
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
            <TabsContent value={`schedule-task-create`}>
                {selectedDate && selectedWeeklyCalendar && (
                    <Card className={`p-2`}>
                        <CardHeader>
                            <CardTitle>{selectedDate?.toDateString()}  </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`w-full flex flex-col gap-4`}>
                                <p className={``}>Create task</p>
                                <Separator />
                                <div>
                                    <label htmlFor={`post-title`}>Task Title</label>
                                    <Input id={`post-title`} placeholder={`Give unique task title , 13091995(ddmmyyyy)`}
                                        value={taskTitle} onChange={e => {
                                            setTaskTitle(e.target.value);
                                        }} />
                                </div>

                                {/*Task Type*/}
                                <div>
                                    <label htmlFor={`select-entry`} className={``}>Select Post From Calender</label>
                                    <Select id={`select-entry`} multiple onValueChange={(e) => {
                                        // setCalendarEntry(e);
                                        const selected = selectedWeeklyCalendar.entries.find(entry => entry.id === e);
                                        if (selected && !calendarEntries.includes(selected)) {
                                            setCalendarEntries([...calendarEntries, selected]);
                                        }

                                    }}>
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Select a Task Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedWeeklyCalendar?.entries.map((entry, index) => (
                                                <SelectItem key={`entry_${entry.id}`} value={entry.id}>
                                                    <div className={`flex flex-row gap-1`}>
                                                        <img src={entry.socialMediaPlatform.icon} width={20}
                                                            height={10} />
                                                        <div>{entry.socialMediaPlatform?.name} {entry.postType.name}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                <div className={`w-full flex flex-row gap-4 justify-center items-center`}>
                                    <button disabled={taskCreating} onClick={() => {
                                        onSubmitCreateTask();
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

export default CreateScheduleTaskTab;
