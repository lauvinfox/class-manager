import { useMutation } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { getMe, loginUser } from "../lib/api";

const LoginPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const redirectUrl = location.state?.redirectUrl || "/";

  const {
    mutate: signin,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: () => {
      navigate(redirectUrl, {
        replace: true,
      });
    },
  });

  useEffect(() => {
    // Cek status login dengan cookie (bukan localStorage)
    getMe()
      .then(() => {
        // Jika berhasil, user sudah login, redirect ke halaman utama
        navigate(redirectUrl, { replace: true });
      })
      .catch(() => {
        // Jika gagal (401), biarkan user di halaman login
      });
  }, [redirectUrl, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signin({ email, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const handleGoogleSignIn = () => {
    navigate("/google/signup");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <div className="w-full sm:w-1/2 md:w-2/3 max-w-md p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-roboto font-bold text-center text-font-primary">
          Sign in
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center justify-center w-full max-w-sm mx-auto"
        >
          <div className="w-full flex flex-col items-center gap-1">
            <input
              type="email"
              id="email"
              className="mt-1 block w-full sm:w-2/3 px-4 py-2 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
              value={email}
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative w-full sm:w-2/3">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                className="mt-1 block w-full px-4 py-2 pr-10 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    signin({ email, password });
                  }
                }}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-form-font hover:text-form-font-focus"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {isError && (
            <div className="text-red-500 text-sm font-roboto">
              Invalid email or password
            </div>
          )}
          <button
            type="submit"
            className={`w-full sm:w-2/3 py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2 ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isPending} // Menonaktifkan tombol ketika isPending true
          >
            {isPending ? (
              <div
                className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full sm:w-2/3 py-2 px-4 bg-form-bg-focus text-form-font font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-form-bg outline-1 focus:ring-2"
          >
            <FaGoogle className="text-form-font" /> {/* Google Icon */}
            Continue with Google
          </button>
          {/* Forgot Password link */}
          <div className="text-center">
            <a
              href={"/password/forget"}
              className="text-sm text-form-font hover:text-form-font-focus"
            >
              Forgot your password?
            </a>
          </div>
        </form>
        <div className="space-y-4 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
          <div className="text-center">
            <p className="text-md text-form-font-focus">
              Don't have an account?
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignUpClick}
            className="w-full sm:w-2/3 py-2 px-4 bg-form-bg-focus text-form-font font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-form-bg outline-1 focus:ring-2"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
