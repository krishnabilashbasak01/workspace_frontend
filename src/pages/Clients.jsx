import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { getToken } from "../hooks/get-token";
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
  Fan,
  Delete,
  Share2,
  Eye,
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Modal, {
  ModalHead,
  ModalMain,
  ModalClose,
  ModalBody,
  ModalFooter,
} from "../components/app/Modal";
import { convertIsoStringTodate } from '../app/dateformat'
import { useNavigate } from "react-router";
import { isPermissionGranted } from "../hooks/permission.js";
import { useSelector } from "react-redux";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"




function Clients() {
  const navigate = useNavigate()
  const user = useSelector(state => state.auth.user);
  const users = useSelector((state) => state.users.users);
  const { toast } = useToast()
  const [clients, setClients] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [clientEditModalOpen, setClientEditModalOpen] = useState(false);
  const [clientSettingsModalOpen, setClientSettingsModalOpen] = useState(false);

  const [clientForm, setClientFrom] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [smes, setSmes] = useState([]);

  const [smeAddModal, setSmeAddModal] = useState(false)
  const [selectedSme, setSelectedSme] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null)
  const [addingSme, setAddingSme] = useState(false)




  useEffect(() => {
    if (clients === null && user) {
      getClients();
    }

    return () => {
    }
  }, [clients, user])

  useEffect(() => {
    if (smes.length == 0) {
      getSmes()
    }
  }, [users])

  // Filter sme from users and set those to smes
  const getSmes = () => {
    if (users) {
      const _smes = users.filter(({ role }) => role.name.toLowerCase() === 'sme');

      if (_smes.length > 0) {
        setSmes(_smes);
      } else {
        setSmes([]); // Ensure smes is an empty array if no match
      }
    }
  }

  const findSme = (id) => {


    if (users) {
      const sme = users.find(({ _id }) => _id === id);
      return sme;
    } else {
      return null;
    }
  }

  // Get Clients
  const getClients = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/client/all`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.status !== 200) {
        toast({
          title: "Error!",
          description: "An error occurred",
          variant: "destructive"
        })
      }

      // console.log('all clients', response.data);

      if (user?.role?.name.toLowerCase() === 'sme') {
        const _primaryClients = response.data.filter(({ smes }) => smes.find(({ smeId, role }) => smeId === user._id && role === 'Primary'));
        const _secondaryClients = response.data.filter(({ smes }) => smes.find(({ smeId, role }) => smeId === user._id && role === 'Secondary'));
 
        setClients(_primaryClients.concat(_secondaryClients));
      }else{
        setClients(response.data);
      }
      

      
    } catch (error) {
      console.log(error);
      
      toast({
        title: "Error!",
        description: "An error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false);
    }
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="name"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            name
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div

        >
          <h6 className={`capitalize`}>{row.getValue("name")}</h6>
          <p>client id : {row.original.username}</p>
        </div>
      ),
    },
    {
      accessorKey: "businessName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            businessName
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="">{row.getValue("businessName")}</div>
      ),
    },
    {
      accessorKey: "joiningDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            DOJ
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (

        <div className="">{convertIsoStringTodate(row.original.joiningDate).date}</div>
      ),
    },
    {
      accessorKey: "sme",
      header: ({ column }) => {
        return (
          <p
          >
            SME
          </p>
        );
      },
      cell: ({ row }) => (

        <div className="w-full flex flex-row gap-1">{row.original.smes.length > 0 ? row.original.smes.map((sme, index) => (

          <div key={`sme_${index}`} className={`relative`}>
            <img src={findSme(sme.smeId)?.profilePicture} className="w-8 h-8 rounded-full border" alt="" />
            <div className={`w-3.5 h-3.5 absolute -top-1 -right-1 ${sme.role === 'Primary' ? 'bg-green-600' : 'bg-orange-600'} rounded-full flex justify-center items-center`}>
              <p className={`p-0 text-xs`} >{sme.role === 'Primary' ? 'P' : 'S'}</p>
            </div>
          </div>

        )) : ''}</div>
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
            {
              isPermissionGranted(user, "Share Client") && (
                <button className={`bg-blue-600 px-1 rounded-sm`}
                  onClick={() => {
                    // console.log(row.original);

                    navigate(`/client/report/${row.original.username}`)
                  }}
                >
                  <Share2 size={15} />
                </button>
              )
            }

            {isPermissionGranted(user, "Access Client") && (
              <button className={`bg-slate-500 px-1 rounded-sm`}
                onClick={() => {
                  navigate(`/client/edit/${row.original.id}`)
                }}
              >
                <Eye size={15} />
              </button>
            )}

            {
              isPermissionGranted(user, "Edit Client") && (
                <button className={`bg-green-600 px-1 rounded-sm`}
                  onClick={() => {
                    setClientFrom(row.original);
                    onOpenCreateClientModal();
                  }}
                ><Pencil size={15} /></button>
              )
            }

            {isPermissionGranted(user, "Delete Client") && (
              <button className={`bg-red-400 px-1 rounded-sm`}
                onClick={() => {
                  onDeleteClient(row.original.id);
                }}
              ><Delete size={20} /></button>
            )}

            {
              isPermissionGranted(user, "Add Sme") && (
                <>
                  <button variant="outline" onClick={() => {
                    onSmeAddModalChange();
                    setSelectedClient(row.original);
                  }}><Plus /></button></>
              )
            }

          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: clients != null ? clients : [],
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

  const onOpenCreateClientModal = () => {
    setClientEditModalOpen(!clientEditModalOpen);
  }

  // handle create client submit
  const createOrEditClient = async (e) => {
    e.preventDefault();

    setLoading(true)

    try {
      let response = null;
      if (clientForm.id) {
        response = await axios.put(`${import.meta.env.VITE_USER_API_SERVER}/api/client/${clientForm.id}`, clientForm, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          }
        })

      } else {
        response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/client`, clientForm, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          }
        })
      }

      if (response.status !== 201 || response.status !== 200) toast({
        title: "Error!",
        description: clientForm.id ? "Error to edit client" : "Error to create client",
        variant: "destructive"
      })

      getClients();
      onOpenCreateClientModal();
      toast({
        title: "Success!",
        description: clientForm.id ? "Client Successfully updated" : "Client successfully updated",
        variant: "success"
      })

    } catch (error) {
      toast({
        title: "Error!",
        description: "Error to create or edit client",
        variant: "destructive"
      })
    } finally {
      setLoading(false);
    }


  }


  const onDeleteClient = async (id) => {
    try {
      let response = await axios.delete(`${import.meta.env.VITE_USER_API_SERVER}/api/client/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) toast({
        title: "Error!",
        description: "Getting error  to delete client",
        variant: "destructive"
      })

      getClients();
      toast({
        title: "Success!",
        description: "Client Deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error!",
        description: "Getting error  to delete client",
        variant: "destructive"
      })
    } finally {
      setLoading(false);
    }
  }

  // On Client Settings Modal change
  const onClientSettingsModalChange = () => {
    setClientSettingsModalOpen(!clientEditModalOpen);
  }


  // add sme to client
  const addSmeToClient = async () => {
    setAddingSme(true);
    if (selectedSme && selectedRole && selectedClient) {
      let data = {
        smeId: selectedSme._id,
        role: selectedRole,
        clientId: parseInt(selectedClient.id)
      }
      try {
        const response = await axios.post(`${import.meta.env.VITE_USER_API_SERVER}/api/client/add-sme-to-client`,
          data, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          },

        })

        if (response.status !== 200) {
          toast({
            title: "Error!",
            description: "An error occurred",
            variant: "destructive"
          })
        }
        toast({
          title: "Success!",
          description: "SME added successfully",

        })

      } catch (error) {
        toast({
          title: "Error!",
          description: "An error occurred",
          variant: "destructive"
        })
      } finally {
        setAddingSme(false);
      }

    }
  }

  const onSmeAddModalChange = () => {
    setSmeAddModal(!smeAddModal);
  }



  return (
    <>
      <div className={`container mt-7`}>
        <Card  >
          <CardHeader className={`flex flex-row justify-between items-center`}>
            <div>
              <CardTitle>Clients</CardTitle>
              <CardDescription>You can change create and edit clients here</CardDescription>
            </div>
            <Button
              onClick={() => {
                setClientFrom({});
                onOpenCreateClientModal();
              }}
            ><Plus /></Button>
          </CardHeader>
          <CardContent className="grid gap-4">
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
            <div>

              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className=" border-0">
                      {headerGroup.headers.map((header) => {
                        return <TableHead key={header.id}
                          className="border-b border-b-zinc-400">
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
                  {!loading && clients && table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow className={`border-b border-b-zinc-200 dark:border-b-zinc-600`}
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}>
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
      </div>

      {/* Create Client Modal  */}
      <Modal
        // key={`createusermodal`}
        open={clientEditModalOpen}
        onClose={() => onOpenCreateClientModal()}
      >
        <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>
          <form id="editclient" action="" onSubmit={createOrEditClient}>
            <ModalClose onClose={() => onOpenCreateClientModal()}>
              <CircleX />
            </ModalClose>
            <ModalHead>
              {/* Title */}
              <p className={``}>{clientForm.id ? 'Edit' : "Create"} Client</p>
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
                    value={`${clientForm.name ?? ''}`}
                    onChange={(e) => {
                      setClientFrom((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="businessName" className="text-right">
                    Business Name :
                  </Label>
                  <Input
                    id="businessName"
                    value={`${clientForm.businessName ?? ''}`}
                    onChange={(e) => {
                      setClientFrom((prev) => ({
                        ...prev,
                        businessName: e.target.value
                      }))
                    }}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    username :
                  </Label>
                  <Input
                    id="username"
                    value={`${clientForm.username ?? ''}`}
                    onChange={(e) => {
                      setClientFrom((prev) => ({
                        ...prev,
                        username: e.target.value
                      }))
                    }}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="joiningDate" className="text-right">
                    Joining Date :
                  </Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={`${clientForm.joiningDate ? new Date(clientForm.joiningDate).toISOString().split('T')[0] : ''}`}
                    onChange={(e) => {
                      setClientFrom((prev) => ({
                        ...prev,
                        joiningDate: e.target.value
                      }))
                    }}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address :
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={`${clientForm.address ?? ''}`}
                    onChange={(e) => {
                      setClientFrom((prev) => ({
                        ...prev,
                        address: e.target.value
                      }))
                    }}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profilePicture" className="text-right">
                    Profile Picture Link :
                  </Label>
                  <Input
                    id="profilePicture"
                    type="text"
                    value={`${clientForm.profilePicture ?? ''}`}
                    onChange={(e) => {
                      setClientFrom((prev) => ({
                        ...prev,
                        profilePicture: e.target.value
                      }))
                    }}
                    className="col-span-3"
                  />
                </div>

              </div>
            </ModalBody>
            <ModalFooter
              className={`flex flex-row justify-end items-center pt-2`}
            >
              <Button type="submit" disabled={loading ? true : false}>
                Submit {loading && <Loader2 className="animate-spin" />}{" "}
              </Button>
            </ModalFooter>
          </form>
        </ModalMain>
      </Modal>

      {/* Client Modal  */}
      <Modal
        // key={`clientsettingsmodal`}
        open={clientSettingsModalOpen}
        onClose={() => onClientSettingsModalChange()}
      >
        <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>

          <ModalClose onClose={() => onClientSettingsModalChange()}>
            <CircleX />
          </ModalClose>
          <ModalHead>
            {/* Title */}
            <p className={``}>Client Settings</p>
          </ModalHead>
          {/* Modal Body */}
          <ModalBody className={`p-5`}>

          </ModalBody>
          <ModalFooter
            className={`flex flex-row justify-end items-center pt-2`}
          >

          </ModalFooter>

        </ModalMain>
      </Modal>


      {/* Sme Add Modal  */}
      <Modal
        // key={`clientsettingsmodal`}
        open={smeAddModal}
        onClose={() => onSmeAddModalChange()}
      >
        <ModalMain className={`w-full md:w-8/12 lg:w-5/12`}>

          <ModalClose onClose={() => onSmeAddModalChange()}>
            <CircleX />
          </ModalClose>
          <ModalHead>
            {/* Title */}
            <p className={``}>Add Sme</p>
          </ModalHead>
          {/* Modal Body */}
          <ModalBody className={`p-5`}>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">Select Sme</Label>
                <Select

                  onValueChange={(value) => {
                    setSelectedSme(value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a Sme" />
                  </SelectTrigger>
                  <SelectContent>
                    {smes?.map((sme) => (
                      <SelectItem key={sme._id} value={sme}>{sme.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">Select Type</Label>
                <Select

                  onValueChange={(value) => {
                    setSelectedRole(value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a Sme" />
                  </SelectTrigger>
                  <SelectContent>

                    <SelectItem value={'Primary'}>Primary</SelectItem>
                    <SelectItem value={'Secondary'}>Secondary</SelectItem>

                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-row justify-end" >

                <Button onClick={() => addSmeToClient()}>{addingSme ? <Loader2 className={`animate-spin`} /> : 'Submit'}</Button>
              </div>

            </div>
          </ModalBody>
          <ModalFooter
            className={`flex flex-row justify-end items-center pt-2`}
          >

          </ModalFooter>

        </ModalMain>
      </Modal>
    </>

  );
}

export default Clients;
