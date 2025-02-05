import { useSelector } from "react-redux";
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { convertIsoStringTodate } from "../../../app/dateformat";

const TasksChatSideBar = ({ selectedTask, onTaskSelect, tasksInQueue }) => {
    const user = useSelector((state) => state.auth.user);
    const users = useSelector((state) => state.users.users);


    // get sme by id
    const getSmeById = (smeId) => {
        if (users) {
            let sme = users.find(({ _id }) => _id === smeId);
            if (sme) {
                return sme.name;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }


    return (<>
        {/* Sidebar */}
        <div className={`w-60 min-h-[calc(100vh-3.5rem)] bg-slate-100 dark:bg-zinc-950 p-1.5 flex flex-col gap-1 overflow-y-auto`}>

        {tasksInQueue && <Reorder.Group axis="y" values={tasksInQueue} className={`space-y-2`}>
                {/* Task */}

                {tasksInQueue?.length > 0 && tasksInQueue.map((task, index) => (
                    <Reorder.Item initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={`task_${task.id}`}
                        value={task}

                        dragListener={false}
                        className=""
                    >
                        <div className={` ${selectedTask?.id === task.id ? 'bg-gradient-to-r from-cyan-200 to-blue-200 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 ' : 'bg-white dark:bg-zinc-950'} hover:bg-gradient-to-r from-cyan-500 to-blue-500 cursor-pointer rounded p-1 shadow-md dark:shadow-zinc-800`}
                            onClick={() => {
                                onTaskSelect(task);
                            }}
                        >
                            <div className={`flex flex-row justify-between`}>
                                <p className="text-sm">{task.title}</p>
                                <div>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-300">S: {convertIsoStringTodate(task.scheduleDate).date}</p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-300">w: {convertIsoStringTodate(task.workDate).date}</p>

                                </div>
                            </div>

                            {user.role.name.toLowerCase() === 'gd' || user.role.name.toLowerCase() === 've' ? (<p className="text-xs">SME: {getSmeById(task.client.smes[0].smeId)}</p>) : ''}
                            {user.role.name.toLowerCase() === 'sme' ? (<p className="text-xs">D: {getSmeById(task.designerId)}</p>) : ''}
                            {user.role.name.toLowerCase() === 'super admin' || user.role.name.toLowerCase() === 'admin' ?
                                (<><p className="text-xs">SME: {getSmeById(task.client.smes[0].smeId)}</p>
                                    <p className="text-xs">D: {getSmeById(task.designerId)}</p></>) : ''}


                        </div>
                    </Reorder.Item>
                )
                )}
            </Reorder.Group>}

        </div>
    </>)
}
export default TasksChatSideBar;