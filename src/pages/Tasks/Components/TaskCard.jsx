import { useEffect, useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { convertIsoStringTodate } from "@/app/dateformat";
import { useSelector } from 'react-redux';
import { ChevronRight, FolderGit2Icon, PersonStanding } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


const TaskCard = ({ task, updateReorderOnServer, children }) => {
    const user = useSelector((state) => state.auth.user);
    const users = useSelector((state => state.users.users));

    // Get Designer By id
    const getDesignerById = (id) => {
        let _designer = users?.find(({ _id }) => _id === id);
        if (_designer) {
            return (
                <div className={`flex flex-col gap-1 items-center`}>
                    <Avatar className={`w-8 h-8`}>
                        <AvatarImage src={_designer.profilePicture} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>

                    <p className={`text-sm ${_designer.online ? 'text-green-500' : ''}`}>   {_designer.name.split(' ')[0].slice(0, 5)}{_designer.name.split(' ')[0].length > 5 && '..'}</p>
                    {/* <p className={`text-sm ${_designer.online ? 'text-green-500' : ''}`}>{_designer.name.split(' ')[0]}</p> */}
                </div>
            )
        }
        return ''
    }
    return (<Reorder.Item initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        value={task}
        onDragEnd={(event, info) => {
            updateReorderOnServer();
        }}
        dragListener={user.head || user.role.name.toLowerCase() === 'admin' || user.role.name.toLowerCase() === 'super admin' ? true : false}
        className="shadow-md dark:shadow-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-1 rounded mb-2 border dark:border-zinc-600"
    >
        <div className="flex flex-row gap-2 items-center">
            <div>
                <div className={`flex flex-col gap-1 items-center`}>
                    <Avatar className={`w-8 h-8`}>
                        <AvatarImage src={task.client.profilePicture} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <p className={`text-sm`}>  {task.client.name.split(' ')[0].slice(0, 5)}{task.client.name.split(' ')[0].length > 5 && '..'}</p>
                    <div className='flex flex-row gap-1 items-center'>
                        <FolderGit2Icon size={15} className={`${task.contents.length > 0 ? 'text-green-600' : 'text-red-400'}`} />
                        <p className='text-xs'>{task.contents.length}</p>
                    </div>
                </div>

            </div>

            {/* <img src={`${task.client.profilePicture}`} alt="" className={`w-16 h-16 rounded-full border dark:border-zinc-600`} /> */}
            <div className={`flex-1`}>
                <p>{task.title}</p>
                <div>
                    <div>
                        <p className="text-xs">S: {convertIsoStringTodate(task.scheduleDate).date} {convertIsoStringTodate(task.scheduleDate).time} / W: {task.workDate ? convertIsoStringTodate(task.workDate).date : ''}</p>
                    </div>
                    <div className="flex flex-row gap-1 items-center">
                        {task.calendarEntries ? task.calendarEntries.map((entry, index) => (
                            <img className={`w-5 h-5`} src={entry.socialMediaPlatform.icon} />
                        )) : ''}
                        <ChevronRight />
                        {/* <p className="text-xs">{task.calendarEntry?.postType ? task.calendarEntry?.postType.name : ''}</p> */}
                        <p className="text-xs"> {task.postType ? task.postType.name : ''}</p>
                        <ChevronRight />
                        <p className={`text-sm`}>{task.status ? task.status.name : ''}</p>
                    </div>

                </div>
            </div>
            <div className="flex flex-col gap-1 items-center">
                {task.designerId ? getDesignerById(task.designerId) : ''}
                {children}
            </div>
            {/* Action */}
            

        </div>
    </Reorder.Item>)
}
export default TaskCard;