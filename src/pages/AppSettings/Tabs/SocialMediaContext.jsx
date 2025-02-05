import { useEffect, useState } from 'react';
import axios from "axios";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
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
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowUpDown,
    ChevronDown,
    MoreHorizontal,
    Plus,
    CircleX,
    Pencil,
    Loader2,
    Delete,
} from "lucide-react";
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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getToken } from '../../../hooks/get-token';
import Modal, {
    ModalHead,
    ModalMain,
    ModalClose,
    ModalBody,
    ModalFooter,
} from "../../../components/app/Modal";
import { get } from 'react-hook-form';
const SocialMediaContext = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [contexts, setContexts] = useState(null);
    const [createContextForm, setCreateContextForm] = useState({});

    const [modalCreateContextOpen, setModalCreateContextOpen] = useState(false);

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


    // Create Context
    const createContext = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            let response = null;
            if (createContextForm.id) {
                response = await axios.put(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/context/${createContextForm.id}`,
                    createContextForm, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    }
                })
            } else {
                response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/context`, createContextForm, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    }
                })
            }


            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while creating a social media context",
                    variant: "destructive"
                })
            }

            getContexts();
            setCreateContextForm({});
            onCreateContextModalOpen();
            toast({
                title: "Success!",
                description: createContextForm.id ? "Social media context updated successfully" : "Social media context created successfully",

            })

        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while creating a social media context",
                variant: "destructive"
            })
        } finally {
            setIsCreating(false);

        }
    }

    // Delete Context
    const deleteContext = async (context) => {
        setIsLoading(true);
        try {
            let response = await axios.delete(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/context/${context.id}`,
                {
                    headers: {

                        Authorization: `Bearer ${getToken()}`
                    }
                });

            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while deleting social media context",
                    variant: "destructive"
                })
            }
            getContexts();
            toast({
                title: "Success!",
                description: response.data.message,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while deleting social media context",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }


    }

    const onCreateContextModalOpen = () => {
        setModalCreateContextOpen(!modalCreateContextOpen);
    }
    return (<>
        <TabsContent value="social-media-context">
            <Card className="w-full">
                <CardHeader className={`flex flex-row justify-between items-center`}>
                    <div>
                        <CardTitle>Social Media Contexts</CardTitle>
                        <CardDescription>
                            Create and remove social media contexts
                        </CardDescription>
                    </div>
                    <Button onClick={() => {
                        setCreateContextForm({});
                        onCreateContextModalOpen();

                    }}><Plus /></Button>
                </CardHeader>
                <CardContent className={`space-y-2`}>
                    <Table>

                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Action</TableHead>

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contexts && contexts.map((context, index) => (
                                <TableRow key={index}>
                                    <TableCell>{context.name}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            {/* on edit social media platform */}
                                            <Button
                                                className={`bg-transparent hover:bg-transparent 
                        text-black dark:text-white`} size="small"
                                                onClick={() => {
                                                    setCreateContextForm(context)
                                                    onCreateContextModalOpen()
                                                }}
                                            >
                                                <Pencil />
                                            </Button>

                                            {/* Delete Social Media Platform */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button className={`bg-transparent hover:bg-transparent text-black dark:text-white `} size="small"><Delete /></Button>

                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Click on delete to delete social media platform.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className={`text-zinc-400`}>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteContext(context)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Social Media Context Modal */}
        <Modal
            key={`createsocialmediamodal`}
            open={modalCreateContextOpen}
            onClose={() => onCreateContextModalOpen()}
        >
            <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>
                <form id="createcontex" action="" onSubmit={createContext}>
                    <ModalClose onClose={() => onCreateContextModalOpen()}>
                        <CircleX />
                    </ModalClose>
                    <ModalHead>
                        {/* Title */}
                        <p className={``}>Create User</p>
                    </ModalHead>
                    {/* Modal Body */}
                    <ModalBody className={`p-5`}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Post Type name :
                                </Label>
                                <Input
                                    id="name"
                                    value={`${createContextForm.name ? createContextForm.name : ""}`}
                                    onChange={(e) => {
                                        setCreateContextForm((prev) => ({
                                            ...prev,
                                            name: e.target.value
                                        }))
                                    }}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Status :
                                </Label>
                                <Switch id="status" checked={createContextForm.status ? createContextForm.status : false}
                                    onCheckedChange={(e) => {
                                        setCreateContextForm((prev) => ({
                                            ...prev,
                                            status: e
                                        }))
                                    }}
                                />
                            </div>

                        </div>
                    </ModalBody>
                    <ModalFooter
                        className={`flex flex-row justify-end items-center pt-2`}
                    >
                        <Button type="submit" disabled={isCreating ? true : false}>
                            Submit {isCreating && <Loader2 className="animate-spin" />}{" "}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalMain>
        </Modal>
    </>)
}
export default SocialMediaContext;