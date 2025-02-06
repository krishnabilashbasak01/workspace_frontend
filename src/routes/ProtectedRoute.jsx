
import { useEffect, useState } from "react";
import { Layout } from "../components/app/Layout";
import { getToken, isTokenExpired } from "../hooks/get-token";
import { Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setUser, updateUser } from "../features/auth/authSlice";
import axios from "axios";
import { io } from "socket.io-client";
import { setSocketConnectionStatus } from "../features/socket/socketSlice";

import { connectSocket, getSocket } from "../app/socket.js";
import { useToast } from "../hooks/use-toast";
import { useLocation } from "react-router";
import { setUsers } from "../features/users/usersSlice.js";
import { setTasksInQueue, setSelectedTask } from "../features/task/task_inqueue.js";

export const ProtectedRoute = ({ children }) => {
    const { toast } = useToast()



    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const users = useSelector((state) => state.users.users);
    const selectedTask = useSelector((state) => state.tasks_in_queue.selected_task);
    const token = getToken();
    const { _id, isExpired } = isTokenExpired(token);
    const socket = getSocket();



    useEffect(() => {
        if (user) {
            const socket = connectSocket(`${import.meta.env.VITE_USER_API_SERVER}`, {
                transports: ["websocket"], // Optional, ensures WebSocket connection
            });
            socket.on("connect", async () => {
                let _user = { ...user, socketId: socket.id };

                dispatch(updateUser(_user))
                dispatch(setSocketConnectionStatus(true));


                // Emit an event to server for user identification (optional)
                if (user) {
                    socket.emit("user_connected", { userId: user._id });
                }
            });

            socket.on("new_user_connected", (data) => {
                toast({
                    title: "Connected!",
                    description: `${data.name} is Connected to Workspace`
                })
            });
            socket.on("user_disconnected", (data) => {
                toast({
                    title: "Disconnected!",
                    description: `${data.name} is disconnected from Workspace`
                })
            });

            if (user.role.name.toLowerCase() === 'sme' || user.role.name.toLowerCase() === 'gd' || user.role.name.toLowerCase() === 've' || user.role.name.toLowerCase() === 'super admin' || user.role.name.toLowerCase() === 'admin') {
                socket.on('tasks_in_queue', (data) => {
                    dispatch(setTasksInQueue(data));
                    
                    if (selectedTask && selectedTask.id) {
                        let _selectedUpdatedTask = data.find((_task) => _task.id === selectedTask.id);
                        dispatch(setSelectedTask(_selectedUpdatedTask));
                    }

                })
            }

            // Cleanup socket connection on component unmount
            return () => {
                socket.off("connect");
                socket.off("user_status");
                socket.off("new_user_connected");
                socket.off("tasks_in_queue");
            };
        }
    }, [user, selectedTask])

    // after login complete then this code will write


    useEffect(() => {
        if (!user) {
            if (token && !isExpired) {
                getUser(_id);
            }
        }
    }, []);


    // Get Users
    const getUser = async (_id) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_USER_API_SERVER}/api/users/get-user/${_id}`,
                { headers: { Authorization: `Bearer ${getToken()}` } },
            );

            if (response.status === 200) {
                // console.log(response.data);
                dispatch(setUser(response.data.user));
            }
        } catch (error) {
            console.log("error : ", error);
        }
    };
    useEffect(() => {
        getUsers();

    }, []);
    useEffect(() => {

        getTaskInQueue();
        return () => {

        }
    }, [socket])


    useEffect(() => {

        if (socket) {
            socket.on("online_users", (data) => {
                if (users) {
                    if (Array.isArray(users)) {
                        const updatedUsers = users.map((_user) => {
                            if (data.includes(_user._id)) {
                                return { ..._user, online: true }
                            }

                            //   Otherwise, set user status to online
                            return { ..._user, online: false };

                        });
                        // console.log(updatedUsers);
                        dispatch(setUsers(updatedUsers))
                        // setUsers(updatedUsers);
                    } else {
                        console.log('Not an array', typeof (users));
                    }

                }
            });
        }

        return () => {
            if (socket) {
                socket.off("online_users");
            }
        };
    }, [user, users])

    // Get Users
    const getUsers = async () => {
        // console.log("getting users");

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
        }
    }


    // get tasks in queue
    const getTaskInQueue = () => {
        console.log('getting task in queue');

        if (socket) {
            if (user) {
                socket.emit('get_tasks_in_queue', { role: user.role.name, id: user._id, head: user.head ? user.head : false, }, (response) => {
                });
            }
        }
    }

    // Check token is expired
    if (!token || isExpired) return <Navigate to={"/login"} replace />;



    // If token exist then return Layout
    return <Layout>{children}</Layout>;
};
