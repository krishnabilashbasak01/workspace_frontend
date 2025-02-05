import { useEffect, useState } from "react";
import axios from "axios";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    ArrowUpDown,
    ChevronDown,
    MoreHorizontal,
    Plus,
    CircleX,
    Pencil,
    Loader2,
    Fan, DotIcon, Dot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import Modal, {
    ModalHead,
    ModalMain,
    ModalClose,
    ModalBody,
    ModalFooter,
} from "../../../components/app/Modal";
import { getToken } from "../../../hooks/get-token";
import { getSocket } from "../../../app/socket";
import { useDispatch, useSelector } from "react-redux";
import { isPermissionGranted } from "../../../hooks/permission.js";
import { setUsers } from '../../../features/users/usersSlice.js'

function UserTab() {

    const socket = getSocket();
    const dispatch = useDispatch();
    const users = useSelector((state) => state.users.users);
    const user = useSelector((state) => state.auth.user);
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [isRolesLoading, setIsRolesLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    // const [users, setUsers] = useState({});
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [isUserCreating, setIsUserCreating] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [userEditFromData, setUserEditFormData] = useState({});
    const [createUserFormData, setCreateUserFromData] = useState({});
    const [modalUserOpen, setModalUserOpen] = useState();
    const [modalCreateUserOpen, setModalCreateUserOpen] = useState();
    const [roleChangingState, setRoleChangingState] = useState(false);
    const [isUserUpating, setIsUserUpdating] = useState(false);

    // Users Columns
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
            accessorKey: "profilePicture",
            header: ({ column }) => {
                return (
                    <Button
                        variant="name"

                    >
                        Picture

                    </Button>
                );
            },
            cell: ({ row }) => (
                <div

                >
                    <div className={`flex flex-row items-center gap-1`}>

                        <Avatar className={`border-2 ${row.original.todaysAttendance ? !row.original.todaysAttendance.logoutTime
                            ? "border-green-500"
                            : "border-orange-400"
                            : ""}`}>
                            <AvatarImage src={row.original.profilePicture ? row.original.profilePicture : 'https://github.com/shadcn.png'} alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>

                    </div>
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="name"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div
                    className={`capitalize
            ${row.original.todaysAttendance
                            ? !row.original.todaysAttendance.logoutTime
                                ? "text-green-500"
                                : "text-orange-400"
                            : ""
                        }`}
                >
                    <div className={`flex flex-row items-center gap-1`}>
                       
                        {row.getValue("name")} </div>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header
                :
                ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            Email
                            <ArrowUpDown />
                        </Button>
                    );
                },
            cell
                :
                ({ row }) => (
                    <div className="lowercase">{row.getValue("email")}</div>
                ),
        }
        ,
        {
            accessorKey: "role",
            header
                :
                ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            Role
                            <ArrowUpDown />
                        </Button>
                    );
                },
            cell
                :
                ({ row }) => (
                    <div className="">{row.original.role && row.original.role.name}</div>
                ),
        }
        ,
        {
            accessorKey: "status",
            header
                :
                ({ column }) => {
                    return <p>Status</p>;
                },
            cell
                :
                ({ row }) => (
                    <div className="">
                        {row.original.isActive ? (
                            <p className="text-green-500">Active</p>
                        ) : (
                            <p className="text-red-500">Inactive</p>
                        )}
                    </div>
                ),
        }
        ,
        {
            id: "actions",
            enableHiding
                :
                false,
            header
                :
                ({ column }) => {
                    return <p>Action</p>;
                },
            cell
                :
                ({ row }) => {
                    const _user = row.original;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isPermissionGranted(user, 'edit user') && (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setUserEditFormData(_user);
                                            onUserModalOpen();
                                        }}
                                        className={`"w-full flex flex-row justify-between items-center`}
                                    >
                                        Edit <Pencil />
                                    </DropdownMenuItem>
                                )}

                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
        }
        ,
    ];

    const table = useReactTable({
        data: users,
        columns: columns,
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

    // useEffect(() => {
    //
    //     if (socket) {
    //         socket.on("online_users", (data) => {
    //             // console.log("Received get_users:", data);
    //             //   Set Online Status To users
    //             if (users !== {}) {
    //
    //                 if (Array.isArray(users)) {
    //                     const updatedUsers = users.map((_user) => {
    //                         if (data.includes(_user._id)) {
    //                             return {..._user, online: true}
    //                         }
    //
    //                         //   Otherwise, set user status to online
    //                         return {..._user, online: false};
    //
    //                     });
    //                     console.log(updatedUsers);
    //                     dispatch(setUsers(updatedUsers))
    //                     // setUsers(updatedUsers);
    //                 } else {
    //                     console.log('Not an array', typeof (users));
    //                 }
    //
    //             }
    //         });
    //     }
    //
    //     return () => {
    //         if (socket) {
    //             socket.off("online_users");
    //         }
    //     };
    // }, [user, users])
    useEffect(() => {
        // getUsers();
        getRoles();
    }, []);

    // Get Users
    const getUsers = async () => {
        setIsUserLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_USER_API_SERVER}/api/users/`,
                { headers: { Authorization: `Bearer ${getToken()}` } },
            );

            if (response.status === 200) {
                // console.log(response.data.users);
                if (socket) {
                    socket.emit("get_online_users", {});
                }
                // setUsers(response.data.users);
                dispatch(setUsers(response.data.users))
            }
        } catch (error) {
            console.log("error : ", error);
        } finally {
            setIsUserLoading(false);
        }
    };

    // Get Roles
    const getRoles = async () => {
        setIsRolesLoading(true);
        try {
            let response = await axios.get(
                `${import.meta.env.VITE_USER_API_SERVER}/api/roles/get-roles`,

                { headers: { Authorization: `Bearer ${getToken()}` } },
            );

            if (Array.isArray(response.data)) {
                setRoles(response.data); // Expecting an array of objects
            } else {
                console.error("Invalid roles data:", response.data);
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setIsRolesLoading(false);
        }
    };

    const onUserModalOpen = () => {
        setModalUserOpen(!modalUserOpen);
    };

    const onCreateUserModalOpen = () => {
        setModalCreateUserOpen(!modalCreateUserOpen);
    };

    // Submit Edit User
    const handleEditUserSubmit = async (event) => {
        event.preventDefault();
        // console.log(userEditFromData);
        setIsUserUpdating(true);
        try {
            let response = await axios.put(
                `${import.meta.env.VITE_USER_API_SERVER}/api/users/${userEditFromData._id}`,
                userEditFromData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                },
            );
            if (response.status === 200) {
                getUsers();

                toast({
                    title: "Success!",
                    description: "User Successfully updated",
                });
                onUserModalOpen();
            } else {
                toast({
                    title: "Error!",
                    description: "Something wrong to edit user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error!",
                description: "Something wrong to edit user",
                variant: "destructive",
            });
        } finally {
            setIsUserUpdating(false);
        }
    };

    // Submit create User
    const handleCreateUserSubmit = async (event) => {
        event.preventDefault();
        setIsUserCreating(true);
        try {
            if (!createUserFormData)
                toast({
                    title: "Error !",
                    description: "Please enter all input fields",
                    variant: "destructive",
                });
            if (createUserFormData.password !== createUserFormData.c_password)
                toast({
                    title: "Error !",
                    description: "Password and Confirm password is not same",
                    variant: "destructive",
                });

            const data = {
                name: createUserFormData.name,
                username: createUserFormData.username,
                password: createUserFormData.password,
                email: createUserFormData.email,
            };

            const response = await axios.post(
                `${import.meta.env.VITE_USER_API_SERVER}/api/register`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        // Authorization: `Bearer ${getToken()}`,
                    },
                },
            );
            if (response.status === 200) {
                getUsers();
                toast({
                    title: "Success!",
                    description: "User Successfully created . Now set role to user",
                });
                onCreateUserModalOpen();
            } else {
                toast({
                    title: "Error!",
                    description: "Something wrong to create user",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error!",
                description: "Something wrong to create user",
                variant: "destructive",
            });
        } finally {
            setIsUserCreating(false);
        }
    };

    // Handle on Role change
    const handleRoleSelectChange = async (value) => {
        setRoleChangingState(true);
        // after role change we have to add role to user
        let data = {
            userId: userEditFromData._id,
            roleId: value._id,
        };

        if (userEditFromData._id && value._id) {
            // Now add role to user
            try {
                let response = await axios.put(
                    `${import.meta.env.VITE_USER_API_SERVER}/api/roles/add-role-to-user`,
                    data,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getToken()}`,
                        },
                    },
                );

                if (response.status === 200) {
                    getUsers();
                    onUserModalOpen();
                    toast({
                        title: "Success!",
                        description: `Role added successfully`,
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error!",
                        description: `Something is wrong to add Role to User`,
                    });
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error!",
                    description: `Something is wrong to save Add Role to User`,
                });
            } finally {
                setRoleChangingState(false);
            }
        }
    };

    return (
        <>
            <TabsContent value="users">
                <Card className={`w-full`}>
                    <CardHeader className={`flex flex-row justify-between items-center`}>
                        <div>
                            <CardTitle>Users</CardTitle>
                            <CardDescription>
                                Make changes to your account here. Click save when you're done.
                            </CardDescription>
                        </div>

                        {isPermissionGranted(user, 'create user') && (
                            <Button onClick={onCreateUserModalOpen}>
                                <Plus />
                            </Button>
                        )}

                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center py-4">
                            <Input
                                placeholder="Filter Names..."
                                value={table.getColumn("name")?.getFilterValue() || ""}
                                onChange={(event) =>
                                    table.getColumn("name")?.setFilterValue(event.target.value)
                                }
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
                        <div className="rounded-md border border-zinc-400">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} className=" border-0">
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead
                                                        key={header.id}
                                                        className="border-b border-b-zinc-400"
                                                    >
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext(),
                                                            )}
                                                    </TableHead>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                className={`border-b border-b-zinc-200 dark:border-b-zinc-600`}
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex items-center justify-end space-x-2 py-4">
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
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Modals */}
            {/* Edit User Modal */}
            <Modal
                // key={`editusermodal`}
                open={modalUserOpen}
                onClose={() => onUserModalOpen()}
            >
                <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>
                    <form id="edituser" action="" onSubmit={handleEditUserSubmit}>
                        <ModalClose onClose={() => onUserModalOpen()}>
                            <CircleX />
                        </ModalClose>
                        <ModalHead>
                            {/* Title */}
                            <p className={``}>Edit User</p>
                        </ModalHead>
                        {/* Modal Body */}
                        <ModalBody className={`p-5`}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="profilePicture" className="text-right">
                                        Profile Picture Link :
                                    </Label>
                                    <Input
                                        id="profilePicture"
                                        value={`${userEditFromData.profilePicture}`}
                                        onChange={(e) => {
                                            setUserEditFormData((prev) => ({
                                                ...prev,
                                                profilePicture: e.target.value,
                                            }));
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name :
                                    </Label>
                                    <Input
                                        id="name"
                                        value={`${userEditFromData.name}`}
                                        onChange={(e) => {
                                            setUserEditFormData((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }));
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="username" className="text-right">
                                        UserId :
                                    </Label>
                                    <Input
                                        id="username"
                                        value={`${userEditFromData.username}`}
                                        onChange={(e) => {
                                            setUserEditFormData((prev) => ({
                                                ...prev,
                                                username: e.target.value,
                                            }));
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">
                                        Email :
                                    </Label>
                                    <Input
                                        id="email"
                                        value={`${userEditFromData.email}`}
                                        onChange={(e) => {
                                            setUserEditFormData((prev) => ({
                                                ...prev,
                                                email: e.target.value,
                                            }));
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="isActive" className="text-right">
                                        Status :
                                    </Label>
                                    <Switch
                                        id="isActive"
                                        checked={userEditFromData.isActive}
                                        onCheckedChange={(e) => {
                                            setUserEditFormData((prev) => ({
                                                ...prev,
                                                isActive: e,
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="isActive" className="text-right">
                                        Role :
                                    </Label>
                                    <div className={`flex flex-row gap-4 items-center`}>
                                        <p>{userEditFromData.role && userEditFromData.role.name}</p>
                                        {roleChangingState ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="head" className="text-right">
                                        Head Of The Department :
                                    </Label>
                                    <Switch
                                        id="head"
                                        checked={userEditFromData.head}
                                        onCheckedChange={(e) => {
                                            setUserEditFormData((prev) => ({
                                                ...prev,
                                                head: e,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter
                            className={`flex flex-col-reverse md:flex-row lg:flex-row justify-start md:justify-between lg:justify-between items-center pt-2 gap-2`}
                        >
                            <div className={`flex flex-row items-center gap-3`}>
                                <Select onValueChange={(e) => handleRoleSelectChange(e)}>
                                    <SelectTrigger className="w-[280px]">
                                        <SelectValue placeholder="Select a Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.length > 0 ? (
                                            roles.map((role) => (
                                                <SelectItem key={`${role._id}`} value={role}>
                                                    {role.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="est">
                                                Eastern Standard Time (EST)
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            {isMobile && <Separator className="my-4" />}
                            <Button type="submit" disabled={isUserUpating ? true : false}>
                                Submit {isUserUpating && <Loader2 className="animate-spin" />}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalMain>
            </Modal>

            {/* Create User Modal  */}
            <Modal
                // key={`createusermodal`}
                open={modalCreateUserOpen}
                onClose={() => onCreateUserModalOpen()}
            >
                <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>
                    <form id="createuserform" action="" onSubmit={handleCreateUserSubmit}>
                        <ModalClose onClose={() => onCreateUserModalOpen()}>
                            <CircleX />
                        </ModalClose>
                        <ModalHead>
                            {/* Title */}
                            <p className={``}>Create User</p>
                        </ModalHead>
                        {/* Modal Body */}
                        <ModalBody className={`p-5`}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name :
                                    </Label>
                                    <Input
                                        id="name"
                                        value={`${createUserFormData.name ?? ""}`}
                                        onChange={(e) => {
                                            setCreateUserFromData((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }));
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="username" className="text-right">
                                        User Id :
                                    </Label>
                                    <Input
                                        id="username"
                                        value={`${createUserFormData.username ?? ""}`}
                                        onChange={(e) => {
                                            setCreateUserFromData((prev) => ({
                                                ...prev,
                                                username: e.target.value,
                                            }));
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">
                                        Email :
                                    </Label>
                                    <Input
                                        id="email"
                                        value={`${createUserFormData.email ?? ""}`}
                                        onChange={(e) => {
                                            setCreateUserFromData((prev) => ({
                                                ...prev,
                                                email: e.target.value,
                                            }));
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="password" className="text-right">
                                        Password :
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={`${createUserFormData.password ?? ""}`}
                                        onChange={(e) => {
                                            setCreateUserFromData((prev) => ({
                                                ...prev,
                                                password: e.target.value,
                                            }));
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="c_password" className="text-right">
                                        Confirm Password :
                                    </Label>
                                    <Input
                                        id="c_password"
                                        type="password"
                                        value={`${createUserFormData.c_password ?? ""}`}
                                        onChange={(e) => {
                                            setCreateUserFromData((prev) => ({
                                                ...prev,
                                                c_password: e.target.value,
                                            }));
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter
                            className={`flex flex-row justify-end items-center pt-2`}
                        >
                            <Button type="submit" disabled={isUserCreating ? true : false}>
                                Submit {isUserCreating && <Loader2 className="animate-spin" />}{" "}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalMain>
            </Modal>
            {/* Modals */}
        </>
    );
}

export default UserTab;
