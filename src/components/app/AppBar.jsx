import { CircleUser, Camera } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDispatch, useSelector } from "react-redux";

export const AppBar = () => {
  const user = useSelector((state) => state.auth.user);
  let navigate = useNavigate();
  return (
    <>
      <div className={`w-full`}>
        <div
          className={`flex flex-row bg-zinc-50 dark:bg-zinc-900 h-14 items-center border-b border-b-zinc-300 `}
        >
          <div className={`flex-none text-black dark:text-white`}>
            <SidebarTrigger />
          </div>
          <div className={`flex-grow`}></div>
          <div
            className={`flex-none mr-3 dark:text-white cursor-pointer`}
            onClick={() => {
              navigate("/camera-login");
            }}
          >
            <Camera size={30} />
          </div>
          <div className={`flex-none mr-3 dark:text-white`}>
            <Avatar>
              <AvatarImage src={`${user?.profilePicture? user.profilePicture : "https://github.com/shadcn.png"}`} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </>
  );
};
