import {memo, useEffect, useState, useCallback} from 'react'
import {TabsContent, Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useToast} from '../../../hooks/use-toast';
import axios from 'axios';
import {getToken} from '../../../hooks/get-token';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Check, Delete, HistoryIcon, Loader2, Pencil, Plus, X} from 'lucide-react'
import {Skeleton} from "@/components/ui/skeleton";
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
import {convertIsoStringTodate} from "../../../app/dateformat.js";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ClientSocialMediaPlatforms = ({client, loading, getClient, setLoading}) => {

    const {toast} = useToast();

    const [platforms, setPlatforms] = useState(null);
    const [adding, setAdding] = useState(false);
    const [newMetricData, setNewMetricData] = useState({
        value: 0
    });

    useEffect(() => {
        if (!platforms) {
            getPlatforms()
        }

    }, [platforms]);


    // add social media calendar
    const addSocialMediaPlatform = async (platformId) => {
        let data = {
            clientId: client.id,
            platformId
        }
        setAdding(true);

        try {
            let response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/add-social-media-platforms`,
                data, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                });


            if (response.status !== 200) toast({
                title: "Error!",
                description: "Failed to add platform",
                variant: "destructive"
            })

            getClient(client.id);
            toString({
                title: "Success!",
                description: "Social Media Platform added successfully",
            })

        } catch (error) {
            toast({
                title: "Error!",
                description: "Error to add social media platform",
                variant: "destructive"
            })
        } finally {
            setAdding(false)
        }


    }

    // remove social media calendar
    const removeSocialMediaPlatform = async (platformId) => {
        let data = {
            clientId: client.id,
            platformId
        }
        setAdding(true);

        try {
            let response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/remove-social-media-platforms`,
                data, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                });


            if (response.status !== 200) toast({
                title: "Error!",
                description: "Failed to remove platform",
                variant: "destructive"
            })

            getClient(client.id);
            toString({
                title: "Success!",
                description: "Social Media Platform removed successfully",
            })

        } catch (error) {
            toast({
                title: "Error!",
                description: "Error to remove social media platform",
                variant: "destructive"
            })
        } finally {
            setAdding(false)
        }
    }

    // Get Platforms
    const getPlatforms = async () => {
        try {
            let response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/all`);
            if (response.status !== 200) toast({
                title: "Error!",
                description: "Error to get platforms",
                variant: "destructive"
            })

            setPlatforms(response.data);
        } catch (error) {
            toast({
                title: "Error!",
                description: "Error to get platforms",
                variant: "destructive"
            })
        } finally {

        }
    }

    const Platform = memo(({key, platform, type}) => {
        return (

            <div key={key} className={`relative`}>
                <div className={`w-12`}>
                    <img src={`${platform.icon}`} width={`100%`} alt={`img`}/>
                </div>

                {type === 'add' ? (<button className={`absolute top-0 right-left bg-green-900 rounded-2xl p-[1px]`}
                                           onClick={() => {
                                               addSocialMediaPlatform(platform.id)
                                           }}
                >
                    <Check size={15}/>
                </button>) : ''}
                {type === 'remove' ? (<button className={`absolute top-0 right-0 bg-red-400 rounded-2xl p-[1px]`}
                                              onClick={() => {
                                                  removeSocialMediaPlatform(platform.id)
                                              }}
                >
                    <X size={15}/>
                </button>) : ''}
            </div>

        );
    }, (prevProps, nextProps) => prevProps.platform.id === nextProps.platform.id);

    const onAddMetric = async (socialMediaPlatformId, clientId) => {

        let data = {
            clientId: parseInt(clientId),
            socialMediaPlatformId: parseInt(socialMediaPlatformId),
            contextId: parseInt(newMetricData.contextId),
            metricType: newMetricData.metricType,
            date: newMetricData.date,
            value: parseInt(newMetricData.value)
        }

        if (data.clientId && data.socialMediaPlatformId && data.contextId && data.metricType && data.date) {
            setAdding(true);
            try {
                let response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/metric`, data, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'Application/json',
                    }
                })
                if (response.status !== 201) toast({
                    title: "Error!",
                    description: "Failed to add metric",
                    variant: "destructive"
                });

                getClient(client.id);
                toast({
                    title: "Success!",
                    description: "Metric added successfully",
                })
            } catch (e) {
                toast({
                    title: "Error!",
                    description: "Failed to add metric",
                    variant: "destructive"
                })
            } finally {
                setAdding(false);
            }
        } else {
            toast({
                title: "Error!",
                description: "Please add all fields",
                variant: "destructive"
            })
        }
    }

    const onDeleteMetric = async (metricId) => {
        try {
            let response = await axios.delete(`${import.meta.env.VITE_USER_API_SERVER}/api/social-media-platforms/metric/${metricId}`,{
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'Application/json',
                }
            });

            if(response.status === 200) toast({
                title: "Error!",
                description: "Failed to delete metric",
                variant: "destructive"
            })

            getClient(client.id);

            toast({
                title: "Success!",
                description: "Metric removed successfully",
            })

        }catch (error) {
            toast({
                title: "Error!",
                description: "Failed to remove metric",
                variant: "destructive"
            })
        }
    }
    return (<>
        <TabsContent value="social-media-platform">
            <Card className="w-full">
                <CardHeader className={`flex flex-row justify-between items-center`}>
                    <div>
                        <CardTitle>Platforms</CardTitle>
                        <CardDescription>
                            You can add and removes client's social media platforms
                        </CardDescription>
                    </div>

                </CardHeader>
                <CardContent className={`space-y-2`}>

                    <div className="flex flex-row gap-2">
                        <div
                            className={`rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 w-full p-3`}>
                            <h4>Social Medial Platforms Added</h4>
                            <div className='flex flex-wrap   gap-4 py-4'>
                                {
                                    client && client.platforms.map((platform, index) => (
                                        <Platform key={index} platform={platform} type={'remove'}/>
                                    ))
                                }
                                {adding && (<Skeleton className="h-12 w-12 rounded-full"/>)}
                            </div>
                        </div>
                        <div
                            className={`rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 w-full p-3`}>
                            <h4>Available Social Media plat form</h4>
                            <div className='flex flex-wrap   gap-4 py-4'>
                                {
                                    platforms && platforms.map((platform, index) => (
                                        <Platform key={index} platform={platform} type={'add'}/>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    {/*    Card */}
                    <Card className="w-full">
                        <CardHeader className={`flex flex-row justify-between items-center`}>
                            <div>
                                <CardTitle>Social Media Metrics</CardTitle>
                                <CardDescription>
                                    You can social media metrics as per Social Media Platform
                                </CardDescription>
                            </div>

                        </CardHeader>
                        <CardContent className={`space-y-2`}>


                            <Tabs className={`w-fill`}
                                  defaultValue={client && client.platforms && client.platforms.length > 0 ? client.platforms[0].name : ''}

                            >
                                <TabsList className=" w-full justify-start">
                                    {client && client.platforms && client.platforms.map((platform, index) => (
                                        <TabsTrigger key={`index_${index}`} className="text-xs h-6"
                                                     value={platform.name}>{platform.name}</TabsTrigger>
                                    ))}
                                </TabsList>
                                {client && client.platforms && client.platforms.map((platform, index) => (
                                    <TabsContent key={`content_${index}`} value={`${platform.name}`}>
                                        <div className={`w-full flex flex-col md:flex-row lg:flex-row gap-2`}>
                                            <Card className={`w-full`}>
                                                <CardHeader className={`flex flex-row justify-between items-center`}>
                                                    <div>
                                                        <CardTitle className={`flex flex-row gap-2`}><p>History</p>
                                                            <HistoryIcon/></CardTitle>

                                                    </div>

                                                </CardHeader>
                                                <CardContent className={`space-y-2`}>
                                                    <Table className="w-full border-collapse border border-slate-500">
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead
                                                                    className="border border-slate-600">Id</TableHead>
                                                                <TableHead
                                                                    className="border border-slate-600">Date</TableHead>
                                                                <TableHead
                                                                    className="border border-slate-600">Name</TableHead>
                                                                <TableHead
                                                                    className="border border-slate-600">Value</TableHead>
                                                                <TableHead
                                                                    className="border border-slate-600">Action</TableHead>

                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>

                                                            <TableRow key={`new_matric`}>
                                                                <TableCell className="border border-slate-600"><Pencil
                                                                    size={18}/></TableCell>
                                                                <TableCell className="border border-slate-600">
                                                                    <Input className={``} type={`date`} placeholder={`Date`}
                                                                           value={newMetricData?.date}
                                                                           onChange={(e) => {
                                                                               setNewMetricData((prev) => ({
                                                                                   ...prev,
                                                                                   date: e.target.value,
                                                                               }))
                                                                           }}/>
                                                                </TableCell>
                                                                <TableCell className="border border-slate-600">
                                                                    <Select
                                                                        className={`max-w-64`}
                                                                        onValueChange={(context) => {
                                                                            setNewMetricData((prev) => ({
                                                                                ...prev,
                                                                                contextId: context.id,
                                                                                metricType: context.name
                                                                            }))
                                                                        }}>
                                                                        <SelectTrigger className="">
                                                                            <SelectValue
                                                                                placeholder="Select a Metric Type"/>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {platform && platform.contexts && platform.contexts.map((context, index) => (
                                                                                <SelectItem
                                                                                    key={`context_${context.id}`}
                                                                                    value={context}>{context.name}</SelectItem>
                                                                            ))}

                                                                        </SelectContent>
                                                                    </Select>
                                                                </TableCell>
                                                                <TableCell className="border border-slate-600">
                                                                    <Input min={1} type={`number`}
                                                                           placeholder={`Quantity`}
                                                                           value={newMetricData?.value}
                                                                           onChange={(e) => {
                                                                               setNewMetricData((prev) => ({
                                                                                   ...prev,
                                                                                   value: e.target.value,
                                                                               }))
                                                                           }}/>
                                                                </TableCell>
                                                                <TableCell className="border border-slate-600">
                                                                    <button
                                                                        className={`bg-zinc-600 dark:bg-zinc-50 text-zinc-50 dark:text-black rounded p-1`}
                                                                        onClick={() => {
                                                                            onAddMetric(platform.id, client.id);
                                                                        }}
                                                                    >
                                                                        {adding ? <Loader2 size={18}
                                                                                           className={`animate-spin`}/> :
                                                                            <Plus size={18}/>}
                                                                    </button>
                                                                </TableCell>

                                                            </TableRow>
                                                            {adding && (<TableRow key={`loading3`}>
                                                                <TableCell className="border border-slate-600"> <Skeleton
                                                                    className="h-4 w-[50px]"/></TableCell>
                                                                <TableCell className="border border-slate-600"> <Skeleton
                                                                    className="h-4 w-[50px]"/></TableCell>
                                                                <TableCell className="border border-slate-600"> <Skeleton
                                                                    className="h-4 w-[50px]"/></TableCell>
                                                                <TableCell className="border border-slate-600"> <Skeleton
                                                                    className="h-4 w-[50px]"/></TableCell>
                                                                <TableCell className="border border-slate-600"> <Skeleton
                                                                    className="h-4 w-[50px]"/></TableCell>
                                                                <TableCell className="border border-slate-600"> <Skeleton
                                                                    className="h-4 w-[50px]"/></TableCell>
                                                            </TableRow>)}
                                                            {platform && platform.socialMediaMetrics && platform.socialMediaMetrics.map((metric, index) => (
                                                                <TableRow key={`matric_${index}`}>
                                                                    <TableCell
                                                                        className="border border-slate-600">{index + 1}</TableCell>
                                                                    <TableCell
                                                                        className="border border-slate-600">{convertIsoStringTodate(metric.date).date}</TableCell>
                                                                    <TableCell
                                                                        className="border border-slate-600">{metric.metricType}</TableCell>
                                                                    <TableCell
                                                                        className="border border-slate-600">{metric.value}</TableCell>
                                                                    <TableCell className="border border-slate-600">
                                                                        <button className={`bg-red-400 rounded p-1`}
                                                                                onClick={() => {
                                                                                    onDeleteMetric(metric.id)
                                                                                }}
                                                                        >
                                                                            <Delete size={18}/>
                                                                        </button>
                                                                    </TableCell>

                                                                </TableRow>
                                                            ))}

                                                        </TableBody>
                                                    </Table>

                                                </CardContent>
                                            </Card>


                                        </div>
                                    </TabsContent>
                                ))}

                            </Tabs>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </TabsContent>
    </>)
}
export default ClientSocialMediaPlatforms;