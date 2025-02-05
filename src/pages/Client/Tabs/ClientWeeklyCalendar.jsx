import { useEffect, useState } from 'react'
import { TabsContent } from "@/components/ui/tabs";
import axios from 'axios';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Check, CircleX, Delete, Loader2, Pencil, Plus, X } from 'lucide-react'
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getToken } from "@/hooks/get-token";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "@/components/ui/input";
import { isPermissionGranted } from '@/hooks/permission'
import { useSelector } from 'react-redux'

const ClientWeeklyCalendar = ({ client, loading, getClient, setLoading }) => {
    const user = useSelector((state) => state.auth.user);
    const { toast } = useToast()
    const [packages, setPackages] = useState(null);
    const [adding, setAdding] = useState(false);
    const [weeklyCalanderModalOpen, setWeeklyCalanderModalOpen] = useState(false);
    const [selectedWeelyCalendar, setSelectedWeelyCalendar] = useState(null);
    const [postTypes, setPostTypes] = useState(null);
    const [selectedPostType, setSelectedPostType] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [postQuantity, setPostQuantity] = useState(0);
    const [calendarEditing, setCalendarEditing] = useState(false);
    const [selectedDayOfWeek, setSelectedDayOfWeek] = useState('Monday');
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        if (!packages) {
            getSystemPackages();
        }
    }, [packages])

    useEffect(() => {
        if (postTypes === null) {
            getPostTypes();
        }
    }, [postTypes])
    const getPostTypes = async () => {
        setLoading(true)
        try {
            let response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/post-type/all`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while fetching post types",
                    variant: "destructive"
                })
            }
            toast({
                title: "Success",
                description: "Post types fetched successfully",
            })

            setPostTypes(response.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while fetching post types",
                variant: "destructive"
            })
        } finally {
            setLoading(false);
        }
    }

    // Get System Packages
    const getSystemPackages = async () => {
        try {
            let response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/package/all`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })

            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "Error to getting system packages",
                    variant: "destructive"
                })
            }
            setPackages(response.data);

        } catch (err) {
            toast({
                title: "Error!",
                description: "Getting error to get system packages",
                variant: "destructive",
            })
        }
    }

    // on Weekly Calendar Modal Change
    const onWeeklyCalendarModalChange = () => {
        setWeeklyCalanderModalOpen(!weeklyCalanderModalOpen);
    }

    const editWeeklyCalendarPackage = async (e) => {
        e.preventDefault();
        setCalendarEditing(true);

        let data = {
            "weeklyCalendarId": selectedWeelyCalendar.id,
            "socialMediaPlatformId": parseInt(selectedPlatform),
            "postTypeId": parseInt(selectedPostType),
            "quantity": parseInt(postQuantity)
        }

        try {
            let response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/calendar/weekly-calendar-entry/`, data, {
                headers: {
                    "Content-Type": "Application/json",
                    Authorization: `Bearer ${getToken()}`
                }
            })

            if (response.status !== 201) toast({
                title: "Error",
                description: "An error occurred while fetching post types",
                variant: "destructive"
            })
            getClient(client.id);
            onWeeklyCalendarModalChange()
            toast({
                title: "Success",
                description: "Post type successfully",
            })

        } catch (err) {
            toast({
                title: "Error",
                description: "An error occurred while fetching post types",
                variant: "destructive"
            })
        } finally {
            setCalendarEditing(false)
        }
    }

    const onCreateWeeklyCalendar = async () => {
        setAdding(true);
        try {
            let response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/calendar/weekly-calendar`, {
                'clientId': client.id,
                'dayOfWeek': selectedDayOfWeek
            }, {
                headers: {
                    'Content-Type': 'Application/json',
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.status !== 200) toast({
                title: "Error",
                description: "An error occurred while fetching post types",
                variant: "destructive"
            })
            getClient(client.id);
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while fetching post types",
                variant: "destructive"
            })
        } finally {
            setAdding(false);
        }
    }


    // Delete Weekly Calendar
    const deleteWeeklyCalendar = async (id) => {
        
        setDeleting(true);
        try {
            let response = await axios.delete(`${import.meta.env.VITE_USER_API_SERVER}/api/calendar/weekly-calendar/${id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })
            if (response.status !== 200) toast({
                title: "Error!",
                description: "Failed to delete weekly calendar",
                variant: "destructive"
            })
            toast({
                title: "Success!",
                description: "Weekly calendar deleted successfully"
            })
            getClient(client.id);
        } catch (error) {
            console.log(error);
        }finally{
            setDeleting(false);
        }
    }

    return (<>
        <TabsContent value="weekly-calendar">
            <Card className="w-full">
                <CardHeader className={`flex flex-row justify-between items-center`}>
                    <div>
                        <CardTitle>Client Weekly Calendar</CardTitle>
                        <CardDescription>
                            You can add and removes client&#39;s weekly calendar
                        </CardDescription>
                    </div>



                </CardHeader>
                <CardContent className={`space-y-2`}>
                    <div className="flex flex-row gap-2">
                        <div
                            className={`flex-1 rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50  p-3`}>
                            <h4>Add and remove weekly calendar</h4>
                            <div className='flex flex-wrap   gap-4 py-4'>
                                <Table className="w-full border-collapse border border-slate-500">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="border border-slate-600">Id</TableHead>
                                            <TableHead className="border border-slate-600">Name</TableHead>
                                            <TableHead className="border border-slate-600">Platforms</TableHead>
                                            <TableHead className="border border-slate-600">Status</TableHead>
                                            <TableHead className="border border-slate-600">Action</TableHead>

                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* {Weekly Calendar Add} */}
                                        {isPermissionGranted(user, 'Weekly Calendar Add') &&
                                            <TableRow key={`weekly-calender-input`}>
                                                <TableCell className="border border-slate-600"> </TableCell>
                                                <TableCell className="border border-slate-600">
                                                    <Select
                                                        onValueChange={(value) => {
                                                            setSelectedDayOfWeek(value);
                                                        }}>
                                                        <SelectTrigger className="">
                                                            <SelectValue placeholder="Select a Week Day" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={`Monday`}>Monday</SelectItem>
                                                            <SelectItem value={`Tuesday`}>Tuesday</SelectItem>
                                                            <SelectItem value={`Wednesday`}>Wednesday</SelectItem>
                                                            <SelectItem value={`Thursday`}>Thursday</SelectItem>
                                                            <SelectItem value={`Friday`}>Friday</SelectItem>
                                                            <SelectItem value={`Saturday`}>Saturday</SelectItem>
                                                            <SelectItem value={`Sunday`}>Sunday</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="border border-slate-600"> </TableCell>
                                                <TableCell className="border border-slate-600"> </TableCell>
                                                <TableCell className="border border-slate-600">
                                                    <button className={`bg-zinc-50 text-black p-1 rounded`}
                                                        onClick={() => {
                                                            onCreateWeeklyCalendar();
                                                        }}
                                                    >
                                                        <Plus size={15} />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        }
                                        {
                                            client && client.weeklyCalendar && client.weeklyCalendar.map((weeklyCalendar, index) => (
                                                <TableRow key={`w${weeklyCalendar.id}`}>
                                                    <TableCell
                                                        className="border border-slate-600"> {index + 1}</TableCell>
                                                    <TableCell
                                                        className="border border-slate-600"> {weeklyCalendar.dayOfWeek}</TableCell>
                                                    <TableCell
                                                        className="border border-slate-600">
                                                        <div
                                                            className={`flex flex-wrap gap-1`}> {weeklyCalendar.entries.map((entry, entryIndex) => (
                                                                <img key={`e${entryIndex}`}
                                                                    src={entry.socialMediaPlatform.icon}
                                                                    width={20} alt={entry.socialMediaPlatform.name} />
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="border border-slate-600"> <Skeleton
                                                        className="h-4 w-[50px]" /></TableCell>
                                                    <TableCell className="border border-slate-600">
                                                        <div className={`flex flex-row gap-2`}>
                                                            {isPermissionGranted(user, 'Weekly Calendar Edit') && <button className={`bg-blue-500 p-1 rounded`}
                                                                onClick={() => {
                                                                    // console.log(weeklyCalendar.entries)
                                                                    setSelectedWeelyCalendar(weeklyCalendar);
                                                                    onWeeklyCalendarModalChange();
                                                                }}
                                                            >
                                                                <Pencil size={15} />
                                                            </button> }
                                                            
                                                            {isPermissionGranted(user, 'Weekly Calendar Delete') && <button 
                                                            onClick={()=>{
                                                                // delete weekly calender delete
                                                                deleteWeeklyCalendar(weeklyCalendar.id);
                                                                
                                                            }}
                                                            className={`bg-red-400 p-1 rounded`}>
                                                                <Delete size={15} />
                                                            </button>}
                                                            
                                                        </div>

                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        }

                                        {adding && (<TableRow key={`loading3`}>
                                            <TableCell className="border border-slate-600"> <Skeleton
                                                className="h-4 w-[50px]" /></TableCell>
                                            <TableCell className="border border-slate-600"> <Skeleton
                                                className="h-4 w-[50px]" /></TableCell>
                                            <TableCell className="border border-slate-600"> <Skeleton
                                                className="h-4 w-[50px]" /></TableCell>
                                            <TableCell className="border border-slate-600"> <Skeleton
                                                className="h-4 w-[50px]" /></TableCell>
                                            <TableCell className="border border-slate-600"> <Skeleton
                                                className="h-4 w-[50px]" /></TableCell>
                                            <TableCell className="border border-slate-600"> <Skeleton
                                                className="h-4 w-[50px]" /></TableCell>
                                        </TableRow>)}

                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* Post Type Modal */}
            <Modal
                key={`editWeeklyCalendarModal`}
                open={weeklyCalanderModalOpen}
                onClose={() => onWeeklyCalendarModalChange()}
            >
                <ModalMain className={`w-full md:w-8/12 lg:w-10/12`}>

                    <ModalClose onClose={() => onWeeklyCalendarModalChange()}>
                        <CircleX />
                    </ModalClose>
                    <ModalHead>
                        {/* Title */}
                        <p className={``}>Edit Weekly Calender Post Types</p>
                    </ModalHead>
                    {/* Modal Body */}
                    <ModalBody className={`p-5`}>

                        <form id="createpackage" action="" onSubmit={editWeeklyCalendarPackage}>
                            <Table className="w-full border-collapse border border-slate-500">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="border border-slate-600">Id</TableHead>
                                        <TableHead className="border border-slate-600">Icon</TableHead>
                                        <TableHead className="border border-slate-600">Platforms</TableHead>
                                        <TableHead className="border border-slate-600">Post Type</TableHead>
                                        <TableHead className="border border-slate-600">Quantity</TableHead>
                                        <TableHead className="border border-slate-600">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedWeelyCalendar && selectedWeelyCalendar.entries && selectedWeelyCalendar.entries.map((entry, index) => (
                                        <TableRow key={`e${entry.id}`}>
                                            <TableCell className="border border-slate-600">{index + 1}</TableCell>
                                            <TableCell className="border border-slate-600"><img
                                                src={entry.socialMediaPlatform.icon} width={20} /></TableCell>
                                            <TableCell
                                                className="border border-slate-600">{entry.socialMediaPlatform.name}</TableCell>
                                            <TableCell
                                                className="border border-slate-600">{entry.postType.name}</TableCell>
                                            <TableCell
                                                className="border border-slate-600">{entry.quantity}</TableCell>
                                            <TableCell className="border border-slate-600">
                                                <button className={`bg-red-400 p-1 rounded`}><Delete size={15} />
                                                </button>
                                            </TableCell>

                                        </TableRow>
                                    ))}

                                    <TableRow key={`new-entry-form`}>

                                        <TableCell className="border border-slate-600"></TableCell>
                                        <TableCell className="border border-slate-600">

                                        </TableCell>
                                        <TableCell className="border border-slate-600">
                                            <Select onValueChange={(value) => {
                                                setSelectedPlatform(value)
                                            }}>
                                                <SelectTrigger className="">
                                                    <SelectValue placeholder="Select a Platform" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {client && client.platforms.map((platform, index) => (
                                                        <SelectItem key={`p${platform.id}`}
                                                            value={`${platform.id}`}>
                                                            <div className={`flex flex-row gap-1`}><img
                                                                src={platform.icon} width={20} />{platform.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}

                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="border border-slate-600">
                                            <Select onValueChange={(e) => {
                                                setSelectedPostType(e)
                                            }}>
                                                <SelectTrigger className="">
                                                    <SelectValue placeholder="Select a Post Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {postTypes && postTypes.map((type, index) => (
                                                        <SelectItem key={`t${type.id}`} value={`${type.id}`}>
                                                            {type.name}
                                                        </SelectItem>
                                                    ))}

                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="border border-slate-600">
                                            <Input min={1} type={`number`} placeholder={`Quantity`}
                                                value={postQuantity} onChange={(e) => {
                                                    setPostQuantity(e.target.value);
                                                }} />
                                        </TableCell>
                                        <TableCell className="border border-slate-600">
                                            <button
                                                type={"submit"}
                                                className={`bg-zinc-600 dark:bg-zinc-50 p-1 rounded text-white dark:text-black`}>
                                                <Plus size={15} /></button>
                                        </TableCell>

                                    </TableRow>
                                </TableBody>

                            </Table>

                        </form>

                    </ModalBody>
                    <ModalFooter
                        className={`flex flex-row justify-end items-center pt-2`}
                    >

                    </ModalFooter>

                </ModalMain>
            </Modal>
        </TabsContent>
    </>
    )
}
export default ClientWeeklyCalendar;