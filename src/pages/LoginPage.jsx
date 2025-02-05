import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Key } from "lucide-react";

const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginPage = () => {
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_USER_API_SERVER}/api/login`,
        {
          username: data.username,
          password: data.password,
        },
      );

      // Save token to localstorage
      const { token } = response.data;
      localStorage.setItem("token", token);
      // console.log("Login Successful : ", token);

      // Navigate to dashboard
      window.location.href = "/";
    } catch (error) {
      console.error("Login Failed:", error);
      setApiError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-sm p-6 rounded shadow-md bg-gradient-to-r from-cyan-50 to-blue-100">
          <h2 className="mb-6 text-xl font-semibold text-gray-700 text-center">
            Login
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                className={`mt-1 block w-full p-2 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                {...register("username")}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className={`mt-1 block w-full p-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* API Error */}
            {apiError && <p className="text-sm text-red-500">{apiError}</p>}

            {/* Submit Button */}
            <center>
              <Button
                type="submit"
                disabled={isLoading}
                className=" px-4 py-2 text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Key />}{" "}
                {isLoading ? "" : "Login"}
              </Button>
            </center>
          </form>
        </div>
      </div>
    </>
  );
};
