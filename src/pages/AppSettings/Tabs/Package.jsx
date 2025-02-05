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

    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Delete,
    Plus,
    CircleX,
    Pencil,
    Loader2,
    Fan,
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
import { getToken } from '../../../hooks/get-token';
const Package = () => {
    const { toast } = useToast();
    const [packages, setPackages] = useState(null);
    const [loading, setLoading] = useState(false);
    const [createPackageForm, setCreatePackageForm] = useState({});
    const [packageModalOpen, setPackageModalOpen] = useState(false);


    useEffect(() => {
        if (packages === null) {
            getPackages();
        }
    }, [packages])

    // On package modal change
    const onPackageModalChange = () => {
        setPackageModalOpen(!packageModalOpen);
    }

    // Get all packages
    const getPackages = async () => {
        setLoading(true);
        try {
            let response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/package/all`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while fetching packages",
                    variant: "destructive",
                })
            }
            setPackages(response.data);
            
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while fetching packages",
                variant: "destructive",
            })
        } finally {
            setLoading(false);
        }

    }

    // create package
    const createPackage = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response = null;
            if (createPackageForm.id) {
                response = await axios.put(`${import.meta.env.VITE_USER_API_SERVER}/api/package/${createPackageForm.id}`, createPackageForm, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    }
                })
            } else {
                response = axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/package`, createPackageForm, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    }
                })
            }

            if (response.status !== 200) {
                toast({
                    title: "Error!",
                    Description: "An error occurred while creating package",
                })
            }

            getPackages();
            onPackageModalChange();
            setCreatePackageForm({});

            toast({
                title: "Success",
                description: "Package created successfully",
                variant: "success",
            });


        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while creating package",
                variant: "destructive",
            });

        } finally {
            setLoading(false);
        }
    }

    // delete package
    const deletePackage = async (item) => {
        setLoading(true);

        try {
            let response = await axios.delete(`${import.meta.env.VITE_USER_API_SERVER}/api/package/${item.id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                }
            })
            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while deleting package",
                    variant: "destructive",
                });
            }
            getPackages();
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while deleting package",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }


    return (<>
        <TabsContent value="packages">
            <Card className="w-full">
                <CardHeader className={`flex flex-row justify-between items-center`}>
                    <div>
                        <CardTitle>Package</CardTitle>
                        <CardDescription>
                            Package settings for work flow app
                        </CardDescription>
                    </div>
                    <Button onClick={() => {
                        setCreatePackageForm({})
                        onPackageModalChange()
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
                            {packages && packages.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            {/* on edit social media platform */}
                                            <Button
                                                className={`bg-transparent hover:bg-transparent 
                        text-black dark:text-white`} size="small"
                                                onClick={() => {
                                                    setCreatePackageForm(item)
                                                    onPackageModalChange()
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
                                                            Click on delete to delete Package.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className={`text-zinc-400`}>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deletePackage(item)}>Delete</AlertDialogAction>
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

        {/* Post Type Modal */}
        <Modal
            key={`createpackagemodal`}
            open={packageModalOpen}
            onClose={() => onPackageModalChange()}
        >
            <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>
                <form id="createpackage" action="" onSubmit={createPackage}>
                    <ModalClose onClose={() => onPackageModalChange()}>
                        <CircleX />
                    </ModalClose>
                    <ModalHead>
                        {/* Title */}
                        <p className={``}>Create Package Form</p>
                    </ModalHead>
                    {/* Modal Body */}
                    <ModalBody className={`p-5`}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name :
                                </Label>
                                <Input
                                    id="name"
                                    value={`${createPackageForm && createPackageForm.name ? createPackageForm.name : ""}`}
                                    onChange={(e) => {
                                        setCreatePackageForm((prev) => ({
                                            ...prev,
                                            name: e.target.value
                                        }))
                                    }}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description :
                                </Label>
                                <Input
                                    id="description"
                                    value={`${createPackageForm && createPackageForm.description ? createPackageForm.description : ""}`}
                                    onChange={(e) => {
                                        setCreatePackageForm((prev) => ({
                                            ...prev,
                                            description: e.target.value
                                        }))
                                    }}
                                    className="col-span-3"
                                />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Status :
                                </Label>
                                <Switch id="status" checked={createPackageForm.status ? createPackageForm.status : false}
                                    onCheckedChange={(e) => {
                                        setCreatePackageForm((prev) => ({
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
                        <Button type="submit" disabled={loading ? true : false}>
                            Submit {loading && <Loader2 className="animate-spin" />}{" "}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalMain>
        </Modal>
    </>)
}
export default Package;