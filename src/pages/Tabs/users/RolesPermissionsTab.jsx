import axios from "axios";
import {useEffect, useState} from "react";
import {getToken} from "../../../hooks/get-token";
import {TabsContent} from "@/components/ui/tabs";
import {useToast} from "@/hooks/use-toast";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    ListPlus,
    Loader2,
    ArrowUpDown,
    ChevronDown,
    MoreHorizontal,
    Delete,
    Pencil,
    CircleX,
    Plus,
} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";

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
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Skeleton} from "@/components/ui/skeleton";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Modal, {
    ModalMain,
    ModalBody,
    ModalHead,
    ModalClose,
    ModalFooter,
} from "../../../components/app/Modal";
import {isPermissionGranted} from "../../../hooks/permission.js";
import {useSelector} from "react-redux";

const RoleSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
});

const PermissionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
});

function RolesPermissionsTab() {
    const {toast} = useToast();
    const user = useSelector((state) => state.auth.user);
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isRolesLoading, setIsRolesLoading] = useState(false);
    const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
    const [isRoleCreating, setIsRoleCreating] = useState(false);
    const [isPermissionCreating, setIsPermissionCreating] = useState(false);

    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});

    const [permissionSorting, setPermissionSorting] = useState([]);
    const [columnPermissionFilters, setPermissionColumnFilters] = useState([]);
    const [columnPermissionVisibility, setPermissionColumnVisibility] = useState(
        {},
    );
    const [editRoleFormData, setEditRoleFormData] = useState({
        _id: "",
        name: "",
        description: "",
        permissions: [],
    });
    const [editPermissionFormData, setEditPermissionFormData] = useState({
        _id: "",
        name: "",
        description: "",
    });

    const handleEditFormChange = (e) => {
        const {name, value} = e.target;
        setEditRoleFormData({
            ...editRoleFormData,
            [name]: value,
        });
    };

    let roleForm = useForm({
        resolver: zodResolver(RoleSchema),
        defaultValues: {name: "", description: ""},
    });

    const permissionForm = useForm({
        resolver: zodResolver(PermissionSchema),
        defaultValues: {name: "", description: ""},
    });

    useEffect(() => {
        getPermissions();
        getRoles();
    }, []);

    // Get Permissions
    const getPermissions = async () => {
        setIsPermissionsLoading(true);
        try {
            let response = await axios.get(
                `${import.meta.env.VITE_USER_API_SERVER}/api/roles/get-permissions`,
                {headers: {Authorization: `Bearer ${getToken()}`}},
            );

            if (Array.isArray(response.data)) {
                setPermissions(response.data); // Expecting an array of objects
            } else {
                console.error("Invalid permissions data:", response.data);
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setIsPermissionsLoading(false);
        }
    };

    // Get Roles
    const getRoles = async () => {
        setIsRolesLoading(true);
        try {
            let response = await axios.get(
                `${import.meta.env.VITE_USER_API_SERVER}/api/roles/get-roles`,

                {headers: {Authorization: `Bearer ${getToken()}`}},
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

    // Sublit role form
    const handleRoleSubmit = async (formData) => {
        setIsRoleCreating(true);

        try {
            await axios.post(
                `${import.meta.env.VITE_USER_API_SERVER}/api/roles/create-role`,
                formData,
                {headers: {Authorization: `Bearer ${getToken()}`}},
            );
            roleForm.reset();
            getRoles();
        } catch (error) {
            console.error("Role creation error: ", error);
        } finally {
            setIsRoleCreating(false);
        }
    };

    // Submit permission form
    const handlePermissionSubmit = async (formData) => {
        setIsPermissionCreating(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_USER_API_SERVER}/api/roles/create-permission`,
                formData,
                {headers: {Authorization: `Bearer ${getToken()}`}},
            );
            permissionForm.reset();
            getPermissions();
        } catch (error) {
            console.error("Permission creation error: ", error);
        } finally {
            setIsPermissionCreating(false);
        }
    };

    // Role Column
    const roleColumns = [
        {
            accessorKey: "name", // Key in your roles array
            header: ({column}) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown/>
                </Button>
            ),
            cell: ({row}) => row.getValue("name"),
        },
        {
            accessorKey: "description", // Key in your roles array
            header: ({column}) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Description
                    <ArrowUpDown/>
                </Button>
            ),
            cell: ({row}) => row.getValue("description"),
        },
        {
            id: "actions",
            cell: ({row}) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            {/* <span className="sr-only">Open menu</span> */}
                            <MoreHorizontal/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                        {isPermissionGranted(user, 'Update Role') && (
                            <>
                                <DropdownMenuItem
                                    className={`cursor-pointer`}
                                    onClick={() => {
                                        // console.log(row.original);
                                        setEditRoleFormData({
                                            _id: row.original._id,
                                            name: row.original.name,
                                            description: row.original.description,
                                            permissions: row.original.permissions,
                                        });
                                        onRolePermissionsModalOpen();
                                    }}
                                >
                                    <div className="w-full flex flex-row justify-between items-center">
                                        Permission <Plus size={20} className={`text-green-600`}/>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className={`cursor-pointer`}
                                    onClick={() => {
                                        setEditRoleFormData({
                                            _id: row.original._id,
                                            name: row.original.name,
                                            description: row.original.description,
                                        });
                                        onRoleModalOpen();
                                    }}
                                >
                                    <div className="w-full flex flex-row justify-between items-center">
                                        Edit <Pencil size={15}/>
                                    </div>
                                </DropdownMenuItem>
                            </>
                        )}

                        {isPermissionGranted(user, 'Delete Role') && (
                            <DropdownMenuItem
                                className={`bg-red-400 hover:bg-red-400 cursor-pointer`}
                                onClick={() => onRoleDelete(row.original._id)}
                            >
                                <div className="w-full flex flex-row justify-between items-center">
                                    Delete <Delete size={20}/>
                                </div>
                            </DropdownMenuItem>
                        )}

                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    // The update role function
    const handleEditRoleSubmit = async (event) => {
        event.preventDefault();
        setIsRoleCreating(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_USER_API_SERVER}/api/roles/update-role/${editRoleFormData._id}`,
                {
                    name: editRoleFormData.name,
                    description: editRoleFormData.description,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                },
            );
            getRoles();
        } catch (error) {
            console.log("Role Edit error", error);
        } finally {
            setIsRoleCreating(false);
        }
    };

    // Delete Role
    const onRoleDelete = async (roleId) => {
        if (!roleId) return;
        try {
            await axios.delete(
                `${import.meta.env.VITE_USER_API_SERVER}/api/roles/delete-role/${roleId}`,
                {headers: {Authorization: `Bearer ${getToken()}`}},
            );
            getRoles(); // Refresh roles after deletion
        } catch (error) {
            console.error("Error deleting role:", error);
        }
    };

    // Row Tables
    const roleTable = useReactTable({
        data: roles, // Use roles state here
        columns: roleColumns, // Columns definition
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
    });

    // Permission Column
    const permissionColumns = [
        {
            accessorKey: "name", // Key in your roles array
            header: ({column}) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown/>
                </Button>
            ),
            cell: ({row}) => row.getValue("name"),
        },
        {
            accessorKey: "description", // Key in your roles array
            header: ({column}) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Description
                    <ArrowUpDown/>
                </Button>
            ),
            cell: ({row}) => row.getValue("description"),
        },
        {
            id: "actions",
            cell: ({row}) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            {/* <span className="sr-only">Open menu</span> */}
                            <MoreHorizontal/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                        {isPermissionGranted(user, 'Update Permission') && (
                            <DropdownMenuItem
                                className={`cursor-pointer`}
                                onClick={() => {
                                    setEditPermissionFormData({
                                        _id: row.original._id,
                                        name: row.original.name,
                                        description: row.original.description,
                                    });
                                    onPermissionModalOpen();
                                }}
                            >
                                <div className="w-full flex flex-row justify-between items-center">
                                    Edit <Pencil size={20}/>
                                </div>
                            </DropdownMenuItem>)}
                        {isPermissionGranted(user, 'Delete Permission') && (


                            <DropdownMenuItem
                                className={`bg-red-400 hover:bg-red-400 cursor-pointer`}
                                onClick={() => {
                                    onPermissionDelete(row.original._id);
                                }}
                            >
                                <div className="w-full flex flex-row justify-between items-center">
                                    Delete <Delete size={20}/>
                                </div>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const onPermissionDelete = async (permissionId) => {
        if (!permissionId) return;
        try {
            await axios.delete(
                `${import.meta.env.VITE_USER_API_SERVER}/api/roles/delete-permission/${permissionId}`,
                {headers: {Authorization: `Bearer ${getToken()}`}},
            );
            getPermissions(); // Refresh roles after deletion
        } catch (error) {
            console.error("Error deleting role:", error);
        }
    };

    // Permission Table
    const permissionTable = useReactTable({
        data: permissions, // Use roles state here
        columns: permissionColumns, // Columns definition
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            permissionSorting,
            columnPermissionFilters,
            columnPermissionVisibility,
            // rowSelection,
        },
        onSortingChange: setPermissionSorting,
        onColumnFiltersChange: setPermissionColumnFilters,
        onColumnVisibilityChange: setPermissionColumnVisibility,
        // onRowSelectionChange: setRowSelection,
    });

    // Modals
    const [modalRoleOpen, setModalRoleOpen] = useState(false);
    const onRoleModalOpen = () => {
        setModalRoleOpen(!modalRoleOpen);
    };
    const [modalRolePermissionOpen, setModalRolePermissionOpen] = useState(false);
    const onRolePermissionsModalOpen = () => {
        setModalRolePermissionOpen(!modalRolePermissionOpen);
    };

    const [modalPermissionOpen, setModalPermissionOpen] = useState(false);
    const onPermissionModalOpen = () => {
        setModalPermissionOpen(!modalPermissionOpen);
    };

    // Updated Role Permissions Save
    const onSaveUpdatedRolePermissions = async () => {
        // name: editRoleFormData.
        const _permissions = [];
        editRoleFormData.permissions.map((permission) => {
            _permissions.push(permission._id);
        });
        const data = {
            roleId: editRoleFormData._id,
            permissions: _permissions,
        };
        setIsRoleCreating(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_USER_API_SERVER}/api/roles/add-permission-to-role`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                },
            );
            getRoles();
            toast({
                title: "Success!",
                description: `Permissions Saved For This Role ${editRoleFormData.name}`,
            });
        } catch (error) {
            console.log("Role Edit error", error);
            toast({
                variant: "destructive",
                title: "Error!",
                description: `Something is wrong to save Permission to Role ${editRoleFormData.name}`,
            });
        } finally {
            setIsRoleCreating(false);
        }
    };

    const handleSelectChange = (value) => {
        const {permissions} = editRoleFormData;
        if (!permissions.some((p) => p._id === value._id)) {
            setEditRoleFormData((prev) => ({
                ...prev,
                permissions: [...prev.permissions, value],
            }));
        } else {
            toast({
                variant: "destructive",
                title: "Error!",
                description: `${value.name} is already exist`,
            });
        }
    };

    const handleEditPermissionSubmit = async (event) => {
        event.preventDefault();
        setIsPermissionCreating(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_USER_API_SERVER}/api/roles/update-permission/${editPermissionFormData._id}`,
                {
                    name: editPermissionFormData.name,
                    description: editPermissionFormData.description,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                },
            );
            getPermissions();
            toast({
                title: "Success!",
                description: "Permission saved successfully",
            });
        } catch (error) {
            console.log("Role Edit error", error);
            toast({
                variant: "destructive",
                title: "Error!",
                description: "Something wrong to save updated data",
            });
        } finally {
            setIsPermissionCreating(true);
        }
    };
    return (
        <>
            <TabsContent value="permissions">
                <div className={`flex flex-col md:flex-row lg:flex-row  gap-5`}>
                    <Card className={`w-full`}>
                        <CardHeader
                            className={`flex flex-row justify-between items-center`}
                        >
                            <div className="">
                                <CardTitle>Roles</CardTitle>
                                <CardDescription>Create & change roles</CardDescription>
                            </div>
                            {isPermissionGranted(user, 'Create Role') && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className={`px-3 py-0`}>
                                            <ListPlus/>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <h4 className="font-medium leading-none">
                                                    Create New Role
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Set the name and details for the Role.
                                                </p>
                                            </div>
                                            <div className="grid gap-2">
                                                <form
                                                    onSubmit={roleForm.handleSubmit(handleRoleSubmit)}
                                                    className="space-y-4"
                                                >
                                                    <div className="">
                                                        <Label htmlFor="role-name">Name : </Label>
                                                        <Input
                                                            {...roleForm.register("name")}
                                                            id="role-name"
                                                            placeholder="Role Name"
                                                            className="col-span-2 h-8"
                                                        />
                                                        <p className="text-red-500 text-sm">
                                                            {roleForm.formState.errors.name?.message}
                                                        </p>
                                                    </div>
                                                    <div className="">
                                                        <Label htmlFor="role-description">Description</Label>
                                                        <Input
                                                            {...roleForm.register("description")}
                                                            id="role-description"
                                                            placeholder="Role Description"
                                                            className="col-span-2 h-8"
                                                        />
                                                        <p className="text-red-500 text-sm">
                                                            {roleForm.formState.errors.description?.message}
                                                        </p>
                                                    </div>
                                                    <Button type="submit">
                                                        {" "}
                                                        {isRoleCreating ? (
                                                            <Loader2 className="animate-spin"/>
                                                        ) : (
                                                            "Create"
                                                        )}
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>)}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {isRolesLoading && !roles && <Loader2 className="animate-spin"/>}
                            {isRolesLoading && roles && (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full"/>
                                    <Skeleton className="h-4 w-full"/>
                                </div>
                            )}

                            {/* Table */}
                            <Table>
                                <TableHeader>
                                    {roleTable.getHeaderGroups().map((headerGroup) => (
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
                                    {roleTable.getRowModel().rows?.length ? (
                                        roleTable.getRowModel().rows.map((row) => (
                                            <TableRow
                                                className={`border-b border-b-zinc-200 dark:border-b-zinc-600`}
                                                key={`${row.id}`}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={`${cell.id}`}>
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
                                                colSpan={roleColumns.length}
                                                className="h-24 text-center"
                                            >
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>{/* No Card footer */}</CardFooter>
                    </Card>
                    <Card className={`w-full`}>
                        <CardHeader
                            className={`flex flex-row justify-between items-center`}
                        >
                            <div className="">
                                <CardTitle>Permissions</CardTitle>
                                <CardDescription>Create & change permissions</CardDescription>
                            </div>

                            {isPermissionGranted(user, 'Create Permission') && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className={`px-3 py-0`}>
                                            <ListPlus/>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <h4 className="font-medium leading-none">
                                                    Create New Permission
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Set the name and details for the Permission.
                                                </p>
                                            </div>
                                            <div className="grid gap-2">
                                                <form
                                                    onSubmit={permissionForm.handleSubmit(
                                                        handlePermissionSubmit,
                                                    )}
                                                    className="space-y-4"
                                                >
                                                    <div className="">
                                                        <Label htmlFor="permission-name">Name : </Label>
                                                        <Input
                                                            {...permissionForm.register("name")}
                                                            id="permission-name"
                                                            placeholder="Permission Name"
                                                            className="col-span-2 h-8"
                                                        />
                                                        <p className="text-red-500 text-sm">
                                                            {permissionForm.formState.errors.name?.message}
                                                        </p>
                                                    </div>
                                                    <div className="">
                                                        <Label htmlFor="permission-description">
                                                            Description
                                                        </Label>
                                                        <Input
                                                            {...permissionForm.register("description")}
                                                            id="permission-description"
                                                            placeholder="Permission Description"
                                                            className="col-span-2 h-8"
                                                        />
                                                        <p className="text-red-500 text-sm">
                                                            {
                                                                permissionForm.formState.errors.description
                                                                    ?.message
                                                            }
                                                        </p>
                                                    </div>
                                                    <Button type="submit">
                                                        {isPermissionCreating ? (
                                                            <Loader2 className="animate-spin"/>
                                                        ) : (
                                                            "Create"
                                                        )}{" "}
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>)}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {/* Table */}
                            <Table>
                                <TableHeader>
                                    {permissionTable.getHeaderGroups().map((headerGroup) => (
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
                                    {permissionTable.getRowModel().rows?.length ? (
                                        permissionTable.getRowModel().rows.map((row) => (
                                            <TableRow
                                                className={`border-b border-b-zinc-200 dark:border-b-zinc-600`}
                                                key={`${row.id}`}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={`${cell.id}`}>
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
                                                colSpan={permissionColumns.length}
                                                className="h-24 text-center"
                                            >
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    {permissionTable.getFilteredSelectedRowModel().rows.length} of{" "}
                                    {permissionTable.getFilteredRowModel().rows.length} row(s)
                                    selected.
                                </div>
                                <div className="space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => permissionTable.previousPage()}
                                        disabled={!permissionTable.getCanPreviousPage()}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => permissionTable.nextPage()}
                                        disabled={!permissionTable.getCanNextPage()}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter></CardFooter>
                    </Card>
                </div>
            </TabsContent>

            {/* Edit Role Model */}
            <Modal
                key={`modal`}
                open={modalRoleOpen}
                onClose={() => onRoleModalOpen()}
            >
                <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>
                    <form id="editrole" action="" onSubmit={handleEditRoleSubmit}>
                        <ModalClose onClose={() => onRoleModalOpen()}>
                            <CircleX/>
                        </ModalClose>
                        <ModalHead>
                            {/* Title */}
                            <p className={``}>Edit Role</p>
                        </ModalHead>
                        {/* Modal Body */}
                        <ModalBody className={`p-5`}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={`${editRoleFormData.name}`}
                                        onChange={(e) => {
                                            setEditRoleFormData({
                                                ...editRoleFormData,
                                                name: e.target.value,
                                            });
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        value={`${editRoleFormData.description}`}
                                        onChange={(e) => {
                                            setEditRoleFormData({
                                                ...editRoleFormData,
                                                description: e.target.value,
                                            });
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter
                            className={`flex flex-row justify-end items-center pt-2`}
                        >
                            <Button type="submit">Submit</Button>
                        </ModalFooter>
                    </form>
                </ModalMain>
            </Modal>

            {/* Update Role Permissions Model */}
            <Modal
                key={`rolepermissionmodal`}
                open={modalRolePermissionOpen}
                onClose={() => onRolePermissionsModalOpen()}
            >
                <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>
                    <ModalClose onClose={() => onRolePermissionsModalOpen()}>
                        <CircleX/>
                    </ModalClose>
                    <ModalHead>
                        {/* Title */}
                        <p className={``}>Add & Edit Role Permissions</p>
                    </ModalHead>
                    {/* Modal Body */}
                    <ModalBody className={`p-5`}>
                        <div className="flex flex-wrap   gap-4 py-4">
                            {editRoleFormData.permissions &&
                            editRoleFormData.permissions.length > 0
                                ? editRoleFormData.permissions.map((e) => (
                                    <div
                                        key={`${e._id}`}
                                        className="flex flex-row items-center gap-2 bg-green-50 text-black p-1 rounded "
                                    >
                                        <p>{e.name}</p>{" "}
                                        <CircleX
                                            size={18}
                                            className="cursor-pointer text-red-500"
                                            onClick={() => {
                                                // remove current permission from permissions
                                                setEditRoleFormData((prev) => ({
                                                    ...prev,
                                                    permissions: [
                                                        ...prev.permissions.filter(
                                                            (permission) => permission._id !== e._id,
                                                        ),
                                                    ],
                                                }));
                                            }}
                                        />
                                    </div>
                                ))
                                : "No Permission Found"}
                        </div>
                    </ModalBody>
                    <ModalFooter
                        className={`flex flex-row justify-end items-center pt-2 gap-2`}
                    >
                        <Select onValueChange={handleSelectChange}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select a Permission"/>
                            </SelectTrigger>
                            <SelectContent>
                                {permissions.length > 0 ? (
                                    permissions.map((permission) => (
                                        <SelectItem key={`${permission._id}`} value={permission}>
                                            {permission.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="est">
                                        Eastern Standard Time (EST)
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => {
                                onSaveUpdatedRolePermissions();
                            }}
                        >
                            Save
                        </Button>
                    </ModalFooter>
                </ModalMain>
            </Modal>

            {/* Edit Permission Model */}
            <Modal
                key={`permissionmodal`}
                open={modalPermissionOpen}
                onClose={() => onPermissionModalOpen()}
            >
                <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>
                    <form
                        id="editrolepermisssion"
                        action=""
                        onSubmit={handleEditPermissionSubmit}
                    >
                        <ModalClose onClose={() => onPermissionModalOpen()}>
                            <CircleX/>
                        </ModalClose>
                        <ModalHead>
                            {/* Title */}
                            <p className={``}>Edit Permission</p>
                        </ModalHead>
                        {/* Modal Body */}
                        <ModalBody className={`p-5`}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={`${editPermissionFormData.name}`}
                                        onChange={(e) => {
                                            setEditPermissionFormData({
                                                ...editPermissionFormData,
                                                name: e.target.value,
                                            });
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        value={`${editPermissionFormData.description}`}
                                        onChange={(e) => {
                                            setEditPermissionFormData({
                                                ...editPermissionFormData,
                                                description: e.target.value,
                                            });
                                        }}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter
                            className={`flex flex-row justify-end items-center pt-2`}
                        >
                            <Button type="submit">Submit</Button>
                        </ModalFooter>
                    </form>
                </ModalMain>
            </Modal>
        </>
    );
}

export default RolesPermissionsTab;
