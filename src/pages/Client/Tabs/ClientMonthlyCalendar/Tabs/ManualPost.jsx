import { useEffect, useState } from 'react'
import { TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getSocket } from "@/app/socket";
import { useToast } from "@/hooks/use-toast"
import DateTimePicker from "@/components/app/DateTimePicker";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
const ManualPost = ({ client, selectedDate, postTypes, statuses, selectedWeeklyCalendar, getDaysOfMonth, setSelectedTasks }) => {

    const socket = getSocket();
    const { toast } = useToast();
    const [taskTitle, setTaskTitle] = useState('');
    const [postLink, setPostLink] = useState(null);
    const [calendarEntry, setCalendarEntry] = useState(null);
    const [scheduleDate, setScheduleDate] = useState(null);
    const [selectedPostType, setSelectedPostType] = useState(null);
    const [postCreating, setPostCreating] = useState(false);


    // on create post
    const onSubmitCreatePost = async () => {
        setPostCreating(true);


        try {
            if (taskTitle && scheduleDate && selectedPostType) {
                let data = {
                    clientId: client.id,
                    title: taskTitle,
                    postTypeId: selectedPostType.id,
                    scheduleDate: scheduleDate,
                    statusId: 1,
                    postLink: postLink,
                    postFromHome: true
                };
                if (selectedWeeklyCalendar && calendarEntry) {
                    data.calendarEntryId = calendarEntry.id;
                }

                // console.log(data);

                if (socket) {
                    socket.emit('create_task', data, (response) => {
                        if (response.status === "success") {
                            getDaysOfMonth()
                            setSelectedTasks(response.tasks.tasks);
                            toast({
                                title: response.status,
                                description: response.message,
                            })
                        } else {

                            toast({
                                title: "Error!",
                                description: response.message,
                                variant: "destructive"
                            })

                        }
                    });
                }

                // clear task complete
                setPostLink(null);
                setTaskTitle(null);
                setCalendarEntry(null);
                setSelectedPostType(null);
                setScheduleDate(null);
            } else {
                toast({
                    title: "Success!",
                    description: "Please enter * marked fields",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error!",
                description: "getting error to create post",
                variant: "destructive"
            })
        } finally {
            setPostCreating(false)
        }

    }

    return (<>
        <TabsContent value={`manual-post-create`}>
            {selectedDate && (
                <Card className={`p-2`}>
                    <CardHeader>
                        <CardTitle>{selectedDate?.toDateString()}  </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`w-full flex flex-col gap-4`}>
                            <p className={``}>Create Post</p>
                            <Separator />
                            {/* Post Title */}
                            <div>
                                <label htmlFor={`post-title`}>Post Title</label>
                                <Input id={`post-title`} placeholder={`Give unique post title , 13091995(ddmmyyyy)`}
                                    value={taskTitle} onChange={e => {
                                        setTaskTitle(e.target.value);
                                    }} />
                            </div>

                            {/*Task Type*/}
                            {selectedWeeklyCalendar &&
                                <div>
                                    <label htmlFor={`select-entry`} className={``}>Select Post From Calender</label>
                                    <Select id={`select-entry`} onValueChange={(e) => {
                                        setCalendarEntry(e);
                                    }}>
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Select a Task Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedWeeklyCalendar?.entries.map((entry, index) => (
                                                <SelectItem key={`entry_${entry.id}`} value={entry}>
                                                    <div className={`flex flex-row gap-1`}>
                                                        <img src={entry.socialMediaPlatform.icon} width={20}
                                                            height={10} />
                                                        <div>{entry.socialMediaPlatform?.name} {entry.postType.name}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>}


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

                            {/* Post Link */}
                            <div>
                                <label htmlFor={`post-title`}>Post Link</label>
                                <Input id={`post-title`} placeholder={`Give unique post title , 13091995(ddmmyyyy)`}
                                    value={postLink} onChange={e => {
                                        setPostLink(e.target.value);
                                    }} />
                            </div>
                            <Separator />
                            <div className={`w-full flex flex-row gap-4 justify-center items-center`}>
                                <button onClick={() => {
                                    onSubmitCreatePost();
                                }} className={`bg-zinc-200 rounded text-black p-2`}>{postCreating ? (
                                    <Loader2 className={`animate-spin`} />) : 'Submit'}</button>

                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
    </>)
}
export default ManualPost;