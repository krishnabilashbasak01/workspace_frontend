import {useEffect, useState} from 'react';
import axios from "axios";
import {Separator} from "@/components/ui/separator";
import {useIsMobile} from "@/hooks/use-mobile";
import {useToast} from "@/hooks/use-toast";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {TabsContent} from "@/components/ui/tabs";
import {Label} from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
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
    ArrowUpDown,
    ChevronDown,
    MoreHorizontal,
    Plus,
    CircleX,
    Pencil,
    Loader2,
    Delete
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Modal, {
    ModalHead,
    ModalMain,
    ModalClose,
    ModalBody,
    ModalFooter,
} from "../../../components/app/Modal";
import {setUser} from '../../../features/auth/authSlice';
import {getToken} from '../../../hooks/get-token';
import {set} from 'react-hook-form';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const SocialMediaTab = () => {
    const {toast} = useToast();
    const [createModalOpen, setCerateModalOpen] = useState(false);
    const [isPlatformCreating, setIsPlatformCreating] = useState(false);
    const [createFormData, setCreateFormData] = useState({});
    const [allPlatforms, setAllPlatforms] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [contexts, setContexts] = useState(null);
    const [selectedContext, setSelectedContext] = useState(null);

    const onCreateModelStateChange = () => {
        setCerateModalOpen(!createModalOpen);
    }


    useEffect(() => {
        if (allPlatforms === null) {
            getAlPlatforms();
        }
        return () => {
        }
    }, [allPlatforms])


    useEffect(() => {
        if (contexts === null) {
            getContexts();
        }
    }, [contexts])
    // Get Context
    const getContexts = async () => {
        setIsLoading(true);
        try {

            const response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/context/all`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })

            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while fetching social media contexts",
                    variant: "destructive"
                })
            }
            setContexts(response.data);


        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while fetching social media contexts",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }


    // On Cerate Platform Submit
    const handleCreatePlatformSubmit = async (e) => {
        e.preventDefault();
        setIsPlatformCreating(true);
        try {
            let response = null
            if (createFormData && createFormData.id) {
                response = await axios.put(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/${createFormData.id}`,
                    createFormData,
                    {
                        headers: {
                            "Content-Type": "Application/json",
                            Authorization: `Bearer ${getToken()}`
                        }
                    }
                )
            } else {
                response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms`,
                    createFormData,
                    {
                        headers: {
                            "Content-Type": "Application/json",
                            Authorization: `Bearer ${getToken()}`
                        }
                    }
                )
            }

            if (response.status !== 201) toast({
                title: "Error!",
                description: "Failed to create platform",
                variant: "destructive"
            })

            toast({
                title: "Success!",
                description: createFormData && createFormData.id ? "Platform updated successfully" : "Platform Created Successfully"
            })
            getAlPlatforms();
            setCreateFormData({});
            onCreateModelStateChange();

        } catch (e) {
            console.log(e);
        } finally {
            setIsPlatformCreating(false)
        }
    }

    //  Get all platforms
    const getAlPlatforms = async () => {

        setIsLoading(true);
        try {
            let response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/all`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })
            if (response.status !== 200) toast({
                title: "Error!",
                description: "Failed get all platforms"
            });
            // console.log(response.data);

            // console.log('platforms',response.data)

            setAllPlatforms(response.data);
        } catch (error) {
            toast({
                title: "Error!",
                description: "Failed to fetch platforms",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }

    // On delete social media platform
    const deleteSocialMediaPlatform = async (platform) => {
        setIsLoading(true);
        try {

            let response = await axios.delete(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/${platform.id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })
            if (response.status !== 200) toast({
                title: "Error!",
                description: "Failed to delete social media platform",
                variant: "destructive"
            })
            toast({
                title: "Success!",
                description: "Social media platform deleted successfully"
            })
            getAlPlatforms();
        } catch (error) {
            toast({
                title: "Error!",
                description: "Failed to delete social media platform",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }

    // on Context Add To Social Media Platform
    const onContextAddToSocialMediaPlatform = async (platformId) => {
        setIsLoading(true)
        let data = {
            platformId,
            contextId: selectedContext
        }

        try {
            let response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/add-context-to-social-media`, data, {
                headers: {
                    "Content-Type": "Application/json",
                    Authorization: `Bearer ${getToken()}`
                }
            })

            if (response.status !== 200) toast({
                title: "Error!",
                description: "Failed to add context to platform",
                variant: "destructive"
            })
            getAlPlatforms();
            toast({
                title: "Success!",
                description: "context added to platform",

            })
            onCreateModelStateChange();
        } catch (error) {
            toast({
                title: "Error!",
                description: "Failed to create platform",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }

    // Context remove from social media platform
    const onContextRemoveFromSocialMediaPlatform = async (platformId, socialMediaContextId) => {
        setIsLoading(true)
        let data = {
            platformId,
            contextId: socialMediaContextId
        }

        try{
            let response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/remove-context-from-social-media`, data,{
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'Application/json',
                }
            })

            if(response.status !== 200) toast({
                title: "Error!",
                description: "Failed to remove context from platform",
                variant: "destructive"
            })

            getAlPlatforms();
            toast({
                title: "Success!",
                description: "context added to platform",

            })
            onCreateModelStateChange();
        }catch (e) {
            toast({
                title: "Error!",
                description: "Failed to remove context from platform",
                variant: "destructive"
            })
        }finally {
            setIsLoading(false);
        }

        // console.log(data)
    }
    return (<>
        <TabsContent value="social-media">
            <Card className="w-full">
                <CardHeader className={`flex flex-row justify-between items-center`}>
                    <div>
                        <CardTitle>Social Media</CardTitle>
                        <CardDescription>
                            Create and remove social media Platforms
                        </CardDescription>
                    </div>
                    <Button onClick={() => {
                        setCreateFormData({});
                        onCreateModelStateChange()
                    }}><Plus/></Button>
                </CardHeader>
                <CardContent className={`space-y-2`}>
                    <Table>

                        <TableHeader>
                            <TableRow>
                                <TableHead>Icon</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Action</TableHead>

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                allPlatforms && allPlatforms.map((platform, index) => (
                                    <TableRow key={index}>
                                        <TableCell><img src={platform.icon} width={50} alt=""/></TableCell>
                                        <TableCell>{platform.name}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-3">
                                                {/* on edit social media platform */}
                                                <Button
                                                    className={`bg-transparent hover:bg-transparent 
                                                text-black dark:text-white`} size="small"
                                                    onClick={() => {
                                                        setCreateFormData(platform)

                                                        onCreateModelStateChange();
                                                    }}
                                                >
                                                    <Pencil/>
                                                </Button>

                                                {/* Delete Social Media Platform */}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            className={`bg-transparent hover:bg-transparent text-black dark:text-white `}
                                                            size="small"><Delete/></Button>

                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Click on delete to delete social media platform.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel
                                                                className={`text-zinc-400`}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => deleteSocialMediaPlatform(platform)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>

                </CardContent>
                <CardFooter>

                </CardFooter>
            </Card>
        </TabsContent>
        <Modal
            key={`createPlatformModal`}
            open={createModalOpen}
            onClose={() => onCreateModelStateChange()}
        >
            <ModalMain className={`w-full md:w-8/12 lg:w-10/12 xl:w-8/12`}>

                <ModalClose onClose={() => onCreateModelStateChange()}>
                    <CircleX/>
                </ModalClose>
                <ModalHead>
                    {/* Title */}
                    <p className={``}>Create Social Media Platform</p>
                </ModalHead>
                {/* Modal Body */}
                <ModalBody className={`p-5`}>
                    <form id="create-platform" action="" onSubmit={handleCreatePlatformSubmit}>
                        <div className="grid gap-4 py-4">

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Platform Name :
                                </Label>
                                <Input
                                    id="name"
                                    value={`${createFormData.name ? createFormData.name : ""}`}
                                    onChange={(e) => {
                                        setCreateFormData((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="icon" className="text-right">
                                    Icon :
                                </Label>
                                <Input
                                    id="icon"
                                    value={`${createFormData.icon ? createFormData.icon : ""}`}
                                    onChange={(e) => {
                                        setCreateFormData((prev => ({
                                            ...prev,
                                            icon: e.target.value
                                        })))
                                    }}
                                    className="col-span-3"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Status :
                                </Label>
                                <Switch id="status" checked={createFormData.status ? createFormData.status : false}
                                        onCheckedChange={(e) => {
                                            setCreateFormData((prev) => ({
                                                ...prev,
                                                status: e
                                            }))
                                        }}
                                />
                            </div>


                        </div>
                        <div className={`w-full flex justify-end`}>
                            <Button type="submit" disabled={isPlatformCreating ? true : false}>
                                Submit {isPlatformCreating && <Loader2 className="animate-spin"/>}{" "}
                            </Button>
                        </div>

                    </form>
                    <h4>Contexts : </h4>

                    <Table className="w-full border-collapse border border-slate-500">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="border border-slate-600">Id</TableHead>
                                <TableHead className="border border-slate-600">Name</TableHead>
                                <TableHead className="border border-slate-600">Action</TableHead>

                            </TableRow>
                        </TableHeader>
                        <TableBody>

                            {createFormData && createFormData.contexts && createFormData.contexts.map((context, index) => (
                                <TableRow key={index}>
                                    <TableCell className={`border border-slate-600`}>{index + 1}</TableCell>
                                    <TableCell className={`border border-slate-600`}>{context.name}</TableCell>
                                    <TableCell className={`border border-slate-600`}>
                                        <button className={`bg-red-400 rounded p-0.5`}
                                        onClick={()=>{
                                            onContextRemoveFromSocialMediaPlatform(createFormData.id, context.id);
                                        }}
                                        >
                                            <Delete size={18}/>
                                        </button>
                                    </TableCell>

                                </TableRow>
                            ))}
                            <TableRow key={`new-context`}>
                                <TableCell className={`border border-slate-600`}></TableCell>
                                <TableCell className={`border border-slate-600`}>
                                    <Select
                                        onValueChange={(value) => {
                                            setSelectedContext(parseInt(value))
                                        }}>
                                        <SelectTrigger className="w-4/12">
                                            <SelectValue placeholder="Select a Platform"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contexts && contexts.map((context, index) => (
                                                <SelectItem key={`context_${context.id}`}
                                                            value={context.id}>{context.name}</SelectItem>
                                            ))}

                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className={`border border-slate-600`}>
                                    <button
                                        onClick={(e) => {
                                            onContextAddToSocialMediaPlatform(createFormData.id);
                                        }}
                                        className={`bg-zinc-600 dark:bg-zinc-50 text-white dark:text-black rounded`}>
                                        {isLoading ? <Loader2 className="animate-spin"/> : <Plus size={20}/> }
                                    </button>
                                </TableCell>

                            </TableRow>
                        </TableBody>
                    </Table>
                </ModalBody>


            </ModalMain>
        </Modal>
    </>)
}
export default SocialMediaTab;