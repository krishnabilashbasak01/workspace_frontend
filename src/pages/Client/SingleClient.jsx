import { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { getToken } from '../../hooks/get-token';
import ViewClient from './ViewClient';
import EditClient from './EditClient';
const SingleClient = () => {
    const { toast } = useToast()
    let { type, selector } = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!client && selector && type) {
            getClient(selector);
        }
    }, [selector, type])

    // Get Client By id
    const getClient = async (selector) => {
        if (loading || !selector) return;
        setLoading(true);
        try {
            let url = ``;
            if (type === 'edit') {
                url = `${import.meta.env.VITE_USER_API_SERVER}/api/client/${selector}`;
            } else if (type === 'view') {
                url = `${import.meta.env.VITE_USER_API_SERVER}/api/client/username/${selector}`;
            }
            let response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })

            if (response.status !== 200) toast({
                title: "Error!",
                description: "Error to get client",
                variant: "destructive"
            })

            // console.log('Client' , response.data);
            setClient(response.data);

        } catch (error) {
            toast({
                title: "Error!",
                description: "Error to get client",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (<>
        {type === 'view' ? (<ViewClient
            client={client}
            loading={loading}
            getClient={getClient}
            setLoading={setLoading}
        />) : type === 'edit' ? (
            <EditClient
                client={client}
                loading={loading}
                getClient={getClient}
                setLoading={setLoading}
            />
        ) : ''}
    </>)
}
export default SingleClient;
