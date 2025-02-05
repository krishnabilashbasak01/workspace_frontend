import { useEffect, useState } from 'react'
import { TabsContent } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Plus,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {useSelector} from "react-redux";

const ClientDetails = ({ client, loading, getClient, setLoading }) => {
    const users = useSelector((state) => state.users.users);
    const [smes, setSmes] = useState(null);

    useEffect(()=>{
        if(!smes && users){
            getSmes()
        }
    },[smes, users])

    // get Smes
    const getSmes = () => {
        const smeDetails = client.smes.map((clientSme)=>{
            //     find user matching the smeId
            const user = users.find((user) => user._id === clientSme.smeId);
            // console.log(user);
            if(user){
                return {
                    sme: user,
                    smeRole: clientSme.role,
                }
            }
        })

        setSmes(smeDetails);
    }

    return (<>
        <TabsContent value="client-details">
            <Card className="w-full">
                <CardContent className={`space-y-2`}>
                    <div className={`flex flex-row justify-center mt-5`}>
                        <div className={`p-5 border border-zinc-600 rounded flex flex-col justify-center items-center`}>
                            <img  src={client?.profilePicture} className={`rounded-full w-32 h-32 object-cover`}/>
                            <p className={`text-center text-4xl`}>{client.name}</p>
                            <p className={`text-center text-xl`}>{client.businessName}</p>

                            <p className={`text-center text-sm text-green-600`}>({client.username})</p>

                        </div>
                    </div>

                    <Table className="w-full border-collapse border border-slate-500">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="border border-slate-600">Id</TableHead>
                                <TableHead className="border border-slate-600">Name</TableHead>
                                <TableHead className="border border-slate-600">Role</TableHead>
                                <TableHead className="border border-slate-600">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {smes && smes.map((sme, index)=>(
                                <TableRow key={index}>
                                    <TableCell className={`border border-slate-600`}>{index+1}</TableCell>
                                    <TableCell className={`border border-slate-600`}>{sme?.sme?.name}</TableCell>
                                    <TableCell className={`border border-slate-600`} >{sme?.smeRole}</TableCell>
                                    <TableCell className={`border border-slate-600`}></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </CardContent>
            </Card>
        </TabsContent>
    </>)
}
export default ClientDetails;