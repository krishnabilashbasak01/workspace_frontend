import {useEffect, useState} from 'react'
import {TabsContent} from "@/components/ui/tabs";
import axios from 'axios';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Check, Plus, X} from 'lucide-react'
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import {getToken} from "@/hooks/get-token";
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

import { Skeleton } from "@/components/ui/skeleton"
import {convertIsoStringTodate} from "../../../app/dateformat.js";


const ClientPackage = ({client, loading, getClient, setLoading}) => {
    const {toast} = useToast();
    const [packages, setPackages] = useState(null);
    const [isPackageAdding, setIsPackageAdding] = useState(false);

    useEffect(() => {
        if (!packages) {
            getSystemPackages();
        }
    }, [packages])

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

    // add packages to client
    const onAddPackageToClient = async (packageId) => {
        setIsPackageAdding(true);
        try {

            // console.log(client)
            let data = {
                packageId: packageId,
                clientId: client.id,
            }
            // console.log(data)
            let response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/package/active-package`,
                data, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getToken()}`,
                    }

                })
            if (response.status !== 200) {
                toast({
                    title: "Error!",
                    description: "Error to getting system packages",
                    variant: "destructive",
                })
            }

            getClient(client.id);
        } catch (error) {
            toast({
                title: "Error",
                description: "Error to add package",
                variant: "destructive",
            })
        }finally {
            setIsPackageAdding(false);
        }
    }

    // deactivate package for client
    const onDeactivatePackage = async (clientPackageId) => {
        try {
            let response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/package/inactive-package/${clientPackageId}`, {
                headers: {

                    Authorization: `Bearer ${getToken()}`
                }
            })

            if (response.status !== 200) {
                toast({
                    title: "Error!",
                    description: "Error to deactivate package",
                    variant: "destructive",
                })
            }

            getClient(client.id);
            toast({
                title: "Success!",
                description: "Package deactivated successfully",
            })
        } catch (error) {
            toast({
                title: "Error!",
                description: "Error to deactivate package",
                variant: "destructive",
            })
        }
    }

    return (
        <TabsContent value="client-package">
            <Card className="w-full">
                <CardHeader className={`flex flex-row justify-between items-center`}>
                    <div>
                        <CardTitle>Client Packages</CardTitle>
                        <CardDescription>
                            You can add and removes client's packages
                        </CardDescription>
                    </div>

                </CardHeader>
                <CardContent className={`space-y-2`}>
                    <div className="flex flex-row gap-2">

                        {/* Client's Packages */}
                        <div
                            className={`rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 w-full p-3`}>
                            <h4>Client&#39;s Packages</h4>
                            <div className='flex flex-wrap gap-4 py-4'>
                                <Table>

                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="">Id</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Active From</TableHead>
                                            <TableHead>Active To</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead >Action</TableHead>

                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {client && client.packages && client.packages.map((data, index) => (
                                            <TableRow key={data.id}>
                                                <TableCell className="font-medium">{index+1}</TableCell>
                                                <TableCell><p>{data.package.name}</p><p>{data.package.description}</p></TableCell>
                                                <TableCell>{convertIsoStringTodate(data.activationDate).date} {convertIsoStringTodate(data.activationDate).time}</TableCell>
                                                <TableCell>{data.deactivationDate && convertIsoStringTodate(data.deactivationDate).date} {data.deactivationDate && convertIsoStringTodate(data.deactivationDate).rime}</TableCell>
                                                <TableCell ><div className={`${data.status ? 'bg-green-500' : 'bg-red-400'}  p-1 rounded text-center`}>{data.status? 'Active' : 'Inactive'}</div></TableCell>
                                                <TableCell >
                                                    <button onClick={()=>{
                                                        onDeactivatePackage(data.id)
                                                    }} className={`bg-red-400 p-1 rounded`}><X size={15} /></button>
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                        {isPackageAdding && (
                                            <TableRow key={`loading`}>
                                                <TableCell> <Skeleton className="h-4 w-[50px]" /></TableCell>
                                                <TableCell> <Skeleton className="h-4 w-[50px]" /></TableCell>
                                                <TableCell> <Skeleton className="h-4 w-[50px]" /></TableCell>
                                                <TableCell> <Skeleton className="h-4 w-[50px]" /></TableCell>
                                                <TableCell> <Skeleton className="h-4 w-[50px]" /></TableCell>
                                                <TableCell> <Skeleton className="h-4 w-[50px]" /></TableCell>

                                            </TableRow>
                                        )}

                                    </TableBody>

                                </Table>
                            </div>
                        </div>

                        {/* Available Packages*/}
                        <div
                            className={`rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 w-full p-3`}>
                            <h4>Available Packages</h4>
                            <div className='flex flex-wrap gap-4 py-4'>
                                <Table>

                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Id</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead >Action</TableHead>

                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {packages && packages.map((_package, index) => (
                                            <TableRow key={_package.id}>
                                                <TableCell className="font-medium">{index+1}</TableCell>
                                                <TableCell>{_package.name}</TableCell>
                                                <TableCell>{_package.description}</TableCell>
                                                <TableCell >{_package.status? 'Active' : 'Inactive'}</TableCell>
                                                <TableCell ><button disabled={_package.status ? false : true} className={`bg-green-700 p-1 rounded disabled:bg-zinc-400`}
                                                onClick={()=>{
                                                    onAddPackageToClient(_package.id)
                                                }}
                                                ><Check size={15} /></button></TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>

                                </Table>
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </TabsContent>
    )
}

export default ClientPackage;
