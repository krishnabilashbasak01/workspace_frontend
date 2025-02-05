import { useState, useEffect, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { Camera, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { clearUser } from "../features/auth/authSlice";
import { getToken } from "../hooks/get-token";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
function CameraLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [location, setLocation] = useState({ longitude: null, latitude: null });
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoConstraints = {
    width: 500,
    height: 700,
    facingMode: "user",
  };

  useEffect(() => {
    if (!location.longitude && !location.latitude) getLocation();
  }, [location]);

  const webcamRef = useRef(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);

    if (user && user.todaysAttendance) {
      if (
        user.todaysAttendance.loginTime &&
        !user.todaysAttendance.logoutTime
      ) {
        // Logout
        logout();
      } else if (user.todaysAttendance.logoutTime) {
        toast({
          title: "Error!",
          description: "You already loggedout",
          varient: "destructive",
        });
      }
    } else if (user && !user.todaysAttendance) {
      login();
    }
  }, [webcamRef, user]);

  // Get Location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
        },
        (err) => {
          setError(err.message);
        },
      );
    } else {
      setError("Geolocation is not supported by this browser");
    }
  };

  // Login
  const login = async () => {
    setLoading(true);
    // Check if `user` exists before proceeding
    if (!user || !user.username || !user._id) {
      toast({
        title: "Error!",
        description: "First login at application to give attendance",
        varient: "destructive",
      });
      setLoading(false);
      return;
    }
    const blob = await (await fetch(image)).blob();
    const imageFile = new File([blob], `${Date.now().toString()}.jpg`, {
      type: "image/jpeg",
    });

    
    // console.log(user.username);
    // const { username, _id } = user;
    let username = user.username;
    let _id = user._id;
    let longitude = location.longitude;
    let latitude = location.latitude;

    const formData = new FormData();
    formData.append("login_image", imageFile);
    formData.append("user_name", username);
    formData.append("log_in_device_id", "tbm_external_web_app");
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);
    formData.append("login_distance", "0");

    try {
      let response = await axios.post(
        `https://thinkbizzmarcom.com/api/login-now-2`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.status !== 200)
        toast({
          title: "Error!",
          description: "Error to give attendance Please Retry after some time",
          varient: "destructive",
        });
      if (response.data.success) {
        giveSystemAttendance(_id);
      }
    } catch (error) {
      toast({
        title: "Error!",
        description: "First login at application to give attendance",
      });
    } finally {
      setLoading(false);
    }
  };

  // Give system attendance
  const giveSystemAttendance = async (_id) => {
    setLoading(true);
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const day = String(today.getDate()).padStart(2, "0");
      let response = await axios.post(
        `${import.meta.env.VITE_USER_API_SERVER}/api/app-login`,
        {
          userId: _id,
          date: `${month}-${day}-${year}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      if (response.status !== 200)
        toast({
          title: "Error!",
          description: "Error take attendance",
          varient: "destructive",
        });
      dispatch(clearUser());
      window.location = "/";
      toast({
        title: "Success!",
        description: "You succesfully logged in at system",
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: "Something error to take attandance",
        varient: "destructive",
      });
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  // logout
  const logout = async () => {
    setLoading(true);

    try {
      const blob = await (await fetch(image)).blob();
      const imageFile = new File([blob], `${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      let username = user.username;
      let _attendanceId = user.todaysAttendance._id;
      let formData = new FormData();
      formData.append("logout_image", imageFile);
      formData.append("user_name", username);
      formData.append("log_in_device_id", "tbm_external_web_app");

      let response = await axios.post(
        "https://thinkbizzmarcom.com/api/logout-now",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.status !== 200)
        toast({
          title: "Error!",
          description: "Something wrong to logout",
          varient: "destructive",
        });
      giveSystemLogout(_attendanceId);
    } catch (error) {
      toast({
        title: "Error!",
        description: "Something wrong to logout",
        varient: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  // Give system logout
  const giveSystemLogout = async (_id) => {
    setLoading(true);

    try {
      let response = await axios.put(
        `${import.meta.env.VITE_USER_API_SERVER}/api/app-logout`,
        {
          _id: _id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      if (response.status !== 200)
        toast({
          title: "Error!",
          description: "Error to logout from sysytem",
          varient: "destructive",
        });
      dispatch(clearUser());
      window.location = "/";
      toast({
        title: "Success!",
        description: "You succesfully logged in at system",
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: "Error to system logout",
      });
    } finally {
      
      setLoading(false);
      window.location.reload();
    }
  };

  // convert Date Time
  const convertIsoStringTodate = (isoString) => {
    const date = new Date(isoString);

    // Extract date and time in a readable format
    const formattedDate = date.toLocaleDateString("en-US"); // YYYY-MM-DD
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }); // HH:MM:SS (24-hour format)

    return { date: formattedDate, time: formattedTime };
  };
  return (
    <>
      <center>
        <Card className={`w-10/12`}>
          <CardHeader className={`flex flex-col justify-center items-center`}>
            <CardTitle className={`text-center w-full`}>Login Camera</CardTitle>
            <CardDescription>
              <p>
                {user && user.todaysAttendance
                  ? user.todaysAttendance.loginTime
                    ? `Today Login Time : ${convertIsoStringTodate(user.todaysAttendance.loginTime).date} ${convertIsoStringTodate(user.todaysAttendance.loginTime).time}`
                    : ""
                  : ""}
              </p>
              <p>
                {user && user.todaysAttendance
                  ? user.todaysAttendance.logoutTime
                    ? ` Today Logout Time : ${convertIsoStringTodate(user.todaysAttendance.logoutTime).date} ${convertIsoStringTodate(user.todaysAttendance.logoutTime).time}`
                    : ""
                  : ""}
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 rounded">
            <p>
              Lat:{location.latitude} Long: {location.longitude}
            </p>
            <Webcam
              audio={false}
              // height={500}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              // width={500}
              videoConstraints={videoConstraints}
              className={`rounded w-11/12 md:w-6/12 lg:w-4/12`}
            />
          </CardContent>
          <CardFooter className={`flex flex-row justify-center items-center`}>
            <button onClick={capture}>
              {loading ? <Loader2 className="animate-spin" /> : <Camera />}
            </button>
          </CardFooter>
        </Card>
      </center>
    </>
  );
}
export default CameraLogin;
