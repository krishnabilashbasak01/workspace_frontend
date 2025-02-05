import { useState } from "react";

import "./App.css";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app/AppSidebar.jsx";
import { Layout } from "./components/app/Layout.jsx";
import { useTheme } from "./hooks/theme-provider.jsx";
import { CustomRoutes } from "./routes/CustomRoutes.jsx";

function App() {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <CustomRoutes />
    </>
  );
}

export default App;
