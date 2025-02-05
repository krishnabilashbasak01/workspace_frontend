import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react'
const ViewClient = ({client, loading, getClient, setLoading}) => {

    if (loading) {
        return <div className={`w-full h-screen flex justify-center items-center`}><Loader2 size={40} className={`animate-spin`} /></div>;
    }

    if (!client) {
        return <p>No client data available</p>;
    }
return(<>
<h1>View Client {client ? client.name : ''}</h1></>)
}
export default ViewClient;