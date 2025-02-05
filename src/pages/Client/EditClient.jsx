import {useToast} from "@/hooks/use-toast";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ClientDetails from "./Tabs/ClientDetails";
import ClientSocialMediaPlatforms from "./Tabs/ClientSocialMediaPlatforms";
import ClientWeeklyCalendar from "./Tabs/ClientWeeklyCalendar";
import ClientPackage from "./Tabs/ClientPackage";
import {Loader2} from "lucide-react";
import ClientMonthlyCalendar from "./Tabs/ClientMonthlyCalendar/ClientMonthlyCalendar.jsx";

const EditClient = ({client, loading, getClient, setLoading}) => {

    const {toast} = useToast()


    if (!client && loading){
        return <center><Loader2 className={`animate-spin`} /></center>
    }
    if (!client && !loading) {
        return <center><p>No client data available</p></center>;
    }
    return (<>

        <div className="container mt-3">
            <Tabs className={`w-fill`} defaultValue="client-details">
                <TabsList className="h-8">
                    <TabsTrigger className="text-xs h-6" value='client-details'>Client</TabsTrigger>
                    <TabsTrigger className="text-xs h-6" value='social-media-platform'>Social Media
                        Platforms</TabsTrigger>
                    <TabsTrigger className="text-xs h-6" value='client-package'>Client Package</TabsTrigger>
                    <TabsTrigger className="text-xs h-6" value='weekly-calendar'>Weekly Calendar</TabsTrigger>
                    <TabsTrigger className="text-xs h-6" value='monthly-calendar'>Calendar</TabsTrigger>
                </TabsList>
                <ClientDetails client={client}
                               loading={loading}
                               getClient={getClient}
                               setLoading={setLoading}/>
                <ClientSocialMediaPlatforms client={client}
                                            loading={loading}
                                            getClient={getClient}
                                            setLoading={setLoading}/>
                <ClientPackage client={client} loading={loading} getClient={getClient} setLoading={setLoading}/>
                <ClientWeeklyCalendar client={client}
                                      loading={loading}
                                      getClient={getClient}
                                      setLoading={setLoading}/>
                <ClientMonthlyCalendar client={client} loading={loading} getClient={getClient} setLoading={setLoading}/>
            </Tabs>
        </div>
    </>)
}
export default EditClient;