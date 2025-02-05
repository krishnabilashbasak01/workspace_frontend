import { Routes, Route } from "react-router";
import { LoginPage } from "../pages/LoginPage";
import DashBoard from "../pages/DashBoard";
import { ProtectedRoute } from "./ProtectedRoute";
import Notifications from "../pages/Notifications";
import Calendar from "../pages/Calendar";
import Clients from "../pages/Clients";
import UserSettings from "../pages/UserSettings";
import CameraLogin from "../pages/CameraLogin";
import AppSettings from "../pages/AppSettings";
import SingleClient from "../pages/Client/SingleClient";
import Tasks from "../pages/Tasks/Tasks";
import TasksChat from "../pages/Tasks/TaskChat";
import ClientByUserName from "../pages/Client/ClientByUserName";
import SMEWeeklyCalendar from "../pages/SMEWeeklyCalendar";

export const CustomRoutes = () => {


  return (
    <>
      <Routes>
        {/* Common Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />

        {/* Notifications */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        {/* Calendar */}
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />

        {/* Sme Weekly Calendar */}
        <Route
          path="/sme-calendar"
          element={
            <ProtectedRoute>
              <SMEWeeklyCalendar />
            </ProtectedRoute>
          }
        />

        {/* Tasks */}
        <Route path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />

        {/* Tasks Chat */}
        <Route path="/tasks/chat"
          element={
            <ProtectedRoute>
              <TasksChat />
            </ProtectedRoute>
          }
        />

        {/* Clients */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />

        {/* Single Client By username */}
        <Route
          path="/client/report/:username"
          element={

            <ClientByUserName />

          }
        />

        {/* Single Client */}
        <Route
          path="/client/:type/:selector"
          element={
            <ProtectedRoute>
              <SingleClient />
            </ProtectedRoute>
          }
        />

        {/* Single Client By username */}
        <Route

          path="/client/:type/:selector"
          element={
            <ProtectedRoute>
              <SingleClient />
            </ProtectedRoute>
          }

        />


        {/* Notifications */}
        <Route
          path="/user-settings"
          element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="/camera-login"
          element={
            <ProtectedRoute>
              <CameraLogin />
            </ProtectedRoute>
          }
        />


        {/* App Settings */}

        <Route path="/app-settings"
          element={
            <ProtectedRoute>
              <AppSettings />
            </ProtectedRoute>
          }
        />


        {/* Protected Routes */}

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </>
  );
};
