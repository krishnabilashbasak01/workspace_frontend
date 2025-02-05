import {
  Calendar,
  LayoutDashboard,
  Bell,
  BellDot,
  Users,
  Settings,
  Sun,
  Moon,
  LogOut,
  UserRoundCog,
  Grid2x2Check,
  MessageCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import ReactLogo from '@/assets/logo.png';
import { Button } from "@/components/ui/button";
import { useTheme } from "../../hooks/theme-provider.jsx";
import { useNavigate, NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../features/auth/authSlice.js";
import { isPermissionGranted } from "@/hooks/permission";
// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: Grid2x2Check,
  },
  {
    title: "Tasks Chat",
    url: "/tasks/chat",
    icon: MessageCircle,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "SME Weekly Calander",
    url: "/sme-calendar",
    icon: Calendar,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "User Settings",
    url: "/user-settings",
    icon: UserRoundCog,
  },
];
export function AppSidebar() {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { state, isMobile } = useSidebar();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const onLogOut = () => {
    localStorage.removeItem("token");
    dispatch(clearUser());
    navigate("/login");
  };
  return (
    <Sidebar collapsible={`${isMobile ? "offcanvas" : "icon"}`}>
      <SidebarHeader><img src={ReactLogo} className="w-40" /></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                user?.role?.permissions.find(({ name }) => name.toLowerCase() === item.title.toLowerCase()) && <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`hover:bg-gradient-to-r from-cyan-500 to-blue-500`}
                  >
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <div
          className={`flex ${state == "expanded" ? "flex-row" : "flex-col"} justify-end`}
        >
          {isPermissionGranted(user, "Settings") && (<Button
            onClick={() => {
              navigate("/app-settings")
            }}
            className={`rounded p-2 border border-gray-300 dark:border-gray-700 bg-gray-800 dark:bg-gray-100
                          text-white dark:text-slate-800 hover:text-slate-800`}
          >
            <Settings />
          </Button>)}

          
          <Button
            onClick={onLogOut}
            className={`rounded p-2 border border-gray-300 dark:border-gray-700 bg-gray-800 dark:bg-gray-100
                          text-white dark:text-slate-800 hover:text-slate-800`}
          >
            <LogOut />
          </Button>
          <Button
            onClick={toggleTheme}
            className={`p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-800 dark:bg-gray-100
                            text-white dark:text-slate-800 hover:text-slate-800`}
          >
            {theme === "dark" ? (
              <Sun className={``} />
            ) : (
              <Moon className={``} />
            )}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
