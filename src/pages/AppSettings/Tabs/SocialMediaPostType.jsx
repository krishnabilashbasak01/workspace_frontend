import { useEffect, useState } from 'react';
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import Modal, {
    ModalHead,
    ModalMain,
    ModalClose,
    ModalBody,
    ModalFooter,
} from "../../../components/app/Modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Plus,
    CircleX,
    Pencil,
    Loader2,
    Delete
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

import { getToken } from '../../../hooks/get-token';

const SocialMediaPostType = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [postTypes, setPostTypes] = useState(null);
    const [createPostTypeForm, setCreatePostTypeForm] = useState({});

    const [modalCreatePostTypeOpen, setModalCreatePostTypeOpen] = useState(false);

    useEffect(() => {
        if (postTypes === null) {
            getPostTypes();
        }
    }, [postTypes])

    // Get all post types
    const getPostTypes = async () => {
        setIsLoading(true)
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
            setIsLoading(false);
        }
    }

    // create and edit post type
    const handleCreatePostTypeSubmit = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            let response = null;
            if (createPostTypeForm.id) {
                response = await axios.put(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/post-type`,
                    createPostTypeForm,
                    {
                        headers: {
                            Authorization: `Bearer ${getToken()}`
                        }
                    });

            } else {
                response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/post-type`,
                    createPostTypeForm,
                    {
                        headers: {
                            Authorization: `Bearer ${getToken()}`
                        }
                    });
            }

            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while creating post type",
                    variant: "destructive"
                })
            }

            toast({
                title: "Success",
                description: "Post type created successfully",
            });

            getPostTypes();
            setCreatePostTypeForm({});
            onPostTypeModalOpen();

        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while creating post type",
                variant: "destructive"
            })
        } finally {
            setIsCreating(false)
        }
    }

    // delete post type
    const deletePostType = (postType) => {
        setIsLoading(true);
        try {
            let response = axios.delete(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/post-type/${postType.id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description: "An error occurred while deleting post type",
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Success",
                    description: "Post type deleted successfully",
                })
                getPostTypes();
            }

        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while deleting post type",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }

    const onPostTypeModalOpen = () => {
        setModalCreatePostTypeOpen(!modalCreatePostTypeOpen);
    }
    return (<>
        <TabsContent value="social-media-post-type">
            <Card className="w-full">
                <CardHeader className={`flex flex-row justify-between items-center`}>
                    <div>
                        <CardTitle>Social Media Post Types</CardTitle>
                        <CardDescription>
                            Create and remove social media Platforms
                        </CardDescription>
                    </div>
                    <Button onClick={() => {
                        setCreatePostTypeForm({})
                        onPostTypeModalOpen()
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
                            {postTypes && postTypes.map((type, index) => (
                                <TableRow key={index}>
                                    <TableCell>{type.name}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            {/* on edit social media platform */}
                                            <Button
                                                className={`bg-transparent hover:bg-transparent 
                                                text-black dark:text-white`} size="small"
                                                onClick={() => {
                                                    setCreatePostTypeForm(type)
                                                    onPostTypeModalOpen()
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
                                                        <AlertDialogAction onClick={() => deletePostType(type)}>Delete</AlertDialogAction>
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
            key={`createposttypemodal`}
            open={modalCreatePostTypeOpen}
            onClose={() => onPostTypeModalOpen()}
        >
            <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>
                <form id="editposttype" action="" onSubmit={handleCreatePostTypeSubmit}>
                    <ModalClose onClose={() => onPostTypeModalOpen()}>
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
                                    value={`${createPostTypeForm && createPostTypeForm.name ? createPostTypeForm.name : ""}`}
                                    onChange={(e) => {
                                        setCreatePostTypeForm((prev) => ({
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
                                <Switch id="status" checked={createPostTypeForm.status ? createPostTypeForm.status : false}
                                    onCheckedChange={(e) => {
                                        setCreatePostTypeForm((prev) => ({
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
export default SocialMediaPostType;