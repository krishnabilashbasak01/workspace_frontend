import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SocialMediaTab from './Tabs/SocialMedia';
import General from './Tabs/General';
import SocialMediaPostType from './Tabs/SocialMediaPostType';
import SocialMediaContext from './Tabs/SocialMediaContext';
import  Package  from './Tabs/Package';
const AppSettings = () => {
    const [socialMediaPlatforms, setSocialMediaPlatforms] = useState([]);
    return (<>

        <div className="container mt-5">
            <Tabs className={`w-fill`} defaultValue="general">
                <TabsList className="">
                    <TabsTrigger value="general" className="text-xs px-4 py-2">General</TabsTrigger>
                    <TabsTrigger value="social-media" className="text-xs px-4 py-2">Social Media</TabsTrigger>
                    <TabsTrigger value="social-media-post-type" className="text-xs px-4 py-2">Social Media Post Type</TabsTrigger>
                    <TabsTrigger value="social-media-context" className="text-xs px-4 py-2">Social Media Context</TabsTrigger>
                    <TabsTrigger value="packages" className="text-xs px-4 py-2">Packages</TabsTrigger>

                </TabsList>
                <General />
                <SocialMediaTab />
                <SocialMediaPostType />
                <SocialMediaContext />
                <Package />
            </Tabs>
        </div>
    </>)
}
export default AppSettings;