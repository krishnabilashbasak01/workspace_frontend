import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar.jsx";
import { useCookies } from "../../hooks/cookie-provider.jsx";
import { AppBar } from "./AppBar.jsx";
import { Toaster } from "@/components/ui/toaster";
export const Layout = ({ children }) => {
  const { cookies } = useCookies();
  const defaultOpen = cookies["sidebar:state"] === "true";

  return (
    <div
      className={`w-full h-full bg-white dark:bg-zinc-950 text-black dark:text-white`}
    >
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        
        <main className={`w-full`}>
          <AppBar />
          {children}
        </main>
      </SidebarProvider>
      <Toaster />
    </div>
  );
};
