import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { CircleX, PersonStanding, ChevronRight, EllipsisVertical, Pencil, BetweenHorizonalStart, ArrowUpDown, ChevronDown, MoreHorizontal, Plus, ListX, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react";
import { getSocket } from "@/app/socket";
import { useSelector } from "react-redux";
import { convertIsoStringTodate } from "../../../app/dateformat";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

import Modal, {
    ModalHead,
    ModalMain,
    ModalClose,
    ModalBody,
    ModalFooter,
} from "@/components/app/Modal";

const AllTasksList = () => {
    const { toast } = useToast();
    const [tasks, setTasks] = useState([]);
    const socket = getSocket();
    const user = useSelector((state) => state.auth.user);
    const users = useSelector((state) => state.users.users);
    const [selectedTask, setSelectedTask] = useState(null);
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] =
        useState({})
    const [rowSelection, setRowSelection] = useState({})
    const [loading, setLoading] = useState(true);
    const [taskEditModal, setTaskEditModal] = useState(false);
    const [designers, setDesigners] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedDesigner, setSelectedDesigner] = useState(null);
    const [addingToBucket, setAddingToBucket] = useState(false);


    useEffect(() => {
        if (!socket) return;
        const handleReceiveTasks = async (data) => {
            if (!tasks.length > 0) { setTasks(data) } else {
                console.log('data', data);

                setTasks((prevTasks) => {

                    return prevTasks.map((task) => {
                        setLoading(false);
                        const updatedTask = data.find((d) => d.id === task.id);
                        return updatedTask ? { ...task, ...updatedTask } : task;
                    });
                });
            }


        };

        socket.on('receive_tasks', handleReceiveTasks);
        // Cleanup function to remove the event listener


        return () => {
            socket.off('receive_tasks', handleReceiveTasks);
        }
    }, [socket, tasks])


    useEffect(() => {
        if (!tasks.length > 0 && user) {
            getTasks()
        }
    }, [])


    useEffect(() => {
        if (!designers) {
            getDesigners()
        }
    }, [users, designers]);

    // get designer
    const getDesigners = () => {

        if (users && users.length > 0) {
            const _designers = users?.filter(({ role }) => role.name.toLowerCase() === 've' || role.name.toLowerCase() === 'gd');

            if (_designers.length > 0) {
                setDesigners(_designers);
            } else {
                setDesigners([]); // Ensure designers is an empty array if no match
            }
        }
    }


    // get Tasks
    const getTasks = () => {
        if (!user || !socket) return;
        let data = {}
        if (user) {
            data.userType = user.role.name;
            data.userId = user._id;

            if (socket) {
                socket.emit('get_tasks', data);
            }

        }
    }

    const getDesignerById = (id) => {
        // console.log(users);

        let _designer = users?.find(({ _id }) => _id === id);

        if (_designer) {
            return (
                <div className={`flex flex-row gap-1 items-center`}>
                   
                    <Avatar className={`w-10 h-10`} >
                        <AvatarImage  src={`${_designer.profilePicture}`} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <p className={`text-sm ${_designer.online ? 'text-green-500' : ''}`}>{_designer.name.split(' ')[0]}</p>
                </div>
            )
        }


        return ''
    }

    const getSMEById = (smes) => {
        if (!smes || smes.length === 0 || !users) return '';
    
        for (let sme of smes) {
            
            
            const user = users.find(({ _id }) => _id === sme.smeId);
            if (user && user.todaysAttendance) {
                console.log(user);
                
                return (
                    <div className="flex flex-row gap-1 items-center">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={user.profilePicture} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <p className={`text-sm ${user.online ? 'text-green-500' : ''}`}>{user.name.split(' ')[0]}</p>
                    </div>
                );
            }
        }
    
        return '';
    };

    // add to bucket
    const addToBucket = ({ task, user }) => {
        setAddingToBucket(true)


        let data = {
            task,
            user: {
                smeId: user._id,
                role: user.role.name,
                socketId: user.socketId
            }
        }
        if (socket) {
            socket.emit('add_task_to_bucket', data, (response) => {
                if (response.status === 'success') {
                    setAddingToBucket(false)
                    toast({
                        title: "Success!",
                        description: response.message,
                    });
                    getTasks();


                } else {
                    setAddingToBucket(false)

                    toast({
                        title: "Error!",
                        description: response.message,
                        variant: "destructive"
                    });
                }
            });

        } else {
            setAddingToBucket(false)
        }


    };


    // on task edit modal change
    const onTaskEditModalOpen = () => {
        setTaskEditModal(!taskEditModal);
    }

    // remove task from bucket
    const removeFromBucket = ({ task, user }) => {
        if (socket) {
            socket.emit('remove_task_from_bucket', { task, user }, (response) => {


                if (response.status === 'success') {
                    getTasks();
                    toast({
                        title: "Success!",
                        description: 'Successfully removed from bucket',

                    });
                } else {
                    toast({
                        title: "Error!",
                        description: 'Error to remove from bucket',
                        variant: "destructive"
                    });
                }
            })
        }
    }




    // DropDown Component
    const DropDownMenuComponent = ({ task }) => {
        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button>
                            <EllipsisVertical />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="">
                        {!task.designerId || !task.workDate ? (
                            <>

                            </>
                        ) : ''}
                        <DropdownMenuLabel>Update Task</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>

                            <DropdownMenuItem onClick={() => {
                                setSelectedTask(task);
                                onTaskEditModalOpen();

                            }}>
                                <Pencil />
                                <span>Edit</span>

                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {task.status.name === 'In Queue' || ['admin', 'super admin'].includes(user.role.name.toLowerCase()) ? (<>
                                <DropdownMenuItem onClick={() => {
                                    if (user.role.name.toLowerCase() === 'sme' || user.role.name.toLowerCase() === 'super admin') {
                                        console.log('remove from bucket', task);

                                        // addToBucket({ task, user })
                                        // Remove from bucket
                                        removeFromBucket({ task, user });
                                    } else {
                                        toast({
                                            title: "Error!",
                                            description: `${user.role.name} Don't have permission to add task in Bucket`
                                        })
                                    }
                                }}>
                                    <ListX />
                                    <span>Remove From Bucket</span>
                                </DropdownMenuItem>
                            </>) : (
                                <></>
                            )}

                            {['Created', 'Designer Assigned'].includes(task.status.name) && <DropdownMenuItem onClick={() => {
                                if (user.role.name.toLowerCase() === 'sme') {

                                    addToBucket({ task, user })
                                } else {
                                    toast({
                                        title: "Error!",
                                        description: `${user.role.name} Don't have permission to add task in Bucket`
                                    })
                                }
                            }}>
                                <BetweenHorizonalStart />
                                <span>Add To Bucket</span>
                            </DropdownMenuItem>}
                            

                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

            </>

        )
    }

    const columns = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="profilePicture"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Task Id
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div>
                    #TASK{row.getValue('id')}
                </div>

            ),
        },
        {
            accessorKey: "profilePicture",
            header: ({ column }) => {
                return (
                    <p
                    >
                        Client
                    </p>
                );
            },
            cell: ({ row }) => (
                <div className="flex flex-col gap-1 items-center justify-center">
                    <Avatar >
                        <AvatarImage src={`${row.original.client.profilePicture}`} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>

            ),
        }, {
            accessorKey: "clientName",
            header: ({ column }) => {
                return (
                    <p
                        variant="name"
                    >
                        Name
                    </p>
                );
            },
            cell: ({ row }) => (
                <div className="">
                    {row.original.client.name}

                </div>

            ),
        },
        {
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <Button
                        variant="title"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Title
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div>
                    <div
                        className="flex flex-row gap-1 items-center">
                        {row.original.calendarEntry ? <img className={`w-5 h-5`} src={row.original.calendarEntry.socialMediaPlatform.icon} /> : ''} <h6 className={`capitalize`}>{row.getValue("title")}</h6>
                    </div>
                    <div className="flex flex-row gap-1 items-center">
                        <div className="flex flex-row gap-1 items-center">
                            {row.original.calendarEntries.length > 0 ? row.original.calendarEntries.map((entry, index) => (
                                <img key={index} className={`w-5 h-5`} src={entry.socialMediaPlatform.icon} />
                            )) : ''}
                        </div>
                        <ChevronRight />

                        <p className="text-[11px]">  {row.original.postType ? row.original.postType.name : ''}</p>
                    </div>

                </div>

            ),
        },
        {
            accessorKey: "sme",
            header: ({ column }) => {
                return (
                    <p>
                        SME
                    </p>
                );
            },
            cell: ({ row }) => (
                <div onClick={()=>{
                    console.log(row.original);
                    
                }}>
                    {row.original.client?.smes ? getSMEById(row.original.client?.smes) : ''}
                </div>

            ),
        },
        {
            accessorKey: "designer",
            header: ({ column }) => {
                return (
                    <p>
                        Designer
                    </p>
                );
            },
            cell: ({ row }) => (
                <div>
                    {row.original.designerId ? getDesignerById(row.original.designerId) : ''}
                </div>

            ),
        },
        {
            accessorKey: "scheduleDate",
            header: ({ column }) => {
                return (
                    <Button
                        variant="scheduleDate"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Schedule
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div
                >
                    <h6 className={`capitalize`}>{convertIsoStringTodate(row.getValue('scheduleDate')).date} {convertIsoStringTodate(row.getValue('scheduleDate')).time}</h6>
                </div>
            ),
        },
        {
            accessorKey: "workDate",
            header: ({ column }) => {
                return (
                    <Button
                        variant="name"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Word Date
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div
                >
                    <h6 className={`capitalize`}>{convertIsoStringTodate(row.getValue('workDate')).date}</h6>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="status"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Status
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div
                >
                    {row.original.status ? row.original.status.name : ''}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            header: ({ column }) => {
                return <p>Action</p>;
            },
            cell: ({ row }) => {

                return (
                    <div className={`flex flex-row gap-2`}>

                        {!['ve', 'gd'].includes(user.role.name.toLowerCase()) ? <DropDownMenuComponent task={row.original} /> : ''}
                    </div>
                );
            },
        },
    ];


    const table = useReactTable({
        data: tasks,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });


    // Update task
    const updateTask = async () => {
        setIsUpdating(true)
        if (selectedTask && selectedDesigner) {
            // console.log(selectedTask);
            const data = {
                id: selectedTask.id,
                title: selectedTask.title,
                workDate: selectedTask.workDate,
                designerId: selectedDesigner._id,
                user: user
            }

            if (data.id && data.title && data.workDate && data.designerId) {
                if (socket) {
                    socket.emit("update_task", data, async (response) => {
                        if (response.status === 'success') {
                            setIsUpdating(false)
                            await getTasks();
                            toast({
                                title: "Success",
                                description: "Successfully updated",
                            })
                        } else {
                            toast({
                                title: "Error",
                                description: "Something went wrong",
                                variant: "destructive",
                            })
                        }
                    })

                    onTaskEditModalOpen();
                }



            } else {
                setIsUpdating(false)

                toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                })
            }
        } else {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
            setIsUpdating(false)

        }
    }




    return (<>
        <TabsContent value={`tasks`} className="p-4">
            <Card  >
                <CardHeader className={`flex flex-row gap-2 items-center`}>
                    <div>
                        <CardTitle>Tasks</CardTitle>
                        <CardDescription>You can update task here</CardDescription>
                    </div>
                    {loading && <Loader2 className="animate-spin" />}
                    {addingToBucket && <Loader2 className="animate-spin" />}

                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center py-4 gap-2">
                        <Input
                            placeholder="Filter Title..."
                            value={table.getColumn("title")?.getFilterValue() || ""}
                            onChange={(event) =>
                                table.getColumn("title")?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        />
                        <Input
                            placeholder="Filter Client..."
                            value={table.getColumn("clientName")?.getFilterValue() || ""}
                            onChange={(event) => {
                                table.getColumn("clientName")?.setFilterValue(event.target.value);
                            }}
                            className="max-w-sm"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto">
                                    Columns <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="overflow-x-auto">
                        <Table className='border-collapse border border-slate-500'>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className=" border-0">
                                        {headerGroup.headers.map((header) => {
                                            return <TableHead key={header.id}
                                                className="border border-slate-600">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                            </TableHead>
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {!loading && tasks && table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="border border-slate-600">
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (<TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-row items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>

                    </div>
                </CardFooter>
            </Card>
        </TabsContent>
        <Modal

            open={taskEditModal}
            onClose={() => onTaskEditModalOpen()}
        >
            <ModalMain className={`w-full md:w-5/12 lg:w-5/12`}>

                <ModalClose onClose={() => onTaskEditModalOpen()}>
                    <CircleX />
                </ModalClose>
                <ModalHead>
                    {/* Title */}
                    <p className={``}>Edit Task</p>
                </ModalHead>
                {/* Modal Body */}
                <ModalBody className={`p-5 flex flex-col gap-1`}>
                    <Separator />
                    <div>
                        <label htmlFor={`task-title`}>Task Title</label>
                        <Input id={`task-title`} placeholder={`Give unique task title , 13091995(ddmmyyyy)`}
                            value={selectedTask ? selectedTask.title : ''} onChange={e => {
                                setSelectedTask({
                                    ...selectedTask,
                                    title: e.target.value,
                                })
                            }} />
                    </div>
                    {/* Schedule Date Picker */}
                    <div>
                        <label htmlFor={`work-date`} className={``}>Work Date</label>
                        <br />
                        <input className={`bg-blue-100 dark:bg-zinc-100 text-zinc-900 p-1 rounded`} id={`work-date`}
                            type={'date'}
                            value={
                                selectedTask && selectedTask.workDate
                                    ? new Date(selectedTask.workDate).toISOString().split('T')[0]
                                    : new Date().toISOString().split('T')[0]
                            }

                            onChange={e => {
                                setSelectedTask({
                                    ...selectedTask,
                                    workDate: e.target.value,
                                })
                            }} />
                    </div>
                    <div>
                        <label htmlFor={`designer-date`} className={``}>Select Designer</label>
                        <Select id={`designer-date`} onValueChange={(e) => {
                            setSelectedDesigner(e)
                        }}

                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Designer" />
                            </SelectTrigger>
                            <SelectContent>

                                {Array.isArray(designers) && designers?.map((designer, index) => (
                                    <SelectItem key={`designer_${index}`}
                                        value={designer}>
                                        <p>{designer.name}</p>
                                    </SelectItem>
                                ))}
                            </SelectContent>

                        </Select>
                    </div>
                </ModalBody>
                <ModalFooter
                    className={`flex flex-row justify-end items-center pt-2`}
                >
                    <button onClick={updateTask} disabled={isUpdating} className={`bg-zinc-900 dark:bg-zinc-200 text-zinc-100 dark:text-black
    px-2 py-1 rounded flex flex-row gap-1
    `}>
                        <p> Submit</p> {isUpdating && <Loader2 className={'animate-spin'} />}
                    </button>

                </ModalFooter>
            </ModalMain>
        </Modal>
    </>)
}
export default AllTasksList;