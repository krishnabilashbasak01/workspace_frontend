

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import AllTasks from "./Tabs/AllTasks";
import AllDesignerTasks from "./Tabs/AllDesignerTasks";
import AllTasksList from "./Tabs/AllTasksList";
import { List, ListTree, PersonStanding } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
const Tasks = () => {

    return (<>
        <TooltipProvider>

            <Tabs defaultValue="all-tasks" className="w-full font-mono">
                <TabsList className="flex flex-row justify-start gap-2">
                    <TabsTrigger value="tasks">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex gap-1 items-center"><List /> List</div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Task List</p>
                            </TooltipContent>
                        </Tooltip>
                    </TabsTrigger>
                    <TabsTrigger value="all-tasks"> <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex gap-1 items-center">
                                <ListTree />
                                Kanban
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Task Progress</p>
                        </TooltipContent>
                    </Tooltip></TabsTrigger>

                    <TabsTrigger value="designers-task">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PersonStanding />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Kanban Of Designers</p>
                            </TooltipContent>
                        </Tooltip>
                    </TabsTrigger>


                </TabsList>
                <AllTasksList />
                <AllTasks />
                <AllDesignerTasks />
            </Tabs>
        </TooltipProvider>


    </>)
}
export default Tasks;