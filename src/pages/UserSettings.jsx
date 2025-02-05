import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import RolesPermissionsTab from "./Tabs/users/RolesPermissionsTab";
import UsersTab from "./Tabs/users/UsersTab";

import { getToken } from "../hooks/get-token";

function UserSettings() {
  return (
    <>
      <div className="container"></div>

      {/* Tabs */}
      <div className={`container mt-5`}>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="permissions">Roles & Permissions</TabsTrigger>
          </TabsList>

          {/* Tabs Imported from tabs Folder */}
          <UsersTab />
          <RolesPermissionsTab />
        </Tabs>
      </div>
    </>
  );
}

export default UserSettings;
